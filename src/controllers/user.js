const { config } = require("../js/config");
const { login_password } = config;

// 한 파일당 한 유저만 접근할 수 있도록 하기 위해 만듦
let usingFile = [];

let loginUser = [];

// 사용자 로그인
const userLogin = (req, res) => {
  const { password, UUID } = req.body;
  try {
    if (login_password === password) {
      loginUser.push(UUID);
      return res.status(200).json();
    } else {
      return res.status(400).json({});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err });
  }
};

// 사용자 로그인 확인
const getUser = (req, res) => {
  const { UUID } = req.query;
  try {
    if (loginUser.includes(UUID)) {
      return res.status(200).json({});
    }

    return res.status(404).json({});
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err });
  }
};

module.exports = {
  userLogin,
  getUser,
};
