# JSDoc Jekyll

A JSDOC Plugin and Template to generate a GitHub Pages compatible Jekyll Documentation Site from jsdoc comments.

## Install

```
npm install --save-dev jsd-jekyll
```
### Configuration

Add `"./node_modules/jsd-jekyll"` as a plugin and template in your jsdoc config file.

**Example:**

```JSON
{
   "opts": {
      "template": "./node_modules/jsd-jekyll",
      "destination": "./out/",
      "recurse": true
   },
   "plugins": ["./node_modules/jsd-jekyll"]
}
```

#### Repository Links

Optionally a link to your source code on GitHub can be added to the documentation.
Under opts in the jsdoc config file add:

```json
"opts": {
  "repos" : [{
    "folder": "folderName",
    "name": "user/repo"
  }]
}
```

Multiple repos can be added to the array to support sub repositories based on the file path of the source code.

## JSDoc
Basic @jsdoc tags should work as [documented](https://jsdoc.app/). Not all currently work with this template, more will be added over time.

### Custom Tags
The following custom tags can be added.
#### `@category`  
A category can be added to a `@module` comment block to organize modules. Each category will create an index page with the relevant modules linked to the main api index.
Modules without a `@category` tag will display on the api index.

#### `@route`
Use @route to document api routes in the following format
``` js
/**
/* @route {GET} /api/path description...
*/
```
Add parameters using the appropriate param tag (`@routeparam`, `@headerparam`, `@bodyparam`, or `@queryparam`). All follow the `@param` fromat (`{type} name description`)
### Linking Types
When using a module as a return or parameter type preface the module name with `module:`
**Example**:
```js
/**
/* @param {module:myMod1} paramName description of the parameter
/* @returns {module:myMod2} description of the return
*/
```

## Jekyll
To run Jekyll locally (requires ruby):

``` bash
bundle exec jekyll serve
```
Only `/_data/jsdoc.json` will be overwritten when running jsdoc a second time. Other files can be customized as needed. To reset them, delete and run jsdoc.

## Set up GitHub Pages

## Credits
- Uses modified jekyll theme [bulam-clean-theme](https://github.com/chrisrhymes/bulma-clean-theme#readme)
- Inspiration from [jsdoc-route-plugin](https://github.com/bvanderlaan/jsdoc-route-plugin#readme)
