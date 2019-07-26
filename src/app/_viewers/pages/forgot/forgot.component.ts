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

export class ForgotComponent implements OnInit, OnDestroy, AfterViewInit {
    private user: User = new User();
    test: Date = new Date();
    private toggleButton: any;
    private sidebarVisible: boolean;
    private nativeElement: Node;

    constructor(private element: ElementRef, private authService: AuthService, private userService:UserService, private router: Router, private route: ActivatedRoute) {
        if(this.authService.getCurrentUser()){
            this.router.navigate(['dashboard']);
        }else{
            this.nativeElement = element.nativeElement;
            this.sidebarVisible = false;
        }
        
    }

    login() {
        this.authService.login(this.user)
            .subscribe(_ => {
                this.router.navigate(['dashboard']);
            },
            error => {
                console.log(error)
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
        
        FB.init({
            appId      : '673893062964918',
            cookie     : true,
            xfbml      : true,
            version    : 'v3.0'
        });
    }
    sidebarToggle() {
        var toggleButton = this.toggleButton;
        var body = document.getElementsByTagName('body')[0];
        var sidebar = document.getElementsByClassName('navbar-collapse')[0];
        if (this.sidebarVisible == false) {
            setTimeout(function() {
                toggleButton.classList.add('toggled');
            }, 500);
            body.classList.add('nav-open');
            this.sidebarVisible = true;
        } else {
            this.toggleButton.classList.remove('toggled');
            this.sidebarVisible = false;
            body.classList.remove('nav-open');
        }
    }
    ngOnDestroy(){
      const body = document.getElementsByTagName('body')[0];
      body.classList.remove('login-page');
      body.classList.remove('off-canvas-sidebar');
    }

    ngAfterViewInit() {
        //this.googleInit();
    }

    public auth2;
    public googleInit() {
        let that = this;
        gapi.load('auth2', function(){
            that.auth2 = gapi.auth2.init({
                client_id: '305079514663-ddrsd311mqdghdhkcq4uu8be4i013e41.apps.googleusercontent.com',
                cookiepolici: 'single_host_origin',
                scope: 'profile email'
            });
            that.attachLogin(document.getElementById('googleBtn'));
        });
    }

    public attachLogin(element){
        let that = this;
        this.auth2.attachClickHandler(element, {}, 
            function (googleUser) {
                let user:User = new User();
                let profile = googleUser.getBasicProfile();
                let auth = googleUser.getAuthResponse();

                user.google = {
                    id : profile.getId(),
                    access_token : auth.access_token,
                    id_token : auth.id_token
                };
                that.authService.gLogin(user)
                    .subscribe(res => {
                        window.location.href = '/dashboard';
                        // that.router.navigateByUrl('dashboard');
                        // that.router.navigate(['dashboard']);
                    }, error => {
                        console.log(error);
                        if(error.error.errorCode == "auth-3"){
                            let pass = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                            user.firstname = profile.getGivenName();
                            user.surname = profile.getFamilyName();
                            user.email = profile.getEmail();
                            user.username = user.email.split('@')[0];
                            user.password = pass;
                            user.profile_picture = profile.getImageUrl();
                            that.userService.create(user)
                                .subscribe(
                                    _ => {
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
                                                    window.location.href = '/dashboard';
                                                    // that.router.navigateByUrl('dashboard');
                                                    // that.router.navigate(['/dashboard']);
                                                }, error => {
                                                    $.notify({
                                                        icon: 'notifications',
                                                        message: 'Oooopppss! <strong>' + error.error.userMessage +'</strong>. You can correct it and try again!'
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
                                    }, error => {
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
                            $.notify({
                                icon: 'notifications',
                                message: 'Oooopppss! <strong>' + error.error.userMessage +'</strong>. You can correct it and try again!'
                            }, {
                                type: 'danger',
                                timer: 250,
                                placement: {
                                    from: 'top',
                                    align: 'right'
                                }
                            });
                        }
                    });

            }, error => {
                swal({
                    type: 'error',
                    html: 'Oooopppss! <strong>' +
                        error.error.userMessage  +
                        '</strong>. <br /> You can try again later!',
                    confirmButtonClass: 'btn btn-danger',
                    buttonsStyling: false
                });
            }
        );
    }

    fbLogin(e){
        e.preventDefault();
        FB.login(result => {
            if (result.authResponse) {
                this.user.facebook = {
                    access_token:result.authResponse.accessToken,
                    id:result.authResponse.userID
                };
                this.authService.fbLogin(this.user)
                    .subscribe(_ => {
                        this.router.navigate(['dashboard']);
                    },
                    error => {
                        if(error.error.errorCode=="auth-3"){
                            let that = this;
                            FB.api(
                                '/me',
                                'GET',
                                {"fields":"email,first_name,last_name,picture,id"},
                                function(response) {
                                    let pass = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                                    that.user.firstname = response.first_name;
                                    that.user.surname = response.last_name;
                                    that.user.email = response.email;
                                    that.user.username = that.user.email.split('@')[0];
                                    that.user.password = pass;
                                    that.user.profile_picture = response.picture.data.url;
                                    that.userService.create(that.user)
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
                                                    that.authService.login(that.user)
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
                              );


                        }else{
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
                        }
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
        });
    }

    gLogin(e){
        e.preventDefault();

    }
}
