import { Injectable } from '@angular/core';
import { versionApiUri } from '../../global.vars';
import { ConceptMap, Result, Version, User } from '../../_models/index.model';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class VersionService {

    constructor(private http: HttpClient, private authService:AuthService){}

    setCurrentLoadVersion(v:Version){
        localStorage.setItem('currentLoadVersion', JSON.stringify(v));
    }

    getCurrentLoadVersion(){
        return JSON.parse(localStorage.getItem('currentLoadVersion'));
    }

    removeCurrentLoadVersion(){
        localStorage.removeItem('currentLoadVersion');
    }

    updateUserMapVersions(): Observable<Version[]> {
        let user:User = JSON.parse(this.authService.getCurrentUser());
        let uri = versionApiUri+'?';
        user.maps.forEach(map => {
            uri+='mapId='+map._id+'&';
        });
        return this.http.get<Version[]>(uri)
            .map(versions => {
                localStorage.setItem('currentUserMapsVersions', JSON.stringify(versions));
                return versions;
            });
    }

    getVersionData(versionId:string){
        return this.http.get<Version>(versionApiUri+'/'+versionId);
    }
}