"use strict";

let fileList = [];

const currentLocation = document.querySelector("#current-location");
const linuxBtn = document.querySelector(".linux-btn");
const linuxInput = document.querySelector(".linux-input");
const linuxResult = document.querySelector(".linux-result");

linuxBtn.addEventListener("click", ReqLinux);
linuxInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    ReqLinux();
  }
});

/**
 * 첫 화면 로딩시 리다이렉트
 */
window.addEventListener("load", () => {
  if (!window.location.pathname.includes("/files")) {
    window.location.href = decodeURIComponent(
      `/files/#/${currentLocation.textContent}`
    );
  } else {
    currentLocation.textContent = window.location.hash.slice(2);
    ReqLoadItem();
  }
});

function locationHashChanged(e) {
  ReqLoadItem();
}

window.onhashchange = locationHashChanged;

/**
 * 리눅스 명령어 실행
 */
function ReqLinux() {
  fetch("/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: linuxInput.value,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        linuxResult.value = data.stderr;
      } else {
        const { linuxText } = data;

        let textValue = "";

        for (let item of linuxText) {
          const value = item.replaceAll("\n", "\t");
          textValue += `$ ${value}\n`;
          textValue += `================================================\n`;
        }

        linuxResult.value = textValue;

        currentLocation.innerText = data.currentLocation;

        window.location.href = decodeURIComponent(
          `/files/#/${data.currentLocation}`
        );
      }
      linuxInput.value = "";
    })
    .catch((err) => {
      console.log(err);
    });
}

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
        const { fileList } = data;
        const itemList = data.stdout.split("\n");
        itemList.pop();
        const tbody = document.querySelector(".file-list");

        const trList = document.querySelectorAll("tbody > tr");

        for (let item of trList) {
          item.remove();
        }
        fileList
          .filter((item) => !(item.name === "." || item.name === ".."))
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
      linuxInput.value = "";
      fileList = fileList.filter(
        (item) => !(item.name === "." || item.name === "..")
      );
    })
    .catch((err) => {
      console.log(err);
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

function readFile(file) {
  console.log(file);
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
