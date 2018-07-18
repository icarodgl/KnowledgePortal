// IMPORTANT: this is a plugin which requires jQuery for initialisation and data manipulation

import { Component, OnInit, AfterViewInit, AfterViewChecked } from '@angular/core';
import { MapService } from '../../_services/index.service';
import { Map } from '../../_models/index.model';

declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: Map[];
}

declare const $: any;

@Component({
    selector: 'app-admin-maps-cmp',
    templateUrl: 'adminmaps.component.html'
})

export class AdminMapsComponent implements OnInit, AfterViewInit, AfterViewChecked {
    public dataTable: DataTable;
    private mapList: Map[];
    public loaded: boolean = false;
    public rendered: boolean = false; 

    constructor(private mapService: MapService){}

    populate(){
      this.dataTable = {
        headerRow: [ 'Title', 'Question', 'Author', 'Actions' ],
        footerRow: [ 'Title', 'Question', 'Author', 'Actions' ],

        dataRows: this.mapList
     };
     this.loaded = true;
    }

    ngOnInit() {
      this.mapService.getAll()
        .subscribe(data => {
            this.mapList = data;
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
