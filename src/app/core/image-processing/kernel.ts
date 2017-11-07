/**
* Define kernel model which is partly on top of matrix object of mathjs library
*
* @author Vu Thai Duy
*/

import * as math from 'mathjs';

// wrap matrix class of mathjs
export class GMKernel {

	private val: any;

	public readonly size: Array<number>;
	public readonly rowIndexs: Array<number>;
	public readonly colIndexs: Array<number>

	// name of kernel
	public name: string = "";
	private extra: any = {};

	/**
	* Contructor
	*
	* @param arr: array which represent for a matrix.
	* For example: [[2, 0], [-1, 3], [5, 6]] -> matrix (3x2)
	*/
	constructor(arr: Array<any>, name?: string) {
		this.val = math.matrix(arr);
		this.name = (name) ? name : 'kernel';
		this.size = this.val.size();
		this.rowIndexs = Array<number>(this.size[0]).fill(0).map((x, i) => i);
		this.colIndexs = Array<number>(this.size[1]).fill(0).map((x, i) => i);
	}

	/**
	* Get extra value of kernel
	*
	* @param key: extra key
	*/
	getExtra(key: string) {
		return this.extra[key];
	}

	/**
	* Set extra value
	* 
	* @param key: extra key
	* @param value: extra value
	*/
	setExtra(key: string, val: any) {
		this.extra[key] = val;
		return this;
	}

	/**
	* Get specified row of kernel or array of rows.
	* Each row should be an array like [1, 2, 3]
	* 
	* @return row or array of rows
	*/
	rows(idx?: number) {
		// check exception
		if (idx < 0 || idx > this.val.size()[0]) {
			return [];
		}

		// return a row if idx is specified else return all rows as an array
		return (idx != null) ? this.val.toArray()[idx] : this.val.toArray();
	}

	/**
	* Get specified column of kernel or array of columns.
	* Each column should be an array like [1, 2, 3]
	* 
	* @return column or array of columns
	*/
	cols(idx?: number) {
		// check exception
		if (idx < 0 || idx > this.val.size()[1]) {
			return [];
		}

		// t = a.transpose() -> column of a = row of b
		// return a row if idx is specified else return all rows as an array
		let t: any = math.transpose(this.val);
		return (idx != null) ? t.toArray()[idx] : t.toArray();
	}

	/**
	* Get cell value at row i and column j
	*
	* @param i: row index of kernel
	* @param j: column index of kernel 
	* @return cell value
	*/
	cell(i: number, j: number) {
		return this.val.subset(math.index(i, j));
	}


	/**
	* Change cell value at row i and column j
	*
	* @param i: row index of kernel
	* @param j: column index of kernel 
	*/
	setValue(i: number, j: number, val: number) {
		this.val.subset(math.index(i, j), val);
		return this;
	}

	/**
	* Check whether kernel is squared or not
	* @return true if squared
	*/
	isSquared() {
		return (this.size[0] == this.size[1]);
	}

	/**
	* Check whether kernel is odd squared or not
	* Odd mean that size is odd number
	* @return true if squared
	*/
	isOddSquared() {
		return (this.size[0] == this.size[1] && this.size[0] % 2 == 1);
	}

	/**
	* Clone kernel
	*
	* @return cloned kernel
	*/
	clone(): GMKernel {
		let clone = new GMKernel(this.val);
		clone.name = this.name;

		for (let key in this.extra) {
			clone.setExtra(key, this.extra[key]);
		}

		return clone;
	}

	/**
	* Flip kernel matrix in both horizontal and vertical side
	*/
	flip(): GMKernel {
		this.horizontalFlip().verticalFlip();
		return this;
	}

	/**
	* Flip kernel matrix in horizontal side
	*/
	horizontalFlip(): GMKernel {
		let w = this.size[0];
		let len = Math.floor(w / 2);

		for (let i = 0; i < len; i++) {
			this.swapCol(i, w - i - 1);
		}
		return this;
	}

	/**
	* Flip kernel matrix in vertical side
	*/
	verticalFlip(): GMKernel {
		let h = this.size[1];
		let len = Math.floor(h / 2);

		for (let i = 0; i < len; i++) {
			this.swapRow(i, h - i - 1);
		}
		return this;
	}

	/**
	* Swap rows to each other
	* 
	* @param i: row index of kernel
	* @param j: row index of kernel 
	*/
	swapRow(i, j): GMKernel {
		let row1 = this.rows(i);
		let row2 = this.rows(j);

		this.val.subset(math.index(i, this.colIndexs), row2);
		this.val.subset(math.index(j, this.colIndexs), row1);
		return this;
	}

