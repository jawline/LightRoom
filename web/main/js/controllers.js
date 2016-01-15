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

	$scope.arm = function() {
		if ($scope.rest.status.armed) {
			$restService.disarm(function(data) {
				$scope.arm_result = data;
			});
		} else {
			$restService.arm(function(data) {
				$scope.arm_result = data;
			});
		}
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