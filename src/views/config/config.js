"use strict";

import {
  deviceInfosTableBody,
  deviceListContainer,
  configFileInfoBtnContainer,
  configContainer,
} from "/views/config/config.values.js";

import { startLoading, endLoading, startAlert } from "/views/values.js";

import { fileList, updateNewFileList } from "/views/table.js";
let targetParsingText = {};

/**
 * config 파일 읽기
 * @param {*} text 파일의 text
 * @param {*} file 파일
 */
export const configParsing = (text, file) => {
  const defaultFile = document.querySelector(".test");
  try {
    defaultFile.style.display = "none";
    defaultFile.style.position = "absolute";
    configFileInfoBtnContainer.style.display = "block";

    const data = parsingText(text, file);

    makeInfoHTml(data);
    targetParsingText = data;
  } catch (err) {
    // 에러나면 config 파일이 아니므로 그냥 파일 text 열기
    console.log(err);
    defaultFile.style.display = "block";
    defaultFile.style.position = "relative";
    configFileInfoBtnContainer.style.display = "none";
    configContainer.style.display = "none";
    deviceInfosTableBody.replaceChildren();
    deviceListContainer.replaceChildren();
  }
};

/**
 * text 바꾸기 (사용 안함)
 * @param {*} data
 */
export const configToText = (data) => {
  let resultText = "";
  // title
  resultText += `${data.title}:`;

  // PCBIP
  resultText += `PCBIP${data.PCBIP}:`;

  // sensor
  resultText += `S${data.sensorUnit}:`;

  // Device List
  for (let i = 1; i < data.deviceList.length + 1; i++) {
    const { DeviceName, PTPoints, TVPoints } = data.deviceList[i - 1];
    resultText += `Q${i}${DeviceName}/Q${i}PT/${PTPoints.join(
      ";"
    )}/Q${i}TV/${TVPoints.join(";")}:`;
  }

  // Frame
  resultText += `F${("0" + data.frameRate.toString()).slice(-2)}00:`;

  // address
  resultText += `${data.address};`;

  // building
  resultText += `Building,${data.building};`;

  // floor
  resultText += `Floor,${data.floor};`;

  // Panel
  resultText += `Panel,${data.panel}`;
};

/**
 * config 파일이면 html 만들기
 * @param {*} data
 */
