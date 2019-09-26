import { Injectable } from "@angular/core";
import { userApiUri } from "../../global.vars";
import { User, Result } from "../../_models/index.model";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/map";
import { Observable } from "rxjs";

@Injectable()
export class UserService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(userApiUri);
  }

  create(user: User) {
    return this.http.post<Result>(userApiUri, user);
  }

  getUserData(userId: string) {
    return this.http.get<User>(userApiUri + "/" + userId);
  }

  searchByUserName(userName: string) {
    return this.http.get<[User]>(userApiUri + "/search?username=" + userName);
  }
  validateEmail(userEmail: string) {
    return this.http.get(userApiUri + "/email/" + userEmail, {
      responseType: "text"
    });
  }
  validateUsername(username: string) {
    return this.http.get(userApiUri + "/username/" + username, {
      responseType: "text"
    });
  }
}
