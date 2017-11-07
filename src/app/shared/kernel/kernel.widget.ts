/**
* Define widget component which visualize a kernel (filter matrix).<p>
* Properties: <ul>
*	<li> kernel: kernel object {{GMKernel}} </li>
*	<li> animation: enable animation on kernel widget such as: hover, ... </li>
*	<li> changable: allow change kernel value on runtime by wheeling, left/right click on each cell </li></ul>
*
* <p>Overridable events: <ul>
*	<li> onCellMouseWheel: trigger when mouse wheel on each kernel cell </li>
*	<li> onCellClick: trigger when left click on each kernel cell </li>
*	<li> onCellContextMenu: trigger when right click on each kernel cell</li>
*	<li> onValueChange: trigger when value of kernel is changed </li></ul>
* To make your own kernel behavior, set changable to false and override obove events.
* or you can keep default behavior and just extend behavior by overriding events
*
* @author Vu Thai Duy
*/

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Input } from '@angular/core';

import { GMKernel } from '../../core/image-processing/kernel';


@Component({
	selector: 'kernel-widget',
	templateUrl: './kernel.widget.html',
	styleUrls: ['./style.css']
})
export class KernelWidget implements OnInit {
	@Input("kernel") kernel: GMKernel = null;
	@Input("animation") animation: boolean = true; // enable animation like hover
	@Input("changable") changable: boolean = true; // allow change value by by wheeling, left/right click on each cell

	constructor() {
		this.kernel = new GMKernel([]);
	}

	ngOnInit() {

	}

	ngAfterViewInit() {
	}

	/**
	* Get kernel value by row and column index
	*/
	private getKernelCell(i: number, j: number) {
		return Math.round(this.kernel.cell(i, j) * 100) / 100
	}

	/**
	* Handle mouse wheel event on each cell
	* 
	* @param a: event argument
	* @param i: row index of cell
	* @param j: column index of cell
	*/
	private _onCellMouseWheel(e: any, i: number, j: number) {
		this.onCellMouseWheel(e, i, j);

		// does not allow to change value
		if (!this.changable) return;

		e.preventDefault(); // prevent default mouse wheel event on page
		if (e.deltaY > 0) /*wheel down -> decrease value */ {
			this.kernel.setValue(i, j, this.kernel.cell(i, j) - 0.1);
		} else /*wheel up -> increase value */ {
			this.kernel.setValue(i, j, this.kernel.cell(i, j) + 0.1);
		}

		// trigger a value changed
		this.onValueChange(e, i, j);
	}
	onCellMouseWheel(e: any, i: number, j: number) { }

	/**
	* Handle mouse left click event on each cell
	* 
	* @param a: event argument
	* @param i: row index of cell
	* @param j: column index of cell
	*/
	private _onCellClick(e: any, i: number, j: number) {
		this.onCellClick(e, i, j);

		// does not allow to change kernel value
		if (!this.changable) return;

		// increase value
		this.kernel.setValue(i, j, this.kernel.cell(i, j) + 0.1);

		// trigger a value changed
		this.onValueChange(e, i, j);
	}
	onCellClick(e: any, i: number, j: number) { }

	/**
	* Handle mouse right click event on each cell
	* 
	* @param a: event argument
	* @param i: row index of cell
	* @param j: column index of cell
	*/
	private _onCellContextMenu(e: any, i: number, j: number) {
		this.onCellContextMenu(e, i, j);

		// does not allow to change value
		if (!this.changable) return;

		// disable show context menu when right click on kernel
		e.preventDefault();
		// decrease value
		this.kernel.setValue(i, j, this.kernel.cell(i, j) - 0.1);

		// trigger a value changed
		this.onValueChange(e, i, j);
	}
	onCellContextMenu(e: any, i: number, j: number) { }

	/**
	* Trigger when value of kernel is changed
	* 
	* @param a: event argument
	* @param i: row index of cell
	* @param j: column index of cell
	*/
	onValueChange(e: any, i: number, j: number) { }
}
