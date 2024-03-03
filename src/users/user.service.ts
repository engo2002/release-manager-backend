import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {UserEntity} from "./entity/user.entity";
import {FindOneOptions, Repository} from "typeorm";
import {GeneralUserDataDto} from "./dto/GeneralUserData.dto";
import {UserDto} from "./dto/user.dto";
import {RolesService} from "../roles/roles.service";
import {InjectRepository} from "@nestjs/typeorm";
import {UserSessionRefreshService} from "../user-session-refresh/user-session-refresh.service";
import {toUserDto} from "./userDto.mapper";
import {LoginUserDto} from "./dto/loginUser.dto";
import {isEmail} from "class-validator";
import * as bcrypt from "bcrypt";
import {CreateUserDto} from "./dto/createUser.dto";
import {createRolesDto} from "../roles/dto/createRolesDto.dto";
import _ from "lodash";
import {RolesEntity} from "../roles/entity/roles.entity";

@Injectable()
export class UserService {

    constructor( @InjectRepository(UserEntity)
                 private readonly userRepo: Repository<UserEntity>,
                 private rolesService: RolesService,
                 private userSessionsService: UserSessionRefreshService,) {
    }

    /**
     * returns General User Data. Should be used for any API with userData.
     */
    async findOneToGeneral(options?: FindOneOptions): Promise<GeneralUserDataDto> {
        const entity = await this.findOneEntity(options);
        const role = await this.rolesService.getUserRoles(entity.id);
        return this.toGeneralUserData(entity, role);
    }

    /**
     * returns Entity. Should not be used for API.
     * @param options
     */
    async findOneEntity(options?: FindOneOptions): Promise<UserEntity> {
        return await this.userRepo.findOne(options);
    }

    /**
     * returns UserDto. Should not be used for API.
     * @param options
     */
    async findOneToUserDto(options?: FindOneOptions): Promise<UserDto> {
        const user = await this.userRepo.findOne(options);
        return toUserDto(user);
    }

    async findAll(): Promise<GeneralUserDataDto[]> {
        const allUser = await this.userRepo.find();
        const userRoles = await this.rolesService.getAll();
        let generalUserData: GeneralUserDataDto[] = [];
        allUser.forEach((user) => {
            const role = userRoles.find((role) => role.user === user.id);
            if (role) {
                generalUserData.push(this.toGeneralUserData(user, role));
            } else {
                return;
            }
        });
        generalUserData = _.orderBy(generalUserData, "username", "asc");
        return generalUserData;
    }

    async findOneByIdToGeneralData(userId: string) {
        const user = await this.findById(userId);
        const role = await this.rolesService.getUserRoles(userId);
        let generalUserData: GeneralUserDataDto = {
            email: "",
            fullname: "",
            id: "",
            primaryRole: "",
            secondaryRole: "",
            username: "",
            lastLogin: "",
        };
        if (role) {
            generalUserData = this.toGeneralUserData(user, role);
        } else {
            throw new HttpException("no user role entry found for user " + user.id, HttpStatus.NOT_FOUND);
        }
        return generalUserData;
    }

    async findByLogin({ username, password }: LoginUserDto): Promise<UserDto> {
        let user: UserEntity;
        if (isEmail(username)) {
            user = await this.userRepo.findOne({ where: { email: username } });
        } else {
            user = await this.userRepo.findOne({ where: { username: username } });
        }
        if (!user) {
            throw new HttpException("User not found", HttpStatus.NOT_IMPLEMENTED);
        }

        if (user.failedLogins >= 3) {
            if (new Date().getTime() <= parseInt(user.lastFailedLogin) + 300000) {
                throw new HttpException("Login locked", HttpStatus.NOT_ACCEPTABLE);
            }
        }
        // compare passwords
        const areEqual = await bcrypt.compare(password, user.password);

        if (!areEqual) {
            await this.setFailedLoginCounter(user, "incr");
            throw new HttpException("Invalid credentials", HttpStatus.EXPECTATION_FAILED);
        }

        return toUserDto(user);
    }

    async findByPayload({ username }: any): Promise<UserDto> {
        return await this.findOneToUserDto({
            where: { username },
        });
    }

    async findById(userId: string): Promise<UserDto> {
        const find = await this.userRepo.findOne({ where: [{ id: userId }] });
        if (!find) {
            throw new HttpException("Cannot find User with id " + userId, HttpStatus.BAD_REQUEST);
        }
        return find;
    }

    async create(userDto: CreateUserDto) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { username, fullname, password, email, primaryRole, secondaryRole } = userDto;

        // check if the user exists in the db
        const userInDb = await this.userRepo.findOne({
            where: { username },
        });
        if (userInDb) {
            throw new HttpException("User already exists", HttpStatus.BAD_REQUEST);
        }

        const emailInDb = await this.userRepo.findOne({
            where: { email },
        });
        if (emailInDb) {
            throw new HttpException("E-Mail already exists", HttpStatus.BAD_REQUEST);
        }

