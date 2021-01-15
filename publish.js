/**
 * A JSDoc Template - write .md files for each module and save json data for jekyll to use building the pages.
 */
const fs = require("fs-extra");
const yaml = require("js-yaml");
const logger = require("jsdoc/util/logger");
const moduleLayout = "module";

exports.publish = function(data, opts) {
  const destination = opts.destination;
  var docs = data()
    .get()
    .filter(function(doc) {
      return !doc.undocumented;
    });

  fs.mkdirsSync(destination + "modules/");

  docs.forEach((doc, i) => {
    if (doc.kind === "module") {
      let data = {};
      data.title = doc.name;
      data.layout = moduleLayout;
      data.mod = doc.longname;
      data.category = doc.hasOwnProperty("category") ? doc.category : "api";
      let yamlStr = yaml.safeDump(data);
      try {
        fs.writeFileSync(
          destination + "modules/" + doc.name.replace("/", "-") + ".md",
          "---\n" + yamlStr + "---"
        );
      } catch (e) {
        logger.warn(
          "Cannot write file: " +
            destination +
            "modules/" +
            doc.name.replace("/", "-") +
            ".md"
        );
      }
    }
  });
  fs.mkdirsSync(destination + "_data/");
  fs.writeFileSync(
    destination + "_data/jsdoc.json",
    JSON.stringify({ docs: docs }, null, 2)
  );
};
