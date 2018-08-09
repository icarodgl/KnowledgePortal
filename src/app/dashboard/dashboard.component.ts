import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import * as go from 'gojs';
import { HttpClient } from '@angular/common/http';
import { AuthService, MapService, MeService } from '../_services/index.service';
import { User, ConceptMap, Version } from '../_models/index.model';
import { Router } from '@angular/router';

declare const $: any;

var myDiagram: go.Diagram;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  @ViewChild('myDiagramDiv')
  element: ElementRef;

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
      private router:Router
  ){
      this.user = JSON.parse(this.authServicve.getCurrentUser());
  }
  public ngOnInit() {
      this.meService.updateDashboardMaps()
        .subscribe(maps => {
            this.maps = maps;
            this.meService.updateDashboardMapsVersions(this.maps)
                .subscribe(versions => {
                    versions.forEach(v => {
                        this.versions.findIndex(item => item.map._id == v.map._id) === -1 ? this.versions.push(v) : {} ;
                    });
                    let serializer = new XMLSerializer();
                    let svg;
                    for(let i = 0; i < (this.versions.length > 3 ? 3 : this.versions.length); i++){
                        myDiagram.model = go.Model.fromJson(this.versions[i].content);
                        this.idMap[i] = this.versions[i].map._id;
                        svg = myDiagram.makeSvg({
                            scale:0.5,
                            maxSize: new go.Size(NaN, 220)
                        });
                        this.images[i] = this._sanitizer.bypassSecurityTrustHtml(serializer.serializeToString(svg));
                    }
                });
        }, error => console.log(error));

    



      // RESOLVER ESSA POG 
    let conceptNodeTemplate, relationNodeTemplate, normalLinkTemplate, orLinkTemplate, mapTemplate;
    const $$ = go.GraphObject.make;

    myDiagram = 
        $$(go.Diagram, this.element.nativeElement,{
            initialContentAlignment: go.Spot.Center, // center the content
        });

        conceptNodeTemplate = 
            $$(go.Node, "Auto",  // the Shape will go around the TextBlock
                new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                $$(go.Shape, "Rectangle", 
                {
                    portId: "", 
                    strokeWidth: 1,
                    fromLinkable: true, 
                    fromLinkableSelfNode: true, 
                    fromLinkableDuplicates: true,
                    toLinkable: true, 
                    toLinkableSelfNode: true, 
                    toLinkableDuplicates: true,
                    cursor: "pointer",
                    fill: $$(go.Brush, "Linear", {0: "rgb(254, 201, 0)", 1:"rgb(254, 162, 0)"}),
                    stroke: "black"
                },
                    // Shape.fill is bound to Node.data.color
                    new go.Binding("fill", "color")
                ),
                $$(go.TextBlock,
                    {
                        font: "bold 12px sans-serif",
                        stroke: '#333',
                        margin: 6,  // make some extra space for the shape around the text
                        isMultiline: true,  // don't allow newlines in text
                        editable: true  // allow in-place editing by user
                    },  // some room around the text
                    // TextBlock.text is bound to Node.data.key
                    new go.Binding("text", "text").makeTwoWay()
                )
        );

        relationNodeTemplate = 
            $$(go.Node, "Auto",  // the Shape will go around the TextBlock
                new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                $$(go.Shape, "Rectangle", 
                {
                    portId: "", 
                    strokeWidth: 1,
                    fromLinkable: true, 
                    fromLinkableSelfNode: true, 
                    fromLinkableDuplicates: true,
                    toLinkable: true, 
                    toLinkableSelfNode: true, 
                    toLinkableDuplicates: true,
                    cursor: "pointer",
                    fill: "rgba(255,255,255,0)",
                    stroke: "rgba(255,255,255,0)"
                }),
                $$(go.TextBlock,
                    {
                        font: "bold 12px sans-serif",
                        stroke: '#333',
                        margin: 6,  // make some extra space for the shape around the text
                        isMultiline: true,  // don't allow newlines in text
                        editable: true
                    },  // some room around the text
                    // TextBlock.text is bound to Node.data.key
                    new go.Binding("text", "text").makeTwoWay()
                )
        );

        normalLinkTemplate = 
            $$(go.Link,
                { 
                    toShortLength: 3, 
                    relinkableFrom: true, 
                    relinkableTo: true,
                    curve: go.Link.Bezier,
                    reshapable: true
                },  // allow the user to relink existing links
                new go.Binding("points").makeTwoWay(),
                $$(go.Shape,
                    {
                        strokeWidth: 1 
                    },
                    new go.Binding("stroke", "color").makeTwoWay()
                ),
                $$(go.Shape,
                    { 
                        toArrow: "Standard",
                        stroke: null
                    },
                    new go.Binding("stroke", "color").makeTwoWay(),
                    new go.Binding("fill", "color").makeTwoWay(),
            )
        );

        orLinkTemplate = 
            $$(go.Link,
                { 
                    toShortLength: 3, 
                    relinkableFrom: true, 
                    relinkableTo: true,
                    curve: go.Link.Bezier,
                    reshapable: true
                },  // allow the user to relink existing links
                new go.Binding("points").makeTwoWay(),
                $$(go.Shape,
                    {
                        strokeWidth: 1 
                    },
                    new go.Binding("stroke", "color").makeTwoWay()
                ),
                $$(go.Shape,
                    {
                        toArrow: "Standard",
                        stroke: null
                    },
                    new go.Binding("fill", "color").makeTwoWay()
                ),
                $$(go.Shape,
                    {
                        strokeWidth: 1, 
                        fromArrow: "BackwardSemiCircle" 
                    },
                    new go.Binding("fill", "color").makeTwoWay()
                )
            );

        mapTemplate =
            $$(go.Group, "Auto",{},
                new go.Binding("isSubGraphExpanded", "expanded").makeTwoWay(),
                new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                $$(go.Shape, "RoundedRectangle",
                    {
                        strokeWidth: 1,
                        portId: "", 
                        cursor: "pointer",
                        fromLinkable: true, 
                        fromLinkableSelfNode: true, 
                        fromLinkableDuplicates: true,
                        toLinkable: true, 
                        toLinkableSelfNode: true, 
                        toLinkableDuplicates: true 
                    },
                    new go.Binding("fill", "isHighlighted", function(h) { return h ? "rgba(255,0,0,0.2)" : $$(go.Brush, "Linear", { 0: "rgba(224,234,252,0.5)", 1: "rgba(207,222,243,0.5)" }); }).ofObject(),
                ),
                $$(go.Panel, "Vertical",
                    { 
                        defaultAlignment: go.Spot.Center, 
                        margin: 6 
                    },
                    $$(go.Panel, "Horizontal",
                        { 
                            defaultAlignment: go.Spot.Top
                        },
                        $$("SubGraphExpanderButton"), // the SubGraphExpanderButton is a panel that functions as a button to expand or collapse the subGraph
                        $$(go.TextBlock,
                            {
                                font: "bold 12px sans-serif",
                                stroke: '#333',
                                margin: 4,  // make some extra space for the shape around the text
                                isMultiline: true,  // don't allow newlines in text
                                editable: true, 
                                alignment: go.Spot.Center
                            },
                            new go.Binding("text", "text").makeTwoWay())
                    ),
                    $$(go.Placeholder, // create a placeholder to represent the area where the contents of the group are
                        { 
                            padding: new go.Margin(0, 5) 
                        }
                    )
                )
        );

        myDiagram.nodeTemplateMap.add("concept", conceptNodeTemplate);
        myDiagram.nodeTemplateMap.add("relation", relationNodeTemplate);
        
        myDiagram.linkTemplateMap.add("normal", normalLinkTemplate);
        myDiagram.linkTemplateMap.add("or", orLinkTemplate);
        
        myDiagram.groupTemplateMap.add("map", mapTemplate);
   }
   ngAfterViewInit() {
       
   }
   click(n){
        this.mapService.setCurrentMap(this.maps[n]);
        this.router.navigate(['view','map']);
   }
}
