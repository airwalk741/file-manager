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

        let textValue = "";

        for (let item of linuxText) {
          // const value = item.replaceAll("\n", "\t");
          const value = item;
          textValue += `$ ${linuxInput.value}\n`;
          textValue += `${value}\n`;
          textValue += `================================================\n`;
        }

        linuxResult.value = textValue;

        currentLocation.innerText = data.currentLocation;

        window.location.href = decodeURIComponent(
          `/files/#/${data.currentLocation}`
        );
      }
      linuxInput.value = "";
      endLoading();
    })
    .catch((err) => {
      console.log(err);
      linuxInput.value = "";
      endLoading();
    });
}
