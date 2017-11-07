import { GMKernel } from './kernel'
import { GMImage } from './image.model';

export module GMImagePro {

	/**
	* Compute convlution between image and kernel
	* Kernel should be odd squared 3x3, 5x5.
	*/
	export function conv(image: GMImage, kernel: GMKernel, gray = false): Uint8ClampedArray {

		if (kernel.isSquared() && kernel.size[0] == 3) {
			if (gray) {
				return conv3x3Gray(image, kernel);
			}
			return conv3x3(image, kernel);
		}

		// TODO: missing gray convolution
		if (kernel.isOddSquared()) {
			convOddSquare(image, kernel);
		}

		return convNonOddSquare(image, kernel);
	}

	/**
	*
	* Compute convlution between image and squared kernel.
	*
	* @param iamge: image object
	* @param kernel: kernel
	* @return convolved image data
	*/
	export function convOddSquare(image: GMImage, kernel: GMKernel): Uint8ClampedArray {
		let length = image.width * image.height * 4;
		let convData = new Uint8ClampedArray(length);
		let half = Math.floor(kernel.size[0] / 2);
		let flippedKernel: GMKernel = kernel.clone().flip();

		for (let i = 0; i < image.height; i++) {
			for (let j = 0; j < image.width; j++) {

				let argb = { R: 0, G: 0, B: 0, A: 0 };
				let alpha = image.pixel(i, j)[3];

				// slide kernel over image by center of kernel
				for (let k = 0; k < flippedKernel.size[1]; k++) {
					for (let h = 0; h < flippedKernel.size[0]; h++) {
						let x = i - half + k;
						let y = j - half + h;

						if (x < 0 || x > image.height - 1 || y < 0 || y > image.width - 1) {
							continue; // out of image
						}

						let pix = image.pixel(x, y); // [r, g, b, alpha]
						let cell = flippedKernel.cell(k, h);
						argb.R += pix[0] * cell;
						argb.G += pix[1] * cell;
						argb.B += pix[2] * cell;
					}
				}

				convData.set(new Uint8ClampedArray([argb.R, argb.G, argb.B, alpha]), i * image.width * 4 + j * 4);
			}
		}

		return convData;
	}

	/**
	*
	* Compute convlution between image and non squared kernel.
	*
	* @param iamge: image object
	* @param kernel: kernel
	* @return convolved image data
	*/
	export function convNonOddSquare(image: GMImage, kernel: GMKernel): Uint8ClampedArray {
		let length = image.width * image.height * 4;
		let convData = new Uint8ClampedArray(length);
		let half = Math.floor(kernel.size[0] / 2);
		let flippedKernel: GMKernel = kernel.clone().flip();

		for (let i = 0; i < image.height; i++) {
			for (let j = 0; j < image.width; j++) {

				let argb = { R: 0, G: 0, B: 0, A: 0 };
				let alpha = image.pixel(i, j)[3];

				// slide kernel over image by top left of kernel
				for (let k = 0; k < flippedKernel.size[1]; k++) {
					for (let h = 0; h < flippedKernel.size[0]; h++) {
						let x = i + k;
						let y = j + h;

						if (x < 0 || x > image.height - 1 || y < 0 || y > image.width - 1) {
							continue; // out of image
						}

						let pix = image.pixel(x, y); // [r, g, b, alpha]
						let cell = kernel.cell(k, h);
						argb.R += pix[0] * cell;
						argb.G += pix[1] * cell;
						argb.B += pix[2] * cell;
						argb.A += pix[3] * cell;
					}
				}

				convData.set(new Uint8ClampedArray([argb.R, argb.G, argb.B, alpha]), i * image.width * 4 + j * 4);
			}
		}

		return convData;
	}

