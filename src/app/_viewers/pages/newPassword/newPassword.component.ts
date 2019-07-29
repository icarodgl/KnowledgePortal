import { Component, OnInit, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { User } from 'app/_models/user.model';
import { AuthService, UserService } from 'app/_services/index.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

declare var $: any;
declare var FB: any;
declare const gapi: any;

@Component({
    selector: 'app-newPassword-cmp',
    templateUrl: './newPassword.component.html',
    styleUrls: ['./newPassword.component.css']
})

export class NewPasswordComponent implements OnInit {
    senhaForm: FormGroup
    private toggleButton: any;


    constructor(
        private element: ElementRef,
        private formBuilder: FormBuilder) { }


    ngOnInit() {
        this.senhaForm = this.formBuilder.group({
            'senha1': [null, [Validators.required, Validators.minLength(6)]],
            'senha2': [null, [Validators.required, Validators.minLength(6)]]
        })

        var navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
        const body = document.getElementsByTagName('body')[0];
        body.classList.add('login-page');
        body.classList.add('off-canvas-sidebar');
        const card = document.getElementsByClassName('card')[0];
        setTimeout(function () {
            // after 1000 ms we add the class animated to the login/register card
            card.classList.remove('card-hidden');
        }, 700);
    }
    print(a) {
        console.log(a)
    }
}