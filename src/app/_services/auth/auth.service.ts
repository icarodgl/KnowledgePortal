import { Injectable } from '@angular/core';
import { authApiUri, meApiUri } from '../../global.vars';
import { User } from '../../_models/user.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {

    constructor(private http: HttpClient){}

    getCurrentUser(){
        return localStorage.getItem('currentUser');
    }

    setCurrentUser(user:User) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    updateUser() {
        return this.http.get<User>(meApiUri)
            .map(user => {
                user.token = JSON.parse(this.getCurrentUser()).token;
                localStorage.setItem('currentUser', JSON.stringify(user));
                return user;
            });
    }

    login(user:User){
        return this.http.post<any>(authApiUri+'/login', user)
            .map(res => {
                console.log(res)
                if(res.access_token){
                    localStorage.setItem('currentUser', JSON.stringify(res.access_token));
                }

                return res;
            });
    }

    forgotPassword(email: string){
        let send = {'email': email}
        return this.http.post<any>(authApiUri+'/reset/password', send)
    }

    logout() {
        localStorage.clear();
    }

    newPassword(password, token) {
        let headers = new HttpHeaders();
        headers.set('Authorization', 'Bearer ' + token)
        return this.http.post<any>(authApiUri + '/new/password', password, { headers: headers })
    }

    //fbLogin(user: User){
    //    return this.http.post<any>(authApiUri+'/facebook', user)
    //        .map(res => {
    //            if(res.user && res.user.token) {
    //                localStorage.setItem('currentUser', JSON.stringify(res.user));
    //            }
    //        });
    //}

    //gLogin(user: User){
    //    return this.http.post<any>(authApiUri+'/google', user)
    //        .map(res => {
    //            if(res.user && res.user.token) {
    //                localStorage.setItem('currentUser', JSON.stringify(res.user));
    //            }
    //        });
    //}



}