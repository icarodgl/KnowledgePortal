import { Injectable } from '@angular/core';
import { mapApiUri, meApiUri } from '../../global.vars';
import { ConceptMap, Result, Version } from '../../_models/index.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class MapService {
    mapaAtualId: string
    private options

    constructor(private http: HttpClient,
        private authService: AuthService) {
        this.options = this.getHeaders() ;
    }

    private getHeaders(): HttpHeaders {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Methods': 'POST',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.authService.getCurrentUser().slice(1, this.authService.getCurrentUser().length - 1),
            'Accept': '*/*',
        });
        return headers;
    }
    updateUserMaps(): Observable<ConceptMap[]> {
        return this.http.get<ConceptMap[]>(meApiUri+'/maps')
            .map(maps => {
                localStorage.setItem('currentUserMaps', JSON.stringify(maps));
                return maps;
            });
    }

    getAll(): Observable<ConceptMap[]> {
        return this.http.get<ConceptMap[]>(mapApiUri, { headers: this.options });
    }

    create(map: ConceptMap){
        return this.http.post<Result>(mapApiUri, map, { headers: this.options });
    }

    setCurrentMap(map: ConceptMap) {
        localStorage.setItem('currentMap', JSON.stringify(map));
    }

    getCurrentMap():any {
        return localStorage.getItem('currentMap');
    }

    removeCurrentMap() {
        localStorage.removeItem('currentMap');
    }

    createVersion(content: string) {
          let send = {
            "content": JSON.parse(content)
        }
        return this.http.post<Result>(mapApiUri + '/' + this.mapaAtualId + '/content', JSON.stringify(send), { headers: this.options });
    }

    //getMapData(mapId:string){
    //    return this.http.get<ConceptMap>(mapApiUri+'/'+mapId);
    //}

    updateMap(mapId: string, conteudo) {
        return this.http.put<Result>(mapApiUri + '/' + mapId, JSON.parse(conteudo));
    }


    getAllVerisonMap(mapId: string) {
        return this.http.get<Version[]>(mapApiUri + '/' + mapId + '/versions', { headers: this.options });
    }

    removeMap(mapId: string) {
        return this.http.delete<any>(mapApiUri + '/' + mapId, { headers: this.options });
    }

    getVerisonMap(mapId: string, versionId: string) {
        return this.http.get<Version>(mapApiUri + '/' + mapId + '/versions/' + versionId, { headers: this.options });
    }
}