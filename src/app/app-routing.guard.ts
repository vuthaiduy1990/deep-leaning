import { Injectable } from '@angular/core';
import { Routes, RouterModule, CanLoad, Router, Route } from '@angular/router';

declare var $: any;

@Injectable()
export class AppRoutingGuard implements CanLoad {
	constructor(private router: Router) { }


	canLoad(route: Route): boolean {
		let url = `/${route.path}`;

		// $('#top-navbar-collapse .app-link li').each((idx, el) => {			
		// 	let jEl = $(el);

		// 	// remove active class
		// 	jEl.removeClass('active');
		// 	if (url === jEl.find('a').attr('routerLink')) {
		// 		jEl.addClass('active');
		// 	}

		// });

		return true;
	}

}