import { Injectable } from '@angular/core';
import { mapApiUri } from '../../global.vars';
import { Map, Result } from '../../_models/index.model';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';

@Injectable()
export class MapService {

    constructor(private http: HttpClient){}

    getAll(): Observable<Map[]> {
        return this.http.get<Map[]>(mapApiUri);
    }

    create(map: Map){
        return this.http.post<Result>(mapApiUri, map);
    }
}