import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MeService } from '../_services/me/me.service';

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
    @ViewChild('wizardPicture') el:ElementRef;

    constructor(public meService:MeService){};


    ngOnInit(): void {
        // Prepare the preview for profile picture
        $(this.el.nativeElement).change((e, args) => {
            const input = $(this.el.nativeElement);
            const file:File = input[0].files[0]; 
            this.meService.sendProfileImage(file).subscribe(_=>{});
            if (input[0].files && input[0].files[0]) {
                const reader = new FileReader();
                reader.onload = function (e: FileReaderEvent) {
                    $('#wizardPicturePreview').attr('src', e.target.result).fadeIn('slow');
                };
                reader.readAsDataURL(input[0].files[0]);
            }
        });
    }
}