export const makeInfoHTml = (data) => {
  const {
    title,
    PCBIP,
    sensorUnit,
    deviceList,
    frameRate,
    address,
    building,
    floor,
    panel,
    text,
    file,
  } = data;

  configFileInfoBtnContainer.replaceChildren();
  deviceInfosTableBody.replaceChildren();
  deviceListContainer.replaceChildren();
  configContainer.style.display = "block";

  // 파일 이름, 수정, 취소
  const infoBtnContainer = createHtml("div");
  infoBtnContainer.setAttribute(
    "class",
    "d-flex justify-content-between align-items-center pb-3"
  );

  const fileNameSpan = createHtml("span");
  fileNameSpan.textContent = `File: ${file.name}`;

  const btnContainer = createHtml("div");
  const updateBtn = createHtml("button");
  updateBtn.textContent = "수정";
  updateBtn.setAttribute(
    "class",
    "btn btn-primary config-file-update-btn btn-sm me-3"
  );

  const cancelBtn = createHtml("button");
  cancelBtn.textContent = "취소";
  cancelBtn.setAttribute(
    "class",
    "btn btn-danger config-file-cancel-btn btn-sm"
  );

  cancelBtn.addEventListener("click", () => {
    cancelInfoBtnClick(text, file);
  });

  updateBtn.addEventListener("click", () => {
    updateFileInfo(data, file);
  });

  appendChildHtml(btnContainer, [updateBtn, cancelBtn]);
  appendChildHtml(infoBtnContainer, [fileNameSpan, btnContainer]);
  appendChildHtml(configFileInfoBtnContainer, [infoBtnContainer]);
  /////////////

  const info_first_tr = createHtml("tr");
  const info_second_tr = createHtml("tr");
  const info_third_tr = createHtml("tr");

  // PCBIP
  const [PCBIP_td, PCBIP_vaule_td] = makeTableTd(false, "PCBIP", PCBIP);

  // sensorUnit
  const [sensorUnit_td, sensorUnit_vaule_td] = makeTableTd(
    false,
    "센서 갯수",
    sensorUnit
  );

  // frameRate
  const [frameRate_td, frameRate_vaule_td] = makeTableTd(
    true,
    "Frame Rate (fps)",
    frameRate,
    "frame"
  );

  appendChildHtml(info_first_tr, [
    PCBIP_td,
    PCBIP_vaule_td,
    sensorUnit_td,
    sensorUnit_vaule_td,
    frameRate_td,
    frameRate_vaule_td,
  ]);

  ////

  // panel
  const [panel_td, panel_vaule_td] = makeTableTd(true, "Panel", panel, "panel");

  // building
  const [building_td, building_vaule_td] = makeTableTd(
    true,
    "Building",
    building,
    "building"
  );

  // floor
  const [floor_td, floor_vaule_td] = makeTableTd(true, "Floor", floor, "floor");

  appendChildHtml(info_second_tr, [
    panel_td,
    panel_vaule_td,
    building_td,
    building_vaule_td,
    floor_td,
    floor_vaule_td,
  ]);

  ///

  // address
  const [address_td, address_vaule_td] = makeTableTd(
    true,
    "설치장소",
    address,
    "address"
  );
  address_vaule_td.setAttribute("colSpan", "5");

  appendChildHtml(info_third_tr, [address_td, address_vaule_td]);

  //
  appendChildHtml(deviceInfosTableBody, [
    info_first_tr,
    info_second_tr,
    info_third_tr,
  ]);

  for (let i = 0; i < deviceList.length; i++) {
    const { DeviceName, PTPoints, TVPoints } = deviceList[i];

    const hr = document.createElement("hr");
    deviceListContainer.appendChild(hr);

    // device name
    const deviceNameDivItem = document.createElement("div");
    deviceNameDivItem.setAttribute("class", " p-4");

    const deviceNameDivCol = document.createElement("div");
    deviceNameDivCol.setAttribute("class", "col-6");

    const deviceNameTable = document.createElement("table");
    deviceNameTable.setAttribute("class", "table table-bordered");

    const deviceNameTableBody = document.createElement("tbody");
    deviceNameTableBody.setAttribute("class", "text-center");

    const deviceNameTableTr = document.createElement("tr");
    const [DeviceNameTd, DeviceNameTdValue] = makeTableTd(
      false,
      `Q${i + 1} Device ID`,
      DeviceName
    );

    deviceNameTableTr.appendChild(DeviceNameTd);
    deviceNameTableTr.appendChild(DeviceNameTdValue);
    deviceNameTableBody.appendChild(deviceNameTableTr);
    deviceNameTable.appendChild(deviceNameTableBody);
    deviceNameDivCol.appendChild(deviceNameTable);
    deviceNameDivItem.appendChild(deviceNameDivCol);
    deviceListContainer.appendChild(deviceNameDivItem);

    const pointRow = createHtml("div");
    pointRow.setAttribute("class", "row");

    /////////////////////////////
    // PT poinsts
    makePointTable(i, PTPoints, 2, pointRow, i, text, file, data);

    ///////////////////////////////
    // 9 point & 온도
    makePointTable(i, TVPoints, 3, pointRow, i, text, file, data);

    deviceListContainer.appendChild(pointRow);
  }
};

/**
 *
 * 테이블 값 만들기
 * @param {*} isInput input html 사용할건지
 * @param {*} title 제목
 * @param {*} data 값
 * @param {*} id input id 값
 * @returns
 */
function makeTableTd(isInput, title, data, id) {
  if (isInput) {
    const td = document.createElement("td");
    td.textContent = title;
    const td_value = document.createElement("td");
    const td_value_input = document.createElement("input");
    td_value.appendChild(td_value_input);
    td_value_input.setAttribute("class", "form-control");
    td_value_input.setAttribute("id", `${id}-input`);
    td_value_input.value = data;

    return [td, td_value];
  } else {
    const td = document.createElement("td");
    td.textContent = title;
    const td_value = document.createElement("td");
    td_value.textContent = data;

    return [td, td_value];
  }
}

/**
 * 포인트 값으로 input 만들기
 * @param {*} data point 값
 * @param {*} count 온도인지 아닌지
 * @param {*} i 0 ~ 8 좌표
 * @param {*} id x, y, z 인지
 * @param {*} deviceIndex x, y, z 인지
 * @returns
 */
function makePointTd(data, count, i, id, deviceIndex) {
  let temp = count === 3 ? "temp-" : "";
  const td_value = document.createElement("td");
  const td_value_input = document.createElement("input");
  td_value.appendChild(td_value_input);
  td_value_input.setAttribute("class", "form-control");
  td_value_input.setAttribute("id", `${temp}${deviceIndex}-${i}-${id}-input`);
  td_value_input.value = data;

  return td_value;
}

/**
 * element 만들기
 * @param {*} data ex) div
 * @returns
 */
