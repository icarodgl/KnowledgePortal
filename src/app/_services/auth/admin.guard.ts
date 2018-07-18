import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { AuthService } from './auth.service'

@Injectable()
export class AdminGuard implements CanActivate{

    constructor(private authService: AuthService, private router: Router){}

    canActivate(router: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        let user = JSON.parse(this.authService.getCurrentUser());
        if(user.groups.filter(g=> (g.name === "Admin")).length === 0) {
            this.router.navigate(['pages/login'], { queryParams: {returnUrl: state.url} });
        }

        return true;
    }
}