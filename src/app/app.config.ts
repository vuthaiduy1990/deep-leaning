/**
* Design app confiuration as dependency-injection
* So that, we can easily change config class in providers setting of app.module
* 
* https://angular.io/docs/ts/latest/guide/dependency-injection.html#!#dependency-injection-tokens
*/
import { OpaqueToken } from "@angular/core";

export let APP_CONFIG = new OpaqueToken("app.config"); // app.config is token key
export interface IAppConfig {
}

// export const BASE_URL: string = "http://192.168.1.73:5525/";
export const BASE_URL: string = "http://host:port/";
export const AppConfig: IAppConfig = {
};