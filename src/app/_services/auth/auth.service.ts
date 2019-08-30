import { Injectable } from '@angular/core';
import { authApiUri, meApiUri } from '../../global.vars';
import { User } from '../../_models/user.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { SharedService } from '../shared.service';


@Injectable()
export class AuthService {
    user: User


    constructor(
        private http: HttpClient,
        private sharedService: SharedService
    ) { }

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

    logado() {
        if (this.sharedService.getCookie().token) {
            return(true)
        }
        return(false)
    }

    login(user:User){
        return this.http.post<any>(authApiUri+'/login', user)
            .map(res => {
                console.log(res)
                if (res.access_token) {
                    this.sharedService.salvaCookie(res.access_token)
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
        this.sharedService.deletaCookie()
        localStorage.clear();
    }

    newPassword(password, token) {
        let headers = new HttpHeaders({
            'Access-Control-Allow-Methods': 'POST',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
            'Accept': '*/*',
        });
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