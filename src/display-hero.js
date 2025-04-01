import "./styles/hero.css";

export { createHero };

function createHero() {
    const heroContainer = document.createElement("div");
    const heroText = document.createElement("div");
    const heroButton = document.createElement("button");

    heroText.classList.add("hero-text");
    heroText.innerText = "Things to Do";

    heroButton.classList.add("hero-button");
    heroButton.innerText = "+";
    heroButton.addEventListener("click", () => {
        const dialog = document.querySelector("#add-project-dialog");
        dialog.showModal();
    })

    heroContainer.classList.add("hero-container");
    heroContainer.appendChild(heroText);
    heroContainer.appendChild(heroButton);

    return heroContainer;
}