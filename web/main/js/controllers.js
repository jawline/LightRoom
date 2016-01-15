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
		console.log(rv + ', ' + gv + ', ' + bv);
		$restService.color(rv,gv,bv, function() {
			$scope.rv = rv;
			$scope.gv = gv;
			$scope.bv = bv;
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