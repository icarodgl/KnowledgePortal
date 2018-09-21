// IMPORTANT: this is a plugin which requires jQuery for initialisation and data manipulation

import { Component, OnInit, AfterViewInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { ConceptMap } from '../../_models/conceptmap.model';
import { MeService } from '../../_services/me/me.service';
import { myDiagram, ConceptMapComponent, resetModel } from '../../edit/conceptmap/conceptmap.component';
import swal from 'sweetalert2';
import { Router } from '@angular/router';

declare interface DataTable {
    headerRow: string[];
    footerRow: string[];
    dataRows: ConceptMap[];
}

declare const $: any;

@Component({
    selector: 'app-manage-maps-cmp',
    templateUrl: 'managemaps.component.html',
    styleUrls: ['./managemaps.component.css']
})

export class ManageMapsComponent implements OnInit, AfterViewInit, AfterViewChecked {
    @ViewChild("map1") map1: ConceptMapComponent;

    @ViewChild('myDiagramDiv') element: ElementRef;

    private mapList: ConceptMap[];
    public dataTable: DataTable;
    public loaded: boolean = false;
    public rendered: boolean = false; 
    public isChecked: boolean = true;

    constructor(private meService:MeService, private router:Router){}

    populate() {
        this.dataTable = {
            headerRow: [ 'id','Title', 'Description', 'Versions', 'Actions' ],
            footerRow: [ 'id','Title', 'Description', 'Versions', 'Actions' ],

            dataRows: this.mapList
            };
            this.loaded = true;
    }

    ngOnInit() {
        this.meService.getMaps()
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
    change(){
        console.log(this.isChecked);
    }

    newMap(e){
        e.preventDefault();
        swal({
             title: 'Are you sure?',
             text: "If you have a map not yet saved, this will delete all unsaved information. Do you wish to continue?",
             type: 'warning',
             showCancelButton: true,
             confirmButtonClass: 'btn btn-success',
             cancelButtonClass: 'btn btn-danger',
             confirmButtonText: 'Yes, create a new...',
             buttonsStyling: false
         }).then((result) => {
             if (result.value) {
                 resetModel();
                 this.router.navigate(['edit','cmap']);
             }
         });
    }
}
