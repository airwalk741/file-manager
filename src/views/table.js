"use strict";
import {
  currentLocation,
  tableSearchInput,
  folderFileSelect,
  fileUpdateText,
  fileUpdateName,
  fileUpdateBtn,
  fileCanceleBtn,
  alertDanger,
  startLoading,
  endLoading,
  startAlert,
} from "/views/values.js";

import { configParsing } from "/views/config/config.js";

export let fileList = [];
let targetFile = "";
let editor = CodeMirror.fromTextArea(fileUpdateText, {
  lineNumbers: true, //왼쪽 라인넘버 표기
  lineWrapping: true, //줄바꿈. 음.. break-word;
  theme: "darcula", //테마는 맘에드는 걸로.
  // mode: "text/x-sql", //모드는 sql 모드
  value: fileUpdateText.value,
});

// // 파일 선택 안했으면 입력 안하게
// fileUpdateText.addEventListener("keypress", (e) => {
//   if (!targetFile) {
//     e.preventDefault();
//   }
// });

// 파일 선택 안했으면 입력 못하도록
editor.on("keypress", (_, e) => {
  if (!targetFile) {
    e.preventDefault();
  }
});

// 수정하기
fileUpdateBtn.addEventListener("click", () => {
  if (!targetFile) return;
  startLoading();
  fetch("/files", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      text: editor.getValue(),
      file: targetFile,
    }),
  })
    .then((res) => {
      const { status } = res;
      if (status === 200) {
        fileList = fileList.map((file) => {
          if (file.path === targetFile.path) {
            return {
              ...targetFile,
              data: editor.getValue(),
            };
          }
          return file;
        });
        drawTable();
        startAlert(200);
      } else {
        startAlert(500);
      }
      endLoading();
    })
    .catch((err) => {
      console.log(err);
      alertDanger.style.display = "block";
      setTimeout(() => {
        alertDanger.style.display = "none";
      }, 1500);
      endLoading();
    });
});

// 취소하기
fileCanceleBtn.addEventListener("click", () => {
  if (targetFile) {
    fileUpdateText.value = "";
    targetFile = "";
    fileUpdateName.textContent = "";
    // console.log(targetFile.data);
    editor.getDoc().setValue("");
  }
});

// linux
const linuxResult = document.querySelector(".linux-result");
const linuxInput = document.querySelector(".linux-input");

tableSearchInput.addEventListener("input", () => {
  drawTable();
});

folderFileSelect.addEventListener("change", () => {
  drawTable();
});

/**
 * 첫 화면 로딩시 리다이렉트
 */
window.addEventListener("load", () => {
  if (!window.location.hash) {
    window.location.href = decodeURIComponent(
      `/files/#/${currentLocation.textContent}`
    );
  } else {
    currentLocation.textContent = decodeURIComponent(
      window.location.hash.slice(2)
    );
    ReqLoadItem();
  }
});

/**
 * URL 현경 추적
 * @param {*} e
 */
function locationHashChanged(e) {
  currentLocation.innerText = decodeURIComponent(window.location.hash.slice(2));
  ReqLoadItem();
}

window.onhashchange = locationHashChanged;

/**
 * 아이템 가져오기
 */
function ReqLoadItem() {
  const hash = window.location.hash.slice(2);
  const decode = decodeURIComponent(hash);
  const korean = /\s/g;
  const params = {
    path: decode,
    spacing: korean.test(decode),
  };

  const queryString = new URLSearchParams(params);
  const requrl = `/api/load/?${queryString}`;
  startLoading();
  fetch(requrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    params: {},
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        linuxResult.value = data.stderr;
      } else {
        fileList = data.fileList;
        fileList = fileList.filter(
          (item) => !(item.name === "." || item.name === "..")
        );
        drawTable();
      }
      linuxInput.value = "";
      endLoading();
    })
    .catch((err) => {
      console.log(err);
      endLoading();
    });
}

/**
 * 경로 이동 및 아이템 가져오기
 * @param {*} directory 경로
 */
function goDirectory(directory) {
  window.location.href = decodeURIComponent(`/files/#/${directory.path}`);
  ReqLoadItem();
}

/**
 * 파일 선택
 * config 파일이면 config 관련, 아니면 그냥 text
 * @param {*} file
 */
function readFile(file) {
  if (file.data) {
    configParsing(file.data, file);
    targetFile = file;
    fileUpdateText.value = file.data;
    // console.log(file.data);
    fileUpdateName.textContent = file.name;
    editor.getDoc().setValue(fileUpdateText.value);
    editor.setSize("100%", "100%");
  }
}

/**
 * 파일의 시간구하기
 * @param {날짜관련} data
 * @returns
 */
function currentDate(data) {
  const resUtc = new Date(data);
  const year = resUtc.getFullYear();
  const month = ("0" + (resUtc.getMonth() + 1)).slice(-2);
  const date = ("0" + resUtc.getDate()).slice(-2);

  const hours = ("0" + resUtc.getHours()).slice(-2);
  const minutes = ("0" + resUtc.getMinutes()).slice(-2);
  const seconds = ("0" + resUtc.getSeconds()).slice(-2);

  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}

/**
 * 파일 사이즈 고르기
 * @param {number} size 계산할 사이즈
 * @returns
 */
function getByteSize(size) {
  var hz;
  if (size < 1024) hz = size + " B";
  else if (size < 1024 * 1024) hz = (size / 1024).toFixed(2) + " KB";
  else if (size < 1024 * 1024 * 1024)
    hz = (size / 1024 / 1024).toFixed(2) + " MB";
  else hz = (size / 1024 / 1024 / 1024).toFixed(2) + " GB";
  return hz;
}

/**
 * 상단 테이블 그리기
 */
function drawTable() {
  const tbody = document.querySelector(".file-list");

  const trList = document.querySelectorAll(".file-list > tr");

  for (let item of trList) {
    item.remove();
  }
  fileList
    .filter((item) => {
      const select = Number(folderFileSelect.value);

      if (select === 1) {
        return true;
      } else if (select === 2) {
        return item.folder;
      } else {
        return !item.folder;
      }
    })
    .filter((item) => {
      const input = tableSearchInput.value.toUpperCase();
      const fileName = item.name.toUpperCase();
      if (input) {
        return fileName.includes(input);
      } else {
        return true;
      }
    })
    .map((item, index) => {
      const tr = document.createElement("tr");
      const indextd = document.createElement("td");
      const typetd = document.createElement("td");
      const nametd = document.createElement("td");
      const sizetd = document.createElement("td");
      const timetd = document.createElement("td");

      indextd.innerText = index + 1;
      typetd.innerText = item.folder ? "폴더" : "파일";
      nametd.innerText = item.name;
      sizetd.innerText = getByteSize(item.size);
      timetd.innerText = currentDate(item.mtime);

      if (item.folder) {
        nametd.addEventListener("click", () => {
          goDirectory(item);
        });
        typetd.setAttribute("class", "folder-color");
      } else {
        if (item.data) {
          nametd.addEventListener("click", () => {
            readFile(item);
          });
        }
      }

      if (item.data || item.folder) {
        nametd.setAttribute("class", "file-name");
      }

      tr.appendChild(indextd);
      tr.appendChild(typetd);
      tr.appendChild(nametd);
      tr.appendChild(sizetd);
      tr.appendChild(timetd);

      tbody.appendChild(tr);
    });
}

/**
 * config 파일 변경했으면 상단 테이블 다시 그리기
 * @param {*} newData 변경된 fileList
 */
export function updateNewFileList(newData) {
  fileList = newData;
  drawTable();
}
