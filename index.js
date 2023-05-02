"use strict";

const express = require("express");
const Routes = require("./src/routes/index");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

app.set("views", "src/views");
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/src"));

Routes(app);

let port = 8088; // 기본 포트
let isPort = false;
for (let item of process.argv) {
  if (isPort) {
    port = Number(item);
    break;
  }
  if (item === "-p") {
    isPort = true;
  }
}

app.listen(port, () => {
  console.log(`server is listening at http://localhost:${port}`);
});
