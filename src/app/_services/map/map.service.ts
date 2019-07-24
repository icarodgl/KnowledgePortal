import { Injectable } from '@angular/core';
import { mapApiUri, meApiUri } from '../../global.vars';
import { ConceptMap, Result, Version } from '../../_models/index.model';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';

@Injectable()
export class MapService {

    constructor(private http: HttpClient){}

    updateUserMaps(): Observable<ConceptMap[]> {
        return this.http.get<ConceptMap[]>(meApiUri+'/maps')
            .map(maps => {
                localStorage.setItem('currentUserMaps', JSON.stringify(maps));
                return maps;
            });
    }

    getAll(): Observable<ConceptMap[]> {
        return this.http.get<ConceptMap[]>(mapApiUri);
    }

    create(map: ConceptMap){
        return this.http.post<Result>(mapApiUri, map);
    }

    setCurrentMap(map:ConceptMap) {
        localStorage.setItem('currentMap', JSON.stringify(map));
    }

    getCurrentMap() {
        return localStorage.getItem('currentMap');
    }

    removeCurrentMap() {
        localStorage.removeItem('currentMap');
    }

    createVersion(content:any) {
        let map:ConceptMap = JSON.parse(this.getCurrentMap());
        return this.http.post<Result>(mapApiUri+'/'+map._id.toString()+'/versions', JSON.parse(content));
    }

    getMapData(mapId:string){
        return this.http.get<ConceptMap>(mapApiUri+'/'+mapId);
    }
}