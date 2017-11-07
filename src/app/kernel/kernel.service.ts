import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';

import { KERNEL_CONFIG } from './kernel.config';
import { GMKernel } from '../core/image-processing/kernel'

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

@Injectable()
export class KernelService {

	private sampleKernels: Array<GMKernel> = [];

	constructor(
		private http: Http,
		@Inject(KERNEL_CONFIG) private kernelCf) { }

}