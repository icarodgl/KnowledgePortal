import { ConceptMap } from './index.model';
export class Version {
    _id: string;
    content: any;
    created?: Date;
    last_update?: Date;
    link?: {
        rel?: string,
        href?: string
    };
    map?: ConceptMap;
}