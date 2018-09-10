import { Component, OnInit } from '@angular/core';
import {myDiagram} from '../conceptmap.component';
import * as go from 'gojs';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { MapService, AuthService } from '../../../_services/index.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import swal from 'sweetalert2';
import { ConceptMap, Permission, Group, User } from '../../../_models/index.model';
import { Router } from '@angular/router';

declare var $: any;

@Component({
    selector: 'app-savemap-cmp',
    templateUrl: './savemap.component.html',
    styleUrls: ['./savemap.component.css']
})
export class SaveMapComponent implements OnInit{
    private image:SafeHtml;
    public map:ConceptMap;
    regularItems;
    teste:boolean = false;
    private search: string;

    constructor(
        private _sanitizer: DomSanitizer, 
        private mapService: MapService, 
        private router: Router,
        private authService: AuthService
    ){
        this.map = new ConceptMap();
        this.map.keywords = [];
        this.map.permissions = {
            publicPermission: new Permission(),
            groups: [],
            users: []
        }
    }

    ngOnInit(): void {
        this.regularItems = [];
        if(!!myDiagram) {
            let serializer = new XMLSerializer();
            let svg = myDiagram.makeSvg({
                scale:0.6,
                maxSize: new go.Size(NaN, 220)
            });
            this.image = this._sanitizer.bypassSecurityTrustHtml(serializer.serializeToString(svg));
        }

    }

    save() {
        let that = this;
        this.map.keywords = this.map.keywords.map((el:any) => el.value);
        this.mapService.create(this.map)
            .subscribe(
                data => {
                    this.mapService.setCurrentMap(data.map);
                    this.mapService.createVersion(myDiagram.model.toJson())
                        .subscribe(_ => {
                            swal({
                                type: 'success',
                                html: 'Greate! <strong>' +
                                        'Your map was saved' +
                                    '</strong>. <br /> You will be redirect to your dashboard!',
                                confirmButtonClass: 'btn btn-success',
                                buttonsStyling: false
                            }).then(() => {
                                that.authService.updateUser()
                                    .subscribe(_ => {
                                        that.router.navigate(['dashboard']);
                                    }, error=> console.log(error));
                            });
                        }, error=> console.log(error));
                }, 
                error => console.log(error));
    }
    back(){
        this.router.navigate(['edit/cmap']);
    }

    click(bt){
        switch(bt){
            case 'canView':
                this.map.permissions.publicPermission.canView = !this.map.permissions.publicPermission.canView;
                if(!this.map.permissions.publicPermission.canView){
                    this.map.permissions.publicPermission.canFork = false;
                    this.map.permissions.publicPermission.canEdit = false;
                }
                break;
            case 'canFork':
                this.map.permissions.publicPermission.canFork = !this.map.permissions.publicPermission.canFork;
                if(this.map.permissions.publicPermission.canFork){
                    this.map.permissions.publicPermission.canView = true;
                }else{
                    this.map.permissions.publicPermission.canEdit = false;
                }
                break;
            case 'canEdit':
                this.map.permissions.publicPermission.canEdit = !this.map.permissions.publicPermission.canEdit;
                if(this.map.permissions.publicPermission.canEdit){
                    this.map.permissions.publicPermission.canView = true;
                    this.map.permissions.publicPermission.canFork = true;
                }
                break;
        }
    }

    findAndAddGroup(e){
        e.preventDefault();
        let g = new Group();
        g.name = this.search;
        let a = {
            group: g,
            permission: new Permission()
        }
        this.map.permissions.groups.push(a);
    }
    findAndAddUser(e){
        e.preventDefault();
        let u = new User();
        u.username = this.search;
        let a = {
            user: u,
            permission: new Permission()
        }
        this.map.permissions.users.push(a);
    }

    removeGroup(i){
        this.map.permissions.groups.splice(i, 1);
    }
    removeUser(i){
        this.map.permissions.users.splice(i, 1);
    }
    
}
