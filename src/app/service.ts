import { Injectable, Inject } from '@angular/core';

import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { APP_CONFIG } from './app.config';

@Injectable()
export class Service {
 
  public isFooterVisible: boolean = true;
  public isTopbarVisible: boolean = true;

  constructor(private http: Http, @Inject(APP_CONFIG) public config) { }
}
