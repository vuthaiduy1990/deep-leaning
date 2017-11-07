/**
* Design app confiuration as dependency-injection
* So that, we can easily change config class in providers setting of kernel.module
* 
* Implements:
*	+ add this { provide: APP_CONFIG, useValue: AppConfig } in "provides" of kernel.module
*	+ to inject to contructors: constructor(@Inject(APP_CONFIG) private config) { }
*
* https://angular.io/docs/ts/latest/guide/dependency-injection.html#!#dependency-injection-tokens
*/
import { OpaqueToken } from "@angular/core";
import { BASE_URL } from "../app.config";


export let KERNEL_CONFIG = new OpaqueToken("kernel.config");
export interface IKernelConfig {
	uploadUrl: string;
}

const baseApi: string = BASE_URL + "api/kernel/";
export const KernekConfig: IKernelConfig = {
	uploadUrl: baseApi + "upload",
};