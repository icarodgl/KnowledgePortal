import { Injectable } from '@angular/core';

@Injectable()
export class ModelService {
    removeCurrentModel(){
        localStorage.removeItem('currentModel');
    }
}