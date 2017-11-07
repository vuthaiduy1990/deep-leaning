import * as math from 'mathjs';

export module ai {

	/**
	* Define gradient descent algorithm
	* http://sebastianruder.com/optimizing-gradient-descent/index.html
	* ['None', 'Momentum', 'Nesterov', 'Adagrad', 'Adadelta', 'RMSprop', 'Adam']
	*/
	export class GradientDescent {
		public static list(): any[] {
			return [
				GradientDescent.NONE,
				GradientDescent.MOMENTUM,
				GradientDescent.NESTEROV,
				GradientDescent.ADAGRAD,
				GradientDescent.ADADELTA,
				GradientDescent.RMSPROP,
				GradientDescent.ADAM
			];
		}

		public static map = (name): any => {
			switch (name) {
				case GradientDescent.NONE.toString():
					return GradientDescent.NONE;
				case GradientDescent.MOMENTUM.toString():
					return GradientDescent.MOMENTUM;
				case GradientDescent.NESTEROV.toString():
					return GradientDescent.NESTEROV;
				case GradientDescent.ADAGRAD.toString():
					return GradientDescent.ADAGRAD;
				case GradientDescent.ADADELTA.toString():
					return GradientDescent.ADADELTA;
				case GradientDescent.RMSPROP.toString():
					return GradientDescent.RMSPROP;
				case GradientDescent.ADAM.toString():
					return GradientDescent.ADAM;
				default:
					break;
			}
			return GradientDescent.NONE;
		}

		public static NONE: any = {
			toString: () => 'None'
		}

		public static MOMENTUM: any = {
			toString: () => 'Momentum'
		}

		public static NESTEROV: any = {
			toString: () => 'Nesterov'
		}

		public static ADAGRAD: any = {
			toString: () => 'Adagrad'
		}

		public static ADADELTA: any = {
			toString: () => 'Adadelta'
		}

		public static RMSPROP: any = {
			toString: () => 'RMSprop'
		}

		public static ADAM: any = {
			toString: () => 'Adam'
		}

	}

	/**
	* Defind structure an activation function and it derivative
	*/
	export interface IActivationFunction {
		f(x: number): number; // function output
		der(x: number): number;	// derivative
		toString(): string; // name of function
	}

	/**
	* Implement activation function
	*/
	export class ActivationFunction {

		public static list() {
			return [
				ActivationFunction.IDENTITY,
				ActivationFunction.SIGMOID,
				ActivationFunction.TANH,
				ActivationFunction.RELU
			];
		}

		public static map = (name): IActivationFunction => {
			switch (name) {
				case ActivationFunction.IDENTITY.toString():
					return ActivationFunction.IDENTITY;
				case ActivationFunction.SIGMOID.toString():
					return ActivationFunction.SIGMOID;
				case ActivationFunction.TANH.toString():
					return ActivationFunction.TANH;
				case ActivationFunction.RELU.toString():
					return ActivationFunction.RELU;
				default:
					break;
			}
			return ActivationFunction.IDENTITY;
		}

		// linear function
		// f(x) = x
		public static IDENTITY: IActivationFunction = {
			f: (x) => x,
			der: (x) => 1,
			toString: () => 'Identity'
		}

		// sigmoid function
		// f(x) = 1 / (1 + e^-x)
		// f'(x) = f(x) * (1 - f(x))
		public static SIGMOID: IActivationFunction = {
			f: (x) => 1 / (1 + Math.exp(-x)),
			der: (x) => {
				let sig = ActivationFunction.SIGMOID.f(x);
				return sig * (1 - sig);
			},
			toString: () => 'Sigmoid'
		}

		// tanh function
		// f(x) = (1 - e^-2x) / (1 + e^-2x)
		// f'(x) = 1 - f(x)*f(x)
		public static TANH: IActivationFunction = {
			f: (x) => {
				if (x === Infinity) return 1
				if (x == -Infinity) return -1

				let a = Math.exp(-2 * x);
				return (1 - a) / (1 + a);
			},
			der: (x) => {
				let tanh = ActivationFunction.TANH.f(x);
				return 1 - tanh * tanh;
			},
			toString: () => 'Tanh'
		}

		// Relu function
		public static RELU: IActivationFunction = {
			f: (x) => Math.max(0, x),
			der: (x) => x <= 0 ? 0 : 1,
			toString: () => 'Relu'
		}
	}

	/**
	* Define structure of error function
	*/
	export interface IErrorFunction {
		/** 
		* Error function
		* @param output should be node's output
		* @param target actual value of training data
		*/
		f(output: number, target: number): number;

