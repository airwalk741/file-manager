"use strict";

const express = require("express");
const router = express.Router();
const {
  homeView,
  typingLinux,
  windowLoad,
  updateFile,
  updateConfigTxt,
  openUserFile,
} = require("../../controllers/home");
const { userLogin, getUser } = require("../../controllers/user");

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

  // 파일 연 사람 등록
  router.post("/files", (req, res) => {
    openUserFile(req, res);
  });

  // 파일 변경
  router.put("/files", (req, res) => {
    updateFile(req, res);
  });

  // hash 변경시 파일, 디렉토리 찾기
  router.get("/api/load", (req, res) => {
    windowLoad(req, res);
  });

  // 리눅스 명령어 입력
  router.post("/", (req, res) => {
    typingLinux(req, res);
  });

  // config.txt 수정
  router.put("/config", (req, res) => {
    updateConfigTxt(req, res);
  });

  // 유저 로그인
  router.post("/login", (req, res) => {
    userLogin(req, res);
  });

  // 유저 확인 (로그인 후 새로고침시 로그인 폼 방지)
  router.get("/login", (req, res) => {
    getUser(req, res);
  });

  app.use(BASE_URL, router);
};
