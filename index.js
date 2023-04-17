"use strict";
const express = require("express");
const Routes = require("./src/routes/index");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("views", "src/views");
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/src"));

Routes(app);

const port = 8088;

app.listen(port, () => {
  console.log(`server is listening at http://localhost:${port}`);
});
