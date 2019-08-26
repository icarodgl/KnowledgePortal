import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import * as go from 'gojs';
import { HttpClient } from '@angular/common/http';
import { AuthService, MapService, MeService, ModelService } from '../../_services/index.service';
import { User, ConceptMap, Version } from '../../_models/index.model';
import { Router } from '@angular/router';
import { myDiagram, ConceptMapComponent, resetModel } from '../../edit/conceptmap/conceptmap.component';
import swal from 'sweetalert2';
import { SharedService } from 'app/_services/shared.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild("map1") map1: ConceptMapComponent;

  @ViewChild('myDiagramDiv') element: ElementRef;

  private images:SafeHtml[] = new Array<SafeHtml>();
  public user:User;
  public maps: ConceptMap[] = [];

  constructor( 
      private _sanitizer: DomSanitizer, 
      private authServicve: AuthService,
      private mapService: MapService,
      private meService: MeService,
      private router: Router,
      private sharedService: SharedService,
      private modelService:ModelService
  ){
      this.user = JSON.parse(this.authServicve.getCurrentUser());
  }
    public ngOnInit() {
        if (!this.meService.maps) {
            this.mapService.getAll().subscribe(maps => {
                this.maps = maps
                let serializer = new XMLSerializer();
                let svg;
                this.maps.forEach((m, i) => {
                    if (m.versions[0].content) {
                        myDiagram.model = go.Model.fromJson(m.versions[0].content);
                        svg = myDiagram.makeSvg({
                            scale: 0.5,
                            maxSize: new go.Size(NaN, 220)
                        });
                        this.images[i] = this._sanitizer.bypassSecurityTrustHtml(serializer.serializeToString(svg));
                        resetModel();
                    }
                })

            })
        }
        //this.meService.getDashboardInfo()
        //    .subscribe(maps => {
        //        this.maps = maps;
        //        let serializer = new XMLSerializer();
        //        let svg;
        //        this.maps.forEach((m, i)=> {
        //            myDiagram.model = go.Model.fromJson(m.versions[0].content);
        //            svg = myDiagram.makeSvg({
        //                scale: 0.5,
        //                maxSize: new go.Size(NaN, 220)
        //            });
        //            this.images[i] = this._sanitizer.bypassSecurityTrustHtml(serializer.serializeToString(svg));
        //            resetModel();
        //        });                
        //    }, error => console.log(error));
   }
   ngAfterViewInit() {
   }
   click(n){
        this.mapService.setCurrentMap(this.maps[n]);
        this.router.navigate(['view','map']);
   }
   newMap(e){
       e.preventDefault();
       swal({
            title: 'Você tem certeza?',
           text: "Se você tiver um mapa ainda não salvo, isso excluirá todas as informações não salvas. Você deseja continuar?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            confirmButtonText: 'Sim, criar um novo...',
            cancelButtonText: 'Cancelar',
            buttonsStyling: false
       }).then((result) => {
            if (result.value) {
                this.router.navigate(['edit','cmap']);
            }
        });
    }

    removeMap(posicao: number) {
        console.log(posicao)
        this.mapService.removeMap(this.maps[posicao]._id).subscribe(
            success => {
                console.log(success)
                this.sharedService.nofiticacao(success.message, 'success')
                this.maps.splice(posicao, 1)  
            },
            error => {
                console.log(error)
                this.sharedService.nofiticacao(error.error, 'danger')
            })
    }
}
