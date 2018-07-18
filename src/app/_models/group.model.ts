import { User } from './index.model';
export class Group {
    _id: string;
    name: string;
    description?: string;
    created?: Date;
    admin?: User;
    isPublic?: Boolean;
    users?: User[];
}