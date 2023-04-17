const express = require("express");
const router = express.Router();
const { homeView, typingLinux, windowLoad } = require("../../controllers/home");

const BASE_URL = "/";

module.exports = (app) => {
  router.get("/", (req, res) => {
    homeView(req, res);
  });

  router.get("/load", (req, res) => {
    windowLoad(req, res);
  });

  router.post("/", (req, res) => {
    typingLinux(req, res);
  });

  router.put("/", (req, res) => {});

  router.delete("/", (req, res) => {});

  app.use(BASE_URL, router);
};
