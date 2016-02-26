'use strict';

var API_PORT = "14320";
var API_URL = location.protocol+'//'+location.hostname + ":" + API_PORT;

/* Controllers */
function LandingCtrl($scope) {}

function CommandsCtrl($scope, $restService) {
	$scope.api_url = API_URL;
}

function StatusCtrl($scope, $restService) {
	$scope.rest = $restService;
	$scope.api_url = API_URL;
	$scope.rv = 0;
	$scope.gv = 0;
	$scope.bv = 0;

	var bright, r, g, b;
	var trustServer = true;
	var deferred = false;


	function sr() {
		r.setValue($restService.status.r);
		$scope.rv = $restService.status.r;
	}

	function sg() {
		g.setValue($restService.status.g);
		$scope.gv = $restService.status.g;
	}

	function sb() {
		b.setValue($restService.status.b);
		$scope.bv = $restService.status.b;
	}

	function rebright() {
		bright.setValue($restService.status.brightness);
		$scope.bl = $restService.status.brightness;
	}

	function rp() {
		rebright();
		sr();
		sg();
		sb();
	}


	$restService.doOnce(function(data) {
		// Without JQuery
		var slider = new Slider('#ex1', {
			formatter: function(value) {
				return 'Current value: ' + value;
			}
		});

		slider.on('slide', function(v) {
			$scope.bl = v;
			trustServer = false;
			$restService.setBrightness(v, function() {
				trustServer = true;
			});
		});

		r = new Slider('#r', {
			min: 0,
			max: 255,
			formatter: function(value) {
				return 'Red: ' + value;
			}
		});

		g = new Slider('#g', {
			min: 0,
			max: 255,
			formatter: function(value) {
				return 'Green: ' + value;
			}
		});

		b = new Slider('#b', {
			min: 0,
			max: 255,
			formatter: function(value) {
				return 'Blue: ' + value;
			}
		});

		r.on('slide', function(v) {
			$scope.rv = v;
			$scope.commit();
		});

		g.on('slide', function(v) {
			$scope.gv = v;
			$scope.commit();
		});

		b.on('slide', function(v) {
			$scope.bv = v;
			$scope.commit();
		});

		$scope.bl = $restService.status.brightness;
		$scope.rv = $restService.status.r;
		$scope.gv = $restService.status.g;
		$scope.bv = $restService.status.b;

		bright = slider;
		rp();
	});

	function reloop() {

		if (!trustServer) {
			console.log('Dont trust server');
			deferred = true;
		}

		if (!deferred) {
			rp();
		}

		deferred = false;
	}

	$restService.repeat(reloop);

	$scope.togglelighting = function() {
		if ($scope.rest.status.on) {
			$restService.turn_off();
		} else {
			$restService.turn_on();
		}
	}

	$scope.white = function() {
		$restService.white();
	}

	$scope.red = function() {
		$restService.red();
	}

	$scope.green = function() {
		$restService.green();
	}
	
	$scope.blue = function() {
		$restService.blue();
	}

	var lR, lG, lB;

	$scope.commit = function() {
		var rv = $scope.rv || 0;
		var gv = $scope.gv || 0;
		var bv = $scope.bv || 0;
		if (rv < 0) { rv = 0; }
		if (gv < 0) { gv = 0; }
		if (bv < 0) { bv = 0; }
		if (rv > 255) { rv = 255; }
		if (gv > 255) { gv = 255; }
		if (bv > 255) { bv = 255; }
		trustServer = false;
		console.log(rv + ', ' + gv + ', ' + bv);
		lR = rv;
		lG = gv;
		lB = bv;
		$restService.color(rv,gv,bv, function() {
			$restService.status.r = rv;
			$restService.status.g = gv;
			$restService.status.b = bv;

			if (lR === rv && lG === gv && lB === bv) {
				rp();
				trustServer = true;
			}
		});
	}
}

function LogsCtrl($scope, $restService) {
	$scope.rest = $restService;
}

function ConfigsCtrl($scope, $restService) {
	$scope.rest = $restService;
}