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
            //$scope.roomObj = rooms[$scope.roomID];
            console.log("roomobj: ", $scope.roomObj);

            $scope.filt = $scope.query;
            //var currRoom = {room: $scope.roomID, pass: undefined};
            var p_messages = [];

            socket.on('updatechat', function(room, messageHistory) {
                $scope.messages = messageHistory;
            });

            socket.on('recv_privatemsg', function(sender, message) {
                /*var pm = {
                  nick : sender,
                  timestamp : new Date(),
                  message : message.substring(0, 200)
                  };
                  p_messages.push(pm);
                  $scope.messages + pm;*/
                console.log("recieved PM: ", message);
            });

            socket.on('updateusers', function(room, userList, opList) {
                console.log("usrs: ", userList);
                console.log("ops: ", opList);
                $scope.roommates = Object.keys(userList);
                $scope.roomops = Object.keys(opList);
            });

            $scope.inputMsg = "";

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
                $scope.inputMsg = "";
            };

            $scope.inputPrvtMsg = "";

            $scope.set_recipient = function(recipient) {
                $scope.msg_recipient = recipient;
            };

            $scope.prvt_msg = function() {
                if($scope.inputPrvtMsg !== "") {
                    var msg = {
                        nick : $scope.msg_recipient,
                        message : $scope.inputPrvtMsg
                    };
                    socket.emit('privatemsg', msg, function(sent) {
                        if(sent) {
                            $scope.inputPrvtMsg = "";
                            console.log("PM: Success");
                        } else {
                            console.log("PM: Failure");
                        }
                    });
                }
            };

            $scope.leave = function () {
                socket.emit('partroom', $scope.roomID);
                $location.path('/rooms/' + $routeParams.userID);
            };

            $scope.$on('$destroy', function() {
                $scope.leave();
            });

            $scope.kick = function(mate) {
            	$scope.userKicked = mate;
            	console.log("mate: ", mate);

            	var kickObj = {user: mate, room: $scope.roomID};
            	socket.emit('kick', kickObj, function(allowed) {
                    // TODO! => maybe ask the user if he is sure he want to kick the mate??
                    if(!allowed) {
                        alert("You have to be OP to kick a mate!");
                    }
                });
            };

            $scope.ban = function(mate) {
                $scope.userBanned = mate;
            	console.log("mate: ", mate);

                var banObj = {user: mate, room: $scope.roomID};
                socket.emit('ban', banObj, function(allowed) {
                    // TODO! => maybe ask the user if he is sure he want to ban the mate??
                    if(!allowed) {
                        alert("You have to be OP to ban a mate!");
                    }
                });
            };

            $scope.promote = function(mate) {
                $scope.userPromoted = mate;
                console.log("mate: ", mate);

                var opObj = {user: mate, room: $scope.roomID};
                socket.emit('op', opObj, function(allowed) {
                    // TODO! => maybe ask the user if he is sure he want to op the mate??
                    if(!allowed) {
                        alert("You have to be OP to promote a mate!");
                    }
                });
            };

        }]);

chatControllers.controller('RoomsController', ['$scope', '$routeParams', '$location', 'socket',
	function ($scope, $routeParams, $location, socket) {
		$scope.currentUser = $routeParams.userID;
		socket.emit('rooms');
		socket.on('roomlist', function(data) {
			$scope.rooms = Object.keys(data);
            $scope.roomObj = data;
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
				$location.path('/room/' + $scope.currentUser + '/' + $scope.newRoomName);
                var joinObj = {room: $scope.newRoomName, pass: $scope.newRoomPass};
                socket.emit('joinroom', joinObj);
                var topicObj = {room: $scope.newRoomName, topic: $scope.newRoomTopic};
                socket.emit('settopic', topicObj);
			}
		};

        $scope.joinRoom = function(roomID) {
            var joinObj = {room: roomID, pass: ''};
            socket.emit('joinroom', joinObj, function(accepted, reason) {
                if(accepted) {
                    $location.path('/room/' + $scope.currentUser + '/' + roomID);
                } else {
                    // TODO ERROR MESSAGE
                }
            });
        };
	}]);