		/**
		* Derivative of error function by output (E'(y))
		*/
		der(output: number, target: number): number;
		toString(): string; // should return name of function
	}

	/**
	* Implement error function
	*/
	export class ErrorFunction {

		// sun of squares error function
		public static SUM_SQUARES = {
			f: (y, t) => 0.5 * Math.pow(y - t, 2),
			der: (y, t) => y - t,
			toString: () => 'Sum of Squares'
		}

		// Cross entropy error function
		public static CROSS_ENTROPY = {
			f: (y, t) => -y * t,
			der: (y, t) => (y - t),
			toString: () => 'Cross Entropy'
		}
	}

	/** 
	* Regularization function which compute penaty cost for given weight 
	*/
	export interface IRegularizationFunction {
		f: (weight: number, hyperParams?: any) => number;
		der: (weight: number, hyperParams?: any) => number;
		toString: () => string
	}

	export class RegularizationFunction {
		public static list(): IRegularizationFunction[] {
			return [
				RegularizationFunction.NONE,
				RegularizationFunction.L1,
				RegularizationFunction.L2
			];
		}

		public static map = (name): IRegularizationFunction => {
			switch (name) {
				case RegularizationFunction.L1.toString():
					return RegularizationFunction.L1;
				case RegularizationFunction.L2.toString():
					return RegularizationFunction.L2;
				default:
					break;
			}
			return RegularizationFunction.NONE;
		}

		public static NONE: IRegularizationFunction = {
			f: (weight: number) => 0,
			der: (weight: number) => 0,
			toString: () => "None"
		}

		public static L1: IRegularizationFunction = {
			f: (weight: number, h?: any) => Math.abs(weight) * h.alpha,
			der: (weight: number, h?: any) => {
				if (weight > 0) return h.alpha;
				if (weight < 0) return -1 * h.alpha;
				return 0; // 0
			},
			toString: () => "L1"
		}

		public static L2: IRegularizationFunction = {
			f: (weight: number, h?: any) => 0.5 * weight * weight * h.alpha,
			der: (weight: number, h?: any) => weight * h.alpha,
			toString: () => "L2"
		}

	}



	/**
	* Defind a neural node which transform input to output by using activation function
	* Prime input and final output are also node
	*/
	export class Node {
		inputLinks: Array<Link> = [];
		outPutLinks: Array<Link> = [];

		activation: number; // a = sum(wi * xi) + w0
		output: number;     // z = h(a);  h is activation function

		bias: number = 0.1;

		// derivative of error function by output of node
		// This equal ∂E/∂z
		ez_der: number = 0;
		// derivative of error function by input of node
		// This equal ∂E/∂a
		ea_der: number = 0;

		// Accumulated error derivative with respect to this node's total input since the last update
		acc_ea_der: number = 0;
		num_acc_ea_der: number = 0;

		/**
		* Constructor
		* @param activationF: activation function
		* @param initZero: (Option) for setting bias parameter
		*/
		constructor(
			public id: string,
			public activationF: IActivationFunction,
			private initZero?: boolean) {

			this.bias = this.initZero ? 0 : this.bias;
		}

		/** 
		* Update output of node
		* output = z = h(a)
		*		+ h: activation function
		*		+ a: activation
		*/
		updateOutput() {
			this.activation = this.bias; // activation = sum(wi * xi) + w0;
			this.inputLinks.forEach(link => {
				this.activation += link.weight * link.src.output;
			});


			this.output = this.activationF.f(this.activation);
			return this;
		}

		/**
		* Update the error derivative of node with respect to its total input (activation)
		* ∂E/∂a = ∂y/∂a * ∂E/∂z = numeber * [K X 1] = [K x 1]
		* y = h(a) = activationFunc(a)
		*/
		updateEA_Der() {
			this.ea_der = this.activationF.der(this.activation) * this.ez_der;
			this.acc_ea_der += this.ea_der;
			this.num_acc_ea_der++;
		}

		/**
		* Compute the error derivative of each node with respect to weight coming into the node.
		* ∂E/∂w = ∂a/∂w * ∂E/∂a = number * [K x 1] = [K x 1]
		* a = sum(w*z) -> ∂a/∂w = z
		*/
		updateEW_Der() {
			for (let i = 0; i < this.inputLinks.length; i++) {
				let link = this.inputLinks[i];

				link.ew_der = link.src.output * this.ea_der;
				link.acc_ew_der += link.ew_der;
				link.num_ew_der++;
			}
		}

