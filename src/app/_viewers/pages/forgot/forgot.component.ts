import { Component, OnInit, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { User } from 'app/_models/user.model';
import { AuthService, UserService } from 'app/_services/index.service';

declare var $: any;
declare var FB: any;
declare const gapi: any;

@Component({
    selector: 'app-forgot-cmp',
    templateUrl: './forgot.component.html'
})

export class ForgotComponent implements OnInit {
    private email: string
    private toggleButton: any;

    constructor(private element: ElementRef,
        private authService: AuthService,
        private router: Router,) {
        
    }


    ngOnInit() {
        var navbar : HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
        const body = document.getElementsByTagName('body')[0];
        body.classList.add('login-page');
        body.classList.add('off-canvas-sidebar');
        const card = document.getElementsByClassName('card')[0];
        setTimeout(function() {
            // after 1000 ms we add the class animated to the login/register card
            card.classList.remove('card-hidden');
        }, 700);
    }

    recuperarSenha(){
        this.authService.forgotPassword(this.email).subscribe(
            success => {
                console.log('Solicitacao Enviada')
            },
          error => {
                console.log('Erro')
          })
    }
}
