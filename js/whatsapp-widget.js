(() => {
    const typing = document.getElementById("typing");
    const msg1 = document.getElementById("msg1");
    const msg2 = document.getElementById("msg2");
    const chatBox = document.getElementById("chat-box");
    const input = document.getElementById("chat-input");
    const sendButton = document.getElementById("send-button");
    const widget = document.getElementById("whatsapp-widget");
    const icon = document.getElementById("whatsapp-icon");

    let hasOpened = false;
    const currentWA = "5491122511243";
    const isMobileDevice = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
    let fallbackText = "Hola! Necesito asesoramiento legal";

    const serviceProfiles = [
        {
            matches: ["/servicios/despidos", "/servicios/despidos.html"],
            message: "¿Necesitas ayuda con un despido?",
            fallback: "Hola, me despidieron y necesito asesoramiento",
        },
        {
            matches: ["/servicios/diferencia-salarial", "/servicios/diferencia-salarial.html"],
            message: "¿Necesitas reclamar diferencias salariales?",
            fallback: "Hola, quiero reclamar diferencias salariales",
        },
        {
            matches: ["/servicios/marcas", "/servicios/marcas.html"],
            message: "¿Necesitas ayuda con tu marca?",
            fallback: "Hola, necesito asesoramiento con una marca",
        },
        {
            matches: ["/servicios/sucesiones", "/servicios/sucesiones.html"],
            message: "¿Necesitas iniciar una sucesión?",
            fallback: "Hola, necesito iniciar una sucesión",
        },
        {
            matches: ["/servicios/divorcios", "/servicios/divorcios.html"],
            message: "¿Necesitas iniciar un divorcio?",
            fallback: "Hola, necesito asesoramiento para un divorcio",
        },
        {
            matches: ["/servicios/mediaciones", "/servicios/mediaciones.html"],
            message: "¿Necesitas iniciar una mediación?",
            fallback: "Hola, necesito asesoramiento para una mediación",
        },
        {
            matches: ["/servicios/jubilaciones", "/servicios/jubilaciones.html"],
            message: "¿Necesitas asesoramiento sobre jubilaciones?",
            fallback: "Hola, necesito asesoramiento para jubilarme",
        },
        {
            matches: ["/servicios/alquileres", "/servicios/alquileres.html"],
            message: "¿Necesitas ayuda con un alquiler?",
            fallback: "Hola, tengo un problema con un alquiler",
        },
        {
            matches: ["/servicios/accidente-de-transito", "/servicios/accidente-de-transito.html"],
            message: "¿Sufriste un accidente de tránsito?",
            fallback: "Hola, tuve un accidente de tránsito y busco asesoramiento",
        },
        {
            matches: ["/servicios/accidente-de-trabajo", "/servicios/accidente-de-trabajo.html"],
            message: "¿Sufriste un accidente de trabajo?",
            fallback: "Hola, tuve un accidente de trabajo y necesito asesoramiento",
        },
    ];

    function updateChatProfile() {
        const path = window.location.pathname.toLowerCase();
        let dynamicMsg2 = "¿Buscás asesoramiento legal?";
        fallbackText = "Hola! Necesito asesoramiento legal";

        const isServicesPath = path.includes("/servicios") || path.startsWith("/servicios");
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
    }

    function simulateChat() {
        if (hasOpened || !typing || !msg1 || !msg2 || !chatBox) {
            return;
        }

        hasOpened = true;

        setTimeout(() => {
            typing.style.display = "block";
        }, 1000);

        setTimeout(() => {
            typing.style.display = "none";
            msg1.style.display = "block";
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 3000);

        setTimeout(() => {
            typing.style.display = "block";
        }, 4000);

        setTimeout(() => {
            typing.style.display = "none";
            msg2.style.display = "block";
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 6000);
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
        input.value = "";
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
        updateChatProfile();
        simulateChat();
    }

    window.abrirWidget = abrirWidget;
    window.cerrarWidget = cerrarWidget;

    if (sendButton) {
        sendButton.addEventListener("click", enviarMensaje);
    }

    if (input) {
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                enviarMensaje();
            }
        });
    }

    setTimeout(() => {
        if (!widget) {
            return;
        }

        if (!isMobileDevice && !hasOpened && widget.style.display === "none") {
            abrirWidget();
        }
    }, 300000);
})();
