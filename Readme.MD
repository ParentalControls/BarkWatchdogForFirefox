# Unofficial Bark For Firefox Extension

This is an unofficial extension for Firefox for [bark.us](https://www.bark.us/signup?ref=2J6B865). It is based off the official Edge release v1.3.0. You will need to have your child setup in bark as a monitored email.

## Explanation of Application

This application is a child safety monitor that sends urls visited in firefox tabs to the bark.us monitoring service api. The application also sends extension events for the Bark for Firefox and the Bark Watchdog for Firefox application to the bark.us monitoring service api. 

When the application is installed it will prompt the parent, the user during initial setup, to enter their child's email address which has already been configured to be monitored by the bark.us service. After which time it will report on activity the child performs while using firefox. 

The application also has a locks after it is setup, and warns that it will do so to prevent the child from disabling the application in any way other than events monitored by the browser management api and permissions; namely uninstalling or disabling the application in the firefox ui.

### Required Software to Develop
You will need web-ext for mozilla.

https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/

##### Quickstart
Install NodeJs to get NPM

then run and follow any prompts:
```
npm install --global web-ext
```

then start a new instance of firefox with this extension by running:
```
web-ext run
```

### How to build 
Go to and get your api keys, you will need to follow the guide if its your first firefox extension.

https://addons.mozilla.org/en-US/developers/addon/api/key/

build with the following commands filling in any values in ${this format}

```
web-ext build
web-ext sign --api-key=${apikey} --api-secret=${apisecret}
```

### Running from the command line
This will start a new instance of Firefox in a new session.

```
web-ext run
```

### Running from files
Go to 
```
about:debugging#/runtime/this-firefox
```

Use the GUI and select the manifest.json in the Load Temporary Addon modal.
