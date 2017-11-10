angular
.module("myApp")
.controller("mainContainerCtrl", ["notify","$uibModal","templates","$scope","$http","$window", function (notify,$uibModal,templates,$scope,$http,$window){
	$scope.selected = 0
	$scope.templates = templates
	$scope.showElements = false
	$scope.editTemplateInputs = false
	$scope.modalInput = {
		name: "",
		horizontal: "",
		vertical: ""
	}
	$scope.modalElementInput = {
		name: "",
		host: "",
		port: 44999,
		password: "",
		horizontal: 0,
		vertical: 0
	}
	$scope.selectedVertical = 0
	$scope.selectedHorizontal = 0
	$scope.selectedElement = -1
	$scope.input = {
		name:"",
		host:"",
		port:"",
		password:""
	}
	$scope.elements = []
	// $scope.elements = [
	// 	{
	// 		"name": "Rac1",
	// 		"host": "localhost",
	// 		"port": "44999",
	// 		"password": "12qw34er"
	// 	},
	// 	{
	// 		"name": "name",
	// 		"host": "192.168.0.1",
	// 		"port": "44999",
	// 		"password": "pass"
	// 	}
	// ]

	$scope.getCorrectJson = function(h, v) {
		var final = {}
		var id = 0
		angular.forEach($scope.elements, function(val, key){
			if(val.horizontal == h && val.vertical == v){
				final = {
					"id": val.id,
					"name": val.name,
					"host": val.host,
					"port": val.port,
					"password": val.password,
					"horizontal": val.horizontal,
					"vertical": val.vertical,
					"templ": val.templ,
					"posId": id
				}
				return
			}
			id++
		})

		return final
	}

	$scope.openElement = function(a){ //a = id
		$scope.selectedElement = $scope.elements[a]
		console.log($scope.selectedElement);
		var modalInstance = $uibModal.open({
			animation: false,
			templateUrl: 'openElement.html',
			controller: 'ModalInstanceCtrl',
			size: 'lg',
			resolve: {
				items: function () {
					return $scope.selectedElement;
				}
			}
		});

		modalInstance.result.then(function (input) {
			// console.log("aje jtototototo?");
			if(!angular.isUndefined($scope.templates[0])) $scope.getElements($scope.templates[$scope.selected].id,$scope.selected)
			else $scope.getElements(-1,-1)
			// $scope.modalElementInput = input;
			// $scope.modalElementInput.horizontal = $scope.selectedHorizontal
			// $scope.modalElementInput.vertical = $scope.selectedVertical
			return
			$http({
				method: 'POST',
				url: '/createElement/' + $scope.templates[$scope.selected].id,
				data: $scope.modalElementInput
			}).then(function successCallback(response) {
				if(!angular.isUndefined($scope.templates[0])) $scope.getElements($scope.templates[$scope.selected].id,$scope.selected)
				else $scope.getElements(-1,-1)
			}, function errorCallback(response) {
				console.log(response);
			});
		}, function () {
			if(!angular.isUndefined($scope.templates[0])) $scope.getElements($scope.templates[$scope.selected].id,$scope.selected)
			else $scope.getElements(-1,-1)
			// console.log("bnanana");
			//exit happend
		});

	}

	$scope.arrangeItems = function(n) {
		// return new Array(n);
		// console.log("sveo");
		$scope.productionItems = []
		for(var i=0; i<$scope.vertical; i++){
			$scope.productionItems.push([])
			// console.log("f");
			for(var j=0; j<$scope.horizontal; j++){
				$scope.productionItems[i].push($scope.getCorrectJson(i,j))
			}
		}
		// console.log($scope.productionItems);
	};


	$scope.createElement = function(vertical, horizontal){
		$scope.selectedVertical = vertical
		$scope.selectedHorizontal = horizontal

		$scope.modalElementInput = {
			name: "",
			host: "",
			port: 44999,
			password: "",
			horizontal: horizontal,
			vertical: vertical
		}
		var modalInstance = $uibModal.open({
			animation: false,
			templateUrl: 'addNewElement.html',
			controller: 'ModalInstanceCtrl',
			size: 'lg',
			resolve: {
				items: function () {
					return $scope.modalElementInput;
				}
			}
		});

		modalInstance.result.then(function (input) {
			$scope.modalElementInput = input;
			$scope.modalElementInput.horizontal = $scope.selectedHorizontal
			$scope.modalElementInput.vertical = $scope.selectedVertical
			$http({
				method: 'POST',
				url: '/createElement/' + $scope.templates[$scope.selected].id,
				data: $scope.modalElementInput
			}).then(function successCallback(response) {
				if(!angular.isUndefined($scope.templates[0])) $scope.getElements($scope.templates[$scope.selected].id,$scope.selected)
				else $scope.getElements(-1,-1)
			}, function errorCallback(response) {
				console.log(response);
			});
		}, function () {
			//exit happend
		});
	}

	$scope.getElements = function(id, index){
		if(id == index && id == -1) {
			$scope.showElements = true
			$scope.horizontal = ""
			$scope.vertical = ""
			$scope.elements = []
			return
		}
		$scope.selected = index

		$http({
			method: 'GET',
			url: '/getElementsByTemplate/' + id
		}).then(function successCallback(response) {
			$scope.showElements = true
			// console.log(response.data);
			// $scope.showName = "Za pokazat"
			$scope.horizontal = $scope.templates[index].horizontal
			$scope.vertical = $scope.templates[index].vertical
			$scope.elements = response.data
			$scope.arrangeItems()
		}, function errorCallback(response) {
			console.log(response);
		});
	}

	if(!angular.isUndefined($scope.templates[0])) $scope.getElements($scope.templates[0].id,0)
	else $scope.getElements(-1,-1)

	$scope.editTemplate = function(){
		if($scope.templates.length == 0) {
			return
		}
		$scope.editTemplateInputs=true
	}
	$scope.saveEditTemplate = function(){
		$http({
			method: 'POST',
			url: '/updateTemplate/' + $scope.templates[$scope.selected].id,
			data : $scope.templates[$scope.selected]
		}).then(function successCallback(response) {
			$scope.getTemplates()
			$scope.editTemplateInputs = false

			if($scope.templates.length == 0 ) $scope.showElements = false
			// console.log(response.data);
			// $scope.showName = "Za pokazat"
			// $scope.horizontal = $scope.templates[index].horizontal
			// $scope.vertical = $scope.templates[index].vertical
			// $scope.elements = response.data
		}, function errorCallback(response) {
			console.log(response);
		});
	}
	$scope.deleteTemplate = function() {
		if($scope.templates.length == 0) {
			return
		}
		if (confirm('Are you sure you want to delete template?')) {
			$http({
				method: 'DELETE',
				url: '/deleteTemplate/' + $scope.templates[$scope.selected].id
			}).then(function successCallback(response) {
				$scope.getTemplates()
				$scope.selected = 0

				if($scope.templates.length == 0 ) $scope.showElements = false
				// console.log(response.data);
				// $scope.showName = "Za pokazat"
				// $scope.horizontal = $scope.templates[index].horizontal
				// $scope.vertical = $scope.templates[index].vertical
				// $scope.elements = response.data
			}, function errorCallback(response) {
				console.log(response);
			});
		} else {
			// Do nothing!
		}
	}
	$scope.addNewTemplate = function(){

		$scope.modalInput = {
			name: "",
			horizontal: "",
			vertical: ""
		}
		var modalInstance = $uibModal.open({
			animation: false,
			templateUrl: 'addNewTemplate.html',
			controller: 'ModalInstanceCtrl',
			size: 'lg',
			resolve: {
				items: function () {
					return $scope.modalInput;
				}
			}
		});

		modalInstance.result.then(function (input) {
			$scope.modalInput = input;
			$http({
				method: 'POST',
				url: '/createTemplate',
				data: $scope.modalInput
			}).then(function successCallback(response) {
				$scope.getTemplates()
			}, function errorCallback(response) {
				console.log(response);
			});
		}, function () {
			//exit happend
		});
	}
	$scope.getTemplates = function (size) {
		$http({
			method: 'GET',
			url: '/getAllTemplates'
		}).then(function successCallback(response) {
			$scope.templates = response.data
		}, function errorCallback(response) {
			console.log(response);
		})
	};
	$scope.addConnection = function () {
		if($scope.input.host== "") {
			alert("Host details must not be empty")
			return
		}
		if($scope.input.port== "") {
			alert("Port details must not be empty")
			return
		}
		$scope.elements.push($scope.input);
		$scope.input = {
			name:"",
			host:"",
			port:"",
			password:""
		}
	}
	$scope.removeConnection = function (index) {
		console.log(index);
		// return
		// angular.forEach($scope.elements, function(val, key){
		// 	if(val.id == index){
		// 		$scope.elements.splice(key,1)
		// 		return
		// 	}
		// })
		$http({
			method: 'DELETE',
			url: '/deleteElement/'+$scope.templates[$scope.selected].id+'/'+index,
			data: $scope.modalInput
		}).then(function successCallback(response) {
			$scope.getTemplates()
			console.log("SCCESS");
			if(!angular.isUndefined($scope.templates[0])) $scope.getElements($scope.templates[$scope.selected].id,$scope.selected)
			else $scope.getElements(-1,-1)
		}, function errorCallback(response) {
			console.log(response);
		});

		// $scope.elements.splice(index, 1);

	}
}])


