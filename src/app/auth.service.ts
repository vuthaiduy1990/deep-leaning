import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { APP_CONFIG } from './app.config';

@Injectable()
export class AuthService {

  // default is immortal token which never die
  public token: string = "umetnogtbdvtadmaaeitaeuiymis";
  public loggedUser: any = { username: "viewer", roles: ['viewer'] };

  constructor(private http: Http, @Inject(APP_CONFIG) public cfg) { }

  /**
  * Login with username and password
  *
  * @param username
  * @param password
  * @return user information and token key
  */
  login(username: string, password: string): Observable<any> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let body = { username: username, password: password };

    return this.http.post(this.cfg.loginUrl, body, options)
      .map((res: Response) => res.json())
      .do(res => {
        this.token = res.token;
        this.loggedUser = res.user;
      });
  }
}
