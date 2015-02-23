angular.module('angularChat').controller('RoomController', ['$scope', '$routeParams', 'socket', '$location', '$route',
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
