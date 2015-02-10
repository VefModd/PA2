var angularChat = angular.module('angularChat', [
  'ngRoute',
  'chatControllers'
]);

angularChat.config(['$routeProvider',
	function($routeProvider) {
    	$routeProvider.
      	when('/home', {
        	templateUrl: 'src/partials/home.html',
        	controller: 'HomeController'
      	}).
      	when('/room/:roomID', {
        	templateUrl: 'src/partials/room.html',
        	controller: 'RoomController'
      	}).
      	otherwise({
        	redirectTo: '/home'
      	});
 	}]);