function createHtml(data) {
  return document.createElement(data);
}

/**
 * 부모 아래 자식 두기
 * @param {*} parent 부모
 * @param {*} childs 자식들
 */
function appendChildHtml(parent, childs) {
  for (let item of childs) {
    parent.appendChild(item);
  }
}

/**
 *
 * 좌표 테이블 만들기
 * @param {*} i 인덱스
 * @param {*} PTPoints 좌표리스트
 * @param {*} count 2차원 3차원
 * @param {*} pointRow 센서 별 container html
 * @param {*} DeviceName 저장 버튼 눌렀을때 몇번째 센서인지
 * @param {*} text 취소할때 다시 만들려고 text
 * @param {*} file 취소할때 다시 만들려고 쓰는 file
 * @param {*} data 파싱된 데이터
 */
function makePointTable(
  i,
  PTPoints,
  count,
  pointRow,
  deviceIndex,
  text,
  file,
  data
) {
  // pointItemCol 반반 나누기 위함
  const pointItemCol = createHtml("div");
  pointItemCol.setAttribute("class", "col-6");

  // point의 title, 저장 버튼의 container
  const pointBtnContainer = createHtml("div");
  pointBtnContainer.setAttribute(
    "class",
    "d-flex justify-content-between align-items-center mb-2"
  );

  // point의 title
  const pointSpan = createHtml("span");
  pointSpan.textContent = `Q${i + 1} 9-Points ${count === 3 ? "온도" : ""}`;

  const btnContainer = createHtml("div");
  // 저장 버튼
  const pointBtn = createHtml("button");
  pointBtn.setAttribute("type", "button");
  pointBtn.setAttribute("class", "btn btn-primary btn-sm");
  pointBtn.textContent = "저장";
  pointBtn.addEventListener("click", () => {
    savePointBtnClick(deviceIndex, count, file);
  });

  // 취소버튼
  const pointCancelBtn = createHtml("button");
  pointCancelBtn.setAttribute("type", "button");
  pointCancelBtn.setAttribute("class", "btn btn-danger ms-3 btn-sm");
  pointCancelBtn.textContent = "취소";
  pointCancelBtn.addEventListener("click", () => {
    cancelPointBtnClick(deviceIndex, count);
  });

  pointBtnContainer.appendChild(pointSpan);
  btnContainer.appendChild(pointBtn);
  btnContainer.appendChild(pointCancelBtn);
  pointBtnContainer.appendChild(btnContainer);
  pointItemCol.appendChild(pointBtnContainer);
  pointRow.appendChild(pointItemCol);

  //
  const ptPointList = PTPoints.map((item) => item.split(","));

  let ptPiointsRow = createHtml("div");
  ptPiointsRow.setAttribute("class", "row");

  for (let i = 0; i < 9; i++) {
    let x, y, v;

    if (ptPointList.length < i + 1) {
      [x, y, v] = [0, 0, 0];
    } else {
      [x, y, v] = ptPointList[i];
    }

    const ptPiointsCol = createHtml("div");
    ptPiointsCol.setAttribute("class", "col-4");

    const ptTable = createHtml("table");
    ptTable.setAttribute("class", "table table-bordered");

    // 첫째줄 header
    if (i < 3) {
      const ptTableHeader = createHtml("thead");
      ptTableHeader.setAttribute("class", "text-center");

      const ptTableHeaderTr = createHtml("tr");
      ptTableHeaderTr.setAttribute("class", "text-center");

      const ptTableHeaderX = createHtml("th");
      ptTableHeaderX.textContent = "X";
      const ptTableHeaderY = createHtml("th");
      ptTableHeaderY.textContent = "Y";

      if (count === 3) {
        const ptTableHeaderV = createHtml("th");
        ptTableHeaderV.textContent = "V";

        appendChildHtml(ptTableHeaderTr, [
          ptTableHeaderX,
          ptTableHeaderY,
          ptTableHeaderV,
        ]);
      } else {
        appendChildHtml(ptTableHeaderTr, [ptTableHeaderX, ptTableHeaderY]);
      }

      appendChildHtml(ptTableHeader, [ptTableHeaderTr]);
      appendChildHtml(ptTable, [ptTableHeader]);
    }

    const ptBody = createHtml("tbody");
    ptBody.setAttribute("class", "text-center");
    const ptBodyTr = createHtml("tr");
    const ptXTd = makePointTd(x, count, i, "x", deviceIndex);
    const ptYTd = makePointTd(y, count, i, "y", deviceIndex);

    if (count === 3) {
      const ptVTd = makePointTd(v, count, i, "v", deviceIndex);

      appendChildHtml(ptBodyTr, [ptXTd, ptYTd, ptVTd]);
    } else {
      appendChildHtml(ptBodyTr, [ptXTd, ptYTd]);
    }

    appendChildHtml(ptBody, [ptBodyTr]);
    appendChildHtml(ptTable, [ptBody]);
    appendChildHtml(ptPiointsCol, [ptTable]);
    appendChildHtml(ptPiointsRow, [ptPiointsCol]);

    if (i % 3 === 2) {
      pointItemCol.appendChild(ptPiointsRow);
      ptPiointsRow = createHtml("div");
      ptPiointsRow.setAttribute("class", "row");
    }
  }
}

