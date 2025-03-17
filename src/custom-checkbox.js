export { createCheckbox };

import "./styles/custom-checkbox.css";

function createCheckbox(text, id, checked, disabled) {
    const container = document.createElement("div");
    const chk = document.createElement("input");
    const lbl = document.createElement("label");

    chk.type = "checkbox";
    chk.id = id;
    chk.checked = checked;
    chk.disabled = disabled;

    lbl.htmlFor = id;
    lbl.innerText = text;

    container.classList.add("custom-check-container");
    container.appendChild(chk);
    container.appendChild(lbl);

    return container;
}