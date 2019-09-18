import {
  Component,
  OnInit,
  Renderer,
  ViewChild,
  ElementRef,
  Directive
} from "@angular/core";
import { ROUTES } from "../../sidebar/sidebar.component";
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  NavigationStart
} from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import {
  Location,
  LocationStrategy,
  PathLocationStrategy
} from "@angular/common";
import { AuthService } from "../../_services/auth/auth.service";
import { User } from "../../_models/user.model";
import swal from "sweetalert2";
const misc: any = {
  navbar_menu_visible: 0,
  active_collapse: true,
  disabled_collapse_init: 0
};

declare var $: any;
@Component({
  selector: "app-navbar-cmp",
  templateUrl: "navbar.component.html"
})
export class NavbarComponent implements OnInit {
  public search: string = "";
  private listTitles: any[];
  location: Location;
  mobile_menu_visible: any = 0;
  private nativeElement: Node;
  private toggleButton: any;
  private sidebarVisible: boolean;
  private _router: Subscription;
  private user: User;

  @ViewChild("app-navbar-cmp") button: any;

  constructor(
    location: Location,
    private renderer: Renderer,
    private element: ElementRef,
    private router: Router,
    private authService: AuthService
  ) {
    this.location = location;
    this.nativeElement = element.nativeElement;
    this.sidebarVisible = false;
    this.user = JSON.parse(this.authService.getCurrentUser());
  }
  minimizeSidebar() {
    const body = document.getElementsByTagName("body")[0];

    if (misc.sidebar_mini_active === true) {
      body.classList.remove("sidebar-mini");
      misc.sidebar_mini_active = false;
    } else {
      setTimeout(function() {
        body.classList.add("sidebar-mini");

        misc.sidebar_mini_active = true;
      }, 300);
    }

    // we simulate the window Resize so the charts will get updated in realtime.
    const simulateWindowResize = setInterval(function() {
      window.dispatchEvent(new Event("resize"));
    }, 180);

    // we stop the simulation of Window Resize after the animations are completed
    setTimeout(function() {
      clearInterval(simulateWindowResize);
    }, 1000);
  }
  hideSidebar() {
    const body = document.getElementsByTagName("body")[0];
    const sidebar = document.getElementsByClassName("sidebar")[0];

    if (misc.hide_sidebar_active === true) {
      setTimeout(function() {
        body.classList.remove("hide-sidebar");
        misc.hide_sidebar_active = false;
      }, 300);
      setTimeout(function() {
        sidebar.classList.remove("animation");
      }, 600);
      sidebar.classList.add("animation");
    } else {
      setTimeout(function() {
        body.classList.add("hide-sidebar");
        // $('.sidebar').addClass('animation');
        misc.hide_sidebar_active = true;
      }, 300);
    }

    // we simulate the window Resize so the charts will get updated in realtime.
    const simulateWindowResize = setInterval(function() {
      window.dispatchEvent(new Event("resize"));
    }, 180);

    // we stop the simulation of Window Resize after the animations are completed
    setTimeout(function() {
      clearInterval(simulateWindowResize);
    }, 1000);
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter(listTitle => listTitle);

    const navbar: HTMLElement = this.element.nativeElement;
    const body = document.getElementsByTagName("body")[0];
    this.toggleButton = navbar.getElementsByClassName("navbar-toggler")[0];
    if (body.classList.contains("sidebar-mini")) {
      misc.sidebar_mini_active = true;
    }
    if (body.classList.contains("hide-sidebar")) {
      misc.hide_sidebar_active = true;
    }
    this._router = this.router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe((event: NavigationEnd) => {
        const $layer = document.getElementsByClassName("close-layer")[0];
        if ($layer) {
          $layer.remove();
        }
      });
  }
  onResize(event) {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }
  sidebarOpen() {
    const toggleButton = this.toggleButton;
    const body = document.getElementsByTagName("body")[0];
    setTimeout(function() {
      toggleButton.classList.add("toggled");
    }, 500);
    body.classList.add("nav-open");

    this.sidebarVisible = true;
  }
  sidebarClose() {
    const body = document.getElementsByTagName("body")[0];
    this.toggleButton.classList.remove("toggled");
    this.sidebarVisible = false;
    body.classList.remove("nav-open");
  }
  sidebarToggle() {
    if (this.sidebarVisible === false) {
      this.sidebarOpen();
    } else {
      this.sidebarClose();
    }
    const body = document.getElementsByTagName("body")[0];

    var $toggle = document.getElementsByClassName("navbar-toggler")[0];
    if (this.mobile_menu_visible == 1) {
      // $('html').removeClass('nav-open');
      body.classList.remove("nav-open");
      if ($layer) {
        $layer.remove();
      }

      setTimeout(function() {
        $toggle.classList.remove("toggled");
      }, 400);

      this.mobile_menu_visible = 0;
    } else {
      setTimeout(function() {
        $toggle.classList.add("toggled");
      }, 430);

      var $layer = document.createElement("div");
      $layer.setAttribute("class", "close-layer");

      if (body.querySelectorAll(".main-panel")) {
        document.getElementsByClassName("main-panel")[0].appendChild($layer);
      } else if (body.classList.contains("off-canvas-sidebar")) {
        document
          .getElementsByClassName("wrapper-full-page")[0]
          .appendChild($layer);
      }

      setTimeout(function() {
        $layer.classList.add("visible");
      }, 100);

      $layer.onclick = function() {
        //asign a function
        body.classList.remove("nav-open");
        this.mobile_menu_visible = 0;
        $layer.classList.remove("visible");
        setTimeout(function() {
          $layer.remove();
          $toggle.classList.remove("toggled");
        }, 400);
      }.bind(this);

      body.classList.add("nav-open");
      this.mobile_menu_visible = 1;
    }
  }

