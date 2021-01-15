/**
 * Helpers used in main.js
 */

/**
 * Process Parameters to be easier to work with in jekyll
 * @param {object[]} input array from doc.params
 * @return {object}  .params = array of param to overite doc.params
 *                   .paramStrings = array of param names
 */
export function processParams(input) {
  var paramStrings = [];
  var params = [];
  input.forEach((param, i) => {
    //Skip params without name
    if (!param.hasOwnProperty("name")) {
      param.name = "unkown";
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
      if (param.hasOwnProperty("type")) {
        param.type.names = processTypes(param.type.names);
      }
      paramStrings.push(name.join("."));
      params.push(param);
    }
  });
  return { paramStrings: paramStrings, params: params };
}

/**
 * Normalizes type names
 * @param {Object[]} names array of type names
 * @return {Object[]} array of type names
 */
export function processTypes(names) {
  names.forEach((name, i) => {
    //format Array.<Obj> -> Obj[]
    if (/Array\.<.*>/.test(name)) {
      let capture = name.match(/Array\.<(.*)>/);
      name = name.replace(/Array\.<.*>/, capture[1] + "[]");
    }
    names[i] = name
      .replace(/obj(ect)?/i, "Object")
      .replace(/arr(ay)?/i, "Array")
      .replace(/bool(ean)?/i, "Boolean")
      .replace(/str(ing)?/i, "String");
  });
  return names;
}

/**
 * Create a url to the repo for the code.
 * @param {type} meta jdoc doc.meta property
 * @return {type} repo url
 */
export function githubUrl(meta, repoUrls) {
  var url = "";
  //For subrepositories will try to match each repoUrl, so that the nested repo url will be returned.
  repoUrls.forEach((repo, i) => {
    let regex = new RegExp(repo.folder + "(.)*");
    url = meta.path.match(regex)
      ? repo.url +
        extract(meta.path, regex) +
        meta.filename +
        "#L" +
        meta.lineno
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
export function extract(string, regex) {
  return string.match(regex)[1];
}
