chatControllers.controller('RoomsController', ['$scope', '$routeParams', '$location', 'socket', '$route',
        function ($scope, $routeParams, $location, socket, $route) {
            $scope.currentUser = $routeParams.userID;

            socket.emit('rooms');
            socket.on('roomlist', function(data) {
                $scope.rooms = Object.keys(data);
                $scope.roomObj = data;
            });

            $scope.newRoom = function() {
                $location.path('/rooms/' + $scope.currentUser + '/newroom');
            };

            $scope.newRoomName = '';
            $scope.newRoomTopic = '';
            $scope.newRoomPass = undefined;
            $scope.errorMsg = '';

            $scope.joinRoom = function(roomID) {
                var joinObj;
                if(roomID === undefined) {
                    // No room parameter, so we create new room
                    if($scope.newRoomName === '') {
                        $scope.errorMsg = 'Please choose a name for the room!';
                        return;
                    } else if($scope.newRoomTopic === '') {
                        $scope.errorMsg = 'Please choose a topic for the room!';
                        return;
                    } else {
                        joinObj = {room: $scope.newRoomName, pass: $scope.newRoomPass, topic: $scope.newRoomTopic};
                    }
                } else {
                    // With roomID we join
                    joinObj = {room: roomID, pass: ''};
                }
                socket.emit('joinroom', joinObj, function(accepted, reason) {
                    if(accepted) {
                        socket.emit('rooms');
                        $location.path('/room/' + $scope.currentUser + '/' + joinObj.room);
                    } else {
                        // TODO ERROR MESSAGE
                    }
                });

            };

            $scope.bannedMessage = '';
            $scope.kickedMessage = '';

            socket.on('unbanned', function(room, unbannedUser, username) {
                if(unbannedUser === $scope.currentUser) {
                    $route.reload();
                }
            });

            socket.on('banneduserfeedback', function(room, bannedUser, username) {
                if(bannedUser === $scope.currentUser) {
                    $scope.bannedMessage = 'You just got banned from ' + room + ' by ' + username + '.';
                }
            });

            socket.on('kickeduser', function(room, kickeduser, username) {
                if(kickeduser === $scope.currentUser) {
                    $scope.kickedMessage = 'You just got kicked from ' + room + ' by ' + username + '.';
                }
            });
        }]);
