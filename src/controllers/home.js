const { exec } = require("child_process");
const fs = require("fs");
let currentLocation = process.execPath;

let linuxText = [];

// 처음 화면 로드 될때 table 아이템 정의
const windowLoad = (req, res) => {
  const { path } = req.query;

  currentLocation = path;
  const value = `
    cd ${currentLocation}
    ls -a
  `;

  exec(value, async (error, stdout, stderr) => {
    if (error !== null) {
      return res.status(500).json({ error, stderr });
    } else {
      const fileList = [];

      const items = stdout.split("\n");
      items.pop();
      let isError = false;
      const promise = items.map(async (item) => {
        try {
          const stats = fs.statSync(`${currentLocation}/${item}`);
          let data = "";
          if (!stats.isDirectory()) {
            data = fs.readFileSync(`${currentLocation}/${item}`, "utf-8");
          }

          fileList.push({
            folder: stats.isDirectory(),
            name: item,
            size: stats.size,
            mtime: stats.mtime.getTime(),
            data,
            path: `${currentLocation}/${item}`,
          });
        } catch (err) {
          isError = err;
        }
      });
      await Promise.all([...promise]);
      if (isError) {
        return res.status(500).json({ error: isError });
      }
      return res.status(200).json({ stdout, fileList, currentLocation });
    }
  });
};

// 처음 화면 로드
const homeView = (req, res) => {
  linuxText = [];
  exec("pwd", (error, stdout, stderr) => {
    if (error !== null) {
      return res.status(500).json({ error, stderr });
    } else {
      currentLocation = stdout.replace("\n", "");
      return res.render("home", { location: currentLocation });
    }
  });
};

// 리눅스 명령어 입력
const typingLinux = (req, res) => {
  const { text } = req.body;
  if (text.slice(0, 2) === "cd") {
    const value =
      currentLocation === __dirname
        ? `
          ${text}
          pwd
        `
        : `
        cd ${currentLocation} 
        ${text} 
        pwd
        `;
    exec(value, (error, stdout, stderr) => {
      if (error !== null) {
        return res.status(500).json({ error, stderr });
      } else {
        currentLocation = stdout.replace("\n", "");
        linuxText.push(stdout);
        return res.status(200).json({ stdout, currentLocation, linuxText });
      }
    });
  } else {
    const value = `
      cd ${currentLocation}
      ${text}
    `;

    exec(value, (error, stdout, stderr) => {
      if (error !== null) {
        return res.status(500).json({ error, stderr });
      } else {
        linuxText.push(stdout);
        return res.status(200).json({ stdout, currentLocation, linuxText });
      }
    });
  }
};

module.exports = {
  homeView,
  typingLinux,
  windowLoad,
};
