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
	$scope.queue = [];
	$scope.api_url = API_URL;
	$scope.rv = 0;
	$scope.gv = 0;
	$scope.bv = 0;

	var bright, r, g, b;

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

	function queueHandler() {
		console.log('Queue Handled');
		if ($scope.queue.length != 0) {
			$restService.clearRepeat(reloop);
			var cb = $scope.queue.pop();
			cb(function() {
				queueHandler();
				$restService.repeat(reloop);
			});
		}
	}

	var locks = 0;
	var queueInterval = setTimeout(queueHandler, 500);

	function lockQueue() {
		if (queueInterval) {
			clearInterval(queueInterval);
			queueInterval = null;
		}
		locks++;
	}

	function unlockQueue() {
		locks--;
		if (locks == 0) {
			queueInterval = setTimeout(queueHandler, 500);
		}
	}

	function reloop() {
		console.log('Reloop');
		rp();
	}

	$restService.repeat(reloop);

	function setupSliders() {

		// Without JQuery
		bright = new Slider('#ex1', {
			min: 0,
			max: 100,
			formatter: function(value) {
				return 'Current value: ' + value;
			}
		});

		function slideStart() {
			console.log('Started Sliding');
			$restService.clearRepeat(reloop);
			lockQueue();
		}

		function slideStop() {
			console.log('Stopped Sliding');
			unlockQueue();
		}

		bright.on('slideStart', slideStart);
		bright.on('slideStop', slideStop);

		bright.on('slideStop', function(v) {
			$scope.bl = v;
			$scope.queue.push(function(done) {
				console.log('Slid');
				$restService.setBrightness(v, function() {
					done();
				});
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

		r.on('slideStop', function(v) {
			$scope.rv = v;
			$scope.commit();
		});

		g.on('slideStop', function(v) {
			$scope.gv = v;
			$scope.commit();
		});

		b.on('slideStop', function(v) {
			$scope.bv = v;
			$scope.commit();
		});
	}

	$restService.doOnce(function(data) {
		$scope.bl = $restService.status.brightness;
		$scope.rv = $restService.status.r;
		$scope.gv = $restService.status.g;
		$scope.bv = $restService.status.b;
		setupSliders();
		rp();
	});

	$scope.togglelighting = function() {
		if ($scope.rest.status.on) {
			$restService.turn_off(function() {});
		} else {
			$restService.turn_on(function() {});
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

		$scope.queue.push(function(done) {		
			$restService.color(rv,gv,bv, function() {
				$restService.status.r = rv;
				$restService.status.g = gv;
				$restService.status.b = bv;
				done();
			});
		});
	}
}

function LogsCtrl($scope, $restService) {
	$scope.rest = $restService;
}

function ConfigsCtrl($scope, $restService) {
	$scope.rest = $restService;
}