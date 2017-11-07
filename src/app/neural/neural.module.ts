import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common'; // use directive like ngIf, ngFor ...
import { FormsModule } from '@angular/forms';

import { MdSelectModule } from '@angular/material';
import { MdButtonModule } from '@angular/material';
import { MdSliderModule } from '@angular/material';
import { MdInputModule } from '@angular/material';
import { MdCheckboxModule } from '@angular/material';
import { MdDialogModule } from '@angular/material';

import { NeuralRoutingModule } from './neural-routing.module';

import { NeuralComponent } from './neural.component';
import { NeuralService } from './neural.service';
import { NEURAL_CONFIG, NeuralConfig } from './neural.config';

import { DataCustomizedDialog } from './data-customized-dialog';


@NgModule({
	imports: [
		NeuralRoutingModule,
		FormsModule,
		CommonModule,
		MdSelectModule,
		MdButtonModule,
		MdSliderModule,
		MdInputModule,
		MdCheckboxModule,
		MdDialogModule
	],
	declarations: [
		NeuralComponent,
		DataCustomizedDialog
	],
	entryComponents: [
		DataCustomizedDialog
	],
	providers: [
		NeuralService,
		{ provide: NEURAL_CONFIG, useValue: NeuralConfig }
	],
	// CUSTOM_ELEMENTS_SCHEMA: allow custom HTML tags like A-Frame's tags run in HTML
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NeuralModule { }

