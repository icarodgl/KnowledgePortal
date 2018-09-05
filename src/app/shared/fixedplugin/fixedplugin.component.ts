import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MapService, AuthService } from '../../_services/index.service';
import { myDiagram, resetModel } from '../../edit/conceptmap/conceptmap.component';
import { MyErrorStateMatcher } from '../../forms/validationforms/validationforms.component';
import swal from 'sweetalert2';
import * as go from "gojs";
import { TestBed } from '@angular/core/testing';

declare const $: any;
const $$ = go.GraphObject.make;  // for conciseness in defining templates
const md: any = {
    misc: {
        navbar_menu_visible: 0,
        active_collapse: true,
        disabled_collapse_init: 0,
    }
};

@Component({
  selector: 'app-fixedplugin',
  templateUrl: './fixedplugin.component.html',
  styleUrls: ['./fixedplugin.component.css']
})

export class FixedpluginComponent implements OnInit {

  constructor(private router:Router, public mapService: MapService, private authService: AuthService) { }

  ngOnInit() {
      // fixed plugin
      const $sidebar = $('.sidebar');
      const $sidebar_img_container = $sidebar.find('.sidebar-background');
      //
      const $full_page = $('.full-page');
      //
      const $sidebar_responsive = $('body > .navbar-collapse');
      const window_width = $(window).width();

      const fixed_plugin_open = $('.sidebar .sidebar-wrapper .nav li.active a p').html();

      if ( window_width > 767 && fixed_plugin_open === 'Dashboard' ) {
          if ($('.fixed-plugin .dropdown').hasClass('show-dropdown')) {
              $('.fixed-plugin .dropdown').addClass('open');
          }

      }

      $('#bt-font').click(function() {
          if($(this).hasClass('active')) {
            $(this).removeClass('active'); 
            $('#a-color-picker').removeClass('text-color');
          }else {
            $(this).addClass('active');
            $('#a-color-picker').addClass('text-color');
          } 
      });
      $('#bt-stroke').click(function() {
          if($(this).hasClass('active')) {
            $(this).removeClass('active'); 
            $('#a-color-picker').removeClass('stroke-color');
          }else {
            $(this).addClass('active');
            $('#a-color-picker').addClass('stroke-color');
          } 
        });
        $('#bt-background').click(function() {
            if($(this).hasClass('active')) {
              $(this).removeClass('active'); 
              $('#a-color-picker').removeClass('background-color');
            }else {
              $(this).addClass('active');
              $('#a-color-picker').addClass('background-color');
            } 
        });

      $('#a-color-picker span').click(function() {
          const color = $(this).data('color');
          const color2 = $(this).data('color2');
          if($('#a-color-picker').hasClass('text-color')){  
            myDiagram.startTransaction("change text color");
            myDiagram.selection.each(function(node) {
                if (node instanceof go.Node) {  // ignore any selected Links and simple Parts
                    // Examine and modify the data, not the Node directly.
                    var data = node.data;
                    // Call setDataProperty to support undo/redo as well as
                    // automatically evaluating any relevant bindings.
                    if(color2){
                        var gradient = $$(go.Brush, "Linear", { 0.0: color, 1.0: color2 });
                        myDiagram.model.setDataProperty(data, "textColor", gradient);
                    }else{
                        myDiagram.model.setDataProperty(data, "textColor", color);
                    }
                }else if(node instanceof go.Link) {
                    var data = node.data;
                    // Call setDataProperty to support undo/redo as well as
                    // automatically evaluating any relevant bindings.
                    if(color2){
                        var gradient = $$(go.Brush, "Linear", { 0.0: color, 1.0: color2 });
                        myDiagram.model.setDataProperty(data, "color", gradient);
                    }else{
                        myDiagram.model.setDataProperty(data, "color", color);
                    }
                }
            });
            myDiagram.commitTransaction("change color");
          }
          if($('#a-color-picker').hasClass('background-color')){
            myDiagram.startTransaction("change color");
            myDiagram.selection.each(function(node) {
                if (node instanceof go.Node) {  // ignore any selected Links and simple Parts
                    // Examine and modify the data, not the Node directly.
                    var data = node.data;
                    // Call setDataProperty to support undo/redo as well as
                    // automatically evaluating any relevant bindings.
                    if(color2){
                        var gradient = $$(go.Brush, "Linear", { 0.0: color, 1.0: color2 });
                        myDiagram.model.setDataProperty(data, "color", gradient);
                    }else{
                        myDiagram.model.setDataProperty(data, "color", color);
                    }
                }
            });
            myDiagram.commitTransaction("change color");
          }
          if($('#a-color-picker').hasClass('stroke-color')){
            myDiagram.startTransaction("change stroke color");
            myDiagram.selection.each(function(node) {
                if (node instanceof go.Node) {  // ignore any selected Links and simple Parts
                    // Examine and modify the data, not the Node directly.
                    var data = node.data;
                    // Call setDataProperty to support undo/redo as well as
                    // automatically evaluating any relevant bindings.
                    if(color2){
                        var gradient = $$(go.Brush, "Linear", { 0.0: color, 1.0: color2 });
                        myDiagram.model.setDataProperty(data, "stroke", gradient);
                    }else{
                        myDiagram.model.setDataProperty(data, "stroke", color);
                    }
                }else if(node instanceof go.Link) {
                    var data = node.data;
                    // Call setDataProperty to support undo/redo as well as
                    // automatically evaluating any relevant bindings.
                    if(color2){
                        var gradient = $$(go.Brush, "Linear", { 0.0: color, 1.0: color2 });
                        myDiagram.model.setDataProperty(data, "color", gradient);
                    }else{
                        myDiagram.model.setDataProperty(data, "color", color);
                    }
                }
            });
            myDiagram.commitTransaction("change color");
          }
      });

      $('#bt-new-map').click((event) => {
        event.preventDefault();
        swal({
            title: 'Are you sure?',
            text: 'All your current map modifications will be lost...',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, proceed...',
            cancelButtonText: 'No, keep it',
            confirmButtonClass: "btn btn-success",
            cancelButtonClass: "btn btn-danger",
            buttonsStyling: false
        }).then((result) => {
          if (result.value) {
            this.mapService.removeCurrentMap();
            resetModel();
          }
        });
        
      });
      $('#bt-save').click((event) => {
          event.preventDefault();
          this.router.navigate(["edit","cmap","save"]);
      });

      $('#bt-version').click(event => {
          event.preventDefault();
          this.mapService.createVersion(myDiagram.model.toJson())
            .subscribe(_ => {
                this.authService.updateUser();

                $.notify({
                    icon: 'notifications',
                    message: 'New version created successful!'
                }, {
                    type: 'success',
                    timer: 250,
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });

            }, error => {
               console.log(error);
            });
      });

      $('.fixed-plugin a').click(function(event) {
        // Alex: if we click on switch, stop propagation of the event,
        // so the dropdown will not be hide, otherwise we set the  section active
          if ($(this).hasClass('switch-trigger')) {
              if (event.stopPropagation) {
                  event.stopPropagation();
              } else if (window.event) {
                 window.event.cancelBubble = true;
              }
          }
      });

      $('.fixed-plugin button').click(function(event) {
        // Alex: if we click on switch, stop propagation of the event,
        // so the dropdown will not be hide, otherwise we set the  section active
          if ($(this).hasClass('color-change')) {
              if (event.stopPropagation) {
                  event.stopPropagation();
              } else if (window.event) {
                 window.event.cancelBubble = true;
              }
          }
      });

      $('.fixed-plugin .stroke-color span').click(function() {
        const color = $(this).data('color');
        //   $(this).siblings().removeClass('active');
        //   $(this).addClass('active');
        //   const new_color = $(this).data('color');

        //   if ($sidebar.length !== 0) {
        //       $sidebar.attr('data-background-color', new_color);
        //   }
        
      });

    //   $('.fixed-plugin .text-color span').click(function() {
    //     const color = $(this).data('color');
    //     //   $(this).siblings().removeClass('active');
    //     //   $(this).addClass('active');
    //     //   const new_color = $(this).data('color');

    //     //   if ($sidebar.length !== 0) {
    //     //       $sidebar.attr('data-background-color', new_color);
    //     //   }
    //     myDiagram.startTransaction("change text color");
    //     myDiagram.selection.each(function(node) {
    //         if (node instanceof go.Node) {  // ignore any selected Links and simple Parts
    //             // Examine and modify the data, not the Node directly.
    //             var data = node.data;
    //             // Call setDataProperty to support undo/redo as well as
    //             // automatically evaluating any relevant bindings.
    //             myDiagram.model.setDataProperty(data, "textColor", color);
    //         }else if(node instanceof go.Link) {
    //             var data = node.data;
    //             // Call setDataProperty to support undo/redo as well as
    //             // automatically evaluating any relevant bindings.
    //             myDiagram.model.setDataProperty(data, "color", color);
    //         }
    //     });
    //     myDiagram.commitTransaction("change color");
    //   });

      $('.fixed-plugin .img-holder').click(function() {
          const $full_page_background = $('.full-page-background');

          $(this).parent('li').siblings().removeClass('active');
          $(this).parent('li').addClass('active');

          let new_image = $(this).find('img').attr('src');

          if ( $sidebar_img_container.length !== 0 && $('.switch-sidebar-image input:checked').length !== 0 ) {
              $sidebar_img_container.fadeOut('fast', function() {
                 $sidebar_img_container.css('background-image', 'url("' + new_image + '")');
                 $sidebar_img_container.fadeIn('fast');
              });
          }

          if ($full_page_background.length !== 0 && $('.switch-sidebar-image input:checked').length !== 0 ) {
              const new_image_full_page = $('.fixed-plugin li.active .img-holder').find('img').data('src');

              $full_page_background.fadeOut('fast', function(){
                 $full_page_background.css('background-image', 'url("' + new_image_full_page + '")');
                 $full_page_background.fadeIn('fast');
              });
          }

          if ( $('.switch-sidebar-image input:checked').length === 0 ) {
              new_image = $('.fixed-plugin li.active .img-holder').find('img').attr('src');
              const new_image_full_page = $('.fixed-plugin li.active .img-holder').find('img').data('src');

              $sidebar_img_container.css('background-image', 'url("' + new_image + '")');
              $full_page_background.css('background-image', 'url("' + new_image_full_page + '")');
          }

          if ($sidebar_responsive.length !== 0) {
              $sidebar_responsive.css('background-image', 'url("' + new_image + '")');
          }
      });

      $('.switch-sidebar-image input').change(function() {
          const $full_page_background = $('.full-page-background');
          const $input = $(this);

          if ($input.is(':checked')) {
              if ($sidebar_img_container.length !== 0) {
                  $sidebar_img_container.fadeIn('fast');
                  $sidebar.attr('data-image', '#');
              }

              if ($full_page_background.length !== 0) {
                  $full_page_background.fadeIn('fast');
                  $full_page.attr('data-image', '#');
              }

              const background_image = true;
          } else {
              if ($sidebar_img_container.length !== 0) {
                  $sidebar.removeAttr('data-image');
                  $sidebar_img_container.fadeOut('fast');
              }

              if ($full_page_background.length !== 0) {
                  $full_page.removeAttr('data-image', '#');
                  $full_page_background.fadeOut('fast');
              }

              const background_image = false;
          }
      });

      $('.switch-sidebar-mini input').change(function(){
          const $body = $('body');

          const $input = $(this);

          if (md.misc.sidebar_mini_active === true) {
              $('body').removeClass('sidebar-mini');
              md.misc.sidebar_mini_active = false;

          } else {
              setTimeout(function(){
                  $('body').addClass('sidebar-mini');

                  $('.sidebar .collapse').css('height', 'auto');
                  md.misc.sidebar_mini_active = true;
              }, 300);
          }

          // we simulate the window Resize so the charts will get updated in realtime.
          const simulateWindowResize = setInterval(function(){
              window.dispatchEvent(new Event('resize'));
          }, 180);

          // we stop the simulation of Window Resize after the animations are completed
          setTimeout(function(){
              clearInterval(simulateWindowResize);
          }, 1000);

      });
  }

}
