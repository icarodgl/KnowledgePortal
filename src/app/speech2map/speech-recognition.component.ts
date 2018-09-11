import { animate, style, transition, trigger } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as go from "gojs";
import { myDiagram } from '../edit/conceptmap/conceptmap.component';
import { SpeechAnalysis } from './spech-analysis';
import { SpeechRecognitionService } from '../_services/speech2map/speech-recognition.service';
import { googleApiKey, googleClientId } from '../secrets.vars';

declare var gapi: any;
declare var swal: any;

var text: string;

@Component({
    selector: 'speech',
    templateUrl: './speech-recognition.component.html',
    styleUrls: ['./speech-recognition.component.css'],
    animations: [
        trigger('dialog', [
            transition('void => *', [
                style({ transform: 'scale3d(.3, .3, .3)' }),
                animate(100)
            ]),
            transition('* => void', [
                animate(100, style({ transform: 'scale3d(.0, .0, .0)' }))
            ])
        ])
    ],
    host: {'(window:keydown)': 'hotkeys($event)'}
})
export class SpeechRecognitionComponent implements OnInit, OnDestroy, AfterViewInit {

    showSearchButton: boolean;
    recognizing: boolean = false;
    mic: string = "mic";
    cls: string = "btn-info";

    constructor(private zone: NgZone,
        public dialogRef: MatDialogRef<SpeechRecognitionComponent>,
        @Inject(MAT_DIALOG_DATA) public speechData: string,
        private speechRecognitionService: SpeechRecognitionService,
        private http: HttpClient) {
        this.showSearchButton = true;
    }

    ngOnInit() {
        //myDiagram.layout = new go.ForceDirectedLayout();
        console.log("hello")
    }

    ngAfterViewInit(): void {
        gapi.load('client:auth2', start);
    }

    ngOnDestroy() {
        this.speechRecognitionService.DestroySpeechObject();
    }

    activateSpeechSearchMovie(): void {
        if (this.recognizing) {
            this.speechRecognitionService.stop();
            this.recognizing = false;
            return;
        }
        this.recognizing = true;
        this.speechData = "";
        this.mic = "mic_off";
        this.cls = "btn-danger";
        this.speechRecognitionService.record()
            .subscribe(
                //listener
                (value) => {
                    this.speechData = value.toLocaleLowerCase();
                    //console.log(value);
                },
                //errror
                (err) => {
                    console.log(err);
                    this.mic = "mic";
                    this.cls = "btn-info";
                    if (err.error == "no-speech") {
                        console.log("--restarting service--");
                        this.recognizing = false;
                    }
                },
                //completion
                () => {
                    this.recognizing = false;
                    this.zone.run(() => {
                        this.mic = "mic";
                        this.cls = "btn-info";
                    });

                    console.log("--complete--");

                });
    }

    close() {
        this.speechRecognitionService.DestroySpeechObject();
        this.dialogRef.close();
    }

    save() {
        this.speechRecognitionService.stop();

        if(this.speechData){
            this.analyzeAndMap(this.speechData.toLocaleLowerCase());
            this.dialogRef.close();
        }else{
            this.showMessage();
        }
    }

    analyzeAndMap(text: string) {

        gapi.load('client:auth2', start);

        gapi.client.language.documents.analyzeSyntax({
            document: {
                content: text,
                type: 'PLAIN_TEXT',
                language: 'pt-br'
            },
            encodingType: 'UTF32',
        }).then(results => {
            const syntax = JSON.parse(results.body);
            new SpeechAnalysis().analyze(syntax);

        }).catch(err => {
            console.error('ERROR:', err);
        });
    }

    hotkeys(event){
        //apertar CTRL + . inicia a gravação
        if (event.keyCode == 190 && event.ctrlKey){
            this.activateSpeechSearchMovie();
        }

        //Apertar ESC sai da tela de inserção
        if (event.keyCode == 27){
            this.close();
        }

        //Apertar ENTER salva a proposição se tiver algo escrito
        if (event.keyCode == 13){
            if(this.speechData){
                if(this.speechData.trim().length>3){
                    this.save();
                }
            }
        }
     }

     showMessage(){
        swal({
            title: 'Nenhuma Proposição Inserida',
            //text: error.message,
            text: "Por favor, insira uma proposição " +
                  "e tente novamente.",
            buttonsStyling: false,
            confirmButtonClass: 'btn btn-info'
          });
     }
}


function start() {
    // Initializes the client with the API key and the Translate API.
    gapi.client.init({
        apiKey: googleApiKey,
        clientId: googleClientId,
        discoveryDocs: ['https://language.googleapis.com/$discovery/rest?version=v1', 'https://language.googleapis.com/$discovery/rest?version=v1beta2'],
        scope: 'https://www.googleapis.com/auth/cloud-language https://www.googleapis.com/auth/cloud-platform'
    });
}