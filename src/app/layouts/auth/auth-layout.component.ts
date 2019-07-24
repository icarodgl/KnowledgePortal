import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../../_services/auth/auth.service';
import { User } from '../../_models/index.model';

@Component({
  selector: 'app-layout',
  templateUrl: './auth-layout.component.html'
})
export class AuthLayoutComponent implements OnInit {
  private toggleButton: any;
  private sidebarVisible: boolean;
  mobile_menu_visible: any = 0;
  private _router: Subscription;
  private user:User;

  constructor(private router: Router, private element: ElementRef, private authService:AuthService) {
      this.user = JSON.parse(this.authService.getCurrentUser());
      this.sidebarVisible = false;
  }

  ngOnInit(){
    const navbar: HTMLElement = this.element.nativeElement;

    this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];
    this._router = this.router.events.filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {
      this.sidebarClose();
    });
  }
  sidebarOpen() {
      const toggleButton = this.toggleButton;
      const body = document.getElementsByTagName('body')[0];
      setTimeout(function(){
          toggleButton.classList.add('toggled');
      }, 500);
      body.classList.add('nav-open');

      this.sidebarVisible = true;
  };
  sidebarClose() {
      const body = document.getElementsByTagName('body')[0];
      this.toggleButton.classList.remove('toggled');
      this.sidebarVisible = false;
      body.classList.remove('nav-open');
  };
  sidebarToggle() {
    const body = document.getElementsByTagName('body')[0];
      if (this.sidebarVisible === false) {
          this.sidebarOpen();
          var $layer = document.createElement('div');
          $layer.setAttribute('class', 'close-layer');
          if (body.querySelectorAll('.wrapper-full-page')) {
              document.getElementsByClassName('wrapper-full-page')[0].appendChild($layer);
          }else if (body.classList.contains('off-canvas-sidebar')) {
              document.getElementsByClassName('wrapper-full-page')[0].appendChild($layer);
          }
          setTimeout(function() {
              $layer.classList.add('visible');
          }, 100);
          $layer.onclick = function() { //asign a function
            body.classList.remove('nav-open');
            this.mobile_menu_visible = 0;
            $layer.classList.remove('visible');
            this.sidebarClose();
          }.bind(this);

          body.classList.add('nav-open');
      } else {
        document.getElementsByClassName("close-layer")[0].remove();
          this.sidebarClose();
      }
  }

  isLocked() {
      if(this.user && !this.user.token){
          return true;
      }
      return false;
  }
}
