import {UserDto} from "./dto/user.dto";
import {UserEntity} from "./entity/user.entity";

export const toUserDto = (data: UserEntity): UserDto => {
    return data;
};
