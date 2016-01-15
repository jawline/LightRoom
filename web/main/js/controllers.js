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