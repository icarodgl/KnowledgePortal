import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import * as Rx from 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import { SocketMessage, SocketResponse } from '../../_models/socketMessage.model';

declare const $:any;

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket;

  constructor() { }

  connect(): Rx.Subject<MessageEvent> {
    this.socket = io(environment.ws_url);

    let observable = new Observable(observer => {
      this.socket.on('newMessage', (data) => {
        let res: SocketResponse = new SocketResponse();
        res.type= 'newMessage';
        res.content = data;
        observer.next(res);
      });
      this.socket.on('updateModel', (data) => {
        let res: SocketResponse = new SocketResponse();
        res.type = 'updateModel';
        res.content = data;
        observer.next(res);
      })
      return () => {
        this.socket.disconnect();
      }
    });


    let observer = {
      next: (data: SocketMessage) => {
        switch(data.type){
          case 'message':
            this.socket.emit(data.type, data.content);
            break;
          case 'join':
            this.socket.emit(data.type, { 'username': data.username, 'roomId': data.content }, function(err){
              if(err){
                $.notify({
                    icon: 'notifications',
                    message: `<b>Error: </b> ${err}.`
                }, {
                    type: 'danger',
                    timer: 2000,
                    placement: {
                        from: 'top',
                        align: 'right'
                    },
                    template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
                      '<button mat-raised-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
                      '<i class="material-icons" data-notify="icon">notifications</i> ' +
                      '<span data-notify="title">{1}</span> ' +
                      '<span data-notify="message">{2}</span>' +
                      '<div class="progress" data-notify="progressbar">' +
                        '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
                      '</div>' +
                      '<a href="{3}" target="{4}" data-notify="url"></a>' +
                    '</div>'
                });
              }else{
                $.notify({
                    icon: 'notifications',
                    message: 'You are connect in <b>Real Time CMPaaS Editor</b> - you can share this link with your friends.'
                }, {
                    type: 'success',
                    timer: 2000,
                    placement: {
                        from: 'top',
                        align: 'right'
                    },
                    template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
                      '<button mat-raised-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
                      '<i class="material-icons" data-notify="icon">notifications</i> ' +
                      '<span data-notify="title">{1}</span> ' +
                      '<span data-notify="message">{2}</span>' +
                      '<div class="progress" data-notify="progressbar">' +
                        '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
                      '</div>' +
                      '<a href="{3}" target="{4}" data-notify="url"></a>' +
                    '</div>'
                });
              }
            })
            break;
          case 'sendModel':
            this.socket.emit(data.type, data.content);
            break;
        }
      },
    };

    return Rx.Subject.create(observer, observable);
  }

  disconnect() {
    return this.socket.disconnect();
  }
}
