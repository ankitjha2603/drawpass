"use strict";
//---------------------------------------------->
//SECTION: IMPORT
import app from "./firebase/base.js";
import {
  readData,
  writeData,
} from "./firebase/firebase.database.operations.js";
//---------------------------------------------->

//---------------------------------------------->
//SECTION: Variable and constant
let clicked = false;
let selected_color = "White";
let mouseon = null;
let submitValid = [false, false];
let state = "create";
const warningMessage = {
  create: "Username already exists or is empty",
  login: "Username does not exist or is empty",
};
const userInputOption = {
  create: select(".create-option"),
  login: select(".login-option"),
};
const password = {};
let count = 0;
//---------------------------------------------->

//---------------------------------------------->
//SECTION: function
function select(selection, singleElement = true) {
  if (singleElement) return document.querySelector(selection);
  return [...document.querySelectorAll(selection)];
}
function append(mainElement, ...subElements) {
  subElements.forEach((subElement) => mainElement.append(subElement));
}
function newElement(cls, content = "", tag = "div") {
  let element = document.createElement(tag);
  if (cls) {
    if (typeof cls === "object")
      cls.forEach((clsElement) => element.classList.add(clsElement));
    else element.classList.add(cls);
  }
  if (content) element.innerText = content;
  return element;
}
const password_box_init = () => {
  const password_box = select(".password");
  const temp = new URL(window.location.href).searchParams.get("n") * 1;
  let n = 12;
  if (temp) {
    n = temp;
  }
  for (let i = 0; i < n; i++) {
    const line = newElement("passline");
    for (let j = 0; j < n; j++) {
      const cell = newElement(["passbox", `passbox-${i}-${j}`]);
      append(line, cell);
      cell.setAttribute("bg-color", "White");
      cell.onmouseenter = () => cell_onmouseenter(i, j);
      cell.onmousedown = () => cell_onmousedown(i, j);
      cell.onmouseup = () => cell_onmouseup(i, j);
    }
    append(password_box, line);
  }
};
const putColor = (i, j) => {
  let store = `${i},${j}`;
  const lastColor = select(`.passbox-${i}-${j}`).getAttribute("bg-color");
  if (lastColor != selected_color) {
    if (selected_color != "White") {
      if (!password[selected_color]) password[selected_color] = {};
      password[selected_color][store] = 1;
      if (lastColor === "White") count++;
      else {
        delete password[lastColor][store];
        if (Object.keys(password[lastColor]).length == 0) {
          delete password[lastColor];
        }
      }
    } else {
      console.log(password, selected_color, store);
      delete password[lastColor][store];
      if (Object.keys(password[lastColor]).length == 0) {
        delete password[lastColor];
      }
      count--;
    }
    select(`.passbox-${i}-${j}`).setAttribute("bg-color", selected_color);
    select(`.passbox-${i}-${j}`).style.backgroundColor = selected_color;
  }
  console.log(count, password);
  submitValid[1] = count >= 5 && Object.keys(password).length >= 3;
  select(".warning-p").setAttribute("show", !submitValid[1]);
  validate();
};
const validate = () => {
  select(".submit-form").disabled = !(submitValid[0] && submitValid[1]);
};
function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  )
    return false;
  let [keys1, keys2] = [Object.keys(obj1), Object.keys(obj2)];
  if (keys1.length !== keys2.length) return false;
  for (let key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;
  }
  return true;
}
//---------------------------------------------->

//---------------------------------------------->
//SECTION: init
password_box_init();
//---------------------------------------------->

//---------------------------------------------->
//SECTION: event function
const cell_onmouseenter = (i, j) => {
  if (clicked) putColor(i, j);
  mouseon = [i, j];
};
const cell_onmousedown = (i, j) => {
  clicked = true;
  putColor(i, j);
};
const cell_onmouseup = () => {
  clicked = false;
};
const swapInputOption = (e) => {
  if (e.target.getAttribute("state") === state) return;
  state = e.target.getAttribute("state");
  userInputOption.create.setAttribute("focus", state === "create");
  userInputOption.login.setAttribute("focus", state === "login");
  select("#username").value = "";
  submitValid[0] = false;
  select("p.warning").innerText = warningMessage[state];
  select("p.warning").setAttribute("show", "false");
  validate();
};
//---------------------------------------------->

//---------------------------------------------->
//SECTION: event
select(".password").onmouseleave = () => {
  mouseon = null;
};
document.addEventListener("keydown", function (event) {
  if (event.keyCode === 17) {
    clicked = true;
    if (mouseon) putColor(...mouseon);
  }
});
document.addEventListener("keyup", function (event) {
  if (event.keyCode === 17) clicked = false;
});
select("body").onmouseup = () => {
  clicked = false;
};
select("#username").onchange = (e) => {
  const username = e.target.value.toLowerCase();
  if (!username) {
    select("p.warning").setAttribute("show", "true");
    submitValid[0] = false;
    return validate();
  }
  readData(
    username,
    () => {
      submitValid[0] = state != "create";
      select("p.warning").setAttribute("show", `${!submitValid[0]}`);
      validate();
    },
    () => {
      submitValid[0] = state === "create";
      select("p.warning").setAttribute("show", `${!submitValid[0]}`);
      validate();
    }
  );
};
select(".color-option", false).forEach((ele) => {
  ele.style.backgroundColor = ele.getAttribute("color");
  ele.onclick = () => {
    let newColor = ele.getAttribute("color");
    select(`.color-option[color='${selected_color}']`).classList.remove(
      "selected"
    );
    select(`.color-option[color='${newColor}']`).classList.add("selected");
    selected_color = newColor;
    select(".password").style.borderColor = selected_color;
  };
});
userInputOption.create.onclick = swapInputOption;
userInputOption.login.onclick = swapInputOption;
select(".submit-form").onclick = () => {
  const username = select("#username").value.toLowerCase();
  if (state === "create") {
    writeData(username, JSON.stringify(password), () => {
      alert("created");
      location.reload();
    });
  } else {
    readData(`${username}`, (actual_password) => {
      actual_password = JSON.parse(actual_password);
      if (deepEqual(actual_password, password)) {
        alert("Right password");
        location.reload();
      } else alert("wrong password");
    });
  }
};
//---------------------------------------------->
