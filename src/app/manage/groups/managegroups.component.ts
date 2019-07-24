// IMPORTANT: this is a plugin which requires jQuery for initialisation and data manipulation

import { Component, OnInit, AfterViewInit, AfterViewChecked } from '@angular/core';
import { Group } from '../../_models/group.model';
import { MeService } from '../../_services/me/me.service';

declare interface DataTable {
    headerRow: string[];
    footerRow: string[];
    dataRows: Group[];
}

declare const $: any;

@Component({
    selector: 'app-manage-groups-cmp',
    templateUrl: 'managegroups.component.html',
    styleUrls: ['./managegroups.component.css']
})

export class ManageGroupsComponent implements OnInit, AfterViewInit, AfterViewChecked {
    private groupList: Group[];
    public dataTable: DataTable;
    public loaded: boolean = false;
    public rendered: boolean = false; 
    public isChecked: boolean = true;

    constructor(private meService:MeService){}

    populate() {
        this.dataTable = {
            headerRow: [ 'Name','Description', 'Is Public', 'Members', 'Actions' ],
            footerRow: [ 'Name','Description', 'Is Public', 'Members', 'Actions' ],

            dataRows: this.groupList
            };
            this.loaded = true;
    }

    ngOnInit() {
        this.meService.getGroups()
            .subscribe(data => {
                this.groupList = data;
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
    change(){
        console.log(this.isChecked);
    }
}
