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

chatControllers.controller('RoomController', ['$scope', '$routeParams', 'socket', '$location',
        function ($scope, $routeParams, socket, $location) {
            $scope.roomID = $routeParams.roomID;
            $scope.filt = $scope.query;
            var currRoom = {room: $scope.roomID, pass: undefined};

            socket.emit('joinroom', currRoom, function(accepted) {
                if(accepted) {
                    socket.on('updatechat', function(room, messageHistory) {
                        $scope.messages = messageHistory;
                    });
                    socket.on('updateusers', function(room, userList, opList) {
                        $scope.roommates = Object.keys(userList);
                    });
                } else {
                    console.log("no");
                }
            });

            $scope.inputMsg = '';

            $scope.sendMsg = function() {
                console.log("inside sendMSg");
                if($scope.inputMsg === '') {
                    console.log("inputmsg = ''");
                } else {
                    console.log($scope.roomID);
                    var input = {roomName: $scope.roomID, msg: $scope.inputMsg};
                    socket.emit('sendmsg', input);
                    socket.on('updatechat', function(room, messageHistory) {
                        $scope.messages = messageHistory;
                        console.log("messageHistory: ", messageHistory);
                    });
                }
                $scope.inputMsg = '';
            };

            $scope.leave = function () {
                socket.emit('partroom', $scope.roomID);
                $location.path('/rooms/' + $scope.currentUser);
            };

            $scope.kick = function() {
            	console.log("kick this bitch please");
            };

            $scope.ban = function() {
            	console.log("ban this bitch please");
            }

        }]);

chatControllers.controller('RoomsController', ['$scope', '$routeParams', '$location', 'socket',
	function ($scope, $routeParams, $location, socket) {
		$scope.currentUser = $routeParams.userID;
		socket.emit('rooms');
		socket.on('roomlist', function(data) {
			$scope.rooms = Object.keys(data);
		});
		
		$scope.newRoom = function() {
			console.log("inside new room");
			$location.path('/rooms/' + $scope.currentUser + '/newroom');
		};

		$scope.newRoomName = '';
		$scope.newRoomTopic = '';
		$scope.newRoomPass = undefined;
		$scope.errorMsg = '';

		$scope.createNewRoom = function() {
			if($scope.newRoomName === '') {
				$scope.errorMsg = 'Please choose a name for the room!';
			} else if($scope.newRoomTopic === '') {
				$scope.errorMsg = 'Please choose a topic for the room!';
			} else {
				var newRoom = {room: $scope.newRoomName, pass: $scope.newRoomPass};
				socket.emit('joinroom', newRoom);
				$location.path('/room/' + $scope.currentUser + '/' + $scope.newRoomName);
			}
		};
		
	}]);
