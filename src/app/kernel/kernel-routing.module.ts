import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { KernelComponent } from './kernel.component';

const routes: Routes = [
	{
		path: '', component: KernelComponent,
		children: [
			//{ path: '3d', component: "Vis3DBoard"}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class KernelRoutingModule { }