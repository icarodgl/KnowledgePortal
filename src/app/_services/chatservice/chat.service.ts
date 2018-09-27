import { Injectable } from '@angular/core';
import { WebsocketService } from '../websocket/websocket.service';
import { Observable, Subject } from 'rxjs/Rx';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
    messages: Subject<any>;

    constructor(private wsService: WebsocketService) {}

    sendMsg(msg){
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
