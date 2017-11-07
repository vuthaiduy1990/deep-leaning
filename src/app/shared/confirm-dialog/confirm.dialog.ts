import { Component, OnInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ViewChild, Inject } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';

@Component({
	templateUrl: './confirm.dialog.html',
	styleUrls: ['./style.css']
})
export class ConfirmDialog {

	constructor(
		public dialogRef: MdDialogRef<any>) {

	}

	ngOnInit() {

	}

	ngAfterViewInit() {

	}


	// ================================ Event ================================

	private _onOKClicked() {
		this.dialogRef.close({ ok: true });
	}

	private _onCancel() {
		this.dialogRef.close({ ok: false });
	}

	// ================================ Event ================================



}