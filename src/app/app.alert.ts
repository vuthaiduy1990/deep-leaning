declare var $: any;

export module Alert {

	/**
	* Notify an error
	*/
	export function notifyError(err: any) {
		let alert = $('#appError');
		alert.html(err.toString());
		alert.show();

		setTimeout(() => {			
			alert.fadeOut(1000);
		}, 2000);
	}

	/**
	* Notify a success
	*/
	export function notifySuccess(msg: any) {
		let alert = $('#appSuccess');
		alert.html(msg.toString());
		alert.show();

		setTimeout(() => {			
			alert.fadeOut(1000);
		}, 2000);
	}


	/**
	* Notify a warning
	*/
	export function notifyWarning(warn: any) {
		let alert = $('#appWarning');
		alert.html(warn.toString());
		alert.show();

		setTimeout(() => {			
			alert.fadeOut(1000);
		}, 2000);
	}
}