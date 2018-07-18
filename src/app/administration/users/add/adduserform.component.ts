import { Component } from '@angular/core';

import {FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import { PasswordValidation } from './password-validator.component';
import { UserService } from '../../../_services/user/user.service';
import { Router } from '@angular/router';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

declare const $: any;

@Component({
    selector: 'app-adduserform-cmp',
    templateUrl: 'adduserform.component.html'
})
export class AddUserFormComponent {

  constructor(private userService: UserService, private formBuilder: FormBuilder, private router: Router){};

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  validTextType: boolean = false;
  validEmailType: boolean = false;
  validNumberType: boolean = false;
  validUrlType: boolean = false;
  pattern = "https?://.+";
  validSourceType: boolean = false;
  validDestinationType: boolean = false;

  matcher = new MyErrorStateMatcher();
  type : FormGroup;


   isFieldValid(form: FormGroup, field: string) {
     return !form.get(field).valid && form.get(field).touched;
   }

   displayFieldCss(form: FormGroup, field: string) {
     return {
       'has-error': this.isFieldValid(form, field),
       'has-feedback': this.isFieldValid(form, field)
     };
   }

   back(){
     this.router.navigate(['administration/users']);
   }

   onType() {
     if (this.type.valid) {
       this.userService.create(this.type.getRawValue())
          .subscribe(data => {
            $.notify({
              icon: 'notifications',
              message: data.userMessage
            }, {
                type: 'success',
                timer: 3000,
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
            this.type.reset();
            for(var key in this.type.controls) this.type.controls[key].setErrors(null);
          }, error => alert(error));
     } else {
       this.validateAllFormFields(this.type);
     }
   }
   validateAllFormFields(formGroup: FormGroup) {
     Object.keys(formGroup.controls).forEach(field => {
       const control = formGroup.get(field);
       if (control instanceof FormControl) {
         control.markAsTouched({ onlySelf: true });
       } else if (control instanceof FormGroup) {
         this.validateAllFormFields(control);
       }
     });
   }
  ngOnInit() {
       this.type = this.formBuilder.group({
         // To add a validator, we must first convert the string value into an array. The first item in the array is the default value if any, then the next item in the array is the validator. Here we are adding a required validator meaning that the firstname attribute must have a value in it.
         firstname: [null, Validators.required],
         surname: [null, Validators.required],
         username: [null, Validators.required],
         email: [null, [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
         // We can use more than one validator per field. If we want to use more than one validator we have to wrap our array of validators with a Validators.compose function. Here we are using a required, minimum length and maximum length validator.
         password: ['', Validators.required],
         confirmPassword: ['', Validators.required],
        }, {
          validator: PasswordValidation.MatchPassword // your validation method
      });
  }
  textValidationType(e){
      if (e) {
          this.validTextType = true;
      }else{
        this.validTextType = false;
      }
  }
  emailValidationType(e){
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(String(e).toLowerCase())) {
        this.validEmailType = true;
    } else {
      this.validEmailType = false;
    }
  }
  
  sourceValidationType(e){
      if (e) {
          this.validSourceType = true;
      }else{
        this.validSourceType = false;
      }
  }
  confirmDestinationValidationType(e){
    if (this.type.controls['password'].value === e) {
        this.validDestinationType = true;
    }else{
      this.validDestinationType = false;
    }
  }

}
