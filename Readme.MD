# Unofficial Bark For Android Extension

This is an unofficial extension for Firefox for [bark.us](https://www.bark.us/signup?ref=2J6B865). It is based off the official Edge release v1.3.0. You will need to have your child setup in bark as a monitored email.


### How to build 
You will need web-ext for mozilla.

Go to and get your api keys, you will need to follow the guide if its your first firefox extension.

https://addons.mozilla.org/en-US/developers/addon/api/key/

build with the following commands filling in any values in ${this format}

```
web-ext build
web-ext sign --api-key=${apikey} --api-secret=${apisecret}
```

### Running from files
Go to 
```
about:debugging#/runtime/this-firefox
```

Use the GUI and select the manifest.json in the Load Temporary Addon modal.
