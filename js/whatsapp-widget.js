(() => {
    const typing = document.getElementById("typing");
    const msg1 = document.getElementById("msg1");
    const msg2 = document.getElementById("msg2");
    const chatBox = document.getElementById("chat-box");
    let input = document.getElementById("chat-input");
    const sendButton = document.getElementById("send-button");
    const widget = document.getElementById("whatsapp-widget");
    const icon = document.getElementById("whatsapp-icon");

    let hasOpened = false;
    let hasUnreadNotification = false;
    let firstMessageShown = false;
    let secondMessageSequenceStarted = false;
    const currentWA = "5491122511243";
    const isMobileDevice = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
    let fallbackText = "Hola! Necesito asesoramiento legal";
    let lastPrefilledText = "";

    const serviceProfiles = [
        {
            matches: ["/servicios/despidos"],
            message: "¿Necesitas ayuda con un despido?",
            fallback: "Hola, me despidieron y necesito asesoramiento",
        },
        {
            matches: ["/servicios/diferencia-salarial"],
            message: "¿Necesitas reclamar diferencias salariales?",
            fallback: "Hola, quiero reclamar diferencias salariales",
        },
        {
            matches: ["/servicios/marcas"],
            message: "¿Necesitas ayuda con tu marca?",
            fallback: "Hola, necesito asesoramiento con una marca",
        },
        {
            matches: ["/servicios/sucesiones"],
            message: "¿Necesitas iniciar una sucesión?",
            fallback: "Hola, necesito iniciar una sucesión",
        },
        {
            matches: ["/servicios/divorcios"],
            message: "¿Necesitas iniciar un divorcio?",
            fallback: "Hola, necesito asesoramiento para un divorcio",
        },
        {
            matches: ["/servicios/mediaciones"],
            message: "¿Necesitas iniciar una mediación?",
            fallback: "Hola, necesito asesoramiento para una mediación",
        },
        {
            matches: ["/servicios/jubilaciones"],
            message: "¿Necesitas asesoramiento sobre jubilaciones?",
            fallback: "Hola, necesito asesoramiento para jubilarme",
        },
        {
            matches: ["/servicios/alquileres"],
            message: "¿Necesitas ayuda con un alquiler?",
            fallback: "Hola, tengo un problema con un alquiler",
        },
        {
            matches: ["/servicios/accidente-de-transito"],
            message: "¿Sufriste un accidente de tránsito?",
            fallback: "Hola, tuve un accidente de tránsito y busco asesoramiento",
        },
        {
            matches: ["/servicios/accidente-de-trabajo"],
            message: "¿Sufriste un accidente de trabajo?",
            fallback: "Hola, tuve un accidente de trabajo y necesito asesoramiento",
        },
    ];

    function scrollChatToBottom() {
        if (chatBox) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }

    function upgradeInputToTextarea() {
        if (!input || input.tagName !== "INPUT") {
            return;
        }

        const textarea = document.createElement("textarea");
        for (const attr of input.attributes) {
            if (attr.name !== "type" && attr.name !== "value") {
                textarea.setAttribute(attr.name, attr.value);
            }
        }

        textarea.value = input.value;
        textarea.rows = 1;
        textarea.style.cssText = `${input.getAttribute("style") || ""};resize:none;overflow:hidden;min-height:24px;max-height:96px;line-height:1.4;display:block;padding:0;margin:0;box-sizing:border-box;`;

        const parent = input.parentElement;
        if (parent) {
            parent.style.alignItems = "flex-end";
        }

        input.replaceWith(textarea);
        input = textarea;
    }

    function resizeChatInput() {
        if (!input || input.tagName !== "TEXTAREA") {
            return;
        }

        input.style.height = "24px";
        const nextHeight = Math.min(input.scrollHeight, 96);
        input.style.height = `${nextHeight}px`;
        input.style.overflowY = input.scrollHeight > 96 ? "auto" : "hidden";
    }

    function ensureNotificationStyles() {
        if (document.getElementById("tb-wa-notification-styles")) {
            return;
        }

        const styles = document.createElement("style");
        styles.id = "tb-wa-notification-styles";
        styles.textContent = `
            @keyframes tb-wa-badge-pop {
                0% { transform: scale(0.5); opacity: 0; }
                70% { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }

            @keyframes tb-wa-icon-nudge {
                0%, 100% { transform: rotate(0deg); }
                20% { transform: rotate(-10deg); }
                40% { transform: rotate(10deg); }
                60% { transform: rotate(-6deg); }
                80% { transform: rotate(6deg); }
            }
        `;
        document.head.appendChild(styles);
    }

    function getNotificationBadge() {
        if (!icon) {
            return null;
        }

        let badge = icon.querySelector("[data-wa-notification-badge]");
        if (!badge) {
            badge = document.createElement("span");
            badge.setAttribute("data-wa-notification-badge", "true");
            badge.textContent = "1";
            Object.assign(badge.style, {
                position: "absolute",
                top: "-4px",
                right: "-4px",
                minWidth: "20px",
                height: "20px",
                padding: "0 5px",
                borderRadius: "999px",
                background: "#ff3b30",
                color: "#fff",
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: "700",
                lineHeight: "1",
                border: "2px solid #fff",
                boxSizing: "border-box",
                pointerEvents: "none",
                transformOrigin: "center",
            });
            icon.style.overflow = "visible";
            icon.appendChild(badge);
        }

        return badge;
    }

    function showNotificationBadge() {
        const badge = getNotificationBadge();
        if (!badge || hasUnreadNotification) {
            return;
        }

        ensureNotificationStyles();
        badge.style.display = "flex";
        badge.style.animation = "tb-wa-badge-pop 0.35s ease-out";
        if (icon) {
            icon.style.animation = "pulse 1.2s infinite, tb-wa-icon-nudge 1.5s ease-in-out 3";
        }
        hasUnreadNotification = true;
    }

    function hideNotificationBadge() {
        const badge = icon ? icon.querySelector("[data-wa-notification-badge]") : null;
        if (badge) {
            badge.style.display = "none";
            badge.style.animation = "";
        }
        if (icon) {
            icon.style.animation = "pulse 1.5s infinite";
        }
        hasUnreadNotification = false;
    }

    function showFirstMessage() {
        if (!msg1) {
            return;
        }

        if (typing) {
            typing.style.display = "none";
        }

        msg1.style.display = "block";
        firstMessageShown = true;
        scrollChatToBottom();
    }

    function syncInputWithFallback() {
        if (!input) {
            return;
        }

        const currentText = input.value.trim();
        if (!currentText || currentText === lastPrefilledText) {
            input.value = fallbackText;
        }

        lastPrefilledText = fallbackText;
        resizeChatInput();
    }

    function updateChatProfile() {
        const path = window.location.pathname.toLowerCase();
        let dynamicMsg2 = "¿Buscás asesoramiento legal?";
        fallbackText = "Hola! Necesito asesoramiento legal";

        const isServicesPath = path.includes("/servicios/") || path.startsWith("/servicios/");
        if (isServicesPath) {
            dynamicMsg2 = "¿En qué servicio legal te podemos ayudar?";
            fallbackText = "Hola, necesito asesoramiento sobre servicios legales";

            for (const profile of serviceProfiles) {
                if (profile.matches.some((token) => path.includes(token))) {
                    dynamicMsg2 = profile.message;
                    fallbackText = profile.fallback;
                    break;
                }
            }
        }

        if (msg2) {
            msg2.textContent = dynamicMsg2;
        }

        syncInputWithFallback();
    }

    function simulateChat() {
        if (!msg1 || !msg2 || !chatBox) {
            return;
        }

        if (!firstMessageShown) {
            showFirstMessage();
        }

        if (secondMessageSequenceStarted || msg2.style.display === "block" || !typing) {
            return;
        }

        secondMessageSequenceStarted = true;

        setTimeout(() => {
            typing.style.display = "block";
            scrollChatToBottom();
        }, 800);

        setTimeout(() => {
            typing.style.display = "none";
            msg2.style.display = "block";
            scrollChatToBottom();
        }, 2000);
    }

    function enviarMensaje() {
        if (!input) {
            return;
        }

        let text = input.value.trim();
        if (!text) {
            text = fallbackText;
        }

        const url = isMobileDevice
            ? `https://wa.me/${currentWA}?text=${encodeURIComponent(text)}`
            : `https://web.whatsapp.com/send?phone=${currentWA}&text=${encodeURIComponent(text)}`;

        window.open(url, "_blank");
        syncInputWithFallback();
    }

    function cerrarWidget() {
        if (widget) {
            widget.style.display = "none";
        }
        if (icon) {
            icon.style.display = "flex";
        }
    }

    function abrirWidget() {
        if (widget) {
            widget.style.display = "block";
        }
        if (icon) {
            icon.style.display = "none";
        }
        hideNotificationBadge();
        updateChatProfile();
        hasOpened = true;
        simulateChat();
    }

    window.abrirWidget = abrirWidget;
    window.cerrarWidget = cerrarWidget;

    upgradeInputToTextarea();

    if (sendButton) {
        sendButton.addEventListener("click", enviarMensaje);
    }

    if (input) {
        input.addEventListener("input", resizeChatInput);
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                enviarMensaje();
            }
        });
    }

    updateChatProfile();

    setTimeout(() => {
        if (!widget || !icon || hasOpened) {
            return;
        }

        if (widget.style.display === "none") {
            showFirstMessage();
            showNotificationBadge();
        }
    }, 45000);
})();
