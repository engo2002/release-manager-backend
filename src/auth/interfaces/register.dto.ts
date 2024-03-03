import { RolesEntity } from "../../roles/entity/roles.entity";
import { UserDto } from "../../users/dto/user.dto";

export class RegisterDto {
    userData: UserDto;
    rolesData: RolesEntity;
}
