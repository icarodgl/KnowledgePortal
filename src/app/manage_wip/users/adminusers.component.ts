// IMPORTANT: this is a plugin which requires jQuery for initialisation and data manipulation

import { Component, OnInit, AfterViewInit, AfterViewChecked } from '@angular/core';
import { UserService } from '../../_services/user/user.service';
import { User } from '../../_models/index.model';

declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: User[];
}

declare const $: any;

@Component({
    selector: 'app-admin-users-cmp',
    templateUrl: 'adminusers.component.html'
})

export class AdminUsersComponent implements OnInit, AfterViewInit, AfterViewChecked {
    public dataTable: DataTable;
    private userList: User[];
    public loaded: boolean = false;
    public rendered: boolean = false; 

    constructor(private userService: UserService){}

    populate(){
      this.dataTable = {
        headerRow: [ 'Username', 'Full Name', 'e-Mail', 'Actions' ],
        footerRow: [ 'Username', 'Full Name', 'e-Mail', 'Actions' ],

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
            searchPlaceholder: "Search records",
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

        //Like record
        table.on('click', '.like', function(e) {
          alert('You clicked on Like button');
          e.preventDefault();
        });

        $('.card .material-datatables label').addClass('form-group');
        this.rendered = true;
      }
    }
}
