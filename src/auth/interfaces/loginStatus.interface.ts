import {UserSessionDto} from "../../user-session-refresh/dto/UserSessionDto";

export interface LoginStatus {
    userId: string;
    username: string;
    fullname: string;
    accessToken: any;
    expiresIn: any;
    refreshToken: any;
    refreshExpiresIn: any;
    session: UserSessionDto;
    avatar: string;
}
