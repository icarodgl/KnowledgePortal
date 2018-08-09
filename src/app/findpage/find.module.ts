import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FindComponent } from './find.component';
import { FindRoutes } from './find.routing';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(FindRoutes),
        FormsModule
    ],
    declarations: [FindComponent]
})

export class FindModule {}
