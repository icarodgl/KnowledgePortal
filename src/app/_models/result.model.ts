import { User, ConceptMap, Version } from "./index.model";
export interface Result{
    userMessage: string,
    user?: User,
    map?: ConceptMap,
    version?: Version,
    url?:string
};