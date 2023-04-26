const fs = require("fs");
const path = require("path");

let config;

const exec = process.argv[0].split("/");

if (
  process.env.NODE_ENV !== "develop" &&
  !exec[exec.length - 1].includes("node")
) {
  const serverPath = process.execPath.split("/");
  serverPath.pop();
  const configFileName = serverPath.join("/") + "/config/config.json";
  let rawdata = fs.readFileSync(configFileName);
  config = JSON.parse(rawdata);
} else {
  config = require(path.join(process.cwd(), "/config/config.json"));
}

module.exports = {
  config,
};