		/**
		* Compute the error derivative with respect to each node's output.
		* this equal ∂E/∂z
		* ∂E/∂z = ∂a/∂z * ∂E/∂a
		*	+ ∂E/∂a is error derivative by input of next node
		*/
		updateEZ_Der() {
			this.ez_der = 0;
			for (let i = 0; i < this.outPutLinks.length; i++) {
				let link = this.outPutLinks[i];
				this.ez_der += link.weight * link.dest.ea_der;
			}
		}

		/**
		* Update bias parameter using gradient descent
		* a -= η * ∂E/∂a
		*
		* @param learningRate: learning rate
		*/
		updateBias(learningRate: number) {
			if (this.num_acc_ea_der > 0) {
				this.bias -= learningRate * this.acc_ea_der / this.num_acc_ea_der;
				this.ea_der = 0;
				this.num_acc_ea_der = 0;
			}
		}

		/**
		* Update weight of each input link using gradient descent
		* w -= η * ∂E/∂w
		*/
		updateInputWeight(learningRate: number) {
			for (let i = 0; i < this.inputLinks.length; i++) {
				let link = this.inputLinks[i];

				if (link.isDead) continue;

				let useRegularization = (link.regularization.toString() != RegularizationFunction.NONE.toString()) ? true : false;
				let regularizationDer = link.regularization.der(link.weight, { alpha: link.regularizationRate });

				if (link.num_ew_der > 0) {
					// update the weight based on dE/dw
					link.weight -= learningRate * link.acc_ew_der / link.num_ew_der;
					link.acc_ew_der = 0;
					link.num_ew_der = 0;

					// update weight using regularization
					if (useRegularization) {
						let newWeight = link.weight - learningRate * regularizationDer;
						if (link.regularization.toString() === RegularizationFunction.L1.toString() && link.weight * newWeight < 0) {
							link.weight = 0;
							link.isDead = true;
						} else {
							link.weight = newWeight;
						}
					}
				}
			}
		}

		/**
		* Generate id base on layer id and index of node in layer
		* @param layerId: id of layer
		* @param nodeIdx: index of node in layer
		*/
		public static makeId(layerId, nodeIdx): string {
			return 'node-' + nodeIdx + '-' + layerId;
		}
	}

	/**
	* Defind a connection between nodes
	*/
	export class Link {
		weight: number = Math.random() - 0.5;

		// Error derivative with respect to this weight.
		// This equal ∂E/∂w
		ew_der: number = 0;
		// Accumulated error derivative since the last update.
		acc_ew_der: number = 0;
		// Number of accumulated derivatives since the last update.
		num_ew_der: number = 0;

		regularization: IRegularizationFunction;
		regularizationRate: number;
		isDead: boolean = false;

		constructor(
			public src: Node, /*source node*/
			public dest: Node, /*destination node*/
			initZero?: boolean) {

			if (initZero) this.weight = 0;
		}
	}


	/**
	* Define a hidden layer which comprises nodes
	*/
	export class Layer {
		nodes: Array<Node> = [];
		preLayer: Layer = null;
		nextLayer: Layer = null;

		/**
		* Constructor
		* 
		* @param id: id of layer. Use makeId to generate id for layer
		* @param nodeNumber: the number of node per layer
		* @param activationF: activation function
		* @param initZero: (Option) for setting bias parameter of each node and initial weight of each links
		*/
		constructor(
			public id: string,
			private nodeNumber: number,
			public activationF: IActivationFunction,
			private initZero?: boolean
		) {
			// create nodes
			for (var i = 0; i < this.nodeNumber; ++i) {
				let node = new Node(Node.makeId(id, i), this.activationF, initZero);
				this.nodes.push(node);
			}
		}

		/**
		* Generate layer id based on index of layer
		*/
		public static makeId(idx: number): string {
			return 'layer-' + idx.toString();
		}

		/**
		* Return the number of nodes
		*/
		length(): number {
			return this.nodes.length;
		}

		/**
		* Push node to layer
		* We should rebuil network after this action.
		*/
		pushNode(): Layer {
			let idx = this.nodes.length;
			this.nodes.push(new Node(Node.makeId(this.id, idx), this.activationF, this.initZero));
			return this;
		}

		/**
		* Remove the last node from layer
		* We should rebuil network after this action.
		*/
		popNode(): Layer {
			this.nodes.pop();
			return this;
		}
	}

	export interface INeuralNetworkSetting {
		gradientDescent?: GradientDescent,
		activation?: IActivationFunction,
		learningRate?: number,
		regularization?: any
		regularizationRate?: number,
		initZero?: boolean
	}

	/**
	* Define a neural network
	*/
	export class NeuralNetwork {

		input: Layer = null;
		hiddenLayers: Layer[] = [];
		output: Layer = null;
		private _options: INeuralNetworkSetting = {};