  getTitle() {
    let titlee: any = this.location.prepareExternalUrl(this.location.path());
    titlee = String(titlee).split("?")[0];
    for (let i = 0; i < this.listTitles.length; i++) {
      if (
        this.listTitles[i].type === "link" &&
        this.listTitles[i].path === titlee
      ) {
        return this.listTitles[i].title;
      } else if (this.listTitles[i].type === "sub") {
        for (let j = 0; j < this.listTitles[i].children.length; j++) {
          let subtitle =
            this.listTitles[i].path + "/" + this.listTitles[i].children[j].path;
          if (subtitle === titlee) {
            return this.listTitles[i].children[j].title;
          }
        }
      }
    }
    let t = String(titlee).split("/");
    if (t.length >= 3) {
      return (
        t[t.length - 1].charAt(0).toLocaleUpperCase() +
        t[t.length - 1].substr(1).toLowerCase() +
        " " +
        t[t.length - 2].charAt(0).toLocaleUpperCase() +
        t[t.length - 2].substr(1).toLowerCase()
      );
    } else {
      return (
        t[t.length - 1].charAt(0).toLocaleUpperCase() +
        t[t.length - 1].substr(1).toLowerCase()
      );
    }
  }
  getPath() {
    return this.location.prepareExternalUrl(this.location.path());
  }

  logout() {
    this.authService.logout();
    this.router.navigate(["pages/login"]);
  }

  redirectToSearch(e) {
    e.preventDefault();
    //this.router.navigate(['pages','find', this.search]);
    window.location.href = "/pages/find/" + this.search;
  }

  goToDashbord(e) {
    e.preventDefault();
    swal({
      title: "Você tem certeza?",
      text:
        "Se você tiver um mapa ainda não salvo, isso excluirá todas as informações não salvas. Você deseja continuar?",
      type: "warning",
      showCancelButton: true,
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      confirmButtonText: "Sim, ir ao dashbord",
      cancelButtonText: "Cancelar",
      buttonsStyling: false
    }).then(result => {
      if (result.value) {
        this.router.navigate(["/dashboard"]);
      }
    });
  }
}
