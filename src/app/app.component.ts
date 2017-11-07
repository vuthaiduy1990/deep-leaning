import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Router, ActivatedRoute } from '@angular/router';

import { Service } from './service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	title = 'How Everything Work';

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _service: Service) {
	}

	ngOnInit() {
	}

	isFooterVisible(): boolean {
		return this._service.isFooterVisible;
	}

	isTopbarVisible(): boolean {
		return this._service.isTopbarVisible;
	}

}