		/**
		* Constructor
		* @param inputDim: the number of feature of input = the number of node of input
		* @param hiddenLayerShape: The shape of the network. E.g. [6, 2, 3, 9] means
 		* 	the network will have 4 hidden layers, 6 nodes in the first layer and 9 node in last layer.
 		* @param kclass: the number of classes
		* @param activationF: activation function which used to transform input and make it separated.
		* @param initZero: (Option) for setting bias and weight parameter
		*/
		constructor(
			private inputDim: number,
			private hiddenLayerShape: number[],
			private kclass: number,
			options?: INeuralNetworkSetting) {

			this.setOption(options);
			this.rebuild();
		}

		setInOutDimension(dim: number[]): NeuralNetwork {
			this.inputDim = dim[0];
			this.kclass = dim[1];
			return this;
		}

		/**
		* Set option
		*/
		setOption(options: INeuralNetworkSetting): NeuralNetwork {
			this._options.gradientDescent = options.gradientDescent || this._options.gradientDescent || GradientDescent.NONE;
			this._options.activation = options.activation || this._options.activation || ActivationFunction.IDENTITY;
			this._options.learningRate = options.learningRate || this._options.learningRate || 0.01;
			this._options.regularization = options.regularization || this._options.regularization || RegularizationFunction.NONE;
			this._options.regularizationRate = options.regularizationRate || this._options.regularizationRate || 0;
			this._options.initZero = options.initZero || this._options.initZero || false;

			return this;
		}

		/**
		* Get option
		*/
		getOption(): INeuralNetworkSetting {
			return this._options;
		}

		/**
		* Build network
		*/
		rebuild(): NeuralNetwork {

			// Compute the number of features (input dimension)
			this.inputDim = this.input ? this.input.length() : this.inputDim;
			// Compute the number of hidden layers
			if (this.hiddenLayers.length > 0) {
				this.hiddenLayerShape = [];
				this.hiddenLayers.forEach((item) => {
					this.hiddenLayerShape.push(item.length());
				});
			}
			this.hiddenLayers = []; // reset hidden layer

			// Build input layer
			this.input = new Layer('input', this.inputDim, this._options.activation, this._options.initZero);

			// build hidden layer
			for (let i = 0; i < this.hiddenLayerShape.length; i++) {
				let nodeNumber = this.hiddenLayerShape[i];
				let layer: Layer = new Layer(Layer.makeId(i), nodeNumber, this._options.activation, this._options.initZero);
				this.hiddenLayers.push(layer);

				// link layers with each other
				if (i > 0) {
					let preLayer = this.hiddenLayers[i - 1];
					preLayer.nextLayer = layer;
					layer.preLayer = preLayer;
				}
			}

			// build output.
			// The number of output node = the number of classes		
			this.output = new Layer('output', this.kclass, this._options.activation, this._options.initZero)

			// wire nodes between input - hidden layers - output
			this.wire(this.input, this.hiddenLayers[0])
			this.hiddenLayers.forEach((layer) => {
				layer.nextLayer && this.wire(layer, layer.nextLayer);
			});
			this.wire(this.hiddenLayers[this.hiddenLayers.length - 1], this.output);

			return this;
		}

		/**
		* Wire nodes between layers
		*/
		private wire(layer1: Layer, layer2: Layer): NeuralNetwork {
			layer1.nodes.forEach((node1) => {
				layer2.nodes.forEach((node2) => {
					let link = new Link(node1, node2, this._options.initZero);
					link.regularization = this._options.regularization;
					link.regularizationRate = this._options.regularizationRate;
					node1.outPutLinks.push(link);
					node2.inputLinks.push(link);
				});
			});
			return this;
		}

		/**
		* Get hidden layer by id
		* @param id
		* @return hidden layer
		*/
		getHiddenLayerById(id: string): Layer {
			for (let i = 0; i < this.hiddenLayers.length; i++) {
				let layer = this.hiddenLayers[i]
				if (id === layer.id) return layer;
			}
			return null;
		}

		/**
		* Add new hidden layer to the end.
		* We should rebuil network after this action.
		*
		* @param nodeNumber: the number of nodes
		*/
		pushLayer(nodeNumber): NeuralNetwork {
			let idx = this.hiddenLayers.length;
			this.hiddenLayers.push(new Layer(Layer.makeId(idx), nodeNumber, this._options.activation, this._options.initZero));
			return this;
		}

		/**
		* Remove the last hidden layer.
		* We should rebuil network after this action.
		*/
		popLayer(): NeuralNetwork {
			this.hiddenLayers.pop();
			return this;
		}

