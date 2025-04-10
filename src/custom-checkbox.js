export { createCustomCheckbox };

import "./styles/custom-checkbox.css";

function createCustomCheckbox(
  text,
  id,
  callback,
  checked = false,
  disabled = false,
) {
  const container = document.createElement("div");
  const chk = document.createElement("input");
  const lbl = document.createElement("label");

  chk.type = "checkbox";
  chk.id = id;
  chk.checked = checked;
  chk.disabled = disabled;

  lbl.htmlFor = id;
  lbl.innerText = text;

  if (arguments.length >= 3) {
    chk.addEventListener("change", callback);
  }

  container.classList.add("custom-check-container");
  container.appendChild(chk);
  container.appendChild(lbl);

  return container;
}
