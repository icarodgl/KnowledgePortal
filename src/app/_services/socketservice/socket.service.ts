import { Injectable } from '@angular/core';
import { WebsocketService } from '../websocket/websocket.service';
import { Subject } from 'rxjs/Rx';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
    messages: Subject<any>;

    constructor(private wsService: WebsocketService) {}

    send(msg){
        this.messages.next(msg);
    }

    disconnect(){
        this.wsService.disconnect();
    }

    connect() {
        this.messages = <Subject<any>>this.wsService
        .connect()
        .map((response: any): any => {
            return response;
        });
    }
}
