import { Injectable } from '@angular/core';
import { meApiUri } from '../../global.vars';
import { ConceptMap, Result, Version, User, Group } from '../../_models/index.model';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { AuthService } from '../auth/auth.service';
import { Observable, of } from 'rxjs';
import { MapService } from '../map/map.service';
import * as jwt_decode from 'jwt-decode';

@Injectable()
export class MeService {
    private updated: boolean = false;
    user: User
    maps: ConceptMap[]

    constructor(private http: HttpClient, private authService: AuthService, private mapService: MapService) { }

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

    
    sendProfileImage(img:File):Observable<Result>{
        const uploadData = new FormData();
        uploadData.append('file', img);
        return this.http.post(meApiUri+'/profileImage', uploadData).map((res:Result) => {
            let user:User = JSON.parse(localStorage.getItem('currentUser'));
            user.profile_picture = res.url;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return res;
        });
    }

    updateInfo(data:User){
        return this.http.put<User>(meApiUri, data).map((res:User) => {
            let u:User = JSON.parse(localStorage.getItem('currentUser'));
            res.token = u.token;
            res.stats = u.stats;
            localStorage.setItem('currentUser', JSON.stringify(res));
            return res;
        });
    }

}