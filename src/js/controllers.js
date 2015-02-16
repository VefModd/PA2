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
						$location.path('/rooms/' + $scope.nickname);
					} else {
						$scope.errorMsg = 'This nickname is already in use - please choose another!';
					}
				});
			}
		};
	}]);

chatControllers.controller('RoomController', ['$scope', '$routeParams', 'socket',
	function ($scope, $routeParams, socket) {
		$scope.roomID = $routeParams.roomID;
		$scope.currentUser = $routeParams.userID;
		var currRoom = {room: $routeParams.roomID, pass: undefined};
		socket.emit('joinroom', currRoom, function(accepted) {
			if(accepted) {
				console.log("yes");
			} else {
				console.log("no");
			}
		});
	}]);

chatControllers.controller('RoomsController', ['$scope', '$routeParams', 'socket',
	function ($scope, $routeParams, socket) {
		$scope.currentUser = $routeParams.userID;
		socket.emit('rooms');
		socket.on('roomlist', function(data) {
			console.log(data);
			$scope.rooms = Object.keys(data);
			console.log(Object.keys(data));
		});
		/*
		$scope.newRoom = function() {
			var fknroom = {room: "Room number2", pass: undefined};
			socket.emit('joinroom', fknroom);
		};
		*/
	}]);

