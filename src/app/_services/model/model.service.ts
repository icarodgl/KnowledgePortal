import { Injectable } from '@angular/core';

@Injectable()
export class ModelService {
    getCurrentModel() {
        return localStorage.getItem('currentModel');
    }
    setCurrentModel(model) {
        localStorage.setItem('currentModel', JSON.stringify(model));
    }
    removeCurrentModel(){
        localStorage.removeItem('currentModel');
    }
}