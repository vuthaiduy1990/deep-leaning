import { NgModule, Injectable } from '@angular/core';
import { Routes, RouterModule, CanLoad, Router, Route } from '@angular/router';
import { HomeComponent } from './homepage/home.component';
import { AppRoutingGuard } from './app-routing.guard'
import { ArticlePage } from './article/article.page';
import { ArticleDetailPage } from './article/article-detail.page';


// using loadChildren for lazy loading module
// It means lazy modules only are loaded when we naviagate to that module
// not at initial app module
export const routes: Routes = [
	{
		path: '', component: HomeComponent,
		pathMatch: 'full'
	},
	{
		path: 'kernel', loadChildren: 'app/kernel/kernel.module#KernelModule',
		canLoad: [AppRoutingGuard]
	},
	{
		path: 'neural-network', loadChildren: 'app/neural/neural.module#NeuralModule',
		canLoad: [AppRoutingGuard]
	},
	// handle not found page
	// it must be placed at the end
	{ path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }

