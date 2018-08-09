import { Injectable } from '@angular/core';
import { meApiUri } from '../../global.vars';
import { ConceptMap, Result, Version } from '../../_models/index.model';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';

@Injectable()
export class MeService {

    constructor(private http: HttpClient){}

    updateDashboardMaps(): Observable<ConceptMap[]> {
        return this.http.get<ConceptMap[]>(meApiUri+'/maps?orderBy=last_update&limit=3')
            .map(maps => {
                localStorage.setItem('currentDashboardMaps', JSON.stringify(maps));
                return maps;
            });
    }

    updateDashboardMapsVersions(maps:ConceptMap[]): Observable<Version[]> {
        let uri = meApiUri+'/versions?';
        maps.forEach(map => {
            uri+='mapId='+map._id+'&';
        });
        return this.http.get<Version[]>(uri)
            .map(versions => {
                localStorage.setItem('currentDashboardUserMapsVersions', JSON.stringify(versions));
                return versions;
            });
    }

}