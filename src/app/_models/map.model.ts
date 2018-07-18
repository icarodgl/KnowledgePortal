import { User } from './index.model';
export class Map {
    _id: string;
    title: string;
    description?: string;
    question?: string;
    keywords?: string[];
    created?: Date;
    author?: User;
    isPublic?: Boolean;
}