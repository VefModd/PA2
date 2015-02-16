var chatControllers = angular.module('chatControllers', []);

chatControllers.controller('HomeController', ['$scope', '$http', '$location', '$rootScope', '$routeParams', 'socket',
	function ($scope, $http, $location, $rootScope, $routeParams, socket) {
		$scope.errorMsg = '';
		$scope.nickname = '';

		$scope.login = function() {
			if($scope.nickname === '') {
				$scope.errorMsg = 'Please choose a nickname!';
			} else {
				socket.emit('adduser', $scope.nickname, function(available) {
					if(available) {
						$scope.errorMsg = 'succeed!';
					} else {
						$scope.errorMsg = 'This nickname is already in use - please choose another!';
					}
				});
			}
		};
	}]);

chatControllers.controller('RoomController', ['$scope', '$routeParams',
	function ($scope, $routeParams) {
  		$scope.roomID = $routeParams.roomID;
  	}]);