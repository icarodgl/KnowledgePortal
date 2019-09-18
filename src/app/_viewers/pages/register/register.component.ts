import { Component, OnInit, OnDestroy, AfterViewInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl
} from "@angular/forms";
import swal from "sweetalert2";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { UserService, AuthService } from "app/_services/index.service";
import { User } from "app/_models/user.model";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { FormValidations } from "../shared/form.validator";

declare const $: any;
declare const FB: any;
declare const gapi: any;

@Component({
  selector: "app-register-cmp",
  templateUrl: "./register.component.html"
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  test: Date = new Date();
  private userLocInformation: any;
  @BlockUI() blockUI: NgBlockUI;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const body = document.getElementsByTagName("body")[0];
    body.classList.add("register-page");
    body.classList.add("off-canvas-sidebar");
    const card = document.getElementsByClassName("card")[0];
    setTimeout(function() {
      // after 1000 ms we add the class animated to the login/register card
      card.classList.remove("card-hidden");
    }, 700);

    this.registerForm = this.formBuilder.group({
      // To add a validator, we must first convert the string value into an array. The first item in the array is the default value if any, then the next item in the array is the validator. Here we are adding a required validator meaning that the firstname attribute must have a value in it.
      firstname: ["", Validators.required],
      surname: ["", Validators.required],
      username: ["", [Validators.required, Validators.pattern("^[a-z0-9]*")]],
      email: [
        "",
        [
          Validators.required,
          Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$")
        ]
      ],
      // We can use more than one validator per field. If we want to use more than one validator we have to wrap our array of validators with a Validators.compose function. Here we are using a required, minimum length and maximum length validator.
      password: ["", Validators.required],
      repassword: [
        "",
        [Validators.required, FormValidations.equalsTo("password")]
      ]
    });

    FB.init({
      appId: "673893062964918",
      cookie: true,
      xfbml: true,
      version: "v3.0"
    });

    this.http.get("http://ip-api.com/json").subscribe(
      data => {
        this.userLocInformation = data;
      },
      error => console.log(error)
    );
  }
  matchPassword(AC: AbstractControl) {
    const password = AC.root.get("password").value; // to get value in input tag
    const confirmPassword = AC.root.get("rePassword").value; // to get value in input tag
    if (password !== confirmPassword) {
      AC.root.get("rePassword").setErrors({ MatchPassword: true });
    } else {
      return null;
    }
  }
  ngOnDestroy() {
    const body = document.getElementsByTagName("body")[0];
    body.classList.remove("register-page");
    body.classList.remove("off-canvas-sidebar");
  }

  register(e) {
    this.blockUI.start("Carregando");
    e.preventDefault();
    let user = this.registerForm.getRawValue();
    this.userService.create(user).subscribe(
      data => {
        this.blockUI.stop();
        swal({
          type: "success",
          html:
            "Ótimo! <strong>" +
            "Usuário criado com sucesso" +
            "</strong>. <br /> Você será redirecionado!",
          confirmButtonClass: "btn btn-success",
          buttonsStyling: false
        }).then(() => {
          this.authService.login(user).subscribe(
            res => {
              this.router.navigate(["dashboard"]);
            },
            error => {
              $.notify(
                {
                  icon: "notifications",
                  message:
                    "Oooopppss! <strong>" +
                    error.json().userMessage +
                    "</strong>. Tente novamente!"
                },
                {
                  type: "danger",
                  timer: 250,
                  placement: {
                    from: "top",
                    align: "right"
                  }
                }
              );
            }
          );
        });
      },
      error => {
        this.blockUI.stop();
        swal({
          type: "error",
          html:
            "Oooopppss! <strong>" +
            error.error +
            "</strong>. <br /> Tente novamente",
          confirmButtonClass: "btn btn-danger",
          buttonsStyling: false
        });
      }
    );
  }
}
