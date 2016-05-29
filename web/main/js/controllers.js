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

	function reloop() {	
		rebright();
		sr();
		sg();
		sb();
	}

	$restService.repeat(reloop);

	function queueHandler() {
		if ($scope.queue.length != 0) {
			console.log('Handling Queue Items');
			$restService.clearRepeat(reloop);
			var cb = $scope.queue.pop();
			cb(function() {
				queueHandler();
				$restService.repeat(reloop);
			});
		}
	}

	var locks = 0;
	var queueInterval = null;

	function lockQueue() {
		if (queueInterval) {
			clearInterval(queueInterval);
			queueInterval = null;
		}
		locks++;
	}

	function unlockQueue() {
		locks--;
		if (locks <= 0) {
			setTimeout(queueHandler, 500);
			locks = 0;
		}
	}

	function changeStart() {
		console.log('Started Change');
		$restService.clearRepeat(reloop);
		lockQueue();
	}

	function changeStop() {
		console.log('Stopped Change');
		unlockQueue();
	}

	function setupSliders() {

		bright = new Slider('#ex1', {
			min: 0,
			max: 100,
			formatter: function(value) {
				return 'Current value: ' + value;
			}
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

		bright.on('slideStart', changeStart);
		bright.on('slideStop', changeStop);

		bright.on('slideStop', function(v) {
			$scope.bl = v;
			$scope.queue.push(function(done) {
				$restService.setBrightness(v, function() {
					done();
				});
			});
		});

		r.on('slideStart', changeStart);
		r.on('slideStop', changeStop);
		r.on('slideStop', function(v) {
			$scope.rv = v;
			$scope.commit();
		});

		g.on('slideStart', changeStart);
		g.on('slideStop', changeStop);
		g.on('slideStop', function(v) {
			$scope.gv = v;
			$scope.commit();
		});

		b.on('slideStart', changeStart);
		b.on('slideStop', changeStop);
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
		reloop();
	});

	$scope.togglelighting = function() {
		if ($scope.rest.status.on) {
			$restService.turn_off(function() {});
		} else {
			$restService.turn_on(function() {});
		}
	}

	$scope.white = function() {
		changeStart();
		$scope.rv = 255;
		$scope.bv = 255;
		$scope.gv = 255;
		$scope.commit();
		changeStop();
	}

	$scope.red = function() {
		changeStart();
		$scope.rv = 255;
		$scope.bv = 0;
		$scope.gv = 0;
		$scope.commit();
		changeStop();
	}

	$scope.green = function() {
		changeStart();
		$scope.rv = 0;
		$scope.bv = 0;
		$scope.gv = 255;
		$scope.commit();
		changeStop();
	}
	
	$scope.blue = function() {
		changeStart();
		$scope.rv = 0;
		$scope.bv = 255;
		$scope.gv = 0;
		$scope.commit();
		changeStop();
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