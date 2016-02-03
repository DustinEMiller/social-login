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
    .then(function(profileInfo) {
      // This will be the stuff that goes in the database I'm assuming
      UserService.setUser({
        authResponse: authResponse,
				userID: profileInfo.id,
				name: profileInfo.name,
				email: profileInfo.email,
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
				console.log(response);
        info.resolve(response);
      },
      function (response) {
				console.log(response);
        info.reject(response);
      }
    );
    return info.promise;
  };

  $scope.login = function(type) {
    switch(type) {
    case 'facebook':
        facebookConnectPlugin.getLoginStatus(function(success){
         if(success.status === 'connected'){
            // the user is logged in and has authenticated your app, and response.authResponse supplies
            // the user's ID, a valid access token, a signed request, and the time the access token
            // and signed request each expire
            console.log('getLoginStatus', success.status);

            //check if we have our user saved
            var user = UserService.getUser();

            if(!user.userID)
            {
              getFacebookProfileInfo(success.authResponse)
              .then(function(profileInfo) {

                UserService.setUser({
                  authResponse: success.authResponse,
                  userID: profileInfo.id,
                  name: profileInfo.name,
                  email: profileInfo.email,
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
      //$ionicLoading.show({
      //template: 'Logging in...'
      //});

      window.plugins.googleplus.login({
          //'scopes': '', // optional space-separated list of scopes, the default is sufficient for login and basic profile info
          //'offline': true, // optional, used for Android only - if set to true the plugin will also return the OAuth access token ('oauthToken' param), that can be used to sign in to some third party services that don't accept a Cross-client identity token (ex. Firebase)
          //'webApiKey': '', // optional API key of your Web application from Credentials settings of your project - if you set it the returned idToken will allow sign in to services like Azure Mobile Services
          // there is no API key for Android; you app is wired to the Google+ API by listing your package name in the google dev console and signing your apk (which you have done in chapter 4)
        },
        function (user_data) {
          console.log(user_data);
          //This will be teh stuff that goes in teh database I'm assuming
          UserService.setUser({
            userID: user_data.userId,
            name: user_data.displayName,
            email: user_data.email,
            picture: user_data.imageUrl,
            accessToken: user_data.accessToken,
            idToken: user_data.idToken,
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
        /*$cordovaOauth.twitter("QvvuMbOMmjk6NXIprkXOkMKy9", "iwAJuZhg2VihNopmf13CLuoWx7NC3P57SlcYoLN6lW2bQGgJYp").then(function(result) {
          console.log(JSON.stringify(result));  
        }, function(error) {
          console.log(JSON.stringify(result));
        });*/ 
        break;
    }
  };
})

.controller('AppCtrl', function($scope){

})

.controller('InfoCtrl', function($scope, UserService, $ionicActionSheet, $state, $ionicLoading){

	$scope.user = UserService.getUser();

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

        //facebook logout
        facebookConnectPlugin.logout(function(){
          $ionicLoading.hide();
          $state.go('welcome');
        },
        function(fail){
          $ionicLoading.hide();
        });

        // Google logout
        window.plugins.googleplus.logout(
          function (msg) {
            console.log(msg);
            $ionicLoading.hide();
            $state.go('welcome');
          },
          function(fail){
            console.log(fail);
          }
        );
			}
		});
	};
});