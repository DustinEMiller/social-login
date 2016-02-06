angular.module('controllers', [])

.controller('WelcomeCtrl', function($scope, $state, $q, UserService, $ionicLoading) {
  $scope.googlePlusAvailable = false;
  
  window.plugins.googleplus.isAvailable(
    function (available) {
      if (available) {
        $scope.googlePlusAvailable = true;  
      }
    }
  );

  //This is the success callback from the login method
  var fbLoginSuccess = function(response) {
    if (!response.authResponse){
      fbLoginError("Cannot find the authResponse");
      return;
    }

    var authResponse = response.authResponse;

    getFacebookProfileInfo(authResponse)
    .then(function(res) {
      // This will be the stuff that goes in the database I'm assuming
      UserService.setUser({
        authResponse: authResponse,
				userID: res.id,
				name: res.name,
				email: res.email,
        picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large",
        type: 'facebook',
        title: 'Facebook'
      });

      $ionicLoading.hide();
      $state.go('app.info');

    }, function(fail){
      //fail get profile info
      console.log('profile info fail', fail);
    });
  };


  //This is the fail callback from the login method
  var fbLoginError = function(error){
    console.log('fbLoginError', error);
    $ionicLoading.hide();
  };

  //this method is to get the user profile info from the facebook api
  var getFacebookProfileInfo = function (authResponse) {
    var info = $q.defer();

    facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
      function (response) {
        info.resolve(response);
      },
      function (response) {
        info.reject(response);
      }
    );
    return info.promise;
  };

  $scope.login = function(type) {
    //Clear out the currently logged in user
    UserService.setUser({});
    switch(type) {
    case 'facebook':
        facebookConnectPlugin.getLoginStatus(function(success){
         if(success.status === 'connected'){
            // the user is logged in and has authenticated your app, and response.authResponse supplies
            // the user's ID, a valid access token, a signed request, and the time the access token
            // and signed request each expire

            //check if we have our user saved
            var user = UserService.getUser();

            if(!user.userID && user.type !== 'facebook') {
              getFacebookProfileInfo(success.authResponse)
              .then(function(res) {

                UserService.setUser({
                  authResponse: success.authResponse,
                  userID: res.id,
                  name: res.name,
                  email: res.email,
                  picture : "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large",
                  type: 'facebook',
                  title: 'Facebook'
                });

                $state.go('app.info');

              }, function(error){
                //Put your error notification here
                console.log('facebook failure', error);
              });
            }else{
              $state.go('app.info');
            }

         } else {
            //if (success.status === 'not_authorized') the user is logged in to Facebook, but has not authenticated your app
            //else The person is not logged into Facebook, so we're not sure if they are logged into this app or not.
            console.log('getLoginStatus', success.status);

            $ionicLoading.show({
              template: 'Logging in...'
            });

            //ask the permissions you need. You can learn more about FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
            facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
          }
        });
      break;
    case 'google':

      var arguments = {};

      if (ionic.Platform.isAndroid()) {
        arguments = {
          'scopes': 'email profile',
          'offline': true,
        }
      }
      else if (ionic.Platform.isIOS()) {
        arguments = {
          'scopes': 'email profile',
          'offline': true,
        }
      }

      window.plugins.googleplus.login(
        arguments,
        function (res) {
          console.log(res);

          UserService.setUser({
            userID: res.userId,
            name: res.displayName,
            email: res.email,
            picture: res.imageUrl,
            accessToken: res.accessToken,
            idToken: res.idToken,
            type: 'google',
            title: 'Google+'
          });

          //$ionicLoading.hide();
          $state.go('app.info');
        },
        function (error) {
          //Put your error notification here
          console.log('google failure', error);
        }
      );
      break;
    case 'twitter':
        TwitterConnect.login(
          function(res) {
            UserService.setUser({
              userID: res.userId,
              name: res.userName,
              //email: res.email, <-- Need whitelisted
              //picture: res.imageUrl, <-- Yes? No? If yes, need to extend Java/Objective C capabilities or use REST API
              secret: res.secret,
              token: res.token,
              type: 'twitter',
              title: 'Twitter'
            });
            $state.go('app.info');
          }, function(error) {
            console.log('Error logging in');
            console.log(error);
          }
        );
        break;
    }
  };
})

.controller('AppCtrl', function($scope){

})

.controller('InfoCtrl', function($scope, UserService, $ionicActionSheet, $state, $ionicLoading){

	$scope.profile = UserService.getUser();

	$scope.showLogOutMenu = function() {
		var hideSheet = $ionicActionSheet.show({
			destructiveText: 'Logout',
			titleText: 'Are you sure you wish to logout?',
			cancelText: 'Cancel',
			cancel: function() {},
			buttonClicked: function(index) {
				return true;
			},
			destructiveButtonClicked: function(){
				$ionicLoading.show({
					template: 'Logging out...'
				});

        switch($scope.profile.type) {
          case 'facebook':
            facebookConnectPlugin.logout(function(){
              UserService.setUser({});
              $ionicLoading.hide();
              console.log('Successful logout!');
              $state.go('welcome');
            },
            function(fail){
              $ionicLoading.hide();
              console.log('Error logging out' + fail);
            });
            break;
          case 'google':
            window.plugins.googleplus.logout(
              function (msg) {
                UserService.setUser({});
                $ionicLoading.hide();
                console.log('Successful logout!');
                $state.go('welcome');
              },
              function(fail){
                $ionicLoading.hide();
                 console.log('Error logging out' + fail);
              }
            );
            break;
          case 'twitter':
            TwitterConnect.logout(
              function() {
                UserService.setUser({});
                $ionicLoading.hide();
                console.log('Successful logout!');
                $state.go('welcome');
              },
              function() {
                $ionicLoading.hide();
                console.log('Error logging out');
              }
            );
            break;
        }   
			}
		});
	};
});