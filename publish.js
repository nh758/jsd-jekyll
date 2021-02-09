/**
 * A JSDoc Template - writes .md files for each module and saves json data for jekyll to use building the pages.
 */
const fs = require("fs-extra");
const yaml = require("js-yaml");
const logger = require("jsdoc/util/logger");
/*Which Jekyll layout to use*/
const moduleLayout = "module";

exports.publish = function(data, opts) {
  const destination = opts.destination;
  const categories = [];
  const docs = data()
    .get()
    .filter(function(doc) {
      return !doc.undocumented;
    });

  fs.mkdirsSync(destination + "modules/");
  let skips = 0;
  docs.forEach((doc, i) => {
    if (doc.kind === "module") {
      let data = {};
      data.title = doc.name;
      data.layout = moduleLayout;
      data.mod = doc.longname;
      data.category = doc.hasOwnProperty("category") ? doc.category : "api";
      !categories.includes(data.category) && categories.push(data.category);
      const yamlStr = yaml.safeDump(data);
      try {
        fs.writeFileSync(
          destination + "modules/" + doc.name.replace("/", "-") + ".md",
          "---\n" + yamlStr + "---",
          { flag: "wx" }
        );
      } catch (e) {
        if (e.code === "EEXIST") {
          skips++;
        } else {
          logger.warn(
            "Cannot write file: " +
              destination +
              "modules/" +
              doc.name.replace("/", "-") +
              ".md (" +
              doc.meta.filename +
              ")"
          );
        }
      }
    }
  });
  //Write the jsdoc.json datafile
  fs.mkdirsSync(destination + "_data/");
  fs.writeFileSync(
    destination + "_data/jsdoc.json",
    JSON.stringify({ docs: docs }, null, 2)
  );

  //Copy static files
  copyDirectory("static", destination);

  //Save category pages
  categories.forEach((category, i) => {
    let data = {};
    data.title = category;
    data.layout = "index";
    data.is_category = category;
    data.category = "api";
    let yamlStr = yaml.safeDump(data);
    try {
      fs.writeFileSync(
        destination + "modules/" + category + ".md",
        "---\n" + yamlStr + "---",
        { flag: "wx" }
      );
    } catch (e) {
      skips++;
    }
  });
  // if (skips > 0) {
    // logger.warn(`Skipped creating ${skips} existing files`);
  // }
};

/**
 * Recursively copy a directory without overwriting individual files.
 * @param {String} directory source directory to copy from
 * @param {String} destination destination directory to copy into
 */
function copyDirectory(directory, destination) {
  fs.mkdirsSync(destination);
  let fp = __dirname + "/" + directory;
  let contents = fs.readdirSync(fp);
  contents.forEach(item => {
    const stat = fs.statSync(fp + "/" + item);
    if (stat.isDirectory()) {
      copyDirectory(directory + "/" + item, destination + "/" + item);
    } else {
      fs.copySync(fp + "/" + item, destination + "/" + item, {
        overwrite: false
      });
    }
  });
}
