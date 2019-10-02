import { Component, OnInit } from "@angular/core";
import { myDiagram } from "../conceptmap.component";
import * as go from "gojs";
import { SafeHtml, DomSanitizer } from "@angular/platform-browser";
import {
  MapService,
  AuthService,
  ModelService
} from "../../../_services/index.service";
import swal from "sweetalert2";
import {
  ConceptMap,
  Permission,
  Group,
  User
} from "../../../_models/index.model";
import { Router, ActivatedRoute } from "@angular/router";

declare var $: any;

@Component({
  selector: "app-savemap-cmp",
  templateUrl: "./savemap.component.html",
  styleUrls: ["./savemap.component.css"]
})
export class SaveMapComponent implements OnInit {
  private image: SafeHtml;
  public map: ConceptMap;
  private search: string;
  private user: User;
  link: string;

  constructor(
    private _sanitizer: DomSanitizer,
    private mapService: MapService,
    private router: Router,
    private routerActive: ActivatedRoute,
    private authService: AuthService,
    private modelService: ModelService
  ) {
    this.map = new ConceptMap();
    this.map.keywords = [];
    this.map.permissions = {
      publicPermission: new Permission(),
      groups: [],
      users: []
    };
    this.user = JSON.parse(this.authService.getCurrentUser());
  }

  ngOnInit(): void {
    this.link = this.routerActive.routeConfig.path;
    if (this.link != "save") {
      this.map = JSON.parse(this.mapService.getCurrentMap());
    }
    if (!!myDiagram) {
      let serializer = new XMLSerializer();
      let svg = myDiagram.makeSvg({
        scale: 0.6,
        maxSize: new go.Size(NaN, 220)
      });
      this.image = this._sanitizer.bypassSecurityTrustHtml(
        serializer.serializeToString(svg)
      );
    }
  }

  save() {
    let that = this;
    this.map.content = this.modelService.getCurrentModel();
    this.map.keywords = this.map.keywords.map((el: any) => el.value);
    this.mapService.create(this.map).subscribe(
      data => {
        swal({
          type: "success",
          html:
            "Ótimo! <strong>" +
            "Seu mapa foi salvo" +
            "</strong>. <br /> Você será redirecionado para o seu dashboard!",
          confirmButtonClass: "btn btn-success",
          buttonsStyling: false
        }).then(() => {
          this.mapService.getAll().subscribe(maps => {
            this.mapService.mapas = maps;

            this.router.navigate(["dashboard"], {
              queryParams: { reload: true }
            });
          });
        });
      },
      error => console.log(error)
    );
  }

  update() {
    let that = this;
    this.map.keywords = this.map.keywords.map((el: any) => el.value);
    this.mapService.updateMap(this.map._id, this.map).subscribe(
      data => {
        swal({
          type: "success",
          html:
            "Ótimo! <strong>" +
            "Seu mapa foi atualizado" +
            "</strong>. <br /> Você será redirecionado para o seu dashboard!",
          confirmButtonClass: "btn btn-success",
          buttonsStyling: false
        }).then(() => {
          that.authService.updateUser();
          this.router.navigate(["dashboard"]);
        });
      },
      error => console.log(error)
    );
  }

  delete() {
    let that = this;
    this.map.keywords = this.map.keywords.map((el: any) => el.value);
    this.mapService.removeMap(this.map._id).subscribe(
      data => {
        swal({
          type: "success",
          html:
            "Ótimo! <strong>" +
            "Seu mapa foi deletado" +
            "</strong>. <br /> Você será redirecionado para o seu dashboard!",
          confirmButtonClass: "btn btn-success",
          buttonsStyling: false
        }).then(() => {
          this.router.navigate(["dashboard"]);
        });
      },
      error => console.log(error)
    );
  }

  back() {
    this.router.navigate(["edit/cmap"]);
  }

  click(bt, gu?, i?) {
    switch (bt) {
      case "canView":
        if (gu) {
          this.map.permissions[gu][i].permission.canView = !this.map
            .permissions[gu][i].permission.canView;
          if (!this.map.permissions[gu][i].permission.canView) {
            this.map.permissions[gu][i].permission.canFork = false;
            this.map.permissions[gu][i].permission.canEdit = false;
          }
        } else {
          this.map.permissions.publicPermission.canView = !this.map.permissions
            .publicPermission.canView;
          if (!this.map.permissions.publicPermission.canView) {
            this.map.permissions.publicPermission.canFork = false;
            this.map.permissions.publicPermission.canEdit = false;
          }
        }
        break;
      case "canFork":
        if (gu) {
          this.map.permissions[gu][i].permission.canFork = !this.map
            .permissions[gu][i].permission.canFork;
          if (this.map.permissions[gu][i].permission.canFork) {
            this.map.permissions[gu][i].permission.canView = true;
          } else {
            this.map.permissions[gu][i].permission.canEdit = false;
          }
        } else {
          this.map.permissions.publicPermission.canFork = !this.map.permissions
            .publicPermission.canFork;
          if (this.map.permissions.publicPermission.canFork) {
            this.map.permissions.publicPermission.canView = true;
          } else {
            this.map.permissions.publicPermission.canEdit = false;
          }
        }
        break;
      case "canEdit":
        if (gu) {
          this.map.permissions[gu][i].permission.canEdit = !this.map
            .permissions[gu][i].permission.canEdit;
          if (this.map.permissions[gu][i].permission.canEdit) {
            this.map.permissions[gu][i].permission.canView = true;
            this.map.permissions[gu][i].permission.canFork = true;
          }
        } else {
          this.map.permissions.publicPermission.canEdit = !this.map.permissions
            .publicPermission.canEdit;
          if (this.map.permissions.publicPermission.canEdit) {
            this.map.permissions.publicPermission.canView = true;
            this.map.permissions.publicPermission.canFork = true;
          }
        }
        break;
    }
  }

  findAndAddGroup(e) {
    e.preventDefault();

    let group = this.user.groups.find(g => g.name === this.search);

    // let g = new Group();
    // g.name = this.search;
    // let a = {
    //     group: g,
    //     permission: new Permission()
    // }
    // this.map.permissions.groups.push(a);
  }
  findAndAddUser(e) {
    e.preventDefault();
    let u = new User();
    u.username = this.search;
    let a = {
      user: u,
      permission: new Permission()
    };
    this.map.permissions.users.push(a);
  }

  removeGroup(i) {
    this.map.permissions.groups.splice(i, 1);
  }
  removeUser(i) {
    this.map.permissions.users.splice(i, 1);
  }
}
