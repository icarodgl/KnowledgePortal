import { Component, OnInit } from '@angular/core';
import {myDiagram} from '../conceptmap.component';
import * as go from 'gojs';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { MapService } from '../../../_services/index.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Map } from '../../../_models/index.model';

declare var $: any;

@Component({
    selector: 'app-savemap-cmp',
    templateUrl: './savemap.component.html',
    styleUrls: ['./savemap.component.css']
})
export class SaveMapComponent implements OnInit{
    private image:SafeHtml;
    public map:Map;
    regularItems;
    teste:boolean = false;

    constructor(private _sanitizer: DomSanitizer, private mapService: MapService){
        this.map = new Map();
        this.map.isPublic = true;
        this.map.keywords = [];
    }

    ngOnInit(): void {
        this.regularItems = [];
        if(!!myDiagram) {
            let serializer = new XMLSerializer();
            let svg = myDiagram.makeSvg({
                scale:0.4,
                maxSize: new go.Size(330, 220)
            });
            this.image = this._sanitizer.bypassSecurityTrustHtml(serializer.serializeToString(svg));
        }

    }

    save() {
        this.map.keywords = this.map.keywords.map((el:any) => el.value);
        this.mapService.create(this.map)
            .subscribe(data => console.log(data), error => console.log(error));
    }
    
}