/**
 * 파일 정보 업데이트
 * @param {*} text 원본 텍스트
 * @param {*} targetFile config 파일
 */
async function updateFileInfo(text, targetFile) {
  startLoading();

  let resultText = "";

  const frameInput = getIDElement("frame-input").value;
  const panelInput = getIDElement("panel-input").value;
  const buildingInput = getIDElement("building-input").value;
  const floorInput = getIDElement("floor-input").value;
  const addressInput = getIDElement("address-input").value;

  // title
  resultText += `${text.title}:`;

  // PCBIP
  resultText += `PCBIP${text.PCBIP}:`;

  // sensor
  resultText += `S${text.sensorUnit}:`;

  // Device List
  for (let i = 1; i < text.deviceList.length + 1; i++) {
    const { DeviceName, PTPoints, TVPoints } = text.deviceList[i - 1];
    resultText += `Q${i}${DeviceName}/Q${i}PT/${PTPoints.join(
      ";"
    )}/Q${i}TV/${TVPoints.join(";")}:`;
  }

  // Frame
  resultText += `F${("0" + frameInput.toString()).slice(-2)}00:`;

  // address
  resultText += `${addressInput};`;

  // building
  resultText += `Building,${buildingInput};`;

  // floor
  resultText += `Floor,${floorInput};`;

  // Panel
  resultText += `Panel,${panelInput}`;

  try {
    const response = await fetch("/config", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resultText,
        file: targetFile,
      }),
    });

    const newFileList = fileList.map((file) => {
      if (file.path === targetFile.path) {
        return {
          ...targetFile,
          data: resultText,
        };
      }
      return file;
    });

    updateNewFileList(newFileList);
    endLoading();
    startAlert(200);

    if (!response.ok) {
      throw new Error("server err");
    }
  } catch (err) {
    console.log(err);
    startAlert(500);
    endLoading();
  }
}

/**
 * 취소 다시 원래 데이터 불러오는 것
 * @param {*} text
 * @param {*} file
 */
function cancelInfoBtnClick(text, file) {
  console.log("취소");

  const frameInput = getIDElement("frame-input");
  const panelInput = getIDElement("panel-input");
  const buildingInput = getIDElement("building-input");
  const floorInput = getIDElement("floor-input");
  const addressInput = getIDElement("address-input");

  const { frameRate, address, building, floor, panel } = targetParsingText;

  frameInput.value = frameRate;
  panelInput.value = panel;
  buildingInput.value = building;
  floorInput.value = floor;
  addressInput.value = address;
}

/**
 * 입력 취소
 * @param {*} deviceIndex 몇번째 센서인지
 * @param {*} count 온도좌표인지
 */
function cancelPointBtnClick(deviceIndex, count) {
  const isTemp = count === 3 ? true : false;

  const device = targetParsingText.deviceList[deviceIndex];
  const { PTPoints, TVPoints } = device;

  if (!isTemp) {
    const points = PTPoints.map((item) => item.split(","));
    for (let i = 0; i < 9; i++) {
      const x = getIDElement(`${deviceIndex}-${i}-x-input`);
      const y = getIDElement(`${deviceIndex}-${i}-y-input`);
      console.log(points[i][0]);
      x.value = points[i][0];
      y.value = points[i][1];
    }
  } else {
    const points = TVPoints.map((item) => item.split(","));
    for (let i = 0; i < 9; i++) {
      const x = getIDElement(`temp-${deviceIndex}-${i}-x-input`);
      const y = getIDElement(`temp-${deviceIndex}-${i}-y-input`);
      const v = getIDElement(`temp-${deviceIndex}-${i}-v-input`);
      x.value = points[i][0];
      y.value = points[i][1];
      v.value = points[i][2];
    }
  }
}

/**
 * 저장하기 (파일도 수정)
 * @param {*} deviceIndex 몇번째 센서인지
 * @param {*} count 온도 좌표인지
 * @param {*} targetFile 파일 정보
 */
