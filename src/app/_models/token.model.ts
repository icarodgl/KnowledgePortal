import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SharedService } from 'app/_services/shared.service';

export class Token {


    constructor(protected http: HttpClient, private sharedService: SharedService
    ) { }
    getHeaders(): HttpHeaders {
        if (this.sharedService.getCookie().token) {
            const headers = new HttpHeaders({
                'Access-Control-Allow-Methods': 'POST',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.sharedService.getCookie().token,
                'Accept': '*/*',
            });
            return headers;
        }
        const headers = new HttpHeaders({
            'Access-Control-Allow-Methods': 'POST',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ',
            'Accept': '*/*',
        });
        return headers;
    }

}