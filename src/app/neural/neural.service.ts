import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';

import { NEURAL_CONFIG } from './neural.config';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

@Injectable()
export class NeuralService {

	constructor(
		private http: Http,
		@Inject(NEURAL_CONFIG) private cf) {
	}
}