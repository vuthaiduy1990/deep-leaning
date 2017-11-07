/**
* Define upload component which allow upload images to serve<p>
*
* @author Vu Thai Duy
*/

import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';

import { AuthService } from '../auth.service'
import { KERNEL_CONFIG } from './kernel.config';


@Component({
	selector: 'kernel-upload',
	templateUrl: './upload.component.html',
	styleUrls: ['../../assets/css/circle-percentage-bar.css']
})
export class UploadComponent implements OnInit {
	@ViewChild('inputUpload') uploadElRef: ElementRef

	public uploader: FileUploader;
	public uploadInfo: any;

	constructor(
		private auth: AuthService,
		private changeRef: ChangeDetectorRef,
		@Inject(KERNEL_CONFIG) private kernelCf) {

		this.uploader = new FileUploader({
			url: this.kernelCf.uploadUrl + '?token=' + this.auth.token,
			autoUpload: true,
			itemAlias: 'photo',
			maxFileSize: 5000000, // maximum 5MB
			allowedMimeType: ['image/jpg', 'image/jpeg', 'image/bmp', 'image/png'],
			// allowedFileType: ['image']
		});
	}

	ngOnInit() {

		this.uploader.onAfterAddingFile = (item) => {
			// Fix: can't upload the same file twice
			// https://github.com/valor-software/ng2-file-upload/issues/220
			this.uploadElRef.nativeElement.value = ''
		};

		// when selecting file failed
		this.uploader.onWhenAddingFileFailed = (item: any, filter: any, options: any) => {
			let msg: string = '';
			switch (filter.name) {
				case "fileSize":
					msg = "File exceed size limit. Maximum size is 5MB";
					break;
				case "mimeType":
					msg = "File type is not available";
					break;
				default:
					msg = 'Uploading file error. Please try again!';
					break;
			}
			this.onError(msg);
		}

		this.uploader.onBeforeUploadItem = (fileItem: FileItem) => {
			fileItem.withCredentials = false; // disable credential
			this.uploadInfo = {
				size: Math.floor(fileItem.file.size / 1024),
				progress: 0,
				speed: 0,
				totalTime: 0,
				startTime: (new Date()).getTime()
			};
		}

		// Override onErrorItem to deal with uploading error
		this.uploader.onErrorItem = (item: FileItem, response: string, status: number, headers: any) => {
			this.onError('Uploading file error. Please try again!');
		}

		this.uploader.onProgressItem = (fileItem: FileItem, progress: number) => {
			this.uploadInfo.progress = progress;
			this.trackUploadingProgress(progress);
			this.changeRef.detectChanges();	// notify change for updating UI
		}

		// Overide the onCompleteItem property of the uploader so we are able to deal with server response 
		this.uploader.onCompleteItem = (item: FileItem, res: any, status: any, req: any) => {
			this.trackUploadingProgress(100);
			this.onUploadComplete(item, res, status, req);
		};
	}

	/**
	* Track and compute parameter of uploading progress like 
	* <ul><li>average speed of uploading</li>
	* <li>total time of uploading</li></ul>
	*
	* @param progress: percentage of uploading
	*/
	private trackUploadingProgress(progress: number) {
		let t = ((new Date()).getTime() - this.uploadInfo.startTime) / 1000;
		let speed = (progress / 100) * (this.uploadInfo.size / 1024) / t;
		this.uploadInfo.totalTime = Math.round(t * 100) / 100; // round at most 2 decimal
		this.uploadInfo.speed = Math.round(speed * 100) / 100; // round at most 2 decimal
	}

	/**
	* On error event handler
	* @param err: error message
	*/
	onError(err: string) { }

	/**
	* On uploading completed
	*
	* @param item: selected file item
	* @param res: response from server
	* @param status: status code
	* @param req: request
	*/
	onUploadComplete(item: FileItem, res: any, status: any, req: any) { }
}
