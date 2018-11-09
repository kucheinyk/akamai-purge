# akamai-purge
Helps to purge Akamai cache. Based on local file structure generates list of urls that are sent to akamai to purge. It is assumed local folder structure is the same as in akamai

# Attributes
* user - your akamai username
* pass - your akamai password
* read - the folder to read recursively, uses local folder if omitted
* prefix - url prefix

# Example of usage
```
node akamai-purge user:myakamaiuser pass:myakamaipassword read:/path/to/folder prefix:https://dummy.akamai.url
```
In this case the script will recursively go through directory /path/to/folder, collect relative file paths, prefix every path with https://dummy.akamai.url and send resulting urls to akamai

# Installation
```
npm install akamai-purge-cache --global
```
