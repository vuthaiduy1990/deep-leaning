/**
* Define 2-D board which visualize the convolution between 2D image and kernel<p>
*
* Event Life Cycle:
* onImageSrcLoaded && onKernelChanged -> onFilterCompleted -> onImageDestLoaded
*
* @author Vu Thai Duy
*/

import { Component, OnInit, SimpleChanges } from '@angular/core';
import { Input, ViewChild, ElementRef } from '@angular/core';

import { KernelWidget } from '../shared/kernel/kernel.widget';
import { GMKernel, KernelSamples } from '../core/image-processing/kernel'
import { GMImage } from '../core/image-processing/image.model';
import { GMCanvas } from '../core/image-processing/image.canvas';
import { GMImagePro } from '../core/image-processing/image.process'


@Component({
	selector: 'vis-2d',
	templateUrl: './vis-2d-board.html',
})
export class Vis2DBoard implements OnInit {

	@ViewChild('srcImageEl') srcImageEl: ElementRef;
	@ViewChild('destImageEl') destImageEl: ElementRef;
	@ViewChild('kernelEl') kernelEl: KernelWidget;
	@ViewChild('kRunTableEl') kRunTableEl: ElementRef;

	@Input("imageSrcData") imageSrcData: string = null;
	private _kernel: GMKernel = KernelSamples.OUTLINE;;
	private KERNEL_LIST = KernelSamples.list();

	private _image: GMImage = null;
	private _canvas: GMCanvas = null;

	private isSetOnValueChangedEvent: boolean = false;
	private kernelRunIntervalId: any;
	private convData: Uint8ClampedArray;
	private isAnimating: boolean = false;
	private isStep: boolean = false;

	constructor() {

	}

	ngOnInit() {
	}

	ngAfterViewInit() {
		// set onchange event
		this.kernelEl.onValueChange = (e: any, i: number, j: number) => {
			this._image && this.doConvolution();
			this.onKernelChanged(this._kernel);
		}
	}

	// ============================ Event Handler ============================

	ngOnChanges(changes: SimpleChanges) {

	}

	/**
	* Trigger when user select kernel from list
	*/
	private _onKernelTypeChanged(value: string) {
		this._kernel = KernelSamples.map(value).clone();
		this._image && this.doConvolution();
		this.onKernelChanged(this._kernel);
	}
	/**
	* Trigger when kernel is changed
	*/
	onKernelChanged(kernel: GMKernel) { }

	/**
	* Trigger when source image is loaded or changed
	*/
	private _onImageSrcLoaded() {
		this.onImageSrcLoaded();
		this._canvas = new GMCanvas(this.destImageEl.nativeElement, this.srcImageEl.nativeElement)
		this._image = new GMImage(this._canvas.getImageData(), this._canvas.width, this._canvas.height);
		this.doConvolution();
	}
	onImageSrcLoaded() { }

	/**
	* Trigger when source image is loaded or changed
	*/
	private _onImageDestLoaded(base64: string) {
		this.onImageDestLoaded(base64);
	}
	onImageDestLoaded(base64: string) { }

	/**
	* Trigger when convolution processing is complete
	*/
	onConvCompleted(convData: Uint8ClampedArray) { }

	private _onReloadBtnClicked() {
		this.reload();
	}

	private _onPlayBtnClicked() {
		if (this.isAnimating == false) {
			// continute animating
			this.isAnimating = true;

			// if animation is not initialized before -> start new
			!this.kernelRunIntervalId && this.animateConv(this.convData);

		} else {
			// stop animation
			this.isAnimating = false;
		}
	}

	private _onStepBtnClicked() {
		this.isStep = true;
		this.isAnimating = false;

		// if animation is not initialized before -> start new
		!this.kernelRunIntervalId && this.animateConv(this.convData);
	}

	// ================================ Methods ==============================

	/**
	* Do convolution between source image and kernel
	*/
	private doConvolution() {
		// clear automatic animation
		this.destroyConvAnimation();

		this.convData = GMImagePro.conv(this._image, this._kernel);
		this.onConvCompleted(this.convData);

		this._canvas.drawImage(this.convData);
		this._onImageDestLoaded(this._canvas.toBase64());

		// hide running kernel table
		this.kRunTableEl && (this.kRunTableEl.nativeElement.style.visibility = 'hidden');
	}

	private reload() {
		// stop animation
		this.destroyConvAnimation();

		// hide running kernel table and reset convolved image
		this.kRunTableEl.nativeElement.style.visibility = 'hidden';
		this._canvas.drawImage(this.convData);
		this._onImageDestLoaded(this._canvas.toBase64());
	}

	/**
	* Stop animating convolution progress
	*/
	destroyConvAnimation() {
		this.isAnimating = false;
		clearInterval(this.kernelRunIntervalId);
		this.kernelRunIntervalId = null;
	}

	/**
	* Animate convolution progress
	*/
	animateConv(convData: Uint8ClampedArray) {
		let x = 0, y = 0;
		let pixelSize = { x: 15, y: 15 };

		let pad: number = this._kernel.isOddSquared() ? Math.floor(this._kernel.size[0] / 2) : 0;

		// init running kernel table 		
		let krtStyle = this.kRunTableEl.nativeElement.style;
		let padLeft: number = parseInt(getComputedStyle(this.srcImageEl.nativeElement).paddingLeft); //parseInt("15px")=15
		let krtOriginPos = {
			left: this.srcImageEl.nativeElement.offsetLeft + padLeft - pixelSize.x * pad,
			top: this.srcImageEl.nativeElement.offsetTop - pixelSize.y * pad
		}
		let krtNextPos = { left: krtOriginPos.left, top: krtOriginPos.top };
		krtStyle.width = pixelSize.x * this._kernel.size[0] + 'px';
		krtStyle.height = pixelSize.y * this._kernel.size[1] + 'px';
		krtStyle.left = krtOriginPos.left + 'px';
		krtStyle.top = krtOriginPos.top + 'px';
		krtStyle.visibility = 'visible';


		// draw origin image so that we can see the convolution progress
		this._canvas.context2d().drawImage(this.srcImageEl.nativeElement, 0, 0, this._canvas.width, this._canvas.height);
		// set convolved data
		this._canvas.setImageData(convData);
		this.kernelRunIntervalId = setInterval(() => {

			// stop animating
			if (this.isAnimating === false && this.isStep === false) return;

			// draw computed convolution area			
			this._canvas.drawArea(0, 0, x, y, pixelSize.x, pixelSize.y);
			krtStyle.left = krtNextPos.left + 'px';
			krtStyle.top = krtNextPos.top + 'px';

			if (x + pixelSize.x < this._canvas.width - 1) {
				krtNextPos.left = parseInt(krtStyle.left) + pixelSize.x;
				x += pixelSize.x;

			} else {
				x = 0;
				// reset x-position of running kernel table
				krtNextPos.left = krtOriginPos.left;

				if (y + pixelSize.y < this._canvas.height - 1) {
					y += pixelSize.y;
					krtNextPos.top = parseInt(krtStyle.top) + pixelSize.y;

				} else {
					y = 0;
					// set convoled image to origin
					this._canvas.context2d().drawImage(this.srcImageEl.nativeElement, 0, 0, this._canvas.width, this._canvas.height);
					// reset y-position of running kernel table					
					krtNextPos.top = krtOriginPos.top;
				}
			}

			this._onImageDestLoaded(this._canvas.toBase64());

			this.isStep = false;

		}, 200);
	}

	private getColorForRunningTableCell(i: number, j: number) {
		let pad: number = this._kernel.isOddSquared() ? Math.floor(this._kernel.size[0] / 2) : 0;
		if (i == j && i == pad) return "yellow";
		return 'transparent';
	}

}
