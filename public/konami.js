document.addEventListener("DOMContentLoaded", () => {
    const konamiSequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let position = 0;
    let isArrowKeyActive = false;
    let retroTransitionTimer = null;

    const updateThemeClass = () => {
        const theme = localStorage.getItem("theme") || '';
        const retro = localStorage.getItem("retro") === "true" ? "retro" : "";
        document.body.classList.remove("retro", "retro-entering", "retro-exiting");
        document.body.setAttribute('class', `${theme} ${retro}`.trim());
    };

    const syncThemeOnly = () => {
        const theme = localStorage.getItem("theme") || '';
        const hasRetro = document.body.classList.contains("retro");
        const hasEntering = document.body.classList.contains("retro-entering");
        const hasExiting = document.body.classList.contains("retro-exiting");
        document.body.className = theme;
        if (hasRetro) {
            document.body.classList.add("retro");
        }
        if (hasEntering) {
            document.body.classList.add("retro-entering");
        }
        if (hasExiting) {
            document.body.classList.add("retro-exiting");
        }
    };

    const animateRetroState = (enableRetro) => {
        if (retroTransitionTimer) {
            clearTimeout(retroTransitionTimer);
            retroTransitionTimer = null;
        }

        syncThemeOnly();

        if (enableRetro) {
            document.body.classList.remove("retro-exiting");
            document.body.classList.add("retro", "retro-entering");
            retroTransitionTimer = setTimeout(() => {
                document.body.classList.remove("retro-entering");
            }, 550);
            return;
        }

        if (!document.body.classList.contains("retro")) {
            return;
        }

        document.body.classList.add("retro-exiting");
        retroTransitionTimer = setTimeout(() => {
            document.body.classList.remove("retro", "retro-exiting");
        }, 550);
    };

    const toggleRetroEffect = () => {
        const retroEnabled = localStorage.getItem("retro") === "true";
        const newRetroState = !retroEnabled;

        localStorage.setItem("retro", newRetroState);
        animateRetroState(newRetroState);
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
