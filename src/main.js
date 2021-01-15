/**
 * JSDoc plugin
 */
import { processParams, processTypes, githubUrl, extract } from "./processing";
import fs from "fs";
import env from "jsdoc/lib/jsdoc/env";
// import env from "../../app_builder/node_modules/jsdoc/lib/jsdoc/env";

exports.handlers = {
  parseBegin: function(e) {
    console.log("START: ParseBegin function (only used for testing)");
    console.log("env");
    console.log(env);
    console.log("END: ParseBegin function (only used for testing)");
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
    if (e.doclet.hasOwnProperty("meta") && Array.isArray(env.opts.repoUrls)) {
      e.doclet.url = githubUrl(e.doclet.meta, env.opts.repoUrls);
      let regex = new RegExp(env.opts.repoUrls[0]["folder"] + "(.*)");
      e.doclet.meta.path = extract(e.doclet.meta.path, regex);
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
      doclet.bodyParam = tag.value;
    }
  });
  dictionary.defineTag("headerparam", {
    mustHaveValue: true,
    canHaveType: true,
    canHaveName: true,
    onTagged: (doclet, tag) => {
      doclet.headerParam = tag.value;
    }
  });
  dictionary.defineTag("routeparam", {
    mustHaveValue: true,
    canHaveType: true,
    canHaveName: true,
    onTagged: (doclet, tag) => {
      doclet.routeParam = tag.value;
    }
  });
  dictionary.defineTag("queryparam", {
    mustHaveValue: true,
    canHaveType: true,
    canHaveName: true,
    onTagged: (doclet, tag) => {
      doclet.queryParam = tag.value;
    }
  });
  dictionary.defineTag("authentication", {
    mustHaveValue: true,
    onTagged: (doclet, tag) => {
      doclet.routeParam = tag.value;
    }
  });
};
