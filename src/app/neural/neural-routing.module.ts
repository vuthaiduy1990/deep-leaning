import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NeuralComponent } from './neural.component';

const routes: Routes = [
	{
		path: '', component: NeuralComponent,
		children: [
			//{ path: '3d', component: "Vis3DBoard"}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class NeuralRoutingModule { }