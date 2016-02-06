angular.module('services', [])

.service('UserService', function() {

  //for the purpose of this example I will store user data on ionic local storage but you should save it on a database
  var setUser = function(user_data) {
    console.log('setting user...');
    console.log(user_data);
    window.localStorage.user = JSON.stringify(user_data);
  };

  var getUser = function(){
    console.log('getting user...');
    console.log(window.localStorage.user);
    return JSON.parse(window.localStorage.user || '{}');
  };

  return {
    getUser: getUser,
    setUser: setUser
  };
});