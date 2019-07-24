import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../../_models/index.model';
import { AuthService } from '../../_services/auth/auth.service';
import { Router } from '@angular/router';

declare var $: any;

@Component({
    selector: 'app-lock-cmp',
    templateUrl: './lock.component.html'
})
export class LockComponent implements OnInit, OnDestroy {
    public user:User;
    test: Date = new Date();
    constructor(private authService:AuthService, private router: Router){};
    ngOnInit() {
      const body = document.getElementsByTagName('body')[0];
      body.classList.add('lock-page');
      body.classList.add('off-canvas-sidebar');
      const card = document.getElementsByClassName('card')[0];
        setTimeout(function() {
            // after 1000 ms we add the class animated to the login/register card
            card.classList.remove('card-hidden');
        }, 700);
      this.user = JSON.parse(this.authService.getCurrentUser());
    }
    ngOnDestroy(){
      const body = document.getElementsByTagName('body')[0];
      body.classList.remove('lock-page');
      body.classList.remove('off-canvas-sidebar');

    }
    login(e){
        e.preventDefault();
        this.authService.login(this.user)
            .subscribe(data => {
                this.router.navigate(['dashboard']);
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
            })
    }
}
