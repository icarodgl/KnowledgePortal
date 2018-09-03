import { Group, ConceptMap } from './index.model';
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
    created?: Date;
    token?:string;
    facebook?: {
        id?: string;
        access_token?: string;
    };
    google?:{
        id?: string;
        access_token?: string;
        id_token?: string
    }
    profile_picture?: string;
    locInfo?: {
        country?: string,
        countryCode?: string,
        region?: string,
        regionName?: string,
        city?: string
    };
    stats?: {
        maps?:number,
        groups?:number,
        following?: number,
        followers?: number
    };
    maps?: ConceptMap[];
    last_maps?: ConceptMap[];
    groups?: Group[];
    following?: User[];
    followers?: User[];
}