		/**
		* Forward propagation.
		* Compute output of each nodes of each layers base on input.
		*
		* @param inputs: array of inputvertical matrix (D x 1)
		*/
		forwardProp(inputs: number[]): NeuralNetwork {
			// Update the input layer.
			this.input.nodes.forEach((node, i: number) => {
				node.output = inputs[i];
			});

			this.hiddenLayers.forEach((layer) => {
				layer.nodes.forEach((node) => {
					node.updateOutput();
				});
			});

			this.output.nodes.forEach((node, i) => {
				node.updateOutput();
			})
			return this;
		}

		/**
		* Back propagation.
		* Pass error back to each nodes to recompure weight for appropriate
		* See {{updateWeight}} function for more information
		* 
		* With each node. Input is output of backward node after transforming using activation function
		* and output will be one of input of forward node.
		*
		*	+ input = a = sum(wi * zi) + bias
		*		* a: activation
		*		* zi: output of backward node
		*	+ wi: weight of repective input link with backward node i
		*	+ output = z = h(a) = h(in)
		*		* h: activation function
		* 
		* Error of network by specific node.
		* ∂E/∂z = ∂a/∂z * ∂E/∂a
		* ∂E/∂a = ∂y/∂a * ∂E/∂z
		* ∂E/∂w = ∂a/∂w * ∂E/∂a
		* ---> When back propagation, we can calculate error at each node based on error of previous node
		* 
		* @param target: matrix [K x 1]. K is number of classes. Target look like [0, 1, 0, 0]
		* @param errorF: error function
		*/
		backProp(target: number[], errorF: IErrorFunction): NeuralNetwork {
			// compute derivative of error of output node
			// -> ∂E/∂y = ∂E/∂z_output = [K x 1]
			this.output.nodes.forEach((node, i) => {
				node.ez_der = errorF.der(node.output, target[i]);
				node.updateEA_Der();
				node.updateEW_Der();
			});

			// Compute the error derivative with respect to each node's output of final hidden layer
			// ∂E/∂z = ∂a/∂z * ∂E/∂a
			let lastHiddenLayer = this.hiddenLayers[this.hiddenLayers.length - 1];
			for (let i = 0; i < lastHiddenLayer.nodes.length; i++) {
				let node = lastHiddenLayer.nodes[i];
				node.updateEZ_Der();
			}

			// Go through the hidden layers backwards
			for (let layerIdx = this.hiddenLayers.length - 1; layerIdx >= 0; --layerIdx) {
				let layer = this.hiddenLayers[layerIdx];

				// Compute the error derivative of each node with respect to its total input (activation)
				// ∂E/∂a = ∂y/∂a * ∂E/∂z
				for (let i = 0; i < layer.nodes.length; i++) {
					let node = layer.nodes[i];
					node.updateEA_Der();
				}

				// Compute the error derivative of each node with respect to weight coming into the node.
				// ∂E/∂w = ∂a/∂w * ∂E/∂a
				for (let i = 0; i < layer.nodes.length; i++) {
					let node = layer.nodes[i];
					node.updateEW_Der();
				}

				if (layerIdx === 0) {
					continue;
				}

				// Compute the error derivative with respect to each node's output.
				// ∂E/∂z = ∂a/∂z * ∂E/∂a
				let preLayer = layer.preLayer;
				for (let i = 0; i < preLayer.nodes.length; i++) {
					let node = preLayer.nodes[i];
					node.updateEZ_Der();
				}
			}

			return this;
		}


		/**
		 * Updates the weights of the network using the previously accumulated error derivatives.
		 */
		updateWeights(): NeuralNetwork {
			let learningRate = this._options.learningRate;

			// Go through hidden layer forward
			for (let layerIdx = 0; layerIdx < this.hiddenLayers.length; layerIdx++) {
				let layer = this.hiddenLayers[layerIdx];

				for (let i = 0; i < layer.nodes.length; i++) {
					let node = layer.nodes[i];

					// update node bias
					node.updateBias(learningRate);

					// Update weight comming into this node
					node.updateInputWeight(learningRate);
				}
			}

			// update output node
			for (let i = 0; i < this.output.nodes.length; i++) {
				let node = this.output.nodes[i];
				node.updateBias(learningRate);
				node.updateInputWeight(learningRate);
			}

			return this;
		}

		/**
		* Get index of category which input is classified to.		
		*/
		getDecision(): number {
			let max = 0;
			let idx = 0;
			this.output.nodes.forEach((node, i) => {
				if (node.output >= max) {
					max = node.output;
					idx = i;
				}
			});
			return idx;
		}
	}

}