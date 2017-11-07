import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FileUploadModule } from 'ng2-file-upload';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // use directive like ngIf
import { MdButtonModule } from '@angular/material';
import { MdSelectModule } from '@angular/material';

import { KernelRoutingModule } from './kernel-routing.module';
import { KernelComponent } from './kernel.component';
import { UploadComponent } from './upload.component';

import { KernelWidget } from '../shared/kernel/kernel.widget'
import { Vis2DBoard } from './vis-2d-board';

import { KernelService } from './kernel.service';
import { KERNEL_CONFIG, KernekConfig } from './kernel.config'

@NgModule({
	imports: [
		KernelRoutingModule,
		CommonModule,
		FormsModule,
		MdButtonModule,
		MdSelectModule,
		FileUploadModule
	],
	declarations: [
		KernelComponent,
		UploadComponent,
		Vis2DBoard,
		KernelWidget
	],
	providers: [
		KernelService,
		{ provide: KERNEL_CONFIG, useValue: KernekConfig }
	],
	// CUSTOM_ELEMENTS_SCHEMA: allow custom HTML tags like A-Frame's tags run in HTML
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class KernelModule { }

