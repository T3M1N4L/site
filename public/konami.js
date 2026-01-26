document.addEventListener("DOMContentLoaded", () => {
    const konamiSequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let position = 0;
    let isArrowKeyActive = false;

    const updateThemeClass = () => {
        const theme = localStorage.getItem("theme") || '';
        const retro = localStorage.getItem("retro") === "true" ? "retro" : "";
        document.body.setAttribute('class', `${theme} ${retro}`.trim());
    };

    const toggleRetroEffect = () => {
        const retroEnabled = localStorage.getItem("retro") === "true";
        const newRetroState = !retroEnabled;

        localStorage.setItem("retro", newRetroState);
        updateThemeClass();
    };

    const disableScroll = () => {
        window.addEventListener("keydown", preventArrowScroll);
    };

    const enableScroll = () => {
        window.removeEventListener("keydown", preventArrowScroll);
    };

    const preventArrowScroll = (e) => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
        }
    };

    const handleKeydown = (e) => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            isArrowKeyActive = true;
            disableScroll();
        }

        if (e.key === konamiSequence[position]) {
            document.getElementById(`k${position}`)?.classList.add("active");
            position++;

            if (position === konamiSequence.length) {
                position = 0;
                isArrowKeyActive = false;
                enableScroll();
                setTimeout(() => {
                    document.querySelectorAll("#konami > kbd").forEach((key) => key.classList.remove("active"));
                    toggleRetroEffect();
                }, 300);
            }
        } else {
            position = 0;
            document.querySelectorAll("#konami > kbd").forEach((key) => key.classList.remove("active"));
            isArrowKeyActive = false;
            enableScroll();
        }
    };

    const handleKeyup = (e) => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            isArrowKeyActive = false;
            enableScroll();
        }
    };

    const handleLazyButtonClick = (e) => {
        e.preventDefault();
        toggleRetroEffect();
    };
    
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("keyup", handleKeyup);
    document.querySelector("#lazy").addEventListener("click", handleLazyButtonClick);
    updateThemeClass();
});
