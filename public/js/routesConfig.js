angular
	.module("myApp",[
		'ui.router',
		'noVNC',
		'ui.bootstrap',
		'cgNotify'
	])
  .config(["$stateProvider","$urlRouterProvider",function($stateProvider, $urlRouterProvider){

    $urlRouterProvider.otherwise("/")

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: "templates/mainContainer.html",
				controller: "mainContainerCtrl",
        resolve : {
          // banana : ["$http",function($http){
          //   return $http({
					// 	  method: 'GET',
					// 	  url: '/banana'
					// 	}).then(function successCallback(response) {
					// 		return response.data
					//   }, function errorCallback(response) {
					// 		if(!angular.isUndefined(response.status) && response.status===401) {
					// 			window.location.href = '/login';
					// 		}else console.log(response);
					// 	})
          // }],
					templates : ["$http",function($http){
            return $http({
						  method: 'GET',
						  url: '/getAllTemplates'
						}).then(function successCallback(response) {
							console.log(response.data);
							return response.data
					  }, function errorCallback(response) {
							if(!angular.isUndefined(response.status) && response.status===401) {
								window.location.href = '/login';
							}else console.log(response);
						})
          }],
        }
      })
      //place for others states

  }])
