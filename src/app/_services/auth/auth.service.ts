import { Injectable } from '@angular/core';
import { authApiUri } from '../../global.vars';
import { User } from '../../_models/user.model';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {

    constructor(private http: HttpClient){}

    getCurrentUser(){
        return localStorage.getItem('currentUser');
    }

    login(user:User){
        return this.http.post<any>(authApiUri, user)
            .map(res => {
                if(res.user && res.user.token){
                    localStorage.setItem('currentUser', JSON.stringify(res.user));
                }

                return res;
            });
    }

    fbLogin(user: User){
        return this.http.post<any>(authApiUri+'/facebook', user)
            .map(res => {
                if(res.user && res.user.token) {
                    localStorage.setItem('currentUser', JSON.stringify(res.user));
                }
            });
    }

    gLogin(user: User){
        return this.http.post<any>(authApiUri+'/google', user)
            .map(res => {
                if(res.user && res.user.token) {
                    localStorage.setItem('currentUser', JSON.stringify(res.user));
                }
            });
    }

    logout(){
        localStorage.removeItem('currentUser');
    }

    lock(){
        let user = JSON.parse(localStorage.getItem('currentUser'));
        delete user.token;
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
}