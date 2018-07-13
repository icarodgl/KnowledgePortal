export class User {
    _id: string;
    firstname: string;
    surname: string;
    username: string;
    password: string;
    email: string;
    link?: {
        rel?: string,
        href?: string
    };
    token?:string;
    facebook?: {
        id?: string;
        access_token?: string;
    };
    profile_picture?: string;
}