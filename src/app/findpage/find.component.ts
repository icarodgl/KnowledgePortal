import { Component, OnInit, AfterViewInit, AfterViewChecked } from '@angular/core';
import { UserService } from '../_services/user/user.service';
import { User } from '../_models/index.model';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../_services/index.service';
import { FollowService } from '../_services/follow/follow.service';

declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: User[];
}

declare const $: any;

@Component({
    selector: 'app-find-cmp',
    templateUrl: 'find.component.html',
    styleUrls: ['./find.component.css']
})

export class FindComponent implements OnInit, AfterViewInit, AfterViewChecked {
    private search:string;
    public dataTable: DataTable;
    private userList: User[];
    public loaded: boolean = false;
    public rendered: boolean = false;
    private user: User;

    constructor(private userService: UserService, private route:ActivatedRoute, private authService:AuthService, private followService:FollowService){
      this.search = this.route.snapshot.params.search || "";
      this.user = JSON.parse(this.authService.getCurrentUser());
    }

    populate(){
      this.dataTable = {
        headerRow: [ 'picture','Username', 'Full Name', 'e-Mail', 'Actions' ],
        footerRow: [ 'picture','Username', 'Full Name', 'e-Mail', 'Actions' ],

        dataRows: this.userList
     };
     this.loaded = true;
    }

    ngOnInit() {
      
      this.userService.getAll()
        .subscribe(data => {
            this.userList = data;
            this.populate();
        });
    }

    ngAfterViewInit() {
    }

    ngAfterViewChecked() {
      let that = this;
      if(this.loaded && !this.rendered){
        $('#datatables').DataTable({
          "pagingType": "full_numbers",
          "lengthMenu": [
            [10, 25, 50, -1],
            [10, 25, 50, "All"]
          ],
          responsive: true,
          language: {
            search: "_INPUT_",
            searchPlaceholder: "Search user",
            zeroRecords: "No user found...",
          }

        });

        const table = $('#datatables').DataTable();

        // Edit record
        table.on('click', '.edit', function(e) {
          const $tr = $(this).closest('tr');
          const data = table.row($tr).data();
          alert('You press on Row: ' + data[0] + ' ' + data[1] + ' ' + data[2] + '\'s row.');
          e.preventDefault();
        });

        // Delete a record
        table.on('click', '.remove', function(e) {
          const $tr = $(this).closest('tr');
          table.row($tr).remove().draw();
          e.preventDefault();
        });

        //Follow user
        table.on('click', '.favorite_border', function(e) {
          e.preventDefault();
          const $tr = $(this).closest('tr');
          const data = table.row($tr).data();
          let user:User = new User();
          user.username = data[1];
          that.followService.follow(user)
            .subscribe(_ => {
              that.authService.updateUser()
                .subscribe(_ => {
                  window.location.reload();
                });
            });
        });

        table.on('click', '.favorite', function(e) {
          e.preventDefault();
          const $tr = $(this).closest('tr');
          const data = table.row($tr).data();
          let user:User = new User();
          user.username = data[1];
          that.followService.unfollow(user)
            .subscribe(_ => {
              that.authService.updateUser()
                .subscribe(_ => {
                    window.location.reload();
                });
            });
        });

        $('.card .material-datatables label').addClass('form-group');

        table.search(this.search).draw();
        this.rendered = true;
      }
      
    }

    following(id:string){
      let found = false;
      for(let i = 0; i < this.user.following.length; i++) {
          if (this.user.following[i]._id == id) {
              found = true;
              break;
          }
      }
      return found;
    }

}

