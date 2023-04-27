"use strict";

const { exec, spawn } = require("child_process");
const fs = require("fs");

// javascript exec가 위치(경로)를 저장하지 못합니다. (exec 실행 끝나면 서버 실행 경로로 돌아갑니다.)
// 저장된 위치를 먼저 이동한 후 text로 입력된 리눅스 명령어를 실행해야합니다.
// example
// cd [저장된 경로] && ls
// 서버 시작 경로
let currentLocation = process.execPath;

let linuxText = [];

// table 아이템 정의
const windowLoad = (req, res) => {
  const { path, spacing } = req.query;
  const pathLocation = decodeURIComponent(path).replace("/c/", "C:/");
  const decodeSpace = decodeURIComponent(spacing);
  let value = "";
  if (decodeSpace === "true") {
    value = `cd "${pathLocation}" && ls`;
  } else {
    value = `cd ${pathLocation} && ls`;
  }

  // 실행코드 (ls -a)
  exec(value, async (error, stdout, stderr) => {
    if (error !== null) {
      console.log(error);
      return res.status(500).json({ error, stderr });
    } else {
      const fileList = [];
      const items = stdout.split("\n");
      items.pop();
      let isError = false;
      const promise = items.map(async (item) => {
        try {
          let data = "";
          const stats = fs.statSync(`${pathLocation}/${item}`);
          if (!stats.isDirectory() && stats.size < 1024 * 300) {
            data = fs.readFileSync(`${pathLocation}/${item}`, "utf-8");
          }
          if (data.includes("login_password")) return;

          fileList.push({
            folder: stats.isDirectory(),
            name: item,
            size: stats.size,
            mtime: stats.mtime.getTime(),
            data,
            path: `${pathLocation}/${item}`,
          });
        } catch (err) {
          isError = err;
        }
      });
      await Promise.all([...promise]);
      if (isError) {
        console.log(isError);
        // return res.status(500).json({ error: isError });
      }
      return res
        .status(200)
        .json({ stdout, fileList, currentLocation: pathLocation });
    }
  });
};

// 처음 화면 로드
const homeView = (req, res) => {
  linuxText = [];
  exec("pwd", (error, stdout, stderr) => {
    if (error !== null) {
      console.log(error);
      return res.status(500).json({ error, stderr });
    } else {
      currentLocation = stdout.replace("\n", "").replace("/c/", "C:/");
      return res.render("home", { location: currentLocation });
    }
  });
};

// 리눅스 명령어 입력 (cd와 아닐때 구분)
const typingLinux = (req, res) => {
  const { text, pathLocation } = req.body;

  if (text.slice(0, 2) === "cd") {
    let value = "";

    value =
      pathLocation === __dirname
        ? `${text} && pwd`
        : `cd ${pathLocation.replace("/c/", "C:/")} && ${text} && pwd`;
    exec(value, (error, stdout, stderr) => {
      if (error !== null) {
        console.log(error);
        return res.status(500).json({ error, stderr });
      } else {
        const nextLocation = stdout.replace("\n", "");
        linuxText.push(stdout);
        return res
          .status(200)
          .json({ stdout, currentLocation: nextLocation, linuxText });
      }
    });
  } else {
    const value = `cd "${pathLocation.replace("/c/", "C:/")}" && ${text}`;
    exec(value, (error, stdout, stderr) => {
      if (error !== null) {
        console.log(error);
        return res.status(500).json({ error, stderr });
      } else {
        linuxText.push(stdout);
        return res
          .status(200)
          .json({ stdout, currentLocation: pathLocation, linuxText });
      }
    });
  }
};

// 파일 수정하기
const updateFile = (req, res) => {
  const data = req.body;

  const {
    text,
    file: { path },
  } = data;

  try {
    fs.writeFileSync(`${path}`, text);
    return res.status(200).json();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err });
  }
};

// config.txt 수정
const updateConfigTxt = (req, res) => {
  const { resultText, file } = req.body;

  try {
    fs.writeFileSync(`${file.path}`, resultText);
    return res.status(200).json();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err });
  }
};

module.exports = {
  homeView,
  typingLinux,
  windowLoad,
  updateFile,
  updateConfigTxt,
};
