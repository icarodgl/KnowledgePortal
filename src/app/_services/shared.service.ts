import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";

declare var $: any;

@Injectable()
export class SharedService {

    constructor(
        private cookieService: CookieService
    ) { }


    nofiticacao(mensagem, tipo) {
        $.notify({
            icon: 'notifications',
            message: mensagem
        }, {
                type: tipo,
                timer: 1000,
                placement: {
                    from: 'top',
                    align: 'right'
                },
            });
    }

    salvaCookie(token) {
        var dt = new Date();
        dt.setHours(dt.getHours() + 24);
        this.cookieService.set('token', JSON.stringify(token), dt)
    }

    deletaCookie() {
        this.cookieService.deleteAll()
    }

    getCookie(): any {
        return(this.cookieService.getAll())
    }

}

