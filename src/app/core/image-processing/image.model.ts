/**
* Define image model which is on top of canvas element
*
* @author Vu Thai Duy
*/

import { GMKernel } from './kernel'

export class GMImage {

	public readonly width: number;
	public readonly height: number;

	public readonly Data: Uint8ClampedArray;
	public readonly R: Uint8ClampedArray;
	public readonly G: Uint8ClampedArray;
	public readonly B: Uint8ClampedArray;
	public readonly A: Uint8ClampedArray;
	public readonly Gray: Uint8ClampedArray;

	private isCanvasChanged: boolean = false;

	constructor(data: Uint8ClampedArray, width: number, height: number) {

		this.width = width;
		this.height = height;

		let length = width * height * 4;
		this.Data = new Uint8ClampedArray(data);
		this.Gray = new Uint8ClampedArray(length);
		this.R = new Uint8ClampedArray(length);
		this.G = new Uint8ClampedArray(length);
		this.B = new Uint8ClampedArray(length);
		this.A = new Uint8ClampedArray(length);

		// convert image to gray
		let pixels = width * height;
		let i = 0;

		while (i < data.length) {
			let r = data[4 * i + 0] // Red value
			let g = data[4 * i + 1] // Green value
			let b = data[4 * i + 2] // Blue value
			let a = data[4 * i + 3] // Alpha value

			// original ITU-R recommendation (BT.709, specifically)
			// http://www.tannerhelland.com/3643/grayscale-image-algorithm-vb6/
			let gray = r * 0.2126 + g * 0.7152 + b * 0.0722;

			this.Gray[4 * i + 0] = gray;
			this.Gray[4 * i + 1] = gray;
			this.Gray[4 * i + 2] = gray;
			this.Gray[4 * i + 3] = a;

			this.R[4 * i + 0] = r;
			this.R[4 * i + 1] = 0;
			this.R[4 * i + 2] = 0;
			this.R[4 * i + 3] = a;

			this.G[4 * i + 0] = 0;
			this.G[4 * i + 1] = g;
			this.G[4 * i + 2] = 0;
			this.G[4 * i + 3] = a;

			this.B[4 * i + 0] = 0;
			this.B[4 * i + 1] = 0;
			this.B[4 * i + 2] = b;
			this.B[4 * i + 3] = a;

			this.A[4 * i + 0] = 0;
			this.A[4 * i + 1] = 0;
			this.A[4 * i + 2] = 0;
			this.A[4 * i + 3] = a;

			i++;
		}
	}

	/**
	* Get pixel value at row i and column j
	* 
	* @param i: row index of image
	* @param j: column index of image
	* @return [R,G,B,A].
	*/
	pixel(i, j) {
		let ridx = this.index(i, j);
		return [this.Data[ridx], this.Data[ridx + 1], this.Data[ridx + 2], this.Data[ridx + 3]];
	}

	/*
	* Return index corresponding to row i and colunn j
	*/
	index(i, j): number {
		return i * this.width * 4 + j * 4;
	}
}

