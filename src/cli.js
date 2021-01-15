/**
 * CLI tool for copying files jeykll files from ./jekyll/
 */
import arg from "arg";
import async from "async";
import path from "path";
import fs from "fs-extra";
import { Toggle } from "enquirer";

function parseArgs(rawArgs) {
  const args = arg(
    {
      "--force": Boolean,
      "--all": Boolean,
      "--destination": String,
      "-i": "--init",
      "-a": "--all",
      "-d": "--destination"
    },
    {
      argv: rawArgs.slice(2)
    }
  );
  return {
    all: args["--all"],
    destination: args["--destination"],
    force: args["--force"]
  };
}

export async function cli(args) {
  args = parseArgs(args);
  var tasks = {};
  if (!args.destination) {
    console.error(
      "Please include a destination (ex. create --destination ./docs/)"
    );
    return false;
  }

  if (!args.all) {
    if (await toggle("Use default settings?", "yes", "no")) {
      args.all = true;
    } else {
      console.log("\nSelect which Jekyll files and folders to include:");
      tasks.includes = await toggle("_includes folder");
      tasks.layouts = await toggle("_layouts folder");
      tasks.config = await toggle("_config.yml");
      tasks.gemfile = await toggle("gemfile");
      tasks.index = await toggle("index.md");
      tasks.api = await toggle("api.md");
      console.log(JSON.stringify(tasks));
    }
  }
  executeTasks(args, tasks);
}

async function toggle(message, enabled = "include", disabled = "exclude") {
  let answer;
  await new Toggle({
    message: message,
    //Switched enabled/disabled labels so 'include' is the default. Return !answer
    enabled: disabled,
    disabled: enabled,
    default: "enabled"
  })
    .run()
    .then(a => (answer = a))
    .catch(console.error);
  //Return inverse because labels switched. See above comment
  return !answer;
}

function executeTasks(args, tasks) {
  var destination = args.destination;
  fs.mkdirsSync(destination);
  if (args.all) {
    fs.copySync(path.normalize(__dirname + "/../jekyll/"), destination);
  } else {
    tasks.includes &&
      fs.copySync(
        path.normalize(__dirname + "/../jekyll/_includes/"),
        destination + "_includes/"
      );
    tasks.layouts &&
      fs.copySync(
        path.normalize(__dirname + "/../jekyll/_layouts/"),
        destination + "_layouts/"
      );
    tasks.config &&
      fs.copySync(
        path.normalize(__dirname + "/../jekyll/_config.yml"),
        destination + "_config.yml"
      );
    tasks.gemfile &&
      fs.copySync(
        path.normalize(__dirname + "/../jekyll/gemfile"),
        destination + "gemfile"
      );
    tasks.index &&
      fs.copySync(
        path.normalize(__dirname + "/../jekyll/index.md"),
        destination + "index.md"
      );
    tasks.api &&
      fs.copySync(
        path.normalize(__dirname + "/../jekyll/api.md"),
        destination + "api.md"
      );
  }
}
