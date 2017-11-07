// import { Component, OnInit, SimpleChanges } from '@angular/core';
// import { Input, ViewChild, ElementRef } from '@angular/core';

// declare var AFRAME: any;

// @Component({
// 	selector: 'vis-3d',
// 	templateUrl: './vis-3d-board.html',
// })
// export class Vis3DBoard implements OnInit {

// 	@Input("imageSrcData") imageSrcData: string = null;
// 	@Input("imageDestData") imageDestData: string = null;

// 	@ViewChild('srcImageEl1') srcImageEl1: ElementRef;
// 	@ViewChild('srcImageEl2') srcImageEl2: ElementRef;
// 	@ViewChild('destImageEl1') destImageEl1: ElementRef;
// 	@ViewChild('destImageEl2') destImageEl2: ElementRef;

// 	constructor() {
// 	}

// 	ngOnInit() {

// 	}

// 	ngAfterViewInit() {
// 	}

// 	ngOnChanges(changes: SimpleChanges) {
// 		if (changes['imageSrcData']) {
// 			this.srcImageEl1 && this.srcImageEl1.nativeElement.setAttribute('src', this.imageSrcData);
// 			this.srcImageEl2 && this.srcImageEl2.nativeElement.setAttribute('src', this.imageSrcData);
// 		}

// 		if (changes['imageDestData']) {
// 			this.destImageEl1 && this.destImageEl1.nativeElement.setAttribute('src', this.imageDestData);
// 			this.destImageEl2 && this.destImageEl2.nativeElement.setAttribute('src', this.imageDestData);
// 		}
// 	}
// }
