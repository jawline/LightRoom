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

	var bright, r, g, b;
	var trustServer = true;

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
			formatter: function(value) {
				return 'Red: ' + value;
			}
		});

		g = new Slider('#g', {
			formatter: function(value) {
				return 'Green: ' + value;
			}
		});

		b = new Slider('#b', {
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
	});

	function reloop() {
		if (trustServer) {

			if ($scope.bl) {
				bright.setValue($restService.status.brightness);
				$scope.bl = $restService.status.brightness;
			}

			if ($scope.rv != $restService.status.r) {
				r.setValue($restService.status.r);
				$scope.rv = $restService.status.r;
			}
			if ($scope.gv != $restService.status.g) {
				g.setValue($restService.status.g);
				$scope.gv = $restService.status.g;
			}
			if ($scope.bv != $restService.status.b) {
				b.setValue($restService.status.b);
				$scope.bv = $restService.status.b;
			}
		}
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
		$restService.color(rv,gv,bv, function() {
			$scope.rv = rv;
			$scope.gv = gv;
			$scope.bv = bv;
			trustServer = true;
		});
	}

	$scope.countdown = function() {
		$scope.rest.countdown();
	}

	$scope.disarm = function() {
		$restService.disarm(function(data) {
			$scope.arm_result = data;
		});
	}

	$scope.motor_test = function() {
		$restService.motor_test(function(data) {
			$scope.motor_result = data;
		});
	}

	$scope.arm_result = "Empty";
	$scope.motor_result = "Empty";
}

function LogsCtrl($scope, $restService) {
	$scope.rest = $restService;
}

function ConfigsCtrl($scope, $restService) {
	$scope.rest = $restService;
}