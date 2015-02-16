var angularChat = angular.module('angularChat', [
  'chatControllers',
  'ngRoute'
]);

angularChat.config(['$routeProvider',
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
      	otherwise({
        	redirectTo: '/home'
      	});
 	}]);


// Factory to wrap around the socket functions
// Borrowed from Brian Ford
// http://briantford.com/blog/angular-socket-io.html
angularChat.factory('socket', function ($rootScope) {
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
