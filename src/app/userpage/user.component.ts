import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MeService } from '../_services/me/me.service';
import { User } from '../_models/user.model';
import { AuthService } from '../_services/index.service';
import { SidebarService } from '../_services/sidebar/sidebar.service';

declare const $:any;

interface FileReaderEventTarget extends EventTarget {
    result: string;
}

interface FileReaderEvent extends Event {
    target: FileReaderEventTarget;
    getMessage(): string;
}

@Component({
    selector: 'app-user-cmp',
    templateUrl: 'user.component.html'
})

export class UserComponent implements OnInit{
    private user:User;
    private editUser:User;
    private editing:boolean = false;

    @ViewChild('wizardPicture') el:ElementRef;

    constructor(public meService:MeService, private authService:AuthService, private sidebarService:SidebarService){
        this.user = JSON.parse(this.authService.getCurrentUser());
        this.editUser = JSON.parse(this.authService.getCurrentUser());
    };


    ngOnInit(): void {
        // Prepare the preview for profile picture
        $(this.el.nativeElement).change((e, args) => {
            const input = $(this.el.nativeElement);
            const file:File = input[0].files[0]; 
            this.meService.sendProfileImage(file).subscribe(_=>{
                this.sidebarService.updateUserProfile();
            });
            if (input[0].files && input[0].files[0]) {
                const reader = new FileReader();
                reader.onload = function (e: FileReaderEvent) {
                    $('#wizardPicturePreview').attr('src', e.target.result).fadeIn('slow');
                };
                reader.readAsDataURL(input[0].files[0]);
            }
            
        });
    }
    edit(){
        if(this.editing){
            this.meService.updateInfo(this.editUser).subscribe(res => {
                this.user = res;
                this.editUser = res;
            });
        }
        this.editing = !this.editing;
    }
}
