import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import * as go from 'gojs';
import { HttpClient } from '@angular/common/http';
import { AuthService, MapService, MeService, ModelService } from '../_services/index.service';
import { User, ConceptMap, Version } from '../_models/index.model';
import { Router } from '@angular/router';
import { myDiagram, ConceptMapComponent } from '../edit/conceptmap/conceptmap.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild("map1") map1: ConceptMapComponent;

  @ViewChild('myDiagramDiv') element: ElementRef;

  private images:SafeHtml[] = new Array<SafeHtml>();
  private idMap:String[] = new Array<String>();
  public user:User;
  public maps: ConceptMap[];
  public versions: Version[] = new Array<Version>();

  constructor(
      private http: HttpClient, 
      private _sanitizer: DomSanitizer, 
      private authServicve: AuthService,
      private mapService: MapService,
      private meService: MeService,
      private router:Router,
      private modelService:ModelService
  ){
      this.user = JSON.parse(this.authServicve.getCurrentUser());
  }
  public ngOnInit() {
        this.meService.getDashboardInfo()
            .subscribe(maps => {
                this.maps = maps;
                let serializer = new XMLSerializer();
                let svg;
                this.maps.forEach((m, i)=> {
                    myDiagram.model = go.Model.fromJson(m.versions[0].content);
                    svg = myDiagram.makeSvg({
                        scale: 0.5,
                        maxSize: new go.Size(NaN, 220)
                    });
                    this.images[i] = this._sanitizer.bypassSecurityTrustHtml(serializer.serializeToString(svg));
                });                
            }, error => console.log(error));
   }
   ngAfterViewInit() {
   }
   click(n){
        this.mapService.setCurrentMap(this.maps[n]);
        this.router.navigate(['view','map']);
   }
   newMap(e){
       e.preventDefault();
       this.modelService.removeCurrentModel();
       this.mapService.removeCurrentMap();
       this.map1.reset();
       this.router.navigate(['edit','cmap']);
   }
}
