import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Rx';

interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

@Injectable()
export class SpeechRecognitionService {
    speechRecognition: any;

    constructor(private zone: NgZone) {
    }

    record(): Observable<string> {

        return Observable.create(observer => {
            const { webkitSpeechRecognition }: IWindow = <IWindow>window;
            this.speechRecognition = new webkitSpeechRecognition();
            this.speechRecognition.continuous = true;
            this.speechRecognition.interimResults = true;
            this.speechRecognition.lang = 'pt-br';
            this.speechRecognition.maxAlternatives = 1;
            
            this.speechRecognition.onresult = speech => {

                this.zone.run(() => {
                    observer.next(speech.results[speech.results.length-1][0].transcript);
                });
            };

            this.speechRecognition.onerror = error => {
                console.log('onerror')
                observer.error(error);
            };

            this.speechRecognition.onend = () => {
                console.log('onend')
                observer.complete();
            };

            this.speechRecognition.start();
            console.log("Say something - We are listening !!!");
        });
    }

    DestroySpeechObject() {
        if (this.speechRecognition)
            this.speechRecognition.abort();
    }

    stop() {
        if (this.speechRecognition)
            this.speechRecognition.stop();
            
    }

}