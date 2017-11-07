import { ai } from '../core/ai/ai';
import { IDataset } from '../core/ai/dataset';

export interface INeuralOption {
	// input setting
	dataset: IDataset,
	kfold: number,
	showTestData: boolean,
	batch: number,
	noise: number,

	// network setting
	gradientDescent: any;
	learningRate: number;
	activation: ai.IActivationFunction;
	regularization: any;
	regularizationRate: number;	
}