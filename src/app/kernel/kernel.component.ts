import { Component, OnInit, ElementRef } from '@angular/core';
import { ViewEncapsulation, ViewChild, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FileItem } from 'ng2-file-upload';

import { KernelService } from './kernel.service';
import { UploadComponent } from './upload.component';
import { GMUtil } from '../core/utils';
import { GMKernel, KernelSamples } from '../core/image-processing/kernel'
import { KERNEL_CONFIG } from './kernel.config';
import { Vis2DBoard } from './vis-2d-board';
import { Alert } from '../app.alert';

@Component({
	templateUrl: './kernel.component.html',
	styleUrls: ['./kernel.style.css'],
	encapsulation: ViewEncapsulation.None // use this setting to share css
})
export class KernelComponent implements OnInit {
	@ViewChild('uploadComp') uploadComp: UploadComponent;
	@ViewChild('vis2d') vis2d: Vis2DBoard;

	// assets folder is declared in .angular-cli.json.
	public _uploadImageSrc: string = './assets/images/kernel-default-image.png';
	public _convImageBase64: string = '';

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private kerService: KernelService,
		@Inject(KERNEL_CONFIG) private kernelCf) {
	}

	ngOnInit() {
	}

	ngAfterViewInit() {

		// Override error handler of upload component
		this.uploadComp.onError = (err) => {
			Alert.notifyError(err);
		}

		// On uploading completed
		this.uploadComp.onUploadComplete = (item: FileItem, res: any, status: any, req: any) => {
			GMUtil.imageToBase64(item._file, (data) => {
				// change image source and notify change to cropper
				this._uploadImageSrc = data;
			});
		}

		this.vis2d.onImageDestLoaded = (base64: string) => {
			this._convImageBase64 = base64;
		}
	}
}
