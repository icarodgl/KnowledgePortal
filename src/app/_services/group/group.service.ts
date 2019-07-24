import { Injectable } from '@angular/core';
import { groupApiUri } from '../../global.vars';
import { Group, Result } from '../../_models/index.model';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';

@Injectable()
export class GroupService {

    constructor(private http: HttpClient){}

    create(group: Group){
        return this.http.post<Result>(groupApiUri, group);
    }

}