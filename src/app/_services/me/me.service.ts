import { Injectable } from '@angular/core';
import { meApiUri } from '../../global.vars';
import { ConceptMap, Result, Version, User, Group } from '../../_models/index.model';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { AuthService } from '../index.service';
import { Observable, of } from 'rxjs';

declare interface ResObject {
    url:string;
}

@Injectable()
export class MeService {
    private updated:boolean = false;

    constructor(private http: HttpClient, private authService: AuthService){}

    getDashboardInfo(): Observable<ConceptMap[]> {
        let savedMapArr: ConceptMap[] = JSON.parse(this.authService.getCurrentUser()).last_maps as ConceptMap[];
        
        if(this.updated && savedMapArr != null){
            return of(savedMapArr);
        }else
            return this.http.get<ConceptMap[]>(meApiUri+'/dashboard')
                .map(maps => {
                    let currentUser : User = JSON.parse(this.authService.getCurrentUser());
                    currentUser.last_maps = maps;
                    this.authService.setCurrentUser(currentUser);
                    this.updated = true;
                    return maps;
                });
    }

    isUpdated(){
        return this.updated;
    }

    updateDashboardInfo(){
        this.updated = false;
        this.getDashboardInfo();
    }

    getMaps(): Observable<ConceptMap[]> {
        return this.http.get<ConceptMap[]>(meApiUri+'/maps?orderBy=last_update&limit=3')
            .map(maps => {
                localStorage.setItem('currentDashboardMaps', JSON.stringify(maps));
                return maps;
            });
    }

    getMapsVersions(maps:ConceptMap[]): Observable<Version[]> {
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

    getGroups(): Observable<Group[]> {
        return this.http.get<Group[]>(meApiUri+'/groups');
    }

    
    sendProfileImage(img:File):Observable<ResObject>{
        const uploadData = new FormData();
        uploadData.append('file', img);
        return this.http.post(meApiUri+'/profileImage', uploadData).map((res:ResObject) => {
            let user:User = JSON.parse(localStorage.getItem('currentUser'));
            user.profile_picture = res.url;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return res;
        });
    }

}