import { User, Version } from './index.model';
export class ConceptMap {
    _id: string;
    title: string;
    description?: string;
    question?: string;
    keywords?: string[];
    created?: Date;
    last_update?: Date;
    author?: User;
    isPublic?: Boolean;
    versions?: Version[];
}