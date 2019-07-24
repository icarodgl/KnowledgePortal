import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';

import { SpeechRecognitionComponent } from './speech-recognition.component';

@NgModule({
    imports: [
        //angular builtin module
        BrowserModule,
        HttpModule,
        FormsModule
    ],
    declarations: [
        SpeechRecognitionComponent
    ],
    exports: [
        SpeechRecognitionComponent
    ]
})

export class SpeechRecognitionModule {
}