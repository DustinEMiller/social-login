#Social Login

A simple app that demonstrates app login using social media platforms.

##Installation

ngCordova will be required

```sh
$ bower install ngCordova
```
##Facebook Setup

[Register an App] [link1] with Facebook

###For iOS
1. Click on Settings->Add Platform->iOS
2. Set the bundle id. It can be found in config.xml
3. Make sure that single sign on is checked

###For Android
1. Click on Settings->Add Platform->Android
2. Set the package name. It can be found in ```platforms/android/AndroidManifest.xml```
3. Make sure that single sign on is checked
4. You'll need to generate a key hash. [Instructions here] [link2]
5. Once you have your key hash, put it into the required field.

Once that is all set up, run the following command, replacing ```APP_ID``` and ```APP_NAME``` with the values from your Facebook app.

```sh
$ cordova plugin add https://github.com/Wizcorp/phonegap-facebook-plugin.git --variable APP_ID="123456789"--variable APP_NAME="myApplication"
```

##Google+ Setup

###For iOS
To get your iOS API key, go [here] [link3] and create a Google sign in app, choosing iOS as your platform. Once you fill out all the fields, download the```GoogleService-Info.plist``` file. It contains the ```REVERSED_CLIENT_ID``` you'll need during installation.

###For Android
To get your iOS API key, go [here] [link3] and create a Google sign in app, choosing Android as your platform this time. You'll need to create a key hash again, but this time it will need to be a release ```SHA1``` key. I could not get the debug key to work with the API, it kept rejecting the token. Take a breath, here we go...

You'll need to find out where keytool.exe is on your system if it's not already in your PATH. You can find it inside your ```Java\jre1.8.051\bin``` folder. Once you have that, run this command replacing ```<NAME>``` and ```<ALIAS>``` with whatever you want those to be.

```sh
<PATH_TO_KEYTOOL.EXE> -genkey -v -keystore <NAME>.keystore -alias <ALIAS> -keyalg RSA -keysize 2048 -validity 10000
```

Next, run the following command. This will give you the ```SHA1``` key which Google needs.

```sh
<PATH_TO_KEYTOOL.EXE> -export -alias <ALIAS_USED_IN_PREVIOUS_STEP> -keystore <PATH_TO_KEYSTORE_CREATED_IN_PREVIOUS_STEP> -list -v
```

Next, make sure the plugin is installed (see below). We now need to sign a release version of the app if we want to test. You'll need to do this when you release the app as well (obviously).

Run this command once the plugin is installed. This will create release versions for Android and iOS. We're only interested in Android at this point, so you can ignore anything related to iOS for the moment.

```sh
cordova build --release
```

Once the release.apk is built, you'll need to find out where your jarsigner .exe is. It should be in the same folder as keytool. The ```android-unsigned-release.apk``` should be in ```<PROJECT_ROOT>\platforms\android\build\outputs\apk```. Run.

```sh
<PATH_TO_JARSIGNER.EXE> -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore <PATH_TO_KEYSTORE_CREATED_IN_PREVIOUS_STEP> <PATH_TO_ANDROID_RELEASE_UNSIGNED_APK> <ALIAS_USED_IN_PREVIOUS_STEP>
```

Once THAT is done, you'll need to run zipalign on your signed ```.apk``. It is inside ```android-sdk\build-tools\<VERSION>```

```sh
<PATH_TO_ZIPALIGN> -v 4 <PATH_TO_ANDROID_RELEASE_UNSIGNED_APK> <NAME_OF_OUTPUT_APK>
```
Take your ```.apk``` that was just created and put it on your device. Click the file on your device to install it. By the way, it is probably a good idea to put ```keytool, jarsigner, and zipaligner``` inside your ```PATH``` so you don't have to type out their paths everytime you want to test.

####Plugin Installation

Run the following command, replacing ```REVERSED_CLIENT_ID``` with what is in your ```GoogleService-Info.plist```

```sh
$ cordova plugin add https://github.com/Argetloum/cordova-plugin-googleplus --variable REVERSED_CLIENT_ID=myreversedclientid
```
 
##Twitter Setup

Twitter does not allow you to query for emails. If you want email addresses, we'll have to get the app whitelisted then we'll have to put in the functionality to actually pull the emails into the app. You can go [here] [link4] to read more.

You'll need to get [Fabric key] [link5]. The process can be somewhat aggravating, as you actually have to use one of the IDEs they have listed and BUILD a project in that IDE before you can get to the API. What I did was just build a simple Java application inside Android Studio and used that to get the key. Once you have your Fabric Key:

```sh
cordova plugin add twitter-connect-plugin --variable FABRIC_KEY=<Fabric API Key>
```

Then, open up ```config.xml``` and add these two lines before the closing ```</widget>``` tag

```sh
<preference name="TwitterConsumerKey" value="<Twitter Consumer Key>" />
<preference name="TwitterConsumerSecret" value="<Twitter Consumer Secret>" />
```

For iOS, you need to make sure that the deployment target is 7.0 or higher. You can go into ```config.xml``` and set it like so

```sh
<preference name="deployment-target" value="7.0" />
```
 
 
[link1]: <https://developers.facebook.com/apps>
[link2]: <https://developers.facebook.com/docs/android/getting-started>
[link3]: <https://developers.google.com/mobile/add>
[link4]: <https://twittercommunity.com/t/how-to-whitelist-a-twitter-application/44378>
[link5]: <https://get.fabric.io/twitter-login>
