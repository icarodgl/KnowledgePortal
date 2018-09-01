import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MapService, AuthService } from '../../_services/index.service';
import { myDiagram, resetModel } from '../../edit/conceptmap/conceptmap.component';
import { MyErrorStateMatcher } from '../../forms/validationforms/validationforms.component';
import swal from 'sweetalert2';
import * as go from "gojs";
import axios from 'axios';

declare const $: any;
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

      $('#bt-check-map').click((event) => {
          event.preventDefault();
        if (event.stopPropagation) {
            event.stopPropagation();
        } else if (window.event) {
           window.event.cancelBubble = true;
        }

          const mapa = myDiagram.model.nodeDataArray;
          const conceitos = mapa.filter(item => 'concept' === (item as any).category);
          const frasesDeLigacao = mapa.filter(item => 'relation' === (item as any).category);
          const proposicoes = [];

          const frasesDeLigacaoComConexoes = [];

          const conexoes = myDiagram.model.linkDataArray;
          
          conceitos.forEach(item => {
              const conceitoOrigem = item;

              conexoes.forEach(item => {
                  if (item.from === (conceitoOrigem as any).key) {
                      const ligacao = frasesDeLigacao.find(element => (element as any).key === item.to);

                      conexoes.forEach(item => {
                          if ((ligacao as any).key === item.from) {
                              const conceitoDestino = conceitos.find(element => (element as any).key === item.to);

                              const temp = {...ligacao, from: (conceitoOrigem as any).key, to: (conceitoDestino as any).key}

                              frasesDeLigacaoComConexoes.push(temp);                             

                              proposicoes.push(`${(conceitoOrigem as any).text} ${(ligacao as any).text} ${(conceitoDestino as any).text}`);
                          }
                      })
                  }
              })
          })

		const mapaConceitual = {
			conceitos: conceitos,
			frasesDeLigacao: frasesDeLigacaoComConexoes,
			proposicoes: proposicoes,
			erros: {
				conceitoNaoDefinido: [],
				fraseDeLigacaoNaoDefinida: [],
				fraseDeLigacaoSemVerbo: [],
				proposicoesComErroDeConcordancia: [],
				conceitoRepetido: [],
				conceitoInvalido: []
			}
        };
        
        console.log({mapaConceitual});
        
		
		const params = new URLSearchParams();
        params.append('mapa', JSON.stringify(mapaConceitual));

        const API = 'http://0.0.0.0:5002/';
        
        $('#bt-check-map i').html('autorenew');
        axios.post(`${API}mapa/erros`, params)
        .then(result => {
            console.log({result});
        })
        .catch(error => console.log({error})
        )
        .then(() => {
            $('#bt-check-map i').html('spellcheck');
        })
          
          
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

      $('.fixed-plugin .active-color span').click(function() {
        const color = $(this).data('color');
        // Always make changes in a transaction, except when initializing the diagram.
        myDiagram.startTransaction("change color");
        myDiagram.selection.each(function(node) {
        if (node instanceof go.Node) {  // ignore any selected Links and simple Parts
            // Examine and modify the data, not the Node directly.
            var data = node.data;
            // Call setDataProperty to support undo/redo as well as
            // automatically evaluating any relevant bindings.
            myDiagram.model.setDataProperty(data, "color", color);
        }
        });
        myDiagram.commitTransaction("change color");
      });

      $('.fixed-plugin .background-color span').click(function() {
          $(this).siblings().removeClass('active');
          $(this).addClass('active');
          const new_color = $(this).data('color');

          if ($sidebar.length !== 0) {
              $sidebar.attr('data-background-color', new_color);
          }
      });

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
