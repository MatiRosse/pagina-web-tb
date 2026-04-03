(() => {
    const typing = document.getElementById("typing");
    const msg1 = document.getElementById("msg1");
    const msg2 = document.getElementById("msg2");
    const chatBox = document.getElementById("chat-box");
    let input = document.getElementById("chat-input");
    const sendButton = document.getElementById("send-button");
    const widget = document.getElementById("whatsapp-widget");
    const icon = document.getElementById("whatsapp-icon");
    const chatProfileSub = document.getElementById("chat-profile-sub");

    if (!chatBox || !input || !sendButton || !widget || !icon) {
        return;
    }

    const currentWA = "5491122511243";
    const contactFormEndpoint = "https://formspree.io/f/xdawoyea";
    const argentinaTimeZone = "America/Argentina/Buenos_Aires";
    const defaultInputPlaceholder = "Escribí tu mensaje acá...";
    const isMobileDevice = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
    const widgetScaleFactor = 1.15;
    const baseWidgetWidth = parseFloat(widget.style.width) || 336;
    const baseChatHeight = parseFloat(chatBox.style.height) || 160;
    const baseWidgetBottom = parseFloat(widget.style.bottom) || 20;
    const baseWidgetRight = parseFloat(widget.style.right) || 20;
    const baseIconBottom = parseFloat(icon.style.bottom) || 20;
    const baseIconRight = parseFloat(icon.style.right) || 20;
    const defaultSendButtonMarkup = sendButton.innerHTML;
    const offlineSendButtonMarkup = `
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none"
            xmlns="http://www.w3.org/2000/svg" style="display:block">
            <path
                d="M4.6 5.3L19.1 11.5C19.6 11.72 19.6 12.28 19.1 12.5L4.6 18.7C4.14 18.89 3.67 18.45 3.81 17.98L5.29 13.24C5.37 12.98 5.6 12.8 5.87 12.77L12.7 12L5.87 11.23C5.6 11.2 5.37 11.02 5.29 10.76L3.81 6.02C3.67 5.55 4.14 5.11 4.6 5.3Z"
                fill="#ffffff"></path>
        </svg>
    `;

    let hasOpened = false;
    let hasUnreadNotification = false;
    let firstMessageShown = false;
    let secondMessageSequenceStarted = false;
    let fallbackText = "Hola! Necesito asesoramiento legal";
    let lastPrefilledText = "";
    let currentProfile = null;
    let baselineViewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

    const serviceProfiles = [
        {
            matches: ["/servicios/despidos"],
            message: "¿Necesitas ayuda con un despido?",
            fallback: "Hola, me despidieron y necesito asesoramiento",
            suggestedSubject: "Consulta Laboral / Despido",
        },
        {
            matches: ["/servicios/diferencia-salarial"],
            message: "¿Necesitas reclamar diferencias salariales?",
            fallback: "Hola, quiero reclamar diferencias salariales",
            suggestedSubject: "Reclamo Diferencia Salarial",
        },
        {
            matches: ["/servicios/marcas"],
            message: "¿Necesitas ayuda con tu marca?",
            fallback: "Hola, necesito asesoramiento con una marca",
            suggestedSubject: "Registro de Marcas",
        },
        {
            matches: ["/servicios/sucesiones"],
            message: "¿Necesitás iniciar una sucesión?",
            fallback: "Hola, necesito iniciar una sucesión",
            suggestedSubject: "Sucesiones / Familia",
        },
        {
            matches: ["/servicios/divorcios"],
            message: "¿Necesitas iniciar un divorcio?",
            fallback: "Hola, necesito asesoramiento para un divorcio",
            suggestedSubject: "Sucesiones / Familia",
        },
        {
            matches: ["/servicios/mediaciones"],
            message: "¿Necesitás iniciar una mediación?",
            fallback: "Hola, necesito asesoramiento para una mediación",
            suggestedSubject: "Consulta legal",
        },
        {
            matches: ["/servicios/jubilaciones"],
            message: "¿Necesitas asesoramiento sobre jubilaciones?",
            fallback: "Hola, necesito asesoramiento para jubilarme",
            suggestedSubject: "Jubilaciones / Previsional",
        },
        {
            matches: ["/servicios/alquileres"],
            message: "¿Necesitas ayuda con un alquiler?",
            fallback: "Hola, tengo un problema con un alquiler",
            suggestedSubject: "Revisión de Contrato de Alquiler",
        },
        {
            matches: ["/servicios/accidente-de-transito"],
            message: "¿Sufriste un accidente de tránsito?",
            fallback: "Hola, tuve un accidente de tránsito y busco asesoramiento",
            suggestedSubject: "Accidentes de Tránsito",
        },
        {
            matches: ["/servicios/accidente-de-trabajo"],
            message: "¿Sufriste un accidente de trabajo?",
            fallback: "Hola, tuve un accidente de trabajo y necesito asesoramiento",
            suggestedSubject: "Accidente de Trabajo ART",
        },
    ];

    const intakeState = {
        active: false,
        started: false,
        completed: false,
        submitting: false,
        awaitingRetry: false,
        currentQuestionIndex: 0,
        answers: {},
    };

    function scrollChatToBottom() {
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function getCurrentWidgetWidth() {
        return intakeState.active
            ? Math.round(baseWidgetWidth * widgetScaleFactor)
            : baseWidgetWidth;
    }

    function getCurrentChatHeight() {
        return intakeState.active
            ? Math.round(baseChatHeight * widgetScaleFactor)
            : baseChatHeight;
    }

    function isWidgetInputFocused() {
        return document.activeElement === input;
    }

    function updateViewportBaseline(force = false) {
        const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        if (force || !isWidgetInputFocused()) {
            baselineViewportHeight = viewportHeight;
        }
    }

    function resetViewportAdjustedLayout() {
        widget.style.top = "auto";
        widget.style.bottom = `${baseWidgetBottom}px`;
        widget.style.right = `${baseWidgetRight}px`;
        widget.style.maxHeight = "";
        chatBox.style.height = `${getCurrentChatHeight()}px`;
        icon.style.bottom = `${baseIconBottom}px`;
        icon.style.right = `${baseIconRight}px`;
    }

    function updateWidgetSize() {
        widget.style.width = `min(${getCurrentWidgetWidth()}px, calc(100vw - 40px))`;
        chatBox.style.height = `${getCurrentChatHeight()}px`;
        adjustWidgetPosition();
    }

    function updateSendButtonIcon() {
        if (intakeState.active) {
            if (sendButton.dataset.iconMode !== "offline") {
                sendButton.innerHTML = offlineSendButtonMarkup;
                sendButton.dataset.iconMode = "offline";
            }
            sendButton.setAttribute("aria-label", "Enviar consulta");
            return;
        }

        if (sendButton.dataset.iconMode !== "whatsapp") {
            sendButton.innerHTML = defaultSendButtonMarkup;
            sendButton.dataset.iconMode = "whatsapp";
        }
        sendButton.setAttribute("aria-label", "Abrir WhatsApp");
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

    function focusInput() {
        if (!input || widget.style.display !== "block") {
            return;
        }

        window.setTimeout(() => {
            try {
                input.focus({ preventScroll: true });
            } catch (error) {
                input.focus();
            }
        }, 50);
    }

    function setComposerState(options = {}) {
        const {
            inputDisabled = false,
            sendDisabled = false,
            placeholder = defaultInputPlaceholder,
        } = options;

        input.disabled = inputDisabled;
        input.placeholder = placeholder;
        sendButton.disabled = sendDisabled;
        sendButton.style.opacity = sendDisabled ? "0.65" : "1";
        sendButton.style.cursor = sendDisabled ? "not-allowed" : "pointer";

        if (!inputDisabled) {
            focusInput();
        }
    }

    function showTyping(show) {
        if (!typing) {
            return;
        }

        typing.style.display = show ? "block" : "none";
        scrollChatToBottom();
    }

    function normalizeText(text) {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    function getCurrentScheduleSnapshot() {
        try {
            const formatter = new Intl.DateTimeFormat("en-US", {
                timeZone: argentinaTimeZone,
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
                hourCycle: "h23",
            });
            const parts = formatter.formatToParts(new Date());
            const values = {};
            for (const part of parts) {
                values[part.type] = part.value;
            }

            return {
                weekday: values.weekday || "",
                hour: Number(values.hour || "0") % 24,
                minute: Number(values.minute || "0"),
            };
        } catch (error) {
            const now = new Date();
            const weekdayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

            return {
                weekday: weekdayMap[now.getDay()],
                hour: now.getHours(),
                minute: now.getMinutes(),
            };
        }
    }

    function shouldUseIntakeMode() {
        const snapshot = getCurrentScheduleSnapshot();
        const currentMinutes = snapshot.hour * 60 + snapshot.minute;
        const isSunday = snapshot.weekday === "Sun";
        const isSaturdayAfternoon = snapshot.weekday === "Sat" && currentMinutes >= 13 * 60;
        const isNightWindow = currentMinutes >= 21 * 60 || currentMinutes < 6 * 60 + 30;

        if (snapshot.weekday === "Sat") {
            return isSaturdayAfternoon;
        }

        return isSunday || isNightWindow;
    }

    function resolveCurrentProfile() {
        const path = window.location.pathname.toLowerCase();

        for (const profile of serviceProfiles) {
            if (profile.matches.some((token) => path.includes(token))) {
                return profile;
            }
        }

        return null;
    }

    function getAutoSubject() {
        return currentProfile ? currentProfile.suggestedSubject : "Consulta legal";
    }

    function appendMessage(text, role = "bot") {
        const bubble = document.createElement("div");
        bubble.textContent = text;

        Object.assign(bubble.style, {
            background: role === "user" ? "#dcf8c6" : "#fff",
            color: "#111827",
            padding: "8px 12px",
            margin: "8px 0",
            borderRadius: "7.5px",
            maxWidth: "85%",
            width: "fit-content",
            wordBreak: "break-word",
            whiteSpace: "pre-line",
            marginLeft: role === "user" ? "auto" : "0",
            boxShadow: "0 1px 1px rgba(0, 0, 0, 0.08)",
        });

        chatBox.appendChild(bubble);
        scrollChatToBottom();
    }

    function queueBotMessage(text, afterReply, typingDuration = 900) {
        setComposerState({
            inputDisabled: true,
            sendDisabled: true,
            placeholder: "Esperá un momento...",
        });
        showTyping(true);

        window.setTimeout(() => {
            showTyping(false);
            appendMessage(text, "bot");
            if (typeof afterReply === "function") {
                afterReply();
            }
        }, typingDuration);
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
        icon.style.animation = "pulse 1.2s infinite, tb-wa-icon-nudge 1.5s ease-in-out 3";
        hasUnreadNotification = true;
    }

    function hideNotificationBadge() {
        const badge = icon.querySelector("[data-wa-notification-badge]");
        if (badge) {
            badge.style.display = "none";
            badge.style.animation = "";
        }

        icon.style.animation = "pulse 1.5s infinite";
        hasUnreadNotification = false;
    }

    function showFirstMessage() {
        if (!msg1) {
            return;
        }

        showTyping(false);
        msg1.style.display = "block";
        firstMessageShown = true;
        scrollChatToBottom();
    }

    function syncInputWithFallback() {
        if (!input) {
            return;
        }

        if (intakeState.active) {
            if (!intakeState.started && !intakeState.completed) {
                input.value = "";
            }
            resizeChatInput();
            return;
        }

        const currentText = input.value.trim();
        if (!currentText || currentText === lastPrefilledText) {
            input.value = fallbackText;
        }

        lastPrefilledText = fallbackText;
        resizeChatInput();
    }

    function updateWidgetMode() {
        currentProfile = resolveCurrentProfile();
        intakeState.active = intakeState.started || intakeState.completed ? intakeState.active : shouldUseIntakeMode();
        updateWidgetSize();
        updateSendButtonIcon();

        let dynamicMsg2 = "¿Buscás asesoramiento legal?";
        fallbackText = "Hola! Necesito asesoramiento legal";

        if (currentProfile) {
            dynamicMsg2 = currentProfile.message;
            fallbackText = currentProfile.fallback;
        }

        if (intakeState.active) {
            if (chatProfileSub) {
                chatProfileSub.textContent = intakeState.completed ? "Consulta recibida" : "Te respondemos pronto";
            }
        } else if (chatProfileSub) {
            chatProfileSub.textContent = "En línea";
        }

        if (msg2) {
            msg2.textContent = dynamicMsg2;
        }

        syncInputWithFallback();

        if (intakeState.completed) {
            setComposerState({
                inputDisabled: true,
                sendDisabled: true,
                placeholder: "Consulta enviada",
            });
        } else if (intakeState.submitting) {
            setComposerState({
                inputDisabled: true,
                sendDisabled: true,
                placeholder: "Enviando consulta...",
            });
        } else if (intakeState.awaitingRetry) {
            setComposerState({
                inputDisabled: true,
                sendDisabled: false,
                placeholder: "Tocá enviar para reintentar",
            });
        } else if (intakeState.active && !intakeState.started) {
            setComposerState({
                inputDisabled: true,
                sendDisabled: true,
                placeholder: "Te hacemos unas preguntas...",
            });
        } else if (intakeState.active) {
            const currentQuestion = getCurrentQuestion();
            setComposerState({
                inputDisabled: false,
                sendDisabled: false,
                placeholder: currentQuestion ? currentQuestion.placeholder : "Escribí tu respuesta",
            });
        } else if (!intakeState.active) {
            setComposerState({
                inputDisabled: false,
                sendDisabled: false,
                placeholder: defaultInputPlaceholder,
            });
        }
    }

    function getIntakeQuestions() {
        return [
            {
                key: "message",
                prompt: "Por favor, detallanos brevemente tu consulta",
                placeholder: "Consulta:",
            },
            {
                key: "name",
                prompt: "Gracias. ¿Cuál es tu nombre?",
                placeholder: "Escribí tu nombre",
            },
            {
                key: "phone",
                prompt: "¿Cuál es tu teléfono o celular?",
                placeholder: "Escribí tu teléfono o celular",
            },
            {
                key: "email",
                prompt: "¿Cuál es tu correo electrónico?",
                placeholder: "Escribí tu correo electrónico",
            },
        ];
    }

    function getCurrentQuestion() {
        return getIntakeQuestions()[intakeState.currentQuestionIndex] || null;
    }

    function getValidationResult(question, rawText) {
        const trimmedText = rawText.trim();

        if (!trimmedText) {
            return {
                valid: false,
                error: "Necesito esa información para poder registrar tu consulta.",
            };
        }

        if (question.key === "name") {
            if (trimmedText.length < 3) {
                return {
                    valid: false,
                    error: "Por favor, escribí tu nombre completo.",
                };
            }

            return { valid: true, value: trimmedText, display: trimmedText };
        }

        if (question.key === "phone") {
            const digits = trimmedText.replace(/\D/g, "");

            if (digits.length < 8) {
                return {
                    valid: false,
                    error: "Necesito un teléfono o celular válido para contactarte.",
                };
            }

            return { valid: true, value: trimmedText, display: trimmedText };
        }

        if (question.key === "email") {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(trimmedText)) {
                return {
                    valid: false,
                    error: "Ese correo no parece válido. ¿Podés escribirlo de nuevo?",
                };
            }

            return { valid: true, value: trimmedText, display: trimmedText };
        }

        return { valid: true, value: trimmedText, display: trimmedText };
    }

    function askCurrentQuestion() {
        const question = getCurrentQuestion();
        if (!question) {
            submitIntakeForm();
            return;
        }

        queueBotMessage(question.prompt, () => {
            input.value = "";
            resizeChatInput();
            setComposerState({
                inputDisabled: false,
                sendDisabled: false,
                placeholder: question.placeholder,
            });
        });
    }

    function startIntakeConversation() {
        if (!intakeState.active || intakeState.started || intakeState.completed) {
            return;
        }

        intakeState.started = true;
        intakeState.answers = {};
        intakeState.currentQuestionIndex = 0;
        input.value = "";
        resizeChatInput();

        window.setTimeout(() => {
            askCurrentQuestion();
        }, 350);
    }

    async function submitIntakeForm() {
        if (intakeState.submitting || intakeState.completed) {
            return;
        }

        const isRetry = intakeState.awaitingRetry;
        intakeState.submitting = true;
        intakeState.awaitingRetry = false;
        setComposerState({
            inputDisabled: true,
            sendDisabled: true,
            placeholder: "Enviando consulta...",
        });

        appendMessage(
            isRetry ? "Estoy reintentando enviar tu consulta." : "Perfecto, estoy enviando tu consulta.",
            "bot",
        );
        showTyping(true);

        const formData = new FormData();
        formData.append("name", intakeState.answers.name || "");
        formData.append("phone", intakeState.answers.phone || "");
        formData.append("email", intakeState.answers.email || "");
        formData.append("subject", getAutoSubject());
        formData.append("message", intakeState.answers.message || "");
        formData.append("source", "Widget WhatsApp fuera de horario");
        formData.append("page", window.location.href);

        try {
            const response = await fetch(contactFormEndpoint, {
                method: "POST",
                body: formData,
                headers: {
                    Accept: "application/json",
                },
            });

            showTyping(false);

            if (!response.ok) {
                throw new Error("FORM_SUBMIT_FAILED");
            }

            intakeState.completed = true;
            intakeState.submitting = false;

            appendMessage(
                "Recibimos tu mensaje. Muchas gracias por escribirnos. Ahora mismo estamos fuera del horario de atención, pero ya tomamos tu consulta y nos vamos a comunicar con vos apenas retomemos la atención.",
                "bot",
            );

            if (chatProfileSub) {
                chatProfileSub.textContent = "Consulta recibida";
            }

            input.value = "";
            resizeChatInput();
            setComposerState({
                inputDisabled: true,
                sendDisabled: true,
                placeholder: "Consulta enviada",
            });
        } catch (error) {
            showTyping(false);
            intakeState.submitting = false;
            intakeState.awaitingRetry = true;

            appendMessage(
                "No pude enviar tu consulta en este momento. Tocá el botón para reintentar y, si el problema continúa, también podés escribirnos a consultas@tbabogados.com.ar.",
                "bot",
            );

            input.value = "";
            resizeChatInput();
            setComposerState({
                inputDisabled: true,
                sendDisabled: false,
                placeholder: "Tocá enviar para reintentar",
            });
        }
    }

    function simulateChat() {
        if (!msg1 || !msg2) {
            return;
        }

        if (!firstMessageShown) {
            showFirstMessage();
        }

        if (secondMessageSequenceStarted || msg2.style.display === "block" || !typing) {
            return;
        }

        secondMessageSequenceStarted = true;

        window.setTimeout(() => {
            showTyping(true);
        }, 800);

        window.setTimeout(() => {
            showTyping(false);
            msg2.style.display = "block";
            scrollChatToBottom();
            if (intakeState.active) {
                startIntakeConversation();
            }
        }, 2000);
    }

    function handleIntakeSubmit() {
        if (sendButton.disabled) {
            return;
        }

        if (intakeState.awaitingRetry) {
            submitIntakeForm();
            return;
        }

        const question = getCurrentQuestion();
        if (!question) {
            return;
        }

        const rawText = input.value;
        const validation = getValidationResult(question, rawText);

        if (!validation.valid) {
            queueBotMessage(validation.error, () => {
                setComposerState({
                    inputDisabled: false,
                    sendDisabled: false,
                    placeholder: question.placeholder,
                });
            }, 700);
            return;
        }

        appendMessage(validation.display, "user");

        intakeState.answers[question.key] = validation.value;
        intakeState.currentQuestionIndex += 1;
        input.value = "";
        resizeChatInput();

        const nextQuestion = getCurrentQuestion();
        if (nextQuestion) {
            askCurrentQuestion();
            return;
        }

        submitIntakeForm();
    }

    function enviarMensaje() {
        if (!input) {
            return;
        }

        updateWidgetMode();

        if (intakeState.active) {
            handleIntakeSubmit();
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

    function adjustWidgetPosition() {
        if (!isMobileDevice) {
            return;
        }

        const viewport = window.visualViewport;
        if (!viewport) {
            if (widget.style.display === "block" && isWidgetInputFocused()) {
                widget.style.top = "20px";
                widget.style.bottom = "auto";
            } else {
                resetViewportAdjustedLayout();
            }
            return;
        }

        const keyboardInset = Math.max(0, baselineViewportHeight - viewport.height - viewport.offsetTop);
        const keyboardIsVisible =
            widget.style.display === "block" &&
            isWidgetInputFocused() &&
            keyboardInset > 80;

        if (!keyboardIsVisible) {
            updateViewportBaseline();
            resetViewportAdjustedLayout();
            return;
        }

        const viewportPadding = 12;
        const availableHeight = Math.max(260, Math.floor(viewport.height - viewportPadding * 2));
        const chromeHeight = Math.max(0, widget.offsetHeight - chatBox.offsetHeight);
        const nextChatHeight = Math.max(110, availableHeight - chromeHeight);

        widget.style.top = "auto";
        widget.style.right = `${baseWidgetRight}px`;
        widget.style.bottom = `${baseWidgetBottom + keyboardInset}px`;
        widget.style.maxHeight = `${availableHeight}px`;
        chatBox.style.height = `${nextChatHeight}px`;
        scrollChatToBottom();
    }

    function cerrarWidget() {
        widget.style.display = "none";
        icon.style.display = "flex";
        updateViewportBaseline(true);
        resetViewportAdjustedLayout();
    }

    function abrirWidget() {
        widget.style.display = "block";
        icon.style.display = "none";
        hideNotificationBadge();
        updateWidgetMode();
        hasOpened = true;
        simulateChat();

        if (!intakeState.active && msg2 && msg2.style.display === "block") {
            setComposerState({
                inputDisabled: false,
                sendDisabled: false,
                placeholder: defaultInputPlaceholder,
            });
        }

        focusInput();
    }

    window.abrirWidget = abrirWidget;
    window.cerrarWidget = cerrarWidget;

    upgradeInputToTextarea();

    if (sendButton) {
        sendButton.addEventListener("click", enviarMensaje);
    }

    input.addEventListener("input", resizeChatInput);

    input.addEventListener("focus", () => {
        window.setTimeout(adjustWidgetPosition, 80);
    });

    input.addEventListener("blur", () => {
        window.setTimeout(() => {
            updateViewportBaseline(true);
            adjustWidgetPosition();
        }, 80);
    });

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (!sendButton.disabled) {
                enviarMensaje();
            }
        }
    });

    updateWidgetMode();
    updateViewportBaseline(true);
    adjustWidgetPosition();

    if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", adjustWidgetPosition);
        window.visualViewport.addEventListener("scroll", adjustWidgetPosition);
    }

    window.addEventListener("orientationchange", () => {
        window.setTimeout(() => {
            updateViewportBaseline(true);
            adjustWidgetPosition();
        }, 120);
    });

    window.setTimeout(() => {
        if (!hasOpened && widget.style.display === "none") {
            showFirstMessage();
            showNotificationBadge();
        }
    }, 45000);
})();
