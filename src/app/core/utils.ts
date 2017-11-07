declare var InstallTrigger: any;
export class GMUtil {

	/**
	* Convert image file to base64 data
	*/
	static imageToBase64(file: File, callback: Function) {
		if (file) {
			var reader = new FileReader();
			reader.onload = function(e: any) {
				callback(e.target.result);
			}
			reader.readAsDataURL(file);
		}
	}

	/**
	* Detect whether brower or graphics support WebGL or not
	*/
	static webgl() {
		try {
			var canvas = document.createElement('canvas');
			return !!(WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));

		} catch (e) {
			return false;
		}
	}

	static os: any = {
		isOpera() {
			return (!!window['opr'] && !!window['opr'].addons) || !!window['opera'] || navigator.userAgent.indexOf(' OPR/') >= 0;
		},

		// Firefox 1.0+
		isFirefox() {
			return typeof InstallTrigger !== 'undefined';
		},

		// Internet Explorer 6-11
		isIE() {
			return /*@cc_on!@*/false || !!document['documentMode'];
		},

		// Edge 20+
		isEdge() {
			return !this.isIE() && !!window['StyleMedia'];
		},

		// Chrome 1+
		isChrome() {
			return !!window['chrome'] && !!window['chrome'].webstore;
		}
	}

	static readonly COLORS = {
		aqua: "#00ffff",
		azure: "#f0ffff",
		beige: "#f5f5dc",
		black: "#000000",
		blue: "#0000ff",
		brown: "#a52a2a",
		cyan: "#00ffff",
		darkblue: "#00008b",
		darkcyan: "#008b8b",
		darkgrey: "#a9a9a9",
		darkgreen: "#006400",
		darkkhaki: "#bdb76b",
		darkmagenta: "#8b008b",
		darkolivegreen: "#556b2f",
		darkorange: "#ff8c00",
		darkorchid: "#9932cc",
		darkred: "#8b0000",
		darksalmon: "#e9967a",
		darkviolet: "#9400d3",
		fuchsia: "#ff00ff",
		gold: "#ffd700",
		green: "#008000",
		indigo: "#4b0082",
		khaki: "#f0e68c",
		lightblue: "#add8e6",
		lightcyan: "#e0ffff",
		lightgreen: "#90ee90",
		lightgrey: "#d3d3d3",
		lightpink: "#ffb6c1",
		lightyellow: "#ffffe0",
		lime: "#00ff00",
		magenta: "#ff00ff",
		maroon: "#800000",
		navy: "#000080",
		olive: "#808000",
		orange: "#ffa500",
		pink: "#ffc0cb",
		purple: "#800080",
		violet: "#800080",
		red: "#ff0000",
		silver: "#c0c0c0",
		white: "#ffffff",
		yellow: "#ffff00"
	};

	static randColor(): any {
		var result;
		var count = 0;
		for (var name in this.COLORS) {
			if (Math.random() < 1 / ++count) {
				result = name;
			}
		}
		return { name: result, value: this.COLORS[result] };
	}

	/**
	* Shuffle an array
	*
	* @param array
	* @return new shuffled copied of input array
	*/
	static shuffle(array: Array<any>, copy?: boolean) {
		let result: Array<any> = copy ? array.slice(0) : array;

		var currentIndex = result.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = result[currentIndex];
			result[currentIndex] = result[randomIndex];
			result[randomIndex] = temporaryValue;
		}

		return result;
	}

	/**
	* Separate big number of commas
	* For example: 1000000 -> 1,000,000
	*/
	static addCommasToNumber(num: number): string {
		return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	/** 
	* Get current date time as string
    * format: yyyy-mm-dd hh:mm:ss
    * example: "2016-12-02 15:31:21"
    */
	static getDateTimeString(date) {
		let year = '' + date.getFullYear(),
			month = '' + (date.getMonth() + 1),
			day = '' + date.getDate(),
			hour = '' + date.getHours(),
			seconds = '' + date.getSeconds(),
			minutes = '' + date.getMinutes();

		month = (month.length < 2) ? '0' + month : month;
		day = (day.length < 2) ? '0' + day : day;
		hour = (hour.length < 2) ? '0' + hour : hour;
		minutes = (minutes.length < 2) ? '0' + minutes : minutes;
		seconds = (seconds.length < 2) ? '0' + seconds : seconds;

		return [year, month, day].join('-') + ' ' + [hour, minutes, seconds].join(':');
	}

	/**
	* Set cookie
	*
	* @param key
	* @param value
	* @param expiredTime milisecond
	*/
	static setCookie(key, value, expiredTime) {
		var d = new Date();
		d.setTime(d.getTime() + expiredTime);
		var expires = "expires=" + d.toUTCString();
		document.cookie = key + "=" + value + ";" + expires + ";path=/";
	}

	/**
	* Get cookie by key
	* @return value
	*/
	static getCookie(key) {
		var name = key + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}

}