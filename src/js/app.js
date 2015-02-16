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


