/**
 * JSDoc plugin
 */
import { processParams, processTypes, githubUrl, extract } from "./processing";
import fs from "fs";
import env from "jsdoc/lib/jsdoc/env";

exports.handlers = {
  // parseBegin: function(e) {
  //   console.log("START: ParseBegin function (only used for testing)");
  //   console.log("END: ParseBegin function (only used for testing)");
  // },
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
      count++;
      e.doclet.meta.url = githubUrl(e.doclet.meta, env.opts.repos);
      let regex = new RegExp(env.opts.repos[0]["folder"] + "(.*)");
      e.doclet.meta.repopath = extract(e.doclet.meta.path, regex).replace(/\\/g, "/");
    }
  },
  parseComplete: function(e) {
    // console.log("START: ParseComplete function (only used for testing)");
    // console.log("END: ParseComplete function (only used for testing)");
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
  // dictionary.defineTag("authentication", {
  //   mustHaveValue: true,
  //   onTagged: (doclet, tag) => {
  //     doclet.routeParam = tag.value;
  //   }
  // });
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
