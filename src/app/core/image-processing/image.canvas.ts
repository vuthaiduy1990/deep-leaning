export class GMCanvas {

	private _ctx: any;
	private _imageData: ImageData;

	public readonly width: number = 0;
	public readonly height: number = 0;

	constructor(public nativeCanvas: any, imgElement: any) {
		this._ctx = nativeCanvas.getContext('2d');
		this.width = imgElement.width;
		this.height = imgElement.height;

		nativeCanvas.width = this.width;
		nativeCanvas.height = this.height;
		this._ctx.drawImage(imgElement, 0, 0, this.width, this.height);
		this._imageData = this._ctx.getImageData(0, 0, this.width, this.height);
	}

	/**
	* Get context 2d
	*/
	context2d() {
		return this._ctx;
	}

	/**
	* Get image data of canvas
	*/
	getImageData(): Uint8ClampedArray {
		return this._imageData.data;
	}

	/**
	* Set image data
	*/
	setImageData(data: Uint8ClampedArray) {
		this._imageData.data.set(data);
	}

	/**
	* Draw image with new data
	*/
	drawImage(data: Uint8ClampedArray) {
		// here we detach the pixels array from DOM to increase performance when computing
		// refer: http://www.onaluf.org/en/entry/13
		this._imageData.data.set(data);
		this._ctx.putImageData(this._imageData, 0, 0);
	}

	/**
	* Draw sub area of image
	* 
	* @param x:	The x-coordinate, in pixels, of the upper-left corner of the ImageData object
	* @param y:	The y-coordinate, in pixels, of the upper-left corner of the ImageData object
	* @param dirtyX: The horizontal (x) value, in pixels, where to place the image on the canvas
	* @param dirtyY: The vertical (y) value, in pixels, where to place the image on the canvas
	* @param dirtyWidth: The width to use to draw the image on the canvas
	* @param dirtyHeight: The height to use to draw the image on the canvas
	*/
	drawArea(x: number, y: number, dirtyX: number, dirtyY: number, dirtyWidth: number, dirtyHeight: number) {
		this._ctx.putImageData(this._imageData, x, y, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
	}

	/**
	* Convert current image rendered on canvas to base64
	*
	* @return base64 string
	*/
	toBase64() {
		return this.nativeCanvas.toDataURL('image/jpeg');
	}

	/**
	* Convert current image rendered on canvas to blob data
	*/
	toBlob(callback: Function) {
		this.nativeCanvas.toBlob((data) => {
			callback(data); // return a Base64 image
		});
	}

}