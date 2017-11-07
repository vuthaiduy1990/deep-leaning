import { Component, OnInit, ElementRef } from '@angular/core';
import { ViewEncapsulation, ViewChild, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';

import * as d3 from 'd3';

import { NeuralService } from './neural.service';
import { NEURAL_CONFIG } from './neural.config';
import { INeuralOption } from './neural'
import { DataCustomizedDialog } from './data-customized-dialog';

import { ai } from '../core/ai/ai';
import { DataGenerator, IDataset, Sample2D } from '../core/ai/dataset';
import { GMUtil } from "../core/utils";

const INPUT_LAYER_WIDTH: number = 100;
const LAYER_PANEL_WIDTH: number = 720; // should change setting in css .vis-panel .net-panel
const LAYER_PANEL_HEIGHT: number = 400;
// canvas width and height
const OUT_CANVAST_SIZE: number = 50;

// minimum and maximum size of node
const MAX_NODE_SIZE: number = 30;
const MIN_NODE_SIZE: number = 25;
// minimum space between node
const MIN_NODE_SPACE: number = 10;
// minimum space between layer
const MIN_LAYER_SPACE: number = 40;

const MIN_LAYER_NUM: number = 1;
const MAX_LAYER_NUM: number = Math.floor((LAYER_PANEL_WIDTH + MIN_LAYER_SPACE) / (MIN_LAYER_SPACE + MIN_NODE_SIZE));
const MIN_NODE_NUM: number = 1;
const MAX_NODE_NUM: number = Math.floor((LAYER_PANEL_HEIGHT + MIN_NODE_SPACE) / (MIN_NODE_SPACE + MIN_NODE_SIZE));

/**
* Create a layer scale which compute appropriate layer width, space so that all node can fit layout
* @param layerNum: mumber of layer
* @return layer width and layer space
*/
const LAYER_SCALE = (layerNum: number) => {
	if (layerNum >= MAX_LAYER_NUM) return { w: MIN_NODE_SIZE, space: MIN_LAYER_SPACE };

	let nodeW = MAX_NODE_SIZE + 5;
	let space = 0;
	while (space < MIN_LAYER_SPACE) {
		// decrease node size to fit layout
		nodeW -= 5;
		space = Math.floor((LAYER_PANEL_WIDTH - layerNum * nodeW) / (layerNum - 1));
	}

	return { w: nodeW, space: space };
}

/**
* Create a node scale which compute appropriate node width, space so that all node can fit layout
* @param nodeNum: mumber of node per layer
* @return lnode width and node space
*/
const NODE_SCALE = (nodeNum: number) => {
	if (nodeNum >= MAX_NODE_NUM) return { w: MIN_NODE_SIZE, space: MIN_NODE_SPACE };

	let nodeW = MAX_NODE_SIZE + 5;
	let space = 0;
	while (space < MIN_NODE_SPACE) {
		// decrease node size to fit layout
		nodeW -= 5;
		space = Math.floor((LAYER_PANEL_HEIGHT - nodeNum * nodeW) / (nodeNum - 1));
	}

	return { w: nodeW, space: space };
}

@Component({
	templateUrl: './neural.component.html',
	styleUrls: ['./neural.style.css'],
	encapsulation: ViewEncapsulation.None // use this setting to share css
})
export class NeuralComponent implements OnInit {

	private readonly SAMPLES_LENGTH: number = 150; // the number of samples per class
	// k-fold cross validation
	private readonly MIN_KFOLD = 2;
	private readonly MAX_KFOLD = 10;
	// batch size for mini-batch gradient descent algorithm
	private readonly MIN_BATCH_SIZE: number = 1;
	private readonly MAX_BATCH_SIZE: number = 50;
	// Gaussian noice
	private readonly MIN_NOISE: number = 0;
	private readonly MAX_NOISE: number = DataGenerator.MAX_NOISE;
	// gradient descent algorithms	
	private readonly GRADIENT_DESCENT: any[] = ai.GradientDescent.list();
	// learning rate
	private readonly LEARNING_RATES: number[] = [0.00001, 0.0001, 0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1, 3, 10];
	// activation functions
	private readonly ACTIVATIONS: ai.IActivationFunction[] = ai.ActivationFunction.list();
	// regularization
	private readonly REGULARIZATION: ai.IRegularizationFunction[] = ai.RegularizationFunction.list();
	private readonly REGULARIZATION_RATES: number[] = [0, 0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1, 3, 10];

	private _network: ai.NeuralNetwork;
	private _options: INeuralOption = {
		dataset: DataGenerator.GAUSSIAN,
		showTestData: true,
		kfold: 5,
		batch: 10,
		noise: 4,
		gradientDescent: ai.GradientDescent.NONE,
		learningRate: 0.03,
		activation: ai.ActivationFunction.IDENTITY,
		regularization: ai.RegularizationFunction.NONE,
		regularizationRate: 0.01
	}

	private _datasetList: IDataset[] = DataGenerator.list();
	private _trainData: Sample2D[] = [];
	private _testData: Sample2D[] = [];
	private _lossTrain: number = 0;
	private _lossTest: number = 0;

	private _isRunning: boolean = false;
	private _isPause: boolean = false;
	private _epoch: number = 0;
	private _trainTimer: any;

	private _outCanvas: HTMLCanvasElement;
	private _outImageData: ImageData;
	private _outCtx: CanvasRenderingContext2D;
	private _outSvg: d3.Selection<any, any, any, any>;
	private _outScale: any = {};
	private _hmScale: any = {};

	private _d3connLines: any = null;

	// blink effect for more icon	
	private _layerMoreTrans = d3.transition('i.more').duration(100).ease(d3.easeLinear);
	private _layerMoreTransEnd: boolean = true;

	constructor(
		private route: ActivatedRoute,
		private router: Router,		
		private neuService: NeuralService,
		@Inject(NEURAL_CONFIG) private cf,
		public dialog: MdDialog) {

		this.genData();
		this._network = new ai.NeuralNetwork(
			2,
			[15, 10, 10, 10, 15],
			this._options.dataset.colors.length,
			{
				gradientDescent: this._options.gradientDescent,
				activation: this._options.activation,
				learningRate: this._options.learningRate,
				regularization: this._options.regularization,
				regularizationRate: this._options.regularizationRate,
				initZero: false
			});

	}

	ngOnInit() {
		// retrieve saved dataset from localstorage
		let json: any = JSON.parse(localStorage.getItem('datasets'));

		if (json && json instanceof Array) {
			for (let i = 0; i < json.length; i++) {
				json[i] && this._datasetList.push(DataGenerator.parseJson(json[i]));
			}
		}

	}

	ngAfterViewInit() {
		let d3canvas = d3.select('#outPanel canvas.heatmap').attr('id', this._network.output.id);
		let width = parseInt(d3canvas.style('width'));
		let height = parseInt(d3canvas.style('height'));

		this._outCanvas = d3canvas.node() as HTMLCanvasElement;
		this._outCanvas.width = OUT_CANVAST_SIZE;
		this._outCanvas.height = OUT_CANVAST_SIZE;
		this._outCtx = this._outCanvas.getContext('2d');
		this._outImageData = this._outCtx.getImageData(0, 0, OUT_CANVAST_SIZE, OUT_CANVAST_SIZE);

		this._outSvg = d3.select('#outPanel svg.vis-data')
			.attr('width', width)
			.attr('height', height);
		this._outScale.x = d3.scaleLinear().domain(DataGenerator.DATA_DOMAIN).range([0, width])
		this._outScale.y = d3.scaleLinear().domain(DataGenerator.DATA_DOMAIN).range([0, height])
		this._hmScale.x = d3.scaleLinear().domain([0, width]).range([0, OUT_CANVAST_SIZE]);
		this._hmScale.y = d3.scaleLinear().domain([0, height]).range([0, OUT_CANVAST_SIZE]);

		this.drawInputPanel();
		this.drawLayerPanel();
		this.drawOutputLayer();
		this.drawLinks();
	}

	// ============================ Drawing Area =============================

	/**
	* Draw input layer
	*/
	private drawInputPanel() {
		let panel = d3.select('#networkPanel #inPanel');
		let nodes = this._network.input.nodes;
		let colors = this._options.dataset.colors;

		// remove all children
		panel.select('div.main').remove();

		// draw input node as canvas
		let scale = NODE_SCALE(nodes.length);
		let nodeW = scale.w;
		var divs = panel.append('div').classed('main', true).selectAll('div').data(nodes).enter()
			.append('div')
			.classed('layer', true)
			.style('margin-top', (d, i) => (i > 0) ? scale.space + 'px' : '0px');

		// append input labe;
		divs.append('span').html((d, i) => "X<sub>" + i + "</sub>");

		// append nodes as canvas
		divs.append('canvas')
			.classed('node', true)
			.attr('id', d => d.id)
			.attr('width', nodeW).attr('height', nodeW)
			.style('margin-left', '10px')
			.style('border-radius', nodeW / 2 + 'px')
			.on('mouseenter', (d) => {
				// hightlight link which when hover on node
				let g = d3.select('#networkPanel .links g');
				g.selectAll('line[src=' + d.id + ']').each(function(d) {
					let el = d3.select(this);
					el.classed('node-hover', true);
				});
			})
			.on('mouseout', (d) => {
				// turn off highlighting links when hover out node
				let g = d3.select('#networkPanel .links g');
				g.selectAll('line[src=' + d.id + ']').each(function(d) {
					let el = d3.select(this);
					el.classed('node-hover', false);
				});
			});

		let r = nodeW / 2;
		divs.selectAll('canvas.node').each(function(d) {
			let c: any = d3.select(this);
			let ctx = c.node().getContext("2d");
			colors.forEach((c, i) => {
				ctx.beginPath();
				ctx.arc(r, r, (colors.length - i) * r / colors.length, 0, 2 * Math.PI);

				ctx.fillStyle = colors[i];
				ctx.fill();
			});
		});
	}

	/**
	* Draw neural network layer
	*/
	private drawLayerPanel(redraw?: boolean) {
		let layers = this._network.hiddenLayers;

		let panel = d3.select('#networkPanel #netPanel');
		let lScale = LAYER_SCALE(layers.length);

		// remove all children
		panel.selectAll('div.main').remove();

		let divs = panel.append('div').classed('main', true);
		for (let i = 0; i < layers.length; i++) {
			let layer = layers[i];

			// append hidden layer
			let hiddenDiv = divs.append('div').classed('hidden-layer', true)
				.attr('id', layer.id)
				.style('margin-left', (i > 0) ? lScale.space + 'px' : '0px')

			// if the number of layers exceed threshold
			// draw a horizontal three-dot line to replace for non-displayed layers
			if (layers.length > MAX_LAYER_NUM && i === Math.floor(MAX_LAYER_NUM / 2)) {
				hiddenDiv.append('i').attr('class', 'fa fa-ellipsis-h fa-2x layer-more');
				continue;
			}

			// append minus and plus icon
			let ctrDiv = hiddenDiv.append('div').classed('node-plus-minus', true)
			ctrDiv.append('i').attr('class', 'fa fa-plus-circle')
				.on('click', () => {
					this._onIncreaseNode(layer.id, lScale);
				});
			ctrDiv.append('i').attr('class', 'fa fa-minus-circle').style('margin-left', '2px')
				.on('click', () => {
					this._onDecreaseNode(layer.id, lScale);
				});
			ctrDiv.append('p').classed('num-neurals', true).html(layer.length() + ' nodes');

			this.drawNodes(hiddenDiv, layer, lScale);
		}

	}

	/**
	* Draw nodes of hidden layer
	*
	* @param hiddenDiv: hidden div element which contain node canvas elements
	* @param layer: hidden layer model
	* @param lScale: layer scaler
	*/
	private drawNodes(hiddenDiv: any, layer: ai.Layer, lScale: any) {
		// remove nodes
		hiddenDiv.selectAll('canvas, i.node-more').remove();

		// redraw nodes again
		let nScale = NODE_SCALE(layer.length());
		let nodeW = nScale.w < lScale.w ? nScale.w : lScale.w;

		// append nodes
		for (let j = 0; j < layer.length(); j++) {
			let node = layer.nodes[j];

			// do not draw all layer because of limitation of layout size
			if (layer.length() > MAX_NODE_NUM && j > MAX_NODE_NUM - 1) break;

			// if the number of nodes per layer exceed threshold
			// draw a vertical three-dot line to replace for non-displayed layers
			if (layer.length() > MAX_NODE_NUM && j === Math.floor(MAX_NODE_NUM / 2)) {
				hiddenDiv.append('i').attr('class', 'fa fa-ellipsis-v fa-2x node-more');
				continue;
			}

			hiddenDiv.append('canvas')
				.classed('node', true)
				.attr('id', node.id)
				.attr('width', nodeW).attr('height', nodeW)
				.style('width', nodeW + 'px').style('height', nodeW + 'px')
				.style('margin-top', (j > 0) ? nScale.space + 'px' : '0px')
				.style('border-radius', nodeW / 2 + 'px')
				.on('mouseenter', () => {
					let g = d3.select('#networkPanel .net-links g');
					g.selectAll('line[dest=' + node.id + '], [src=' + node.id + ']').each(function(d) {
						let el = d3.select(this);
						el.classed('node-hover', true);
					});
				})
				.on('mouseout', () => {
					let g = d3.select('#networkPanel .net-links g');
					g.selectAll('line[dest=' + node.id + '], [src=' + node.id + ']').each(function(d) {
						let el = d3.select(this);
						el.classed('node-hover', false);
					});
				});
		}
	}

	/**
	* Draw connection between nodes
	*/
	private drawLinks() {
		let layers = this._network.hiddenLayers;

		let panel = d3.select('#networkPanel');
		let layerEls: any = panel.selectAll('#netPanel .main .hidden-layer').nodes();


		let svg = panel.select('.net-links')
			.attr('width', parseInt(panel.style('width')))
			.attr('height', parseInt(panel.style('height')));

		// remove all element of svg
		svg.selectAll('g.main').remove();
		let g = svg.append('g').classed('main', true);

		// wire input and first layers
		panel.selectAll('#inPanel .main canvas').nodes().forEach((el1: any) => {
			d3.select(layerEls[0]).selectAll('canvas').nodes().forEach((el2: any) => {
				g.append('line').classed('in', true)
					.attr('src', el1.id)
					.attr('dest', el2.id)
					.attr('x1', el1.offsetLeft + el1.width)
					.attr('y1', el1.offsetTop + el1.height / 2)
					.attr('x2', el2.offsetLeft)
					.attr('y2', el2.offsetTop + el2.height / 2);
			});
		});

		// wire layer nodes with each other		
		for (let i = 1; i < layerEls.length; i++) {
			let layerEl: any = layerEls[i];
			let preLayerEl: any = layerEls[i - 1];

			d3.select(preLayerEl).selectAll('canvas, i.layer-more, i.node-more').nodes().forEach((el1: any) => {
				d3.select(layerEl).selectAll('canvas, i.layer-more, i.node-more').nodes().forEach((el2: any) => {
					g.append('line')
						.attr('src', el1.id)
						.attr('dest', el2.id)
						.attr('x1', el1.offsetLeft + el1.clientWidth)
						.attr('y1', el1.offsetTop + el1.clientHeight / 2)
						.attr('x2', el2.offsetLeft)
						.attr('y2', el2.offsetTop + el2.clientHeight / 2)
				});
			});
		}

		// wire final layer with play button
		let playEl: any = panel.select('#outPanel i.fa-run').node();
		let outEl: any = panel.select('#outPanel canvas.heatmap').node();
		d3.select(layerEls[layerEls.length - 1]).selectAll('canvas').nodes().forEach((el: any) => {
			g.append('line').classed('out', true)
				.attr('src', el.id)
				.attr('dest', outEl.id)
				.attr('x1', el.offsetLeft + el.width)
				.attr('y1', el.offsetTop + el.height / 2)
				.attr('x2', playEl.offsetLeft)
				.attr('y2', playEl.offsetTop + playEl.clientHeight / 2);
		});

		// wire play button with output
		g.append('line').classed('out', true)
			.attr('x1', playEl.offsetLeft + playEl.clientWidth)
			.attr('y1', playEl.offsetTop + playEl.clientHeight / 2)
			.attr('x2', playEl.offsetLeft + playEl.clientWidth + 20)
			.attr('y2', playEl.offsetTop + playEl.clientHeight / 2);

		this._d3connLines = g.selectAll('line');
	}

	/**
	* Draw output layer
	*/
	private drawOutputLayer() {
		// draw heatmap
		this.clearHeatMap();

		// draw dataset
		this.drawDataset();
	}

	private drawDataset() {
		// remove chidren before redrawing
		this._outSvg.select('g.main').remove();

		// visualize input data using d3 and svg
		// draw train data
		let g = this._outSvg.append('g').classed('main', true)
		g.selectAll('circle.train').data(this._trainData).enter()
			.append('circle')
			.attr('r', 3)
			.attr('cx', (d) => this._outScale.x(d.x))
			.attr('cy', (d) => this._outScale.y(d.y))
			.style('fill', (d) => d.label)
			.style('stroke', 'white')
			.style('stroke-width', 1);;
		// draw test data
		this._options.showTestData && g.selectAll('circle.test').data(this._testData).enter()
			.append('circle')
			.attr('r', 3)
			.attr('cx', (d) => this._outScale.x(d.x))
			.attr('cy', (d) => this._outScale.y(d.y))
			.style('fill', (d) => d.label)
			.style('stroke', 'black')
			.style('stroke-width', 1);
	}

	private clearHeatMap() {
		this._outCtx.clearRect(0, 0, this._outCanvas.width, this._outCanvas.height);
		this._outCtx.fillStyle = "#dae6f1";
		this._outCtx.fillRect(0, 0, this._outCanvas.width, this._outCanvas.height);
	}

	private drawHeatMap() {
		let colors = this._options.dataset.colors;
		let data: Uint8ClampedArray = this._outImageData.data;
		let width = this._outCanvas.width;
		let height = this._outCanvas.height;


		for (let r = 0; r < height; r++) {
			for (let c = 0; c < width; c++) {
				let idx = r * width * 4 + c * 4;
				let x = this._outScale.x.invert(this._hmScale.x.invert(c));
				let y = this._outScale.y.invert(this._hmScale.y.invert(r));
				let catIdx = this._network.forwardProp([x, y]).getDecision();
				let rgb = d3.rgb(colors[catIdx]);

				data[idx] = rgb.r;
				data[idx + 1] = rgb.g
				data[idx + 2] = rgb.b;
				data[idx + 3] = 160;
			}
		}

		this._outImageData.data.set(data);
		this._outCtx.putImageData(this._outImageData, 0, 0);
	}


	// ============================ Event Handler ============================

	/**
	* On network setting changed
	*
	* @param layoutChanged layout is changed or not
	*/
	onSettingChanged(layoutChanged?: boolean) {
		this.reload();
	}

	private _onIncreaseLayerClick() {
		this._network.pushLayer(this._network.hiddenLayers[this._network.hiddenLayers.length - 1].length());
		this._network.rebuild();

		// 1 mean non-displayed layer
		if (this._network.hiddenLayers.length <= MAX_LAYER_NUM + 1) {
			this.drawLayerPanel();
			this.drawLinks();
			this.onSettingChanged(true);

		} else {
			// blink more icon
			this.blinkMoreIcon(d3.select('#netPanel'), 'i.layer-more');
			this.onSettingChanged();
		}
	}

	private _onDecreaseLayerClick() {
		if (this._network.hiddenLayers.length > MIN_LAYER_NUM) {
			this._network.popLayer();
			this._network.rebuild();
		}

		if (this._network.hiddenLayers.length <= MAX_LAYER_NUM) {
			this.drawLayerPanel();
			this.drawLinks();
			this.onSettingChanged(true);

		} else {
			// blink more icon			
			this.blinkMoreIcon(d3.select('#netPanel'), 'i.layer-more');
			this.onSettingChanged();
		}
	}

	_onIncreaseNode(layerId: string, lScale: any) {
		this._network.getHiddenLayerById(layerId).pushNode();
		this._network.rebuild();

		let layer = this._network.getHiddenLayerById(layerId);
		let hiddenDiv = d3.select('#' + layer.id);
		hiddenDiv.select('.num-neurals').html(layer.length() + ' nodes');

		// 1 mean non-displayed nodes
		// do not redraw nodes if the number exceed max_node setting
		if (layer.length() <= MAX_NODE_NUM + 1) {
			// redraw nodes on this layer only								
			this.drawNodes(hiddenDiv, layer, lScale);
			this.drawLinks();
			this.onSettingChanged(true);

		} else {
			// blink more icon
			this.blinkMoreIcon(hiddenDiv, 'i.node-more');
			this.onSettingChanged();
		}
	}

	_onDecreaseNode(layerId: string, lScale: any) {
		let layer = this._network.getHiddenLayerById(layerId);
		if (layer.length() > MIN_NODE_NUM) {
			layer.popNode();
			this._network.rebuild();
		}

		layer = this._network.getHiddenLayerById(layerId);
		let hiddenDiv = d3.select('#' + layer.id);
		hiddenDiv.select('.num-neurals').html(layer.length() + ' nodes');

		// do not redraw nodes if the number of nodes still exceed max_node setting
		if (layer.length() <= MAX_NODE_NUM) {
			// redraw node on this layer only
			this.drawNodes(hiddenDiv, layer, lScale);
			this.drawLinks();
			this.onSettingChanged(true);

		} else {
			this.blinkMoreIcon(hiddenDiv, 'i.node-more');
			this.onSettingChanged();
		}
	}

	private _onDatasetChanged(value: any) {
		let dataset: IDataset = this.mapDataset(value);
		this._options.dataset = dataset;
		this.genData();

		this.drawInputPanel();
		this.drawOutputLayer();

		this.onSettingChanged(true);
	}

	private _onKFoldChanged(value: any) {
		this._options.kfold = parseInt(value);
		this.genData();
		this.drawOutputLayer();

		this.onSettingChanged(true);
	}

	private _onShowTestData(value: boolean) {
		this._options.showTestData = value;
		this.drawDataset();

		this.onSettingChanged(true);
	}

	private _onBatchSizeChanged(value: any) {
		this._options.batch = parseInt(value);
		this.onSettingChanged();
	}

	private _onNoiseChanged(value: any) {
		this._options.noise = parseInt(value);
		this.genData();
		this.drawOutputLayer();

		this.onSettingChanged(true);
	}

	private _onGradientTypeChanged(value: any) {
		let grad = ai.GradientDescent.map(value);
		this._options.gradientDescent = grad;
		this.onSettingChanged();
	}

	private _onLearningRateChanged(value: any) {
		this._options.learningRate = parseFloat(value);
		this.onSettingChanged();
	}

	private _onActivationChanged(value: any) {
		let act = ai.ActivationFunction.map(value);
		this._options.activation = act;
		this.onSettingChanged();
	}

	private _onRegularizationChanged(value: any) {
		let reg = ai.RegularizationFunction.map(value);
		this._options.regularization = reg;
		this.onSettingChanged();
	}

	private _onRegularizationRateChanged(value: any) {
		this._options.regularizationRate = parseFloat(value);
		this.onSettingChanged();
	}

	private _onReloadClick() {
		this.reload();
	}

	private _onStartClick() {
		if (this._isRunning) {
			if (this._isPause) {
				this.resume();

			} else {
				this.pause();
			}

		} else {
			// start only once			
			this.start();
		}
	}

	private _onStepClick() {
		if (this._isRunning) {
			this._isRunning = false;
			this._isPause = false;
			this.makeLineFlow(false);
			this._trainTimer && this._trainTimer.stop();
		}
		this.trainStepByStep();
	}

	private _onCustomDataDialogOpened() {
		this.openDataCustomizeDialog();
	}

	// =============================== GET-SET ===============================

	private getEpoch(): string {
		return GMUtil.addCommasToNumber(this._epoch);
	}

	// ================================ Method ===============================

	/**
	* Start training data
	* This should be called only once
	*/
	private start() {
		this._isRunning = true;
		this.makeLineFlow(true);
		this._network.setInOutDimension([2, this._options.dataset.colors.length])
			.setOption(this._options)
			.rebuild();

		// use timeer to trigger training step by step
		this._trainTimer = d3.timer(() => {
			if (this._isPause === false) {
				this.trainStepByStep();
			}
		}, 0);
	}

	/**
	* Pause training progress
	*/
	private pause() {
		this._isPause = true;
		this.makeLineFlow(false);
	}

	/**
	* Resume training progress
	*/
	private resume() {
		this._isPause = false;
		this.makeLineFlow(true);
	}

	/**
	* Reload setting
	*/
	private reload() {
		this._trainTimer && this._trainTimer.stop();
		this._isRunning && !this._isPause && this.makeLineFlow(false); // stop flowing link
		this._isRunning = false;
		this._isPause = false;
		this._epoch = 0;
		this.clearHeatMap();
	}

	/**
	* Train data step by step
	*/
	private trainStepByStep() {
		this._epoch++;

		// start training
		this._trainData.forEach((d, i) => {
			this._network.forwardProp(this.construcInput(d));
			this._network.backProp(this.constructTarget(d), ai.ErrorFunction.SUM_SQUARES);
			// update weight after number of batch
			if ((i + 1) % this._options.batch === 0) {
				this._network.updateWeights();
			}
		});

		this.drawHeatMap();

		this._lossTrain = this.computeLoss(this._trainData);
		this._lossTest = this.computeLoss(this._testData);
	}

	/**
	* Construct input for neural network
	*
	* @param data: a two dimension sample
	*/
	private construcInput(data: Sample2D): number[] {
		return [data.x, data.y]
	}

	/**
	* Construct target (class label representation) 1-K coding scheme.
	* For example [0, 1, 0, 0, 0]
	*
	* @param data: a two dimension sample
	*/
	private constructTarget(data: Sample2D): number[] {
		let target = [];
		let dataset = this._options.dataset;
		for (let i = 0; i < dataset.colors.length; i++) {
			target[i] = (data.label === dataset.colors[i]) ? 1 : 0;
		}
		return target;
	}

	/**
	* Compute loss
	*/
	private computeLoss(dataset: Sample2D[]): number {
		let result = 0;

		dataset.forEach((d) => {
			let input = this.construcInput(d);
			let target = this.constructTarget(d);
			let loss = 0;

			this._network.forwardProp(input);
			this._network.output.nodes.forEach((node, i) => {
				loss += ai.ErrorFunction.SUM_SQUARES.f(node.output, target[i]);
			});
			loss /= this._network.output.nodes.length;
			result += loss;

		});
		return result / dataset.length;
	}

	/**
	* Blink more icon by changing its size
	*/
	private blinkMoreIcon(parentEl: any, selector: string) {
		// blink more icon
		let moreEl = parentEl.select(selector);
		this._layerMoreTransEnd && moreEl.transition(this._layerMoreTrans)
			.style('font-size', '2em')
			.on('start', () => this._layerMoreTransEnd = false)
			.on('end', () => this._layerMoreTransEnd = true);
	}

	/*
	* Make connection link running
	*/
	// Temporary disable this feature to improve performance
	private makeLineFlow(running: boolean) {
		// this._d3connLines.each(function(d) {
		// 	let line = d3.select(this);
		// 	line.style('animation-play-state', running ? 'running' : 'paused');
		// });
	}

	/*
	* Generate for training and testing
	*/
	private genData() {
		let config = {
			size: this.SAMPLES_LENGTH,
			noise: this._options.noise
		};

		let samples = GMUtil.shuffle(this._options.dataset.generate(config));
		let samplesPerFold = Math.round(this.SAMPLES_LENGTH / this._options.kfold) * this._options.dataset.colors.length;
		this._testData = samples.slice(0, samplesPerFold);
		this._trainData = samples.slice(samplesPerFold);
	}

	/*
	* Get dataset by name
	*/
	private mapDataset(name: string): IDataset {
		for (let i = 0; i < this._datasetList.length; i++) {
			let dataset = this._datasetList[i];
			if (dataset.toString() === name) {
				return dataset;
			}
		}
		return DataGenerator.GAUSSIAN;
	}

	private openDataCustomizeDialog() {
		// stop traioning
		this.pause();

		// open dialog
		let refDialog = this.dialog.open(DataCustomizedDialog);
		refDialog.componentInstance.dataset = this._options.dataset;
		refDialog.componentInstance.datasetList = this._datasetList;
		refDialog.componentInstance.datasetConfig = {
			size: this.SAMPLES_LENGTH,
			noise: this._options.noise
		};

		refDialog.afterClosed().subscribe(result => {
			if (!result) return;
			if (result.status === 'remove') {
				this._options.dataset = this._datasetList[0];
				this.genData();
				this.drawOutputLayer();
				this.onSettingChanged();

			} else if (result.status === 'update') {
				this.genData();
				this.drawOutputLayer();
				this.onSettingChanged();
			}
		});
	}

}
