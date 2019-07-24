import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FixedpluginComponent } from './fixedplugin.component';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  imports: [
    CommonModule,
    ClipboardModule
  ],
  declarations: [FixedpluginComponent],
  exports: [FixedpluginComponent]
})
export class FixedpluginModule { }
