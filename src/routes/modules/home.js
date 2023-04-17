const express = require("express");
const router = express.Router();
const { homeView, typingLinux, windowLoad } = require("../../controllers/home");

const BASE_URL = "/";

module.exports = (app) => {
  // 첫 화면 로드되면 redirect
  router.get("/", (req, res) => {
    res.redirect("/files");
  });

  // hash를 이용해 directory 구분 (query)
  router.get("/files", (req, res) => {
    homeView(req, res);
  });

  // hash 변경시 파일 및 디렉토리 확인
  router.get("/api/load", (req, res) => {
    windowLoad(req, res);
  });

  // 리눅스 명령어 입력
  router.post("/", (req, res) => {
    typingLinux(req, res);
  });

  router.put("/", (req, res) => {});

  router.delete("/", (req, res) => {});

  app.use(BASE_URL, router);
};
