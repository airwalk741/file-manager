const { exec } = require("child_process");
let currentLocation = process.execPath;

const windowLoad = (req, res) => {
  const value = `
    cd ${currentLocation}
    ls -a
  `;

  exec(value, (error, stdout, stderr) => {
    if (error !== null) {
      return res.status(500).json({ error, stderr });
    } else {
      return res.status(200).json({ stdout, currentLocation });
    }
  });
};

const homeView = (req, res) => {
  exec("pwd", (error, stdout, stderr) => {
    if (error !== null) {
      return res.status(500).json({ error, stderr });
    } else {
      currentLocation = stdout;
      return res.render("home", { location: currentLocation });
    }
  });
};

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
        currentLocation = stdout;
        return res.status(200).json({ stdout, currentLocation });
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
        return res.status(200).json({ stdout, currentLocation });
      }
    });
  }
};

module.exports = {
  homeView,
  typingLinux,
  windowLoad,
};
