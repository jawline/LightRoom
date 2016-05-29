'use strict';

var STATUS_RELOAD_TIME = 250;

angular.module('RestServices', []).factory('$restService', function($http) {

	var rest = {
		status: {},
		config: {},
		logs: ""
	};

	rest.armed_text = "";
	rest.live_text = "Not Live Yet (Making Initial Request)";

	var doOnceList = [];
	var repeatList = [];

	var deferredRepeats = [];

	function reloadStatus() {
		$http.get(API_URL + "/status").success(function(data) {
			rest.status = data;
			rest.live_text = "Live (Updating)";
			rest.toggle_text = rest.status.on ? "Switch Off" : "Switch On";

			doOnceList.forEach(function(fn) {
				fn(data);
			});

			repeatList.forEach(function(fn) {
				fn(data);
			});

			doOnceList.length = 0;

			deferredRepeats.forEach(function (cb) {		
				if (repeatList.indexOf(cb) == -1) {
					repeatList.push(cb);
				}
			});

		}).then(function() {
			setTimeout(reloadStatus, 250);
		}, function(data) {
			rest.live_text = "Not Live (Not Updating)";
			rest.status = {};
			rest.status.alive = false;
			setTimeout(reloadStatus, 250);
		});
	}

	function reloadLog() {
		$http.get(API_URL + "/log").success(function(data) {
			rest.logs = data;
		}).then(function() {
			setTimeout(reloadLog, 250);
		});
	}

	function reloadLogMin() {
		$http.get(API_URL + "/log_reduced").success(function(data) {
			rest.logs_min = data;
		}).then(function() {
			setTimeout(reloadLogMin, 250);
		});
	}

	function reloadConfig() {
		$http.get(API_URL + "/config").success(function(data) {
			rest.config = data;
		});
	}

	reloadStatus();
	reloadLog();
	reloadLogMin();
	reloadConfig();

	rest.doOnce = function(cb) {
		doOnceList.push(cb);
	}

	rest.repeat = function(cb) {
		deferredRepeats.push(cb);
	}

	rest.clearRepeat = function(cb) {
		var idx = repeatList.indexOf(cb);
		if (idx != -1) {
			repeatList.splice(idx, 1);
		}

		idx = deferredRepeats.indexOf(cb);
		if (idx != -1) {
			deferredRepeats.splice(idx, 1);
		}
	}

	rest.countdown = function(cb) {
		if (rest.status.is_counting_down) {
			$http.get(API_URL + "/end_countdown").success(function(data) {
				cb(data);
			});
		} else {
			$http.get(API_URL + "/begin_countdown").success(function(data) {
				cb(data);
			});
		}
	}

	rest.white = function(cb) {
		$http.get(API_URL + "/white").success(function(data) {
			cb(data);
		});
	}

	rest.red = function(cb) {
		$http.get(API_URL + "/red").success(function(data) {
			cb(data);
		});
	}

	rest.green = function(cb) {
		$http.get(API_URL + "/green").success(function(data) {
			cb(data);
		});
	}

	rest.blue = function(cb) {
		$http.get(API_URL + "/blue").success(function(data) {
			cb(data);
		});
	}

	rest.color = function(r,g,b,cb) {
		$http.get(API_URL + "/color?r="+r + "&g=" + g + "&b=" + b).success(function(data) {
			cb(data);
		});
	}

	rest.setBrightness = function(bl, cb) {
		$http.get(API_URL + "/brightness?brightness=" + bl).success(function(data) {
			cb(data);
		});
	}

	rest.turn_on = function(cb) {
		$http.get(API_URL + "/on").success(function(data) {
			cb(data);
		});
	}

	rest.turn_off = function(cb) {
		$http.get(API_URL + "/off").success(function(data) {
			cb(data);
		});
	}

	rest.motor_test = function(cb) {
		$http.get(API_URL + "/motor_test").success(function(data) {
			cb(data);
		});		
	}

	return rest;
});