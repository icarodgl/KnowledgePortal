import { Component, OnInit } from '@angular/core';
import { Group, User } from '../../../_models/index.model';

@Component({
    selector: 'app-addgroup-cmp',
    templateUrl: './addgroup.component.html',
    styleUrls: ['./addgroup.component.css']
})
export class AddGroupComponent implements OnInit{
    private group:Group = new Group();
    private search:string;
    
    constructor(){
        this.group.isPublic = false;
        this.group.users = [];
    }

    ngOnInit(): void {
    }

    create(){
        console.log(this.group);
    }
    findAndAddUser(e){
        e.preventDefault();
        let u = new User();
        u.username = this.search;
        this.group.users.push(u);
    }

    removeUser(i){
        this.group.users.splice(i, 1);
    }
}
