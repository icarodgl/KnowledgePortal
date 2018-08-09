import { Injectable } from '@angular/core';
import { followApiUri } from '../../global.vars';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { User } from '../../_models/user.model';
import { Result } from '../../_models/index.model';

@Injectable()
export class FollowService {

    constructor(private http: HttpClient){}

    follow(user:User) {
        return this.http.post<Result>(followApiUri, user);
    }
    unfollow(user:User) {
        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(user)
        }; 
        return this.http.delete<Result>(followApiUri, httpOptions);
    }
}