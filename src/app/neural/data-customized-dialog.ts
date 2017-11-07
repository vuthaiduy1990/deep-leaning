import { Component, OnInit, ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';

import * as d3 from 'd3';
import { DataGenerator, IDataset, Sample2D } from '../core/ai/dataset';

@Component({
	selector: 'data-customized-dialog',
	templateUrl: './data-customized-dialog.html',
})
export class DataCustomizedDialog {

	private readonly CLEAR_ICON = "url(./assets/images/clear-icon.png)";
	private readonly RELOAD_ICON = "url(./assets/images/reload-icon.png)";
	private readonly CURSOR_CLEAN_ICON = "url(./assets/images/cursor-clean-icon.cur), auto";

	private readonly COLORS: string[] = DataGenerator.SUPPORTED_COLORS;
	private _selectedColor: string = this.COLORS[0];

	private _isClearSelected: boolean = false;
	private _count: number = 0;

	private _board: d3.Selection<any, any, any, any>;
	private _mainBoard: d3.Selection<any, any, any, any>;
	private _scale: any = {};

	private _isMouseDown: boolean = false;

	public dataset: IDataset;
	public datasetList: IDataset[];
	public datasetConfig: any = {};

	private _name = "Custom Data";
	private _nameError = "";

	constructor(public dialogRef: MdDialogRef<DataCustomizedDialog>) {
	}

	ngOnInit() {
		this._name = this.dataset.toString();
		if (this.isDuplicateName(this._name)) {
			this._name = this._name + "_" + (new Date()).getTime();
		}
	}

	ngAfterViewInit() {
		let me = this;
		this._board = d3.select('#board');
		this._mainBoard = this._board.append('g').classed('main', true);

		let width = parseInt(this._board.attr('width'));
		let height = parseInt(this._board.attr('height'));
		this._scale.x = d3.scaleLinear().domain(DataGenerator.DATA_DOMAIN).range([0, width]);
		this._scale.y = d3.scaleLinear().domain(DataGenerator.DATA_DOMAIN).range([0, height]);

		this._board.select('#plane')
			.on('mousedown', function() {
				me._isMouseDown = true;
				if (me._isClearSelected) return;

				let mouse = d3.mouse(d3.select(this).node() as SVGGElement);
				me.drawItem(mouse);

			}).on('mousemove', function() {
				if (me._isClearSelected) return;

				me._count++;
				if (me._isMouseDown && me._count % 5 === 0) {
					let mouse = d3.mouse(d3.select(this).node() as SVGGElement);
					me.drawItem(mouse);
					me._count = 0;
				}

			}).on('mouseup', function() {
				me._isMouseDown = false;
				me._count = 0;
			});

		// draw origin dataset
		this.drawOriginData();


		// blink default color at init
		this.blinkSelectedColor(this._selectedColor);
	}

	// ============================ Drawing Area =============================

	private drawItem(pos: any, color?: string) {
		let me = this;

		this._mainBoard.append('circle')
			.classed('data', true)
			.attr('cx', pos[0]).attr('cy', pos[1]).attr('r', 3)
			.attr('label', color || this._selectedColor)
			.style('fill', color || this._selectedColor)
			.on('mousedown', function() {
				me._isMouseDown = true;

			}).on('mouseup', function() {
				me._isMouseDown = false;
				me._count = 0;

			}).on('mousemove', function() {
				if (me._isClearSelected && me._isMouseDown) {
					d3.select(this).remove();
				}
			});
	}

	private drawOriginData() {
		this.dataset.generate(this.datasetConfig).forEach((p) => {
			let x: number = this._scale.x(p.x);
			let y: number = this._scale.y(p.y);
			this.drawItem([x, y], p.label);
		});
	}

	private clearBoard() {
		this._mainBoard.remove();
		this._mainBoard = this._board.append('g').classed('main', true);
		this._isClearSelected = false;
		this._board.style('cursor', 'pointer');
	}

	// ============================ Event Handler ============================

	private _onNameChanged(name: string) {
		this._nameError = "";
		if (name.length === 0) {
			this._nameError = "Name must not empty";

		} else if (this.isDuplicateName(name)) {
			this._nameError = "Name is duplicated";
		}
	}

	private _onSelectColor(color: string) {
		this._selectedColor = color;
		this.blinkSelectedColor(color);

		this._isClearSelected = false;
		this._board.style('cursor', 'pointer');
	}

	private _onSaveClicked() {
		// there is error -> do not save
		if (this._nameError != '') return;

		this.updateCurrentDataset();
		this.saveToLocalStorage();
		this.dialogRef.close({ status: 'update' });
	}

	private _onSaveAsNewClicked() {
		// there is error -> do not save
		if (this._nameError != '') return;

		this.addNewDataset();
		this.saveToLocalStorage();
		this.dialogRef.close();
	}

	private _onRemoved() {
		this.removeDataset(this.dataset);
		this.saveToLocalStorage();
		this.dialogRef.close({ status: 'remove' });
	}

	private _onClearClicked() {
		this._isClearSelected = this._isClearSelected ? false : true;
		if (this._isClearSelected) {
			this._board.style('cursor', this.CURSOR_CLEAN_ICON);
		} else {
			this._board.style('cursor', 'pointer');
		}
	}

	private _onClearAllClicked() {
		this.clearBoard();
	}

	private _onReloadClicked() {
		this.clearBoard();
		this.drawOriginData();
	}

	// ================================ Method ===============================

	/**
	* Blink color item;
	* @param color hexadecimal color string
	*/
	private blinkSelectedColor(color: string) {
		let rgb = d3.rgb(color).toString();
		d3.selectAll('canvas.color-item').each(function() {
			let el = d3.select(this);

			if (el.style('background-color') === rgb) {
				el.style('animation', 'a-color 1s')
					.style('animation-iteration-count', 'infinite');
			} else {
				el.style('animation', 'none');
			}
		});
	}

	/**
	* Construct dataset from point which user draw on board
	*/
	private constructDataset(): IDataset {
		let me = this;
		let samples: Sample2D[] = [];
		let colors: string[] = [];

		this._mainBoard.selectAll('circle.data').each(function(d) {
			let el = d3.select(this);
			let x: number = me._scale.x.invert(el.attr('cx'));
			let y: number = me._scale.y.invert(el.attr('cy'));
			let color = el.attr('label');

			if (colors.indexOf(color) == -1) {
				colors.push(color);
			}

			samples.push({
				x: x,
				y: y,
				label: color,
			});
		});

		return {
			colors: colors,
			generate: (config?: any) => {
				return samples;
			},
			toString: () => {
				return me._name;
			}
		}
	}

	/**
	* Check whether specified name is duplicated or not.
	* @param name: dataset name
	* @return true if duplicate
	*/
	private isDuplicateName(name: string) {
		for (let i = 0; i < this.datasetList.length; i++) {
			if (this.datasetList[i].toString() === name) return true;
		}
		return false;
	}

	/**
	* Save new data set to local storage
	*/
	private saveToLocalStorage() {
		let json = [];
		this.datasetList.forEach((dataset) => {
			!dataset.isDefault && json.push(DataGenerator.convertDatasetToJson(dataset));
		});
		localStorage.setItem('datasets', JSON.stringify(json));
	}

	/**
	* Remove current dataset
	*/
	private removeDataset(dataset: IDataset) {
		for (let i = 0; i < this.datasetList.length; i++) {
			if (dataset.toString() === this.datasetList[i].toString()) {
				this.datasetList.splice(i, 1);
				break;
			}
		}
	}

	/**
	* Update current dataset
	*/
	private updateCurrentDataset() {
		// get index of current dataset in list
		let idx = 0;
		for (let i = 0; i < this.datasetList.length; i++) {
			if (this.dataset.toString() === this.datasetList[i].toString()) {
				idx = i;
				break;
			}
		}

		this.dataset = this.constructDataset();
		this.datasetList[idx] = this.dataset;
	}

	private addNewDataset() {
		this.datasetList.push(this.constructDataset());
	}
}