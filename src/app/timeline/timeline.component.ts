import { Component, AfterViewInit, OnInit } from '@angular/core';
import { User } from '../_models/user.model';
import { AuthService, UserService } from '../_services/index.service';

@Component({
    selector: 'app-timeline-cmp',
    templateUrl: 'timeline.component.html'
})

export class TimelineComponent implements AfterViewInit, OnInit {
    
    
    private currentUser:User;
    private friendsData:User[] = new Array<User>();

    constructor(private authService:AuthService, private userService:UserService){
        this.currentUser = JSON.parse(authService.getCurrentUser());
    }
    ngOnInit() {
        this.currentUser.following.forEach(f => {
            this.userService.getUserData(f._id)
                .subscribe(u => {
                    u.maps.forEach(m => {})
                    this.friendsData.push(u);
                });
        })
    }
    ngAfterViewInit() {
        console.log(this.friendsData);
    }
}
