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

let fileList = [];
let targetFile = "";

fileUpdateBtn.addEventListener("click", () => {
  if (!targetFile) return;
  startLoading();
  fetch("/files", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: fileUpdateText.value,
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
              data: fileUpdateText.value,
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

fileCanceleBtn.addEventListener("click", () => {
  if (targetFile) {
    console.log(targetFile.data);
    fileUpdateText.value = targetFile.data;
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
  if (!window.location.pathname.includes("/files/")) {
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

  const params = {
    path: hash,
  };

  const queryString = new URLSearchParams(params).toString();
  const requrl = `/api/load/?${queryString}`;
  startLoading();
  fetch(requrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
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

// 파일 읽기
function readFile(file) {
  targetFile = file;
  fileUpdateText.value = file.data;
  fileUpdateName.textContent = file.name;
}

// 파일 시간
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

// 파일 사이즈 계산
function getByteSize(size) {
  const byteUnits = ["KB", "MB", "GB", "TB"];

  for (let i = 0; i < byteUnits.length; i++) {
    size = Math.floor(size / 1024);

    if (size < 1024) return size.toFixed(1) + byteUnits[i];
  }
}

//테이블 그리기
function drawTable() {
  const tbody = document.querySelector(".file-list");

  const trList = document.querySelectorAll("tbody > tr");

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
        typetd.style.color = "blue";
      } else {
        nametd.addEventListener("click", () => {
          readFile(item);
        });
      }

      nametd.setAttribute("class", "file-name");

      tr.appendChild(indextd);
      tr.appendChild(typetd);
      tr.appendChild(nametd);
      tr.appendChild(sizetd);
      tr.appendChild(timetd);

      tbody.appendChild(tr);
    });
}
