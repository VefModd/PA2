var chatControllers = angular.module('chatControllers', []);

chatControllers.controller('HomeController', ['$scope', '$http',
  function ($scope, $http) {
    
  }]);

chatControllers.controller('RoomController', ['$scope', '$routeParams',
	function ($scope, $routeParams) {
  		$scope.roomID = $routeParams.roomID;
  	}]);