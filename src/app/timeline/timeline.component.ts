import { Component, AfterViewInit, OnInit, ElementRef, ViewChild } from '@angular/core';
import { User } from '../_models/user.model';
import * as go from 'gojs';
import { AuthService, UserService, MapService, VersionService } from '../_services/index.service';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

var myDiagram: go.Diagram;

@Component({
    selector: 'app-timeline-cmp',
    templateUrl: 'timeline.component.html',
    styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements AfterViewInit, OnInit {

    @ViewChild('myDiagramDiv')
    element: ElementRef;
    
    
    currentUser:User;
    images:SafeHtml[] = new Array<SafeHtml>();
    idImages:String[] = new Array<String>();


    constructor(
        private authService:AuthService, 
        private userService:UserService, 
        private mapService:MapService, 
        private versionService:VersionService,
        private _sanitizer: DomSanitizer, 
    ){
        this.currentUser = JSON.parse(authService.getCurrentUser());
    }
    ngOnInit() {
        //this.currentUser.following.forEach((follow, i, arr) => {
        //    this.userService.getUserData(follow._id)
        //        .subscribe(u => {
        //            u.maps.forEach((map, i2, arr2) => {
        //                this.mapService.getMapData(map._id)
        //                    .subscribe(m => {
        //                        m.versions.forEach((version, i3, arr3) => {
        //                            this.versionService.getVersionData(version._id)
        //                                .subscribe(v => {
        //                                    arr3[i3] = v;
        //                                    let serializer = new XMLSerializer();
        //                                    let svg;
        //                                    myDiagram.model = go.Model.fromJson(v.content);
        //                                    svg = myDiagram.makeSvg({
        //                                        scale:0.8,
        //                                        maxSize: new go.Size(NaN, 300)
        //                                    });
        //                                    this.images.push(this._sanitizer.bypassSecurityTrustHtml(serializer.serializeToString(svg)));
        //                                    this.idImages.push(v._id);
        //                                })
        //                        })
        //                        arr2[i2] = m;
        //                    })
        //            })
        //            arr[i] = u;
        //        });
        //});



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
    like(e, i){
        e.preventDefault();
        console.log(i);
    }
}