async function savePointBtnClick(deviceIndex, count, targetFile) {
  const isTemp = count === 3 ? true : false;

  const points = [];

  if (!isTemp) {
    for (let i = 0; i < 9; i++) {
      const x = getIDElement(`${deviceIndex}-${i}-x-input`).value;
      const y = getIDElement(`${deviceIndex}-${i}-y-input`).value;
      points.push(`${x},${y}`);
    }
  } else {
    for (let i = 0; i < 9; i++) {
      const x = getIDElement(`temp-${deviceIndex}-${i}-x-input`).value;
      const y = getIDElement(`temp-${deviceIndex}-${i}-y-input`).value;
      const v = getIDElement(`temp-${deviceIndex}-${i}-v-input`).value;
      points.push(`${x},${y},${v}`);
    }
  }

  console.log(points);

  let resultText = "";
  // title
  resultText += `${targetParsingText.title}:`;

  // PCBIP
  resultText += `PCBIP${targetParsingText.PCBIP}:`;

  // sensor
  resultText += `S${targetParsingText.sensorUnit}:`;

  // Device List
  for (let i = 1; i < targetParsingText.deviceList.length + 1; i++) {
    const { DeviceName, PTPoints, TVPoints } =
      targetParsingText.deviceList[i - 1];

    if (deviceIndex === i - 1) {
      if (isTemp) {
        resultText += `Q${i}${DeviceName}/Q${i}PT/${PTPoints.join(
          ";"
        )}/Q${i}TV/${points.join(";")}:`;
      } else {
        resultText += `Q${i}${DeviceName}/Q${i}PT/${points.join(
          ";"
        )}/Q${i}TV/${TVPoints.join(";")}:`;
      }
      continue;
    }

    resultText += `Q${i}${DeviceName}/Q${i}PT/${PTPoints.join(
      ";"
    )}/Q${i}TV/${TVPoints.join(";")}:`;
  }

  // Frame
  resultText += `F${("0" + targetParsingText.frameRate.toString()).slice(
    -2
  )}00:`;

  // address
  resultText += `${targetParsingText.address};`;

  // building
  resultText += `Building,${targetParsingText.building};`;

  // floor
  resultText += `Floor,${targetParsingText.floor};`;

  // Panel
  resultText += `Panel,${targetParsingText.panel}`;

  try {
    const response = await fetch("/config", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resultText,
        file: targetFile,
      }),
    });

    const newFileList = fileList.map((file) => {
      if (file.path === targetFile.path) {
        return {
          ...targetFile,
          data: resultText,
        };
      }
      return file;
    });

    updateNewFileList(newFileList);
    endLoading();
    startAlert(200);

    targetParsingText = parsingText(resultText, targetFile);

    if (!response.ok) {
      throw new Error("server err");
    }
  } catch (err) {
    console.log(err);
    startAlert(500);
    endLoading();
  }
}

/**
 * element 찾기
 * @param {*} id 아이디 값
 * @returns
 */
function getIDElement(id) {
  return document.getElementById(`${id}`);
}

/**
 * text 파싱
 * @param {*} text text
 * @param {*} file 해당 config 파일
 * @returns
 */
function parsingText(text, file) {
  const deviceList = [];

  const configList = text.split(":");
  // main
  const title = configList[0];
  const PCBIP = configList[1].replace("PCBIP", "");
  const sensorUnit = Number(configList[2].replace("S", ""));

  for (let i = 0; i < sensorUnit; i++) {
    //  디바이스 정보
    const DeviceInfo = configList[3 + i].split("/");
    const DeviceName = DeviceInfo[0].replace(`Q${i + 1}`, "");
    //  좌표
    const PTPoints = DeviceInfo[2].split(";");
    const TVPoints = DeviceInfo[4].split(";");

    deviceList.push({
      DeviceName,
      PTPoints,
      TVPoints,
    });
    console.log(deviceList);
  }

  // Frame Rate
  const frameRate = Number(configList[3 + sensorUnit].slice(1, 3));

  // company info
  const companyInfo = configList[4 + sensorUnit].split(";");
  const address = companyInfo[0];
  const building = companyInfo[1].replace("Building,", "");
  const floor = companyInfo[2].replace("Floor,", "");
  const panel = companyInfo[3].replace("Panel,", "");

  const data = {
    title,
    PCBIP,
    sensorUnit,
    deviceList,
    frameRate,
    address,
    building,
    floor,
    panel,
    text,
    file,
  };
  return data;
}