	/**
	* Swap columns to each other
	* 
	* @param i: column index of kernel
	* @param j: column index of kernel 
	*/
	swapCol(i, j): GMKernel {
		let col1 = this.cols(i);
		let col2 = this.cols(j);

		this.val.subset(math.index(this.rowIndexs, i), col2);
		this.val.subset(math.index(this.colIndexs, j), col1);
		return this;
	}

	toString() {
		return this.name;
	}

	/**
	* Convert kernel to json
	*/
	toJson() {
		let json = { name: this.name, data: {} };

		// convert kernel matrix tp json
		let rows = this.rows();
		for (let i = 0; i < rows.legnth; i++) {
			json.data[i] = rows[i];
		}

		// convert extra attribute to json
		for (let key in this.extra) {
			json[key] = this.extra[key];
		}

		return json;
	}

	/**
	* Parse json object to kernel object
	*
	* @param jobj: json object
	* @return kernel object
	*/
	public static fromJson(jobj: any): GMKernel {
		let val = [];
		let data = jobj.data;
		for (let key in data) {
			val.push(data[key]);
		}
		let result = new GMKernel(val, jobj.name);

		// get extra infor
		for (let key in jobj) {
			if (key != 'name' && key != 'data') {
				result.setExtra(key, jobj[key]);
			}
		}
		return result;
	}
}

export class KernelSamples {

	public static list(): GMKernel[] {
		return [
			this.IDENTITY, this.SHARPEN, this.GAUSSIAN,
			this.EMBOSS, this.OUTLINE, this.LEFT_SOBEL,
			this.RIGHT_SOBEL, this.TOP_SOBEL, this.BOTTOM_SOBEL
		]
	};

	public static map(name: string) {
		switch (name) {
			case this.IDENTITY.toString():
				return this.IDENTITY;

			case this.SHARPEN.toString():
				return this.SHARPEN;

			case this.GAUSSIAN.toString():
				return this.GAUSSIAN;

			case this.EMBOSS.toString():
				return this.EMBOSS;

			case this.OUTLINE.toString():
				return this.OUTLINE;

			case this.LEFT_SOBEL.toString():
				return this.LEFT_SOBEL;

			case this.RIGHT_SOBEL.toString():
				return this.RIGHT_SOBEL;

			case this.TOP_SOBEL.toString():
				return this.TOP_SOBEL;

			case this.BOTTOM_SOBEL.toString():
				return this.BOTTOM_SOBEL;			

			default:
				break;
		}
		return this.IDENTITY;
	}

	public static IDENTITY: GMKernel = GMKernel.fromJson({
		name: "Indentity",
		data: {
			"0": [0, 0, 0],
			"1": [0, 1, 0],
			"2": [0, 0, 0]
		}
	});

	public static SHARPEN: GMKernel = GMKernel.fromJson({
		name: "Sharpen",
		data: {
			"0": [0, -1, 0],
			"1": [-1, 5, -1],
			"2": [0, -1, 0]
		}
	});

	public static GAUSSIAN: GMKernel = GMKernel.fromJson({
		name: "Gaussian 3x3 (Blur)",
		data: {
			"0": [0.0625, 0.125, 0.0625],
			"1": [0.125, 0.25, 0.125],
			"2": [0.0625, 0.125, 0.0625]
		}
	});

	public static EMBOSS: GMKernel = GMKernel.fromJson({
		name: "Emboss",
		data: {
			"0": [-2, -1, 0],
			"1": [-1, 1, 1],
			"2": [0, 1, 2]
		}
	});

	public static OUTLINE: GMKernel = GMKernel.fromJson({
		name: "Outline (Edge Detection)",
		data: {
			"0": [-1, -1, -1],
			"1": [-1, 8, -1],
			"2": [-1, -1, -1]
		}
	});

	public static LEFT_SOBEL: GMKernel = GMKernel.fromJson({
		name: "Left Sobel",
		data: {
			"0": [1, 0, -1],
			"1": [2, 0, -2],
			"2": [1, 0, -1]
		}
	});

	public static RIGHT_SOBEL: GMKernel = GMKernel.fromJson({
		name: "Right Sobel",
		data: {
			"0": [-1, 0, 1],
			"1": [-2, 0, 2],
			"2": [-1, 0, 1]
		}
	});

	public static TOP_SOBEL: GMKernel = GMKernel.fromJson({
		name: "Top Sobel",
		data: {
			"0": [1, 2, 1],
			"1": [0, 0, 0],
			"2": [-1, -2, -1]
		}
	});

	public static BOTTOM_SOBEL: GMKernel = GMKernel.fromJson({
		name: "Bottom Sobel",
		data: {
			"0": [-1, -2, -1],
			"1": [0, 0, 0],
			"2": [1, 2, 1]
		}
	});

}