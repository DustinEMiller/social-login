# Social Login

ngCordova will be required

```sh
$ bower install ngCordova
```
##Facebook Setup

[Register App] [link1]

###For iOS
1. Click on Settings->Add Platform->iOS
2. Set the bundle id. It can be found in config.xml
3. Make sure that single sign on is checked

###For Android
1. Click on Settings->Add Platform->Android
2. Set the package name. It can be found in platforms/android/AndroidManifest.xml
3. Make sure that single sign on is checked
4. You'll need to generate a key hash. [Instructions here] [link2]
5. Once you have your key hash, put it into the required field.

Once that is all set up, run the following command, replacing APP_ID and APP_NAME with the values from your Facebook app.

```sh
$ cordova plugin add https://github.com/Wizcorp/phonegap-facebook-plugin.git --variable APP_ID="123456789"--variable APP_NAME="myApplication"
```
 
 ##Twitter Setup
 


[link1]: <https://developers.facebook.com/apps>
[link2]: <https://developers.facebook.com/docs/android/getting-started>
