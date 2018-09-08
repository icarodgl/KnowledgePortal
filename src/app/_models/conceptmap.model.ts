import { User, Version, Permission } from './index.model';
export class ConceptMap {
    _id: string;
    title: string;
    description?: string;
    question?: string;
    keywords?: string[];
    created?: Date;
    last_update?: Date;
    author?: User;
    versions?: Version[];
    permissions?: {
        publicPermission?: Permission,
        groups?:[
            {
                groupId?: string,
                permission?: Permission
            }
        ],
        users?:[
            {
                userId?: string,
                permission?: Permission
            }
        ]
    };
}