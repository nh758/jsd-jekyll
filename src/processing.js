/**
 * Helpers used in main.js
 */

/**
 * Process Parameters to be easier to work with in jekyll
 * @param {object[]} input array from doc.params
 * @return {object}  .params = array of param to overite doc.params
 *                   .paramStrings = array of param names
 */
function processParams(input) {
  var paramStrings = [];
  var params = [];
  input.forEach((param, i) => {
    //Skip params without name
    if (!param.hasOwnProperty("name")) {
      param.name = "unkown";
    }
    if (param.hasOwnProperty("type")) {
      param.type.names = processTypes(param.type.names);
    }
    //Split name to process jsdoc @param {type} obj.prop names
    let name = param.name.split(".");
    if (name.length > 1 && paramStrings.includes(name[0])) {
      let index = paramStrings.indexOf(name[0]);
      //Add @params {} obj.prop as defenition of @param {} obj
      if (!params[index].hasOwnProperty("definition")) {
        params[index].definition = [];
      }
      params[index].definition.push(param);
    } else {
      paramStrings.push(name.join("."));
      params.push(param);
    }
  });
  return { paramStrings: paramStrings, params: params };
}

/**
 * Normalizes type names and sets up linking
 * @param {Object[]} names array of type names
 * @return {Object[]} array of type names
 */
function processTypes(names) {
  names.forEach((name, i) => {
    let isArray = false;
    //format Array.<Obj> -> Obj[]
    if (/Array\.<.*>/.test(name)) {
      let capture = name.match(/Array\.<(.*)>/);
      isArray = true;
      name = name.replace(/Array\.<(.*)>/, "$1");
    }
    name = name
      .replace(/module:(\w*)/, "<a href='./$1.html'>$1</a>")
      .replace(
        /^obj(ect)?$/i,
        "<a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object'>Object</a>"
      )
      .replace(
        /^arr(ay)?$/i,
        "<a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array'>Array</a>"
      )
      .replace(
        /^bool(ean)?$/i,
        "<a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean'>Boolean</a>"
      )
      .replace(/^int(eger)?$/i, "Integer")
      .replace(
        /^num(ber)?$/i,
        "<a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number'>Number</a>"
      )
      .replace(
        /^str(ing)?$/i,
        "<a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String'>String</a>"
      )
      .replace(
        /^json$/i,
        "<a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON'>JSON</a>"
      );
    names[i] = isArray ? `[${name}]` : name;
  });
  return names;
}

/**
 * Create a url to the repo for the code.
 * @param {type} meta jdoc doc.meta property
 * @return {type} repo url
 */
function githubUrl(meta, repos) {
  var url = "";
  //For subrepositories will try to match each repoUrl, so that the nested repo url will be returned.
  repos.forEach(repo => {
    let regex = new RegExp(repo.folder + "(.*)");
    url = meta.path.match(regex)
      ? `https://github.com/${repo.name}/blob/master${extract(
          meta.path,
          regex
        )}/${meta.filename}#L${meta.lineno}`
      : url;
  });
  return url;
}

/**
 * Returns the first capture group in a string based on a regular expression.
 * @param {string} string String to extract from.
 * @param {RegEx} regex  Regular expression with capture group.
 * @return {string} Captured string
 */
function extract(string, regex) {
  return string.match(regex)[1];
}

module.exports = { processParams, processTypes, githubUrl, extract };
