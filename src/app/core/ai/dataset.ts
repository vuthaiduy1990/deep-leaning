import * as d3 from 'd3';

export type Sample2D = {
	x: number,
	y: number,
	label: string // label should be color
}


export interface IDataset {
	colors: string[];
	isDefault?: boolean;
	generate(config?: any): Sample2D[];
	toString(): string;
}

export class DataGenerator {

	public static readonly MAX_NOISE: number = 50;
	public static readonly DATA_DOMAIN: number[] = [-6, 6];
	public static readonly SUPPORTED_COLORS: string[] = ['#0877BD', '#FFA500', '#800080', '#ff7373', '#008000', '#5152a7', '#00ff00'];

	public static list(): IDataset[] {
		return [
			DataGenerator.GAUSSIAN,
			DataGenerator.SPIRAL,
			DataGenerator.CIRCLE,
		];
	}

	public static GAUSSIAN: IDataset = {
		colors: DataGenerator.SUPPORTED_COLORS.slice(0, 2),
		isDefault: true,
		/**
		* Generate data
		* @param cfg: configuration 
		* {
		* 	size: 50, // the number of samples per each class
		*	noise: 0   // gaussian noise
		* }
		*/
		generate: (cfg?: any): Sample2D[] => {
			let samples: Sample2D[] = [];
			let numSamples: number = (cfg && cfg.size) ? parseInt(cfg.size) : 50;
			let noise: number = (cfg && cfg.noise) ? parseInt(cfg.noise) : 0;
			let vScale = d3.scaleLinear().domain([0, DataGenerator.MAX_NOISE]).range([0.5, 4]);
			let variance = vScale(noise);

			for (let i = 0; i < numSamples; i++) {
				// gaussian with positive sample
				samples.push({
					x: DataGenerator.normalRandom(2, variance),
					y: DataGenerator.normalRandom(2, variance),
					label: DataGenerator.SUPPORTED_COLORS[0]
				});

				// guassian with negative sample
				samples.push({
					x: DataGenerator.normalRandom(-2, variance),
					y: DataGenerator.normalRandom(-2, variance),
					label: DataGenerator.SUPPORTED_COLORS[1]
				});
			}

			return samples;
		},
		toString: () => 'Gaussian'
	}

	public static SPIRAL: IDataset = {
		colors: DataGenerator.SUPPORTED_COLORS.slice(0, 2),
		isDefault: true,
		/**
		* Generate data
		* @param cfg: configuration 
		* {
		* 	size: 50, // the number of samples per each class
		*	noise: 0   // gaussian noise
		* }
		*/
		generate: (cfg?: any): Sample2D[] => {
			let samples: Sample2D[] = [];
			let numSamples: number = (cfg && cfg.size) ? parseInt(cfg.size) : 50;
			let noise: number = (cfg && cfg.noise) ? parseInt(cfg.noise) : 0;
			let radius = (DataGenerator.DATA_DOMAIN[1] - DataGenerator.DATA_DOMAIN[0] - 2) / 2;

			let rand = (idx: number, delta: number): any => {
				let r = idx / numSamples * radius;
				let t = 1.75 * idx / numSamples * 2 * Math.PI + delta;
				let x = r * Math.sin(t) + DataGenerator.randUniform(-1, 1) * noise / 100;
				let y = r * Math.cos(t) + DataGenerator.randUniform(-1, 1) * noise / 100;
				return { x: x, y: y };
			}

			for (let i = 0; i < numSamples; i++) {

				// Positive samples.
				let point: any = rand(i, 0);
				samples.push({
					x: point.x,
					y: point.y,
					label: DataGenerator.SUPPORTED_COLORS[0]
				});

				// Negative examples.
				point = rand(i, Math.PI);
				samples.push({
					x: point.x,
					y: point.y,
					label: DataGenerator.SUPPORTED_COLORS[1]
				});
			}

			return samples;

		},
		toString: () => 'Spiral'
	}

	public static CIRCLE: IDataset = {
		colors: DataGenerator.SUPPORTED_COLORS.slice(0, 2),
		isDefault: true,

		/**
		* Generate data
		* @param cfg: configuration 
		* {
		* 	size: 50, // the number of samples per each class
		*	noise: 0   // gaussian noise
		* }
		*/
		generate: (cfg?: any): Sample2D[] => {
			let samples: Sample2D[] = [];
			let numSamples: number = (cfg && cfg.size) ? parseInt(cfg.size) : 50;
			let noise: number = (cfg && cfg.noise) ? parseInt(cfg.noise) : 0;
			let radius = (DataGenerator.DATA_DOMAIN[1] - DataGenerator.DATA_DOMAIN[0] - 2) / 2;

			let rand = (domain) => {
				let r = DataGenerator.randUniform(domain[0], domain[1]);
				let angle = DataGenerator.randUniform(0, 2 * Math.PI);
				let x = r * Math.sin(angle);
				let y = r * Math.cos(angle);
				let noiseX = DataGenerator.randUniform(-radius, radius) * noise / 100;
				let noiseY = DataGenerator.randUniform(-radius, radius) * noise / 100;
				return { x: x + noiseX, y: y + noiseY };
			}

			let label = (point) => {
				let center = { x: 0, y: 0 };
				if (DataGenerator.distance(point, center) < (radius * 0.5)) {
					return DataGenerator.SUPPORTED_COLORS[0];
				}
				return DataGenerator.SUPPORTED_COLORS[1];
			}

			for (let i = 0; i < numSamples; i++) {
				// Generate positive points inside the circle.
				let point = rand([0, radius * 0.5]);
				samples.push({
					x: point.x,
					y: point.y,
					label: label(point)
				});


				// Generate negative points outside the circle.
				point = rand([radius * 0.7, radius]);
				samples.push({
					x: point.x,
					y: point.y,
					label: label(point)
				});

			}
			return samples;
		},
		toString: () => 'Circle'
	}

	/**
	* Generate Gaussian random variable using Box-Muller transformation
	* 
	* (c) Copyright 1994, Everett F. Carter Jr.
	* Permission is granted by the author to use this software for any application 
	* provided thiscopyright notice is preserved
	* 
	* @param mean: mean value
	* @param variance: variance value
	* @return random Gaussian variable 
	*/
	public static normalRandom(mean: number, variance: number): number {
		let v1: number, v2: number, s: number;
		do {
			v1 = 2 * Math.random() - 1;
			v2 = 2 * Math.random() - 1;
			s = v1 * v1 + v2 * v2;
		} while (s > 1);

		let result = Math.sqrt(-2 * Math.log(s) / s) * v1;
		return mean + Math.sqrt(variance) * result;
	}

	/**
 	* Returns a sample from a uniform [a, b] distribution.
 	*/
	public static randUniform(a: number, b: number) {
		return Math.random() * (b - a) + a;
	}

	/**
	* Compute distance between two points
	*/
	private static distance(p1: any, p2: any): number {
		let dx = p1.x - p2.x;
		let dy = p1.y - p2.y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	/**
	* Convert json object to dataset
	* @param json: json object
	*/
	public static parseJson(json: any): IDataset {
		return {
			colors: json.colors,
			generate: (config?: any) => {
				return json.samples;
			},
			toString: () => {
				return json.name;
			}
		}
	}

	/**
	* Convert dataset to json object
	* @param dataset dataset
	*/
	public static convertDatasetToJson(dataset: IDataset) {
		let json: any = {};
		json.colors = dataset.colors;
		json.name = dataset.toString();
		json.samples = dataset.generate();

		return json;
	}

}

