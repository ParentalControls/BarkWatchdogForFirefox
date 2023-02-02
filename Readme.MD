# Unofficial Bark For Android Extension


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
