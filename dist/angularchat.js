angular.module('angularChat', [
  'ngRoute'
]);

angular.module('angularChat').config(['$routeProvider',
	function($routeProvider) {
        $routeProvider.
      	when('/home', {
        	templateUrl: 'src/partials/home.html',
          controller: 'HomeController'
      	}).
      	when('/room/:userID/:roomID', {
        	templateUrl: 'src/partials/room.html',
          controller: 'RoomController'
      	}).
        when('/rooms/:userID', {
          templateUrl: 'src/partials/rooms.html',
          controller: 'RoomsController'
        }).
        when('/rooms/:userID/newroom', {
          templateUrl: 'src/partials/newroom.html',
          controller: 'RoomsController'
        }).
      	otherwise({
        	redirectTo: '/home'
      	});
 	}]);

;angular.module('angularChat').controller('HomeController', ['$scope', '$http', '$location', '$rootScope', '$routeParams', 'socket',
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
;// Filter to filter private messages between users
angular.module('angularChat').
filter('prvtChat', function() {
    return function(messages, sender, reciever) {
        var out = [];
        for(var i = 0; i < messages.length; i++) {
            if(messages[i].prvt) {
                // Filter out messages that are not between the sender and reciever
                if((messages[i].nick === sender && messages[i].recipient === reciever) || 
                    (messages[i].recipient === sender && messages[i].nick === reciever)) {
                    out.push(messages[i]);
                }
            }
        }
        return out;
    };
});
;angular.module('angularChat').controller('RoomController', ['$scope', '$routeParams', 'socket', '$location', '$route',
        function ($scope, $routeParams, socket, $location, $route) {
            $scope.roomID = $routeParams.roomID;
            $scope.currentUser = $routeParams.userID;

            socket.on('updatetopic', function(room, roomtopic, user) {
                $scope.roomTopic = roomtopic;
            });

            $scope.filt = $scope.query;
            $scope.prvtMessages = [];
            $scope.messages = [];
            $scope.msg_recipient = "";
            $scope.newMessage = false;

            socket.on('updatechat', function(room, messageHistory) {
                $scope.messages = messageHistory;
            });

            socket.on('recv_privatemsg', function(messageHistoryPrivate) {
                if(messageHistoryPrivate[messageHistoryPrivate.length -1].recipient === $scope.currentUser) {
                    $scope.newMessage = true;
                    $scope.msg_recipient = messageHistoryPrivate[messageHistoryPrivate.length -1].nick;
                }
                $scope.prvtMessages = messageHistoryPrivate;
            });

            socket.on('updateusers', function(room, userList, opList) {
                if($scope.roomID === room) {
                    $scope.roommates = Object.keys(userList);
                    $scope.roomops = Object.keys(opList);
                    $scope.opObj = opList;
                }
            });

            socket.on('updatebanlist', function(banlist) {
                $scope.banlist = banlist;
            });

            $scope.inputMsg = "";

            $scope.sendMsg = function() {
                if($scope.inputMsg === '') {
                    // TODO ERROR
                } else {
                    var input = {roomName: $scope.roomID, msg: $scope.inputMsg};
                    socket.emit('sendmsg', input);
                }
                $scope.inputMsg = "";
            };

            $scope.inputPrvtMsg = "";

            $scope.set_recipient = function(recipient) {
                $scope.newMessage = false;
                $scope.msg_recipient = recipient;
            };

            $scope.sendPrvtMsg = function() {
                $scope.newMessage = false;
                if($scope.inputPrvtMsg !== "") {
                    var msg = {
                        nick : $scope.msg_recipient,
                        message : $scope.inputPrvtMsg
                    };
                    socket.emit('privatemsg', msg, function(sent) {
                        if(sent) {
                            // TODO : ERROR!
                            $scope.inputPrvtMsg = "";
                        } else {
                        }
                    });
                }
            };

            $scope.leave = function () {
                socket.emit('partroom', $scope.roomID, function(succeed) {
                    if(succeed) {
                        $location.path('/rooms/' + $routeParams.userID);
                    } else {
                        $location.path('/home');
                    }
                });
                
            };

            $scope.disconnect = function() {
                socket.emit('disco-nnects');
                $location.path('/home');
            };

            $scope.$on('$destroy', function() {
                $scope.leave();
            });

            $scope.kick = function(mate) {
                $scope.userKicked = mate;
                var kickObj = {user: mate, room: $scope.roomID};
                socket.emit('kick', kickObj);
            };

            $scope.ban = function(mate) {
                $scope.userBanned = mate;
                var banObj = {user: mate, room: $scope.roomID};
                socket.emit('ban', banObj);
            };

            socket.on('banned', function(room, bannedUser, username) {
                if(bannedUser === $scope.currentUser) {
                    $location.path('/rooms/' + bannedUser);
                }
            });

            socket.on('kicked', function(room, kickedUser, username) {
                if(kickedUser == $scope.currentUser) {
                    $location.path('/rooms/' + kickedUser);
                }
            });

            $scope.promotedMessage = '';

            socket.on('opped', function(room, oppedUser, username) {
                if(oppedUser === $scope.currentUser) {
                    $scope.promotedMessage = 'You got promoted by ' + username + '!';
                }
            });

            $scope.unban = function(banmate) {
                var unbanObj = {user: banmate, room: $scope.roomID};
                socket.emit('unban', unbanObj);
            };

            $scope.promote = function(mate) {
                $scope.userPromoted = mate;
                var opObj = {user: mate, room: $scope.roomID};
                socket.emit('op', opObj);
            };

        }]);
;angular.module('angularChat').controller('RoomsController', ['$scope', '$routeParams', '$location', 'socket', '$route',
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
                    }
                });

            };


            $scope.disconnect = function() {
                socket.emit('disco-nnects');
                $location.path('/home');
            };

            $scope.bannedMessage = '';
            $scope.kickedMessage = '';
            $scope.unbanMessage = '';

            socket.on('unbanned', function(room, unbannedUser, username) {
                if(unbannedUser === $scope.currentUser) {
                    $route.reload();
                }
            });

            socket.on('unbanneduserfeedback', function(room, unbannedUser, username) {
                if(unbannedUser === $scope.currentUser) {
                    $scope.unbanMessage = 'You just got unbanned from ' + room + ' by ' + username + '.';
                }
            });

            socket.on('banneduserfeedback', function(room, bannedUser, username) {
                if(bannedUser === $scope.currentUser) {
                    $scope.bannedMessage = 'You just got banned from ' + room + ' by ' + username + '.';
                }
            });

            socket.on('kickeduserfeedback', function(room, kickeduser, username) {
                if(kickeduser === $scope.currentUser) {
                    $scope.kickedMessage = 'You just got kicked from ' + room + ' by ' + username + '.';
                }
            });


        }]);

;// Factory to wrap around the socket functions
// Borrowed from Brian Ford
// http://briantford.com/blog/angular-socket-io.html
angular.module('angularChat').factory('socket', function ($rootScope) {
    var socket = io.connect('http://localhost:8080');
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
});
