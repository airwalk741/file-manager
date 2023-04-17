"use strict";

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

window.addEventListener("load", ReqLoad);

function ReqLinux() {
  fetch("", {
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
        linuxResult.value = data.stdout;
        currentLocation.innerText = data.currentLocation;
      }
      linuxInput.value = "";
      ReqLoad();
    })
    .catch((err) => {
      console.log(err);
    });
}

function ReqLoad() {
  console.log("test");
  fetch("/load", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        linuxResult.value = data.stderr;
      } else {
        const itemList = data.stdout.split("\n");
        itemList.pop();
        const tbody = document.querySelector(".file-list");

        const trList = document.querySelectorAll("tr");

        for (let item of trList) {
          item.remove();
        }

        let tr = "";

        const tableIndex = 6;

        for (let i = 0; i < itemList.length; i++) {
          if (i % tableIndex) {
          } else {
            if (tr) {
              tbody.appendChild(tr);
            }
            tr = document.createElement("tr");
            tr.setAttribute("class", `item${i}`);
          }
          const td = document.createElement("td");
          td.innerText = itemList[i];
          tr.appendChild(td);
        }

        const remain = tableIndex - (itemList.length % tableIndex);
        if (remain) {
          new Array(remain).fill(undefined).map(() => {
            const td = document.createElement("td");
            tr.appendChild(td);
          });
        }
        tbody.appendChild(tr);
      }
      linuxInput.value = "";
    })
    .catch((err) => {
      console.log(err);
    });
}
