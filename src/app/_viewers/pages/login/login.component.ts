import {
  Component,
  OnInit,
  ElementRef,
  OnDestroy,
  AfterViewInit
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import swal from "sweetalert2";
import { User } from "app/_models/user.model";
import { AuthService, UserService } from "app/_services/index.service";
import { NgBlockUI, BlockUI } from "ng-block-ui";
import { SharedService } from "app/_services/shared.service";

declare var $: any;
declare var FB: any;
declare const gapi: any;

@Component({
  selector: "app-login-cmp",
  templateUrl: "./login.component.html"
})
export class LoginComponent implements OnInit, OnDestroy {
  user: User = new User();
  test: Date = new Date();
  toggleButton: any;
  sidebarVisible: boolean;
  nativeElement: Node;
  @BlockUI() blockUI: NgBlockUI;

  constructor(
    private element: ElementRef,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private sharedService: SharedService,
    private route: ActivatedRoute
  ) {
    if (this.authService.getCurrentUser()) {
      this.router.navigate(["dashboard"]);
    } else {
      this.nativeElement = element.nativeElement;
      this.sidebarVisible = false;
    }
  }

  login() {
    this.blockUI.start("Carregando");
    this.authService.login(this.user).subscribe(
      _ => {
        this.router.navigate(["dashboard"]);
        this.blockUI.stop();
      },
      error => {
        this.blockUI.stop();
        this.sharedService.nofiticacao("Login ou senha incorreto", "danger");
      }
    );
  }

  ngOnInit() {
    var navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName("navbar-toggle")[0];
    const body = document.getElementsByTagName("body")[0];
    body.classList.add("login-page");
    body.classList.add("off-canvas-sidebar");
    const card = document.getElementsByClassName("card")[0];
    setTimeout(function() {
      // after 1000 ms we add the class animated to the login/register card
      card.classList.remove("card-hidden");
    }, 700);

    FB.init({
      appId: "673893062964918",
      cookie: true,
      xfbml: true,
      version: "v3.0"
    });
  }
  sidebarToggle() {
    var toggleButton = this.toggleButton;
    var body = document.getElementsByTagName("body")[0];
    var sidebar = document.getElementsByClassName("navbar-collapse")[0];
    if (this.sidebarVisible == false) {
      setTimeout(function() {
        toggleButton.classList.add("toggled");
      }, 500);
      body.classList.add("nav-open");
      this.sidebarVisible = true;
    } else {
      this.toggleButton.classList.remove("toggled");
      this.sidebarVisible = false;
      body.classList.remove("nav-open");
    }
  }
  ngOnDestroy() {
    const body = document.getElementsByTagName("body")[0];
    body.classList.remove("login-page");
    body.classList.remove("off-canvas-sidebar");
  }
}
