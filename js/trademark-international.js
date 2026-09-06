(function () {
    "use strict";

    function pushEvent(eventName, details) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(Object.assign({ event: eventName }, details || {}));
    }

    function initNavigation() {
        const toggle = document.querySelector("[data-ti-nav-toggle]");
        const panel = document.querySelector("[data-ti-nav-panel]");

        if (!toggle || !panel) return;

        const setOpen = function (open) {
            toggle.setAttribute("aria-expanded", String(open));
            panel.dataset.open = String(open);
            toggle.textContent = open ? "×" : "☰";
        };

        toggle.addEventListener("click", function () {
            setOpen(toggle.getAttribute("aria-expanded") !== "true");
        });

        panel.addEventListener("click", function (event) {
            if (event.target.closest("a") && window.matchMedia("(max-width: 760px)").matches) {
                setOpen(false);
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") setOpen(false);
        });
    }

    function initAccordions() {
        document.querySelectorAll("[data-ti-faq-button]").forEach(function (button) {
            const panelId = button.getAttribute("aria-controls");
            const panel = panelId ? document.getElementById(panelId) : null;
            if (!panel) return;

            button.addEventListener("click", function () {
                const open = button.getAttribute("aria-expanded") === "true";
                button.setAttribute("aria-expanded", String(!open));
                panel.hidden = open;
            });
        });
    }

    function initAnalytics() {
        document.addEventListener("click", function (event) {
            const link = event.target.closest("[data-analytics-event]");
            if (!link) return;

            pushEvent(link.dataset.analyticsEvent, {
                page_language: document.documentElement.lang,
                page_type: document.body.dataset.pageType || "trademark",
                cta_position: link.dataset.ctaPosition || "unspecified",
                contact_method: link.dataset.contactMethod || "onsite",
            });
        });
    }

    function formCopy(language) {
        if (language.toLowerCase().startsWith("pt")) {
            return {
                sending: "Enviando…",
                success: "Recebemos sua consulta. Nossa equipe analisará as informações e entrará em contato.",
                error: "Não foi possível enviar a consulta agora. Tente novamente ou escreva para consultas@tbabogados.com.ar.",
                required: "Preencha este campo.",
                email: "Informe um e-mail válido.",
            };
        }

        return {
            sending: "Sending…",
            success: "We received your inquiry. Our team will review the information and contact you.",
            error: "We could not send your inquiry right now. Please try again or email consultas@tbabogados.com.ar.",
            required: "Please complete this field.",
            email: "Please enter a valid email address.",
        };
    }

    function setFieldError(field, copy) {
        const wrapper = field.closest(".ti-field") || field.closest(".ti-consent");
        if (!wrapper) return;

        let message = wrapper.querySelector(".ti-field-error");
        const messageId = field.id ? field.id + "-error" : "";
        if (!message) {
            message = document.createElement("span");
            message.className = "ti-field-error";
            if (messageId) message.id = messageId;
            wrapper.appendChild(message);
        }

        message.textContent = field.validity.typeMismatch ? copy.email : copy.required;
        field.setAttribute("aria-invalid", "true");
        if (messageId) {
            const describedBy = (field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
            if (!describedBy.includes(messageId)) describedBy.push(messageId);
            field.setAttribute("aria-describedby", describedBy.join(" "));
        }
    }

    function clearFieldError(field) {
        const wrapper = field.closest(".ti-field") || field.closest(".ti-consent");
        const message = wrapper ? wrapper.querySelector(".ti-field-error") : null;
        if (message) message.remove();
        field.removeAttribute("aria-invalid");
        if (field.id) {
            const messageId = field.id + "-error";
            const describedBy = (field.getAttribute("aria-describedby") || "")
                .split(/\s+/)
                .filter(function (id) { return id && id !== messageId; });
            if (describedBy.length) field.setAttribute("aria-describedby", describedBy.join(" "));
            else field.removeAttribute("aria-describedby");
        }
    }

    function initForms() {
        document.querySelectorAll("[data-trademark-form]").forEach(function (form) {
            const language = document.documentElement.lang || "en";
            const copy = formCopy(language);
            const status = form.querySelector("[data-form-status]");
            const submit = form.querySelector('button[type="submit"]');
            let started = false;
            let submitting = false;

            form.querySelectorAll("input, select, textarea").forEach(function (field) {
                field.addEventListener("invalid", function (event) {
                    event.preventDefault();
                    setFieldError(field, copy);
                });
                field.addEventListener("input", function () {
                    if (field.validity.valid) clearFieldError(field);
                });
                field.addEventListener("change", function () {
                    if (field.validity.valid) clearFieldError(field);
                });
            });

            form.addEventListener("input", function () {
                if (started) return;
                started = true;
                pushEvent("quote_form_start", {
                    page_language: language,
                    page_type: document.body.dataset.pageType || "trademark",
                });
            });

            form.addEventListener("submit", async function (event) {
                event.preventDefault();

                if (submitting) return;
                if (!form.checkValidity()) {
                    form.querySelector(":invalid")?.focus();
                    return;
                }

                const originalText = submit.textContent;
                submitting = true;
                submit.disabled = true;
                submit.textContent = copy.sending;
                status.textContent = "";
                status.removeAttribute("data-state");

                pushEvent("quote_form_submit", {
                    page_language: language,
                    page_type: document.body.dataset.pageType || "trademark",
                });

                const data = new FormData(form);
                const campaign = new URLSearchParams(window.location.search);
                data.set("page_path", window.location.pathname);
                data.set("page_url", window.location.href.split("#")[0]);
                data.set("page_language", language);
                data.set("page_type", document.body.dataset.pageType || "trademark");
                data.set("referrer", document.referrer || "direct");
                ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (key) {
                    const value = campaign.get(key);
                    if (value) data.set(key, value);
                });

                try {
                    const response = await fetch(form.action, {
                        method: form.method || "POST",
                        body: data,
                        headers: { Accept: "application/json" },
                    });

                    if (!response.ok) throw new Error("FORM_SUBMIT_FAILED");

                    status.textContent = copy.success;
                    status.dataset.state = "success";
                    form.reset();
                    form.querySelectorAll("[aria-invalid]").forEach(clearFieldError);
                    started = false;

                    pushEvent(
                        document.body.dataset.pageType === "foreign-associate"
                            ? "associate_contact_success"
                            : "quote_form_success",
                        {
                            page_language: language,
                            page_type: document.body.dataset.pageType || "trademark",
                        },
                    );

                    status.focus();
                } catch (error) {
                    status.textContent = copy.error;
                    status.dataset.state = "error";
                    pushEvent("quote_form_error", {
                        page_language: language,
                        page_type: document.body.dataset.pageType || "trademark",
                    });
                } finally {
                    submitting = false;
                    submit.disabled = false;
                    submit.textContent = originalText;
                }
            });
        });
    }

    function initFooterYear() {
        document.querySelectorAll("[data-current-year]").forEach(function (element) {
            element.textContent = new Date().getFullYear();
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initNavigation();
        initAccordions();
        initAnalytics();
        initForms();
        initFooterYear();
    });
})();
