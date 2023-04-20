"use strict";

import {
  linuxBtn,
  linuxInput,
  linuxResult,
  currentLocation,
  startLoading,
  endLoading,
} from "/views/values.js";

linuxBtn.addEventListener("click", ReqLinux);
linuxInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    ReqLinux();
  }
});

linuxResult.addEventListener("keypress", (e) => {
  e.preventDefault();
});

/**
 * 리눅스 명령어 실행
 */
function ReqLinux() {
  const pathLocation = window.location.hash.slice(2);

  if (linuxInput.value === "clear") {
    linuxResult.value = "";
    linuxInput.value = "";
    return;
  }
  startLoading();

  fetch("/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: linuxInput.value,
      pathLocation: pathLocation,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        linuxResult.value += `$ ${linuxInput.value}\n`;
        linuxResult.value += data.stderr;
        linuxResult.value += `================================================\n`;
      } else {
        const { linuxText } = data;

        for (let item of linuxText) {
          // const value = item.replaceAll("\n", "\t");
          const value = item;
          linuxResult.value += `$ ${linuxInput.value}\n`;
          linuxResult.value += `${value}\n`;
          linuxResult.value += `================================================\n`;
        }

        currentLocation.innerText = data.currentLocation;

        window.location.href = decodeURIComponent(
          `/files/#/${data.currentLocation}`
        );
      }
      // input 명령어 초기화 및 textarea 아래로
      linuxInput.value = "";
      linuxResult.scrollTop = linuxResult.scrollHeight;
      endLoading();
    })
    .catch((err) => {
      console.log(err);
      linuxInput.value = "";
      linuxResult.scrollTop = linuxResult.scrollHeight;
      endLoading();
    });
}
