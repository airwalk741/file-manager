"use strict";

// location
export const currentLocation = document.querySelector("#current-location");

// file select and search
export const tableSearchInput = document.querySelector(".table-search-input");
export const folderFileSelect = document.querySelector(".folder-file-select");

// file update
export const fileUpdateText = document.querySelector(".file-update-text");
export const fileUpdateName = document.querySelector(".update-file-name");
export const fileUpdateBtn = document.querySelector(".file-update-btn");
export const fileCanceleBtn = document.querySelector(".file-cancel-btn");

// alert
export const alertPrimary = document.querySelector(".alert-primary");
export const alertDanger = document.querySelector(".alert-danger");

// linux
export const linuxBtn = document.querySelector(".linux-btn");
export const linuxInput = document.querySelector(".linux-input");
export const linuxResult = document.querySelector(".linux-result");

//loading
const loading = document.querySelector(".layerPopup");

/**
 * 로딩스피너 시작
 */
export const startLoading = () => {
  loading.style.display = "block";
};

/**
 * 로딩스피너 끝
 */
export const endLoading = () => {
  loading.style.display = "none";
};

/**
 * 메세지
 * @param {number} status 200 ok else err
 */
export const startAlert = (status, text) => {
  if (status === 200) {
    alertPrimary.style.display = "block";
    alertPrimary.textContent = text;
    setTimeout(() => {
      alertPrimary.style.display = "none";
    }, 1500);
  } else {
    alertDanger.style.display = "block";
    alertDanger.style.display = "block";
    alertDanger.textContent = text;
    setTimeout(() => {
      alertDanger.style.display = "none";
    }, 1500);
  }
};
