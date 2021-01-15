# JSDoc Jekyll

JSDOC Plugin and Templates to make a Jekyll Documentation Site from jsdoc comments

## Install

```
npm install --save jsdoc4jekyll
```

Add `"./node_modules/jsdoc4jekyll"` as a plugin and template in your jsdoc config file.

## Repository Links

Optionally a link to your source code on github can be added to the Documentation.
Under opts in jsdoc conf file add

```json
"opts": {
  "repoUrls" : [{
    "folder": "folder",
    "url": "https://github.com/user/repo"
  }]
}
```

Multiple repos can be added to the array to support sub repositories based on the file path of the source code.

## Custom Tags

`@category`  
`@...`

## Setup Jekyll

Use to copy the Jekyll setup files and templates to the docs directory.

```bash
jsd-jekyll -a -d ./docs/
```

Leave off the --all / -a flag to specify which files to copy. The docs may not display correctly without all the jekyll files.
