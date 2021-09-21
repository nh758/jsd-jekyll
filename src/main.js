/**
 * JSDoc plugin
 */
const {
  processParams,
  processTypes,
  githubUrl,
  extract
} = require("./processing");
const fs = require("jsdoc/fs");
const env = require("jsdoc/env");

exports.handlers = {
  beforeParse: function(e) {
    //Option to tag each file with '@module filename'
    if (env.opts.includeAll) {
      if (new RegExp("@module").test(e.source) == false) {
        try {
          const captures = e.filename.match(/\\(.*)\\(.*)\./);
          const file = captures[2];
          e.source = `/** @module ${file} */` + e.source;
        } catch (err) {
          console.log(err, e);
        }
      }
    }
    if (env.opts.folderCategory) {
      //Option to assign modules to categories based on folder
      if (new RegExp("@module").test(e.source)) {
        const captures = e.filename.match(/\\([^\\]+)\\([^\\]+)\\([^\\]+)\./);
        const moduleName = e.source.match(/(@module +\S*) ?/)[1];
        // const category = captures[2];

        const replace = `${moduleName} \n * @category ${captures[1]}-${captures[2]}`;
        e.source = e.source.replace(/(@module +\S*) ?/, replace);
      }
    }
  },
  jsdocCommentFound: function(e) {
    // Option to fix @function names with name() -> name and tag @description written after a function
    if (env.opts.functionFix) {
      const funRegEx = new RegExp(/@(?:method|function)([^@]+)/);
      const extraRegEx = new RegExp(/(\w+[^@]+\* )(\w+[^@]*)/);
      if (funRegEx.test(e.comment)) {
        let content = e.comment.match(funRegEx)[1];
        content = content.replace(/\(\)/, "");
        let replacement = `@function${content}`;
        if (extraRegEx.test(content)) {
          const split = content.split("*");
          split[1] = ` @description${split[1]}`;
          replacement = `@function${split.join("*")}`;
        }
        e.comment = e.comment.replace(funRegEx, replacement);
      }
    }
  },
  newDoclet: function(e) {
    if (e.doclet.hasOwnProperty("params")) {
      let processed = processParams(e.doclet.params);
      e.doclet.params = processed.params;
      e.doclet.paramStrings = processed.paramStrings;
    }
    if (e.doclet.hasOwnProperty("returns")) {
      e.doclet.returns.forEach((ret, i) => {
        if (ret.hasOwnProperty("type")) {
          e.doclet.returns[i].type.names = processTypes(ret.type.names);
        }
      });
    }
    if (e.doclet.hasOwnProperty("examples")) {
      e.doclet.examples.forEach((example, i) => {
        if (/<caption>(.*)<\/caption>/.test(example)) {
          let caption = example.match(/<caption>(.*)<\/caption>/)[1];
          let code = example.replace(/<caption>.*<\/caption>/, "");
          e.doclet.examples[i] = { caption: caption, code: code };
        } else {
          e.doclet.examples[i] = { code: example };
        }
      });
    }
    if (
      e.doclet.hasOwnProperty("meta") &&
      Array.isArray(env.opts.repos) &&
      env.opts.repos.length > 0
    ) {
      e.doclet.meta.url = githubUrl(e.doclet.meta, env.opts.repos);
      let regex = new RegExp(env.opts.repos[0]["folder"] + "(.*)");
      e.doclet.meta.repopath = extract(e.doclet.meta.path, regex).replace(
        /\\/g,
        "/"
      );
    }
  }
};

exports.defineTags = function(dictionary) {
  dictionary.defineTag("category", {
    mustHaveValue: true,
    onTagged: (doclet, tag) => {
      doclet.category = tag.value;
    }
  });
  //@route {POST} url/route description
  dictionary.defineTag("route", {
    mustHaveValue: true,
    canHaveType: true,
    canHaveName: true,
    onTagged: (doclet, tag) => {
      doclet.route = tag.value;
    }
  });
  dictionary.defineTag("bodyparam", {
    mustHaveValue: true,
    canHaveType: true,
    canHaveName: true,
    onTagged: (doclet, tag) => {
      paramOnTagged(doclet, tag, "bodyParam");
    }
  });
  dictionary.defineTag("headerparam", {
    mustHaveValue: true,
    canHaveType: true,
    canHaveName: true,
    onTagged: (doclet, tag) => {
      paramOnTagged(doclet, tag, "headerParam");
    }
  });
  dictionary.defineTag("routeparam", {
    mustHaveValue: true,
    canHaveType: true,
    canHaveName: true,
    onTagged: (doclet, tag) => {
      paramOnTagged(doclet, tag, "routeParam");
    }
  });
  dictionary.defineTag("queryparam", {
    mustHaveValue: true,
    canHaveType: true,
    canHaveName: true,
    onTagged: (doclet, tag) => {
      paramOnTagged(doclet, tag, "queryParam");
    }
  });
};

/**
 * Common function for saving a tagged param type to the doclet
 *
 * @param {type} doclet the current jsdoc doclet
 * @param {type} tag    the jsdoc tag object
 * @param {type} key    Name of the property of the doclet to save the tag.value to
 */
function paramOnTagged(doclet, tag, key) {
  if (!doclet[key]) {
    doclet[key] = [];
  }
  if (tag.value.hasOwnProperty("type")) {
    tag.value.type.names = processTypes(tag.value.type.names);
  }
  doclet[key].push(tag.value);
}
