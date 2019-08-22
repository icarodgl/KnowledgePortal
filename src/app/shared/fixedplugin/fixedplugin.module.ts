import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FixedpluginComponent } from './fixedplugin.component';
import { ClipboardModule } from 'ngx-clipboard';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    ClipboardModule,
    RouterModule
  ],
  declarations: [FixedpluginComponent],
  exports: [FixedpluginComponent]
})
export class FixedpluginModule { }