	/**
	*
	* Compute convlution between image and 3x3 kernel.
	* Kernel is fixed at 3x3 so that we can speedup computing by decrease the number of for loop
	*
	* @param iamge: image object
	* @param kernel: kernel
	* @return convolved image data
	*/
	function conv3x3(image: GMImage, kernel: GMKernel): Uint8ClampedArray {

		let length = image.width * image.height * 4;
		let convData = new Uint8ClampedArray(length);
		let flippedKernel: GMKernel = kernel.clone().flip();

		let cell00 = flippedKernel.cell(0, 0);
		let cell01 = flippedKernel.cell(0, 1);
		let cell02 = flippedKernel.cell(0, 2);
		let cell10 = flippedKernel.cell(1, 0);
		let cell11 = flippedKernel.cell(1, 1); // center
		let cell12 = flippedKernel.cell(1, 2);
		let cell20 = flippedKernel.cell(2, 0);
		let cell21 = flippedKernel.cell(2, 1);
		let cell22 = flippedKernel.cell(2, 2);

		for (let i = 0; i < image.height; i++) {
			for (let j = 0; j < image.width; j++) {

				// center cell of kernel will be put on convolving pixel of image
				// pix(x, y) = pix(i - half + k, j - half + h)
				// half = 3 / 2 = 1
				// k -> [0, kernel.heigh -1], h -> [0, kernel.width - 1]
				let pix00 = image.pixel(i - 1 + 0, j - 1 + 0);
				let pix01 = image.pixel(i - 1 + 0, j - 1 + 1);
				let pix02 = image.pixel(i - 1 + 0, j - 1 + 2);
				let pix10 = image.pixel(i - 1 + 1, j - 1 + 0);
				let pix11 = image.pixel(i - 1 + 1, j - 1 + 1);	// convolving pixel
				let pix12 = image.pixel(i - 1 + 1, j - 1 + 2);
				let pix20 = image.pixel(i - 1 + 2, j - 1 + 0);
				let pix21 = image.pixel(i - 1 + 2, j - 1 + 1);
				let pix22 = image.pixel(i - 1 + 2, j - 1 + 2);

				let R = (pix00[0] * cell00 + pix01[0] * cell01 + pix02[0] * cell02
					+ pix10[0] * cell10 + pix11[0] * cell11 + pix12[0] * cell12
					+ pix20[0] * cell20 + pix21[0] * cell21 + pix22[0] * cell22) | 0;

				let G = (pix00[1] * cell00 + pix01[1] * cell01 + pix02[1] * cell02
					+ pix10[1] * cell10 + pix11[1] * cell11 + pix12[1] * cell12
					+ pix20[1] * cell20 + pix21[1] * cell21 + pix22[1] * cell22) | 0;

				let B = (pix00[2] * cell00 + pix01[2] * cell01 + pix02[2] * cell02
					+ pix10[2] * cell10 + pix11[2] * cell11 + pix12[2] * cell12
					+ pix20[2] * cell20 + pix21[2] * cell21 + pix22[2] * cell22) | 0;

				convData.set(new Uint8ClampedArray([R, G, B, pix11[3]]), i * image.width * 4 + j * 4);
			}
		}

		return convData;
	}

	/**
	*
	* Compute convlution between gray image and 3x3 kernel.
	* Kernel is fixed at 3x3 so that we can speedup computing by decrease the number of for loop
	*
	* @param iamge: image object
	* @param kernel: kernel
	* @return convolved image data
	*/
	function conv3x3Gray(image: GMImage, kernel: GMKernel): Uint8ClampedArray {
		let length = image.width * image.height * 4;
		let convData = new Uint8ClampedArray(length);
		let flippedKernel: GMKernel = kernel.clone().flip();

		let cell00 = flippedKernel.cell(0, 0);
		let cell01 = flippedKernel.cell(0, 1);
		let cell02 = flippedKernel.cell(0, 2);
		let cell10 = flippedKernel.cell(1, 0);
		let cell11 = flippedKernel.cell(1, 1); // center
		let cell12 = flippedKernel.cell(1, 2);
		let cell20 = flippedKernel.cell(2, 0);
		let cell21 = flippedKernel.cell(2, 1);
		let cell22 = flippedKernel.cell(2, 2);

		for (let i = 0; i < image.height; i++) {
			for (let j = 0; j < image.width; j++) {

				// center cell of kernel will be put on convolving pixel of image
				// pix(x, y) = pix(i - half + k, j - half + h)
				// half = 3 / 2 = 1
				// k -> [0, kernel.heigh -1], h -> [0, kernel.width - 1]			
				let pix00 = image.Gray[image.index(i - 1 + 0, j - 1 + 0)] | 0;
				let pix01 = image.Gray[image.index(i - 1 + 0, j - 1 + 1)] | 0;
				let pix02 = image.Gray[image.index(i - 1 + 0, j - 1 + 2)] | 0;
				let pix10 = image.Gray[image.index(i - 1 + 1, j - 1 + 0)] | 0;
				let pix11 = image.Gray[image.index(i - 1 + 1, j - 1 + 1)] | 0;	// convolving pixel
				let pix12 = image.Gray[image.index(i - 1 + 1, j - 1 + 2)] | 0;
				let pix20 = image.Gray[image.index(i - 1 + 2, j - 1 + 0)] | 0;
				let pix21 = image.Gray[image.index(i - 1 + 2, j - 1 + 1)] | 0;
				let pix22 = image.Gray[image.index(i - 1 + 2, j - 1 + 2)] | 0;

				let gray = (pix00 * cell00 + pix01 * cell01 + pix02 * cell02
					+ pix10 * cell10 + pix11 * cell11 + pix12 * cell12
					+ pix20 * cell20 + pix21 * cell21 + pix22 * cell22);
				let alpha = image.Gray[image.index(i - 1 + 1, j - 1 + 1) + 3]
				convData.set(new Uint8ClampedArray([gray, gray, gray, alpha]), i * image.width * 4 + j * 4);
			}
		}

		return convData;
	}

};

