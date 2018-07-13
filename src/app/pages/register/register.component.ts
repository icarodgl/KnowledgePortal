import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../_services/user/user.service';
import swal from 'sweetalert2';
import { AuthService } from '../../_services/auth/auth.service';
import { Router } from '@angular/router';
import { User } from '../../_models/user.model';

declare var $: any;
declare var FB: any;

@Component({
    selector: 'app-register-cmp',
    templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit, OnDestroy {
    registerForm: FormGroup;
    test: Date = new Date();

    constructor(private formBuilder: FormBuilder, private userService: UserService, private authService: AuthService, private router: Router){}

    ngOnInit() {
      const body = document.getElementsByTagName('body')[0];
      body.classList.add('register-page');
      body.classList.add('off-canvas-sidebar');
      const card = document.getElementsByClassName('card')[0];
      setTimeout(function() {
            // after 1000 ms we add the class animated to the login/register card
            card.classList.remove('card-hidden');
        }, 700);
        
        this.registerForm = this.formBuilder.group({
            // To add a validator, we must first convert the string value into an array. The first item in the array is the default value if any, then the next item in the array is the validator. Here we are adding a required validator meaning that the firstname attribute must have a value in it.
            firstname: ['', Validators.required],
            surname: ['', Validators.required],
            username: ['', Validators.required],
            email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
            // We can use more than one validator per field. If we want to use more than one validator we have to wrap our array of validators with a Validators.compose function. Here we are using a required, minimum length and maximum length validator.
            password: ['', Validators.required]
           });
        
        FB.init({
            appId      : '673893062964918',
            cookie     : true,
            xfbml      : true,
            version    : 'v3.0'
        });
        
    }

    ngOnDestroy(){
      const body = document.getElementsByTagName('body')[0];
      body.classList.remove('register-page');
      body.classList.remove('off-canvas-sidebar');
    }
      
    register(e){
        e.preventDefault();
        let user = this.registerForm.getRawValue();

        this.userService.create(user)
            .subscribe(
                data => {
                    swal({
                        type: 'success',
                        html: 'Greate! <strong>' +
                                'User creation successfull' +
                              '</strong>. <br /> You will be redirect!',
                        confirmButtonClass: 'btn btn-success',
                        buttonsStyling: false
                    }).then(() => {
                        this.authService.login(user)
                            .subscribe(res => {
                                this.router.navigate(['dashboard']);
                            }, error => {
                                $.notify({
                                    icon: 'notifications',
                                    message: 'Oooopppss! <strong>' + error.json().userMessage +'</strong>. You can correct it and try again!'
                                }, {
                                    type: 'danger',
                                    timer: 250,
                                    placement: {
                                        from: 'top',
                                        align: 'right'
                                    }
                                });
                            });
                    });
                },
                error => {
                    swal({
                        type: 'error',
                        html: 'Oooopppss! <strong>' +
                                error.error.userMessage +
                            '</strong>. <br /> You can correct it and try again!',
                        confirmButtonClass: 'btn btn-danger',
                        buttonsStyling: false
                    });
                }
            )

    }

    fbRegister(e){
        let that = this;
        let user:User = new User();
        e.preventDefault();
        FB.login(result => {
            if (result.authResponse) {
                FB.api(
                    '/me',
                    'GET',
                    {"fields":"email,first_name,last_name,picture,id"},
                    function(response) {
                        let pass = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                        user.firstname = response.first_name;
                        user.surname = response.last_name;
                        user.email = response.email;
                        user.username = user.email.split('@')[0];
                        user.password = pass;
                        user.profile_picture = response.picture.data.url;
                        user.facebook = {};
                        user.facebook.id = result.authResponse.userID;
                        user.facebook.access_token = result.authResponse.accessToken;
                        that.userService.create(user)
                            .subscribe(
                                data => {
                                    swal({
                                        type: 'success',
                                        html: 'Greate! <strong>' +
                                                'User creation successfull' +
                                            '</strong>. <br /> You will be redirect!',
                                        confirmButtonClass: 'btn btn-success',
                                        buttonsStyling: false
                                    }).then(() => {
                                        that.authService.login(user)
                                            .subscribe(res => {
                                                that.router.navigate(['dashboard']);
                                            }, error => {
                                                $.notify({
                                                    icon: 'notifications',
                                                    message: 'Oooopppss! <strong>' + error.json().userMessage +'</strong>. You can correct it and try again!'
                                                }, {
                                                    type: 'danger',
                                                    timer: 250,
                                                    placement: {
                                                        from: 'top',
                                                        align: 'right'
                                                    }
                                                });
                                            });
                                    });
                                },
                                error => {
                                    if(error.error.errorCode == "users-3") {
                                        that.authService.fbLogin(user)
                                            .subscribe(_ => {
                                                that.router.navigate(['dashboard']);
                                            },
                                            error => {
                                                $.notify({
                                                    icon: 'notifications',
                                                    message: error.error.userMessage
                                                }, {
                                                    type: 'danger',
                                                    timer: 1000,
                                                    placement: {
                                                        from: 'top',
                                                        align: 'right'
                                                    },
                                                    template: '<div data-notify="container" class="col-xs-11 col-sm-4 alert alert-{0}" role="alert">' +
                                                        '<button mat-raised-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
                                                        '<span data-notify="title">{1}</span> ' +
                                                        '<span data-notify="message">{2}</span>' +
                                                        '<div class="progress" data-notify="progressbar">' +
                                                        '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
                                                        '</div>' +
                                                        '<a href="{3}" target="{4}" data-notify="url"></a>' +
                                                    '</div>'
                                                });
                                            });
                                    }else{
                                        swal({
                                            type: 'error',
                                            html: 'Oooopppss! <strong>' +
                                                    error.error.userMessage +
                                                '</strong>. <br /> You can correct it and try again!',
                                            confirmButtonClass: 'btn btn-danger',
                                            buttonsStyling: false
                                        });
                                    }
                                }
                            )

                    }
                  );
            }else{
                swal({
                    type: 'error',
                    html: 'Oooopppss! <strong>' +
                            'An unexpected error occurred.' +
                        '</strong>. <br /> You can try again later!',
                    confirmButtonClass: 'btn btn-danger',
                    buttonsStyling: false
                });
            }
        },{scope: 'email, public_profile'});
    }
}