.controller('ModalInstanceCtrl', function (notify,$http,$scope, $uibModalInstance, items) {
	$scope.modalInput = {
		name: "",
		horizontal: "",
		vertical: ""
	}
	$scope.modalElementInput = {
		name: "",
		host: "",
		port: 44999,
		password: "",
		horizontal: 0,
		vertical: 0
	}
	$scope.selectedElement = {
    "id": -1,
    "name": "dsadasd",
    "host": "",
    "port": -1,
    "password": "",
    "horizontal": -1,
    "vertical": -1,
    "templ": -1
  }
	$scope.saveChangesForElement = function () {
		console.log("test");
		console.log($scope.selectedElement);
		$http({
			method: 'POST',
			url: '/updateElement/'+$scope.selectedElement.id,
			data: $scope.selectedElement
		}).then(function successCallback(response) {
			notify({message:'Success!',duration:2000})
			console.log("Success");
		}, function errorCallback(response) {
			console.log(response);
		});
	}
	$scope.selectedElement = items
	$scope.selectedElement.port = parseInt($scope.selectedElement.port)
	$scope.ok = function () {
		if($scope.modalInput.name == "" || $scope.modalInput.horizontal == "" || $scope.modalInput.vertical == ""){
			alert("Vsa polja so obvezna")
			return
		}
		$uibModalInstance.close($scope.modalInput);
	};
	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
	$scope.ok1 = function () {
		if($scope.modalElementInput.name == "" || $scope.modalElementInput.host == "" || $scope.modalElementInput.port == ""){ //|| $scope.modalInput.port == ""
			alert("Vsa polja so obvezna")
			return
		}
		$uibModalInstance.close($scope.modalElementInput);
	};
	$scope.cancel1 = function () {
		$uibModalInstance.dismiss('cancel');
	};
	$scope.cancel2 = function () {
		$uibModalInstance.close($scope.selectedElement);
	};

})
