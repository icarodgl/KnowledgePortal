import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { TableData } from '../../md/md-table/md-table.component';
import { LegendItem, ChartType } from '../../md/md-chart/md-chart.component';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import * as go from 'gojs';
import * as Chartist from 'chartist';
import { HttpClient } from '@angular/common/http';
import { AuthService, VersionService, MapService, MeService } from '../../_services/index.service';
import { User, ConceptMap, Version } from '../../_models/index.model';
import { map } from 'rxjs-compat/operator/map';
import { Router } from '@angular/router';

declare const $: any;

var myDiagram: go.Diagram;

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admindashboard.component.html',
  styleUrls: ['./admindashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {

  @ViewChild('myDiagramDiv')
  element: ElementRef;

  private images:SafeHtml[] = new Array<SafeHtml>();
  private idMap:String[] = new Array<String>();
  private globalInfo: Object[];
  public loaded: boolean = false;
  public tableData: TableData;
  public user:User;
  public maps: ConceptMap[];
  public versions: Version[] = new Array<Version>();

  constructor(
      private http: HttpClient, 
      private _sanitizer: DomSanitizer, 
      private authServicve: AuthService,
      private versionService: VersionService,
      private mapService: MapService,
      private meService: MeService,
      private router:Router
  ){
      this.user = JSON.parse(authServicve.getCurrentUser());
  }
  startAnimationForLineChart(chart: any) {
      let seq: any, delays: any, durations: any;
      seq = 0;
      delays = 80;
      durations = 500;
      chart.on('draw', function(data: any) {

        if (data.type === 'line' || data.type === 'area') {
          data.element.animate({
            d: {
              begin: 600,
              dur: 700,
              from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
              to: data.path.clone().stringify(),
              easing: Chartist.Svg.Easing.easeOutQuint
            }
          });
        } else if (data.type === 'point') {
              seq++;
              data.element.animate({
                opacity: {
                  begin: seq * delays,
                  dur: durations,
                  from: 0,
                  to: 1,
                  easing: 'ease'
                }
              });
          }
      });

      seq = 0;
  }
  startAnimationForBarChart(chart: any) {
      let seq2: any, delays2: any, durations2: any;
      seq2 = 0;
      delays2 = 80;
      durations2 = 500;
      chart.on('draw', function(data: any) {
        if (data.type === 'bar') {
            seq2++;
            data.element.animate({
              opacity: {
                begin: seq2 * delays2,
                dur: durations2,
                from: 0,
                to: 1,
                easing: 'ease'
              }
            });
        }
      });

      seq2 = 0;
  }
  // constructor(private navbarTitleService: NavbarTitleService) { }
  public populate() {
      let total:any = 0;
      let arr:string[][] = new Array<string[]>();
      this.globalInfo.forEach((el:any) => total+=el.count);

      this.globalInfo.forEach(function(el:any) {
          if(el._id) arr.push([el.countryCode, el._id, el.count, Math.round(((el.count/total)*100)*10)/10+'%']);
          else arr.push(['unknow', 'Unknow', el.count, Math.round(((el.count/total)*100)*10)/10+'%']);
      });
    this.tableData = {
        headerRow: ['ID', 'Name', 'Salary', 'Country', 'City'],
        dataRows: arr
     };
     this.loaded = true;
  }
  public ngOnInit() {
      this.meService.getMaps()
        .subscribe(maps => {
            this.maps = maps;
            this.meService.getMapsVersions(this.maps)
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

    





      this.http.get('http://localhost:3000/v1/users/globalInfo')
        .subscribe(data => {
            this.globalInfo = data as Object[];
            this.populate();
        }, error => console.log(error));
      /* ----------==========     Daily Sales Chart initialization    ==========---------- */

      const dataDailySalesChart = {
          labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
          series: [
              [12, 17, 7, 17, 23, 18, 38]
          ]
      };

     const optionsDailySalesChart = {
          lineSmooth: Chartist.Interpolation.cardinal({
              tension: 0
          }),
          low: 0,
          high: 50, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
          chartPadding: { top: 0, right: 0, bottom: 0, left: 0},
      };

      const dailySalesChart = new Chartist.Line('#dailySalesChart', dataDailySalesChart, optionsDailySalesChart);

      this.startAnimationForLineChart(dailySalesChart);
      /* ----------==========     Completed Tasks Chart initialization    ==========---------- */

      const dataCompletedTasksChart = {
          labels: ['12p', '3p', '6p', '9p', '12p', '3a', '6a', '9a'],
          series: [
              [230, 750, 450, 300, 280, 240, 200, 190]
          ]
      };

      const optionsCompletedTasksChart = {
          lineSmooth: Chartist.Interpolation.cardinal({
              tension: 0
          }),
          low: 0,
          high: 1000, // creative tim: we recommend you to set the high sa the biggest value + something for a better
          // look
          chartPadding: { top: 0, right: 0, bottom: 0, left: 0}
      };

     const completedTasksChart = new Chartist.Line('#completedTasksChart', dataCompletedTasksChart,
      optionsCompletedTasksChart);

     this.startAnimationForLineChart(completedTasksChart);

      /* ----------==========     Emails Subscription Chart initialization    ==========---------- */

      const dataWebsiteViewsChart = {
        labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        series: [
          [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895]

        ]
      };
      const optionsWebsiteViewsChart = {
          axisX: {
              showGrid: false
          },
          low: 0,
          high: 1000,
          chartPadding: { top: 0, right: 5, bottom: 0, left: 0}
      };
      const responsiveOptions: any = [
        ['screen and (max-width: 640px)', {
          seriesBarDistance: 5,
          axisX: {
            labelInterpolationFnc: function (value) {
              return value[0];
            }
          }
        }]
      ];
      const websiteViewsChart = new Chartist.Bar('#websiteViewsChart', dataWebsiteViewsChart, optionsWebsiteViewsChart, responsiveOptions);

      this.startAnimationForBarChart(websiteViewsChart);

      $('#worldMap').vectorMap({
        map: 'world_en',
        backgroundColor: 'transparent',
         borderColor: '#818181',
         borderOpacity: 0.25,
         borderWidth: 1,
         color: '#b3b3b3',
         enableZoom: true,
         hoverColor: '#eee',
         hoverOpacity: null,
         normalizeFunction: 'linear',
         scaleColors: ['#b6d6ff', '#005ace'],
         selectedColor: '#c9dfaf',
         selectedRegions: null,
         showTooltip: true,
         onRegionClick: function(element, code, region)
         {
             var message = 'You clicked "'
                 + region
                 + '" which has the code: '
                 + code.toUpperCase();

             alert(message);
         }
      });
      
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
       const breakCards = true;
       if (breakCards === true) {
           // We break the cards headers if there is too much stress on them :-)
           $('[data-header-animation="true"]').each(function(){
               const $fix_button = $(this);
               const $card = $(this).parent('.card');
               $card.find('.fix-broken-card').click(function(){
                   const $header = $(this).parent().parent().siblings('.card-header, .card-image');
                   $header.removeClass('hinge').addClass('fadeInDown');

                   $card.attr('data-count', 0);

                   setTimeout(function(){
                       $header.removeClass('fadeInDown animate');
                   }, 480);
               });

               $card.mouseenter(function(){
                   const $this = $(this);
                   const hover_count = parseInt($this.attr('data-count'), 10) + 1 || 0;
                   $this.attr('data-count', hover_count);
                   if (hover_count >= 20) {
                       $(this).children('.card-header, .card-image').addClass('hinge animated');
                   }
               });
           });
       }
   }
   click(n){
        this.mapService.setCurrentMap(this.maps[n]);
        this.router.navigate(['view','map']);
   }
}