        const user: UserEntity = this.userRepo.create({
            username,
            fullname,
            password,
            email,
        });
        const userFinal = await this.userRepo.save(user);
        const roles: createRolesDto = {
            primaryRole: userDto.primaryRole,
            secondaryRole: userDto.secondaryRole,
            user: userFinal.id,
        };
        const createRoles = await this.rolesService.createUserRoles(roles);
        return {
            userData: toUserDto(user),
            rolesData: createRoles,
        };
    }

    async updatePassword(username: string, oldPasswort: string, newPasswort: string, newPasswortCheck: string) {
        if (newPasswort !== newPasswortCheck) {
            throw new HttpException("Passwords are not equal", HttpStatus.EXPECTATION_FAILED);
        }
        let hashNewPassword = await bcrypt.hash(newPasswort, 10);
        hashNewPassword = hashNewPassword.toString();
        const user = await this.userRepo.findOne({ where: { username } });
        if (!user) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }
        // compare passwords
        const areEqual = await bcrypt.compare(oldPasswort, user.password);

        if (!areEqual) {
            throw new HttpException("Invalid credentials", HttpStatus.EXPECTATION_FAILED);
        }

        const newUserData = {
            id: user.id,
            username: user.username,
            fullname: user.fullname,
            password: hashNewPassword,
            email: user.email,
        };

        await this.userRepo.update(user.id, newUserData);
        await this.userSessionsService.deleteSessionsForUserId(user.id);
    }

    async updatePasswordAdmin(username: string, newPasswort: string, newPasswordCheck: string) {
        if (newPasswort !== newPasswordCheck) {
            throw new HttpException("Passwords are not equal", HttpStatus.EXPECTATION_FAILED);
        }

        let hashNewPassword = await bcrypt.hash(newPasswort, 10);
        hashNewPassword = hashNewPassword.toString();

        const user = await this.userRepo.findOne({ where: { username } });
        if (!user) {
            throw new HttpException("User not found", HttpStatus.NOT_IMPLEMENTED);
        }

        const newUserData = {
            id: user.id,
            username: user.username,
            fullname: user.fullname,
            password: hashNewPassword,
            email: user.email,
        };

        await this.userRepo.update(user.id, newUserData);
    }

    async deleteUser(id: string) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) {
            throw new HttpException("User not found", HttpStatus.NOT_IMPLEMENTED);
        }
        await this.rolesService.deleteUserRoles(id);
        return await this.userRepo.delete(id);
    }

    async checkPassword(password: string, userId: string): Promise<boolean> {
        const find = await this.userRepo.findOne({ where: { id: userId } });
        if (_.isEmpty(find)) {
            throw new HttpException("User could not be found", HttpStatus.NOT_FOUND);
        }
        return await bcrypt.compare(password, find.password);
    }

    async setFailedLoginCounter(user: UserDto | UserEntity, type: "incr" | "reset") {
        if (type === "incr") {
            await this.userRepo.update(user.id, { lastFailedLogin: String(new Date().getTime()) });
            return await this.userRepo.update(user.id, { failedLogins: user.failedLogins + 1 });
        }

        if (type === "reset") {
            return await this.userRepo.update(user.id, { failedLogins: 0 });
        }
    }

    async getTwoFactorEnabled(userId?: string, username?: string) {
        let find;
        if (!_.isEmpty(userId)) {
            find = await this.userRepo.findOne({ where: { id: userId } });
        } else {
            if (!_.isEmpty(username)) {
                if (isEmail(username)) {
                    find = await this.userRepo.findOne({ where: { email: username } });
                } else {
                    find = await this.userRepo.findOne({ where: { username: username } });
                }
            } else {
                throw new HttpException("You have to provide userId or username or email!", HttpStatus.BAD_REQUEST);
            }
        }
        if (_.isEmpty(find)) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }
        return find.isTwoFactorAuthenticationEnabled;
    }

    async setTwoFactorEnabled(userId: string, newValue: boolean) {
        const find = await this.userRepo.findOne({ where: { id: userId } });
        if (_.isEmpty(find)) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }
        return await this.userRepo.update(userId, {
            isTwoFactorAuthenticationEnabled: newValue,
        });
    }

    async setTwoFactorAuthenticationSecret(secret: string, id: string) {
        return await this.userRepo.update(id, {
            twoFactorAuthenticationSecret: secret,
            isTwoFactorAuthenticationEnabled: true,
        });
    }

    async setLastLoginDate(userId: string) {
        const find = await this.userRepo.findOne({ where: { id: userId } });
        if (_.isEmpty(find)) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }
        return await this.userRepo.update(userId, {
            lastLogin: new Date().getTime().toString(),
        });
    }

    async getTwoFactorAuthenticationSecret(id: string) {
        const find = await this.userRepo.findOne({ where: { id: id } });
        if (_.isEmpty(find)) {
            return "";
        } else {
            return find.twoFactorAuthenticationSecret;
        }
    }

    async deleteTwoFactorAuthenticationSecret(id: string) {
        const find = await this.userRepo.findOne({ where: { id: id } });
        if (_.isEmpty(find)) {
            throw new HttpException("No user found", HttpStatus.NOT_FOUND);
        } else {
            return await this.userRepo.update(id, {
                twoFactorAuthenticationSecret: null,
                isTwoFactorAuthenticationEnabled: false,
            });
        }
    }

    private toGeneralUserData(user: UserDto | UserEntity, role: RolesEntity): GeneralUserDataDto {
        return {
            id: user.id,
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            primaryRole: role.primaryRole,
            secondaryRole: !!role.secondaryRole ? role.secondaryRole : undefined,
            lastLogin: user.lastLogin,
        };
    }
}
