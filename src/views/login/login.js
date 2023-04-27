"use strict";

import { loginInput, loginBtn } from "/views/login/values.js";

import { startLoading, endLoading, startAlert } from "/views/values.js";

window.scrollTo(0, 0);

loginInput.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    e.preventDefault();
    loginBtn.click();
  }

  if (e.keyCode === 32) {
    console.log("test");
    e.returnValue = false;
  }
});

loginBtn.addEventListener("click", async () => {
  const password = loginInput.value.trim();
  if (!password) {
    startAlert(500, "비밀번호를 입력해 주세요.");
    return;
  }

  const res = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      password,
      UUID: window.navigator.userAgent.replace(/\D+/g, ""),
    }),
  });

  if (res.status !== 200) {
    loginInput.value = "";
    startAlert(400, "비밀번호가 틀렸습니다.");
    return;
  }

  const mainUI = document.querySelector(".main-ui");
  const body = document.querySelector("body");
  const loginContainer = document.querySelector(".login-container");
  mainUI.style.visibility = "visible";
  loginContainer.style.display = "none";
  body.style.overflow = "auto";
  loginInput.value = "";
});

async function getUser() {
  const params = {
    UUID: window.navigator.userAgent.replace(/\D+/g, ""),
  };

  const queryString = new URLSearchParams(params);
  const requrl = `/login/?${queryString}`;

  const res = await fetch(requrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  });

  if (res.status === 200) {
    const mainUI = document.querySelector(".main-ui");
    const body = document.querySelector("body");
    const loginContainer = document.querySelector(".login-container");
    mainUI.style.visibility = "visible";
    loginContainer.style.display = "none";
    body.style.overflow = "auto";
    loginInput.value = "";
    return;
  }
  console.log(res.status);
}

getUser();
