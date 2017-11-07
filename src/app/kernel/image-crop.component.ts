// /**
// * Define image cropper component which allow upload images to serve<p>
// *
// * @author Vu Thai Duy
// */

// import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
// import { Input, SimpleChanges } from '@angular/core';
// import { FileItem } from 'ng2-file-upload';

// /**
// * Step by step to install and import CropperJS
// * 1. Install js package and typing package for angular2
// * 	$ npm install cropperjs --save
// * 	$ npm install --save @types/cropperjs
// * 2. In .angular-cl.json, add css file
//  	"styles": [
//         "../node_modules/cropperjs/dist/cropper.min.css"
//     ]
// * 3. In tsconfig.json, under "compilerOptions" add "type":["cropperjs"]    
// * 4. In Component
// *	import * as Cropper from 'cropperjs';
// */
// import * as Cropper from 'cropperjs';

// import { UploadComponent } from './upload.component';

// @Component({
// 	selector: 'kernel-image-crop',
// 	templateUrl: './image-crop.component.html'
// })
// export class ImageCropComponent implements OnInit {
// 	@Input('imageSrc') imageSrc: string;
// 	@ViewChild('photo') photo: ElementRef;

// 	private cropper: any;
// 	private isImageChanged: boolean = false;

// 	constructor() { }

// 	ngOnInit() {

// 	}

// 	ngAfterViewInit() {
// 		// initialize cropper
// 		this.cropper = new Cropper(this.photo.nativeElement, {
// 			dragMode: 'none',
// 			movable: false,
// 			zoomable: false,
// 			rotatable: false,
// 			scalable: false,
// 			cropBoxResizable: true,
// 			autoCropArea: 1,
// 			minContainerWidth: 640,
// 			minContainerHeight: 480
// 		});
// 	}

// 	ngOnChanges(changes: SimpleChanges) {
// 		if (changes['imageSrc'] && this.imageSrc != '') {
// 			this.cropper.replace(this.imageSrc);
// 		}
// 	}

// 	/*
// 	* Trigger after image is loaded completely	
// 	*/
// 	private _onImageLoaded() {
// 		this.onImageLoaded();
// 	}
// 	onImageLoaded() { }

// 	/**
// 	* Get cropper
// 	*/
// 	getCropper() {
// 		return this.cropper;
// 	}

// 	/**
// 	* Get cropped image data as blob type
// 	*/
// 	getCroppedAsBlob(callback: Function) {
// 		this.cropper.getCroppedCanvas().toBlob((blob) => {
// 			callback(blob); // return a Base64 image
// 		});
// 	}

// 	/**
// 	* Get cropped image data in base64 format
// 	*/
// 	getCroppedAsBase64() {
// 		return this.cropper.getCroppedCanvas().toDataURL('image/jpeg');
// 	}

// }
