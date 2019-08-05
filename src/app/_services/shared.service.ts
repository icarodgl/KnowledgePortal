import { Injectable } from "@angular/core";

declare var $: any;

@Injectable()
export class SharedService {
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
}