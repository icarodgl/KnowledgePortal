import { Injectable, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { User } from '../../_models/index.model';

@Injectable()
export class SidebarService {

    constructor(private authService:AuthService){};
   
    @Output() update: EventEmitter<string> = new EventEmitter();

    updateUserProfile() {
        let user:User = JSON.parse(this.authService.getCurrentUser());
        this.update.emit(user.profile_picture);
    }


}