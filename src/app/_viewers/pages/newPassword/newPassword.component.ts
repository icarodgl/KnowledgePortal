import { Component, OnInit, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { User } from 'app/_models/user.model';
import { AuthService, UserService } from 'app/_services/index.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from 'app/_services/shared.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
    selector: 'app-newPassword-cmp',
    templateUrl: './newPassword.component.html',
    styleUrls: ['./newPassword.component.css']
})

export class NewPasswordComponent implements OnInit {
    senhaForm: FormGroup
    private toggleButton: any;
    token: string
    @BlockUI() blockUI: NgBlockUI;

    constructor(
        private element: ElementRef,
        private formBuilder: FormBuilder,
        private routeract: ActivatedRoute,
        private authService: AuthService,
        private sharedService: SharedService,
        private router: Router,
    ) { }


    ngOnInit() {
        this.routeract.params.subscribe(params => {
            this.token = params.token
        })
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

    sendNewPass() {
        this.blockUI.start('Carregando');
        let password = { 'password': this.senhaForm.value.senha1 }
        this.authService.newPassword(password, this.token).subscribe(
            success => {
                this.blockUI.stop();
                this.sharedService.nofiticacao(success.message, 'success')
                this.router.navigate(['../../pages/login'])
            },
            error => {
                this.blockUI.stop();
                this.sharedService.nofiticacao(error.error, 'danger')
            })
    }
}