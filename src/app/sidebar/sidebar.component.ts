import { Component, OnInit } from "@angular/core";
import PerfectScrollbar from "perfect-scrollbar";
import { AuthService } from "../_services/auth/auth.service";
import { Router } from "@angular/router";
import { User } from "../_models/user.model";
import { SidebarService } from "../_services/sidebar/sidebar.service";
import * as jwt_decode from "jwt-decode";
import { MapService } from "app/_services/index.service";
import swal from "sweetalert2";
declare const $: any;

//Metadata
export interface RouteInfo {
  path: string;
  title: string;
  type: string;
  icontype: string;
  collapse?: string;
  children?: ChildrenItems[];
}

export interface ChildrenItems {
  path: string;
  title: string;
  ab: string;
  type?: string;
}

//Menu Items
export const ROUTES: RouteInfo[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    type: "link",
    icontype: "dashboard"
  }
  //{
  //    path: '/administration',
  //    title: 'Administration',
  //    type: 'sub',
  //    icontype: 'security',
  //    collapse: 'administration',
  //    children: [
  //        {path: 'dashboard', title: 'Dashboard', ab:'D'},
  //        {path: 'users', title: 'Users', ab:'U'},
  //        {path: 'maps', title: 'Maps', ab:'M'}
  //    ]
  //},
  //  {
  //    path: '/manage',
  //    title: 'Manage',
  //    type: 'sub',
  //    icontype: 'developer_board',
  //    collapse: 'manage',
  //    children: [
  //        {path: 'groups', title: 'Groups', ab:'G'},
  //        {path: 'maps', title: 'Maps', ab:'M'}
  //    ]
  //},
  //    {
  //    path: '/edit',
  //    title: 'Editar',
  //    type: 'sub',
  //    icontype: 'palette',
  //    collapse: 'edit',
  //    children: [
  //        {path: 'cmap', title: 'Mapa Conceitual', ab:'MC'}
  //    ]
  //}
];
@Component({
  selector: "app-sidebar-cmp",
  templateUrl: "sidebar.component.html"
})
export class SidebarComponent implements OnInit {
  public user: User;
  maps;
  constructor(
    private router: Router,
    private authService: AuthService,
    private sidebarService: SidebarService,
    private mapService: MapService
  ) {
    this.user = jwt_decode(this.authService.getCurrentUser());
  }

  public menuItems: any[];

  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => {
      if (menuItem.title !== "Administration") return menuItem;
      /* if(this.user.groups.filter(g=> (g.name === "Admin")).length > 0)*/ else
        return menuItem;
    });
    if (!this.mapService.requisizaoFeita) {
      this.mapService.getAll().subscribe(maps => {
        this.mapService.mapas = maps;
        this.mapService.requisizaoFeita = true;
        this.maps = this.mapService.mapas;
      });
    } else {
      console.log(this.mapService.mapas);
      this.maps = this.mapService.mapas;
    }

    this.sidebarService.update.subscribe(res => {
      this.user.profile_picture = res;
    });
  }
  updatePS(): void {
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      const elemSidebar = <HTMLElement>(
        document.querySelector(".sidebar .sidebar-wrapper")
      );
      let ps = new PerfectScrollbar(elemSidebar, {
        wheelSpeed: 2,
        suppressScrollX: true
      });
    }
  }
  isMac(): boolean {
    let bool = false;
    if (
      navigator.platform.toUpperCase().indexOf("MAC") >= 0 ||
      navigator.platform.toUpperCase().indexOf("IPAD") >= 0
    ) {
      bool = true;
    }
    return bool;
  }

  logout(event: any) {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(["pages/login"]);
  }

  updateUser() {}
  goTo(e, routerLink) {
    e.preventDefault();
    swal({
      title: "Você tem certeza?",
      text:
        "Se você tiver um mapa ainda não salvo, isso excluirá todas as informações não salvas. Você deseja continuar?",
      type: "warning",
      showCancelButton: true,
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      confirmButtonText: "Continuar",
      cancelButtonText: "Cancelar",
      buttonsStyling: false
    }).then(result => {
      if (result.value) {
        this.router.navigate(routerLink);
      }
    });
  }
}
