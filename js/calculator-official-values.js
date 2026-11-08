(function (global) {
    'use strict';

    const SERIES_API_BASE = 'https://apis.datos.gob.ar/series/api/series/';
    const IPC_SERIES_ID = '148.3_INIVELNAL_DICI_M_26';
    const IPC_SNAPSHOT_URL = new URL('../data/calculator-ipc.json', document.currentScript.src).href;
    const IPC_SOURCE_URL = 'https://www.indec.gob.ar/ftp/cuadros/economia/serie_ipc_divisiones.csv';
    const RIPTE_SERIES_ID = '158.1_REPTE_0_0_5';
    const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

    const CONTRIBUTION_CAP_BASE = {
        // Resolución ANSES 304/2026, art. 3.
        value: 4861685.38,
        effectiveMonth: '2026-11',
        ipcMonth: '2026-09'
    };

    const CONTRIBUTION_CAP_FALLBACKS = {
        '2026-08': 4594798.23,
        '2026-09': 4691748.47,
        '2026-10': 4769631.49,
        [CONTRIBUTION_CAP_BASE.effectiveMonth]: CONTRIBUTION_CAP_BASE.value
    };

    const ART_FLOOR_BASE = {
        value: 114354110,
        periodStart: '2026-09',
        ripteMonth: '2026-06'
    };

    const ART_FLOOR_FALLBACKS = {
        '2026-03': 97502420,
        '2026-09': 114354110
    };

    const MONTH_NAMES = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    function addMonths(yearMonth, delta) {
        const [year, month] = yearMonth.split('-').map(Number);
        const total = year * 12 + month - 1 + delta;
        return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
    }

    function argentinaYearMonth(date = new Date()) {
        const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Argentina/Buenos_Aires',
            year: 'numeric',
            month: '2-digit'
        }).formatToParts(date).map((part) => [part.type, part.value]));

        return `${parts.year}-${parts.month}`;
    }

    function monthLabel(yearMonth) {
        const [year, month] = yearMonth.split('-').map(Number);
        return `${MONTH_NAMES[month - 1]} ${year}`;
    }

    function artPeriodStart(yearMonth) {
        const [year, month] = yearMonth.split('-').map(Number);
        if (month >= 9) return `${year}-09`;
        if (month >= 3) return `${year}-03`;
        return `${year - 1}-09`;
    }

    function artPeriodEnd(periodStart) {
        const [year, month] = periodStart.split('-').map(Number);
        return month === 9 ? `${year + 1}-02` : `${year}-08`;
    }

    function daysInMonth(yearMonth) {
        const [year, month] = yearMonth.split('-').map(Number);
        return new Date(Date.UTC(year, month, 0)).getUTCDate();
    }

    function periodLabel(start, end) {
        const [startYear, startMonth] = start.split('-').map(Number);
        const [endYear, endMonth] = end.split('-').map(Number);
        return `1 de ${MONTH_NAMES[startMonth - 1]} de ${startYear} y el ${daysInMonth(end)} de ${MONTH_NAMES[endMonth - 1]} de ${endYear}`;
    }

    function latestFallback(schedule, requestedMonth) {
        const months = Object.keys(schedule).sort();
        let selected = months[0];
        for (const month of months) {
            if (month > requestedMonth) break;
            selected = month;
        }
        return { month: selected, value: schedule[selected] };
    }

    function readCache(key) {
        try {
            const cached = JSON.parse(global.localStorage.getItem(key));
            if (!cached || Date.now() - cached.savedAt > CACHE_TTL_MS) return null;
            return cached.value;
        } catch (error) {
            return null;
        }
    }

    function writeCache(key, value) {
        try {
            global.localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), value }));
        } catch (error) {
            // La calculadora funciona igualmente si el navegador bloquea localStorage.
        }
    }

    async function fetchJson(url, timeoutMs = 8000) {
        const controller = typeof AbortController === 'function' ? new AbortController() : null;
        const timeout = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

        try {
            const response = await fetch(url, controller ? { signal: controller.signal } : undefined);
            if (!response.ok) throw new Error(`La API oficial respondió ${response.status}.`);
            return await response.json();
        } finally {
            if (timeout) clearTimeout(timeout);
        }
    }

    async function fetchSeries(seriesId, limit) {
        const url = `${SERIES_API_BASE}?ids=${encodeURIComponent(seriesId)}&sort=desc&limit=${limit}&format=json`;
        const json = await fetchJson(url);
        const values = {};

        (json.data || []).forEach((point) => {
            if (!Array.isArray(point) || typeof point[0] !== 'string') return;
            const value = Number(point[1]);
            if (Number.isFinite(value) && value > 0) values[point[0].slice(0, 7)] = value;
        });

        return values;
    }

    function continuousIpc(values, baseMonth, targetMonth) {
        const range = {};
        for (let month = baseMonth; month <= targetMonth; month = addMonths(month, 1)) {
            const value = values?.[month];
            if (!Number.isFinite(value) || value <= 0) break;
            range[month] = value;
        }
        return range;
    }

    async function getNationalIpc(baseMonth, targetMonth) {
        if (targetMonth < baseMonth) return {};

        const snapshot = await fetchJson(IPC_SNAPSHOT_URL, 4000).catch(() => null);
        const local = continuousIpc(
            snapshot?.source === IPC_SOURCE_URL ? snapshot.values : null,
            baseMonth,
            targetMonth
        );
        if (local[targetMonth]) return local;

        const series = await fetchSeries(IPC_SERIES_ID, 36).catch(() => null);
        const remote = continuousIpc(series, baseMonth, targetMonth);
        // Ambas series se comparan por cobertura. El cálculo usa los niveles de una sola.
        return Object.keys(remote).length > Object.keys(local).length ? remote : local;
    }

    function initialContributionCap(date = new Date()) {
        const requestedMonth = argentinaYearMonth(date);
        const fallback = latestFallback(CONTRIBUTION_CAP_FALLBACKS, requestedMonth);
        return {
            value: fallback.value,
            effectiveMonth: fallback.month,
            effectiveLabel: monthLabel(fallback.month),
            source: 'official-fallback'
        };
    }

    async function getContributionCap(date = new Date()) {
        const requestedMonth = argentinaYearMonth(date);
        const fallback = initialContributionCap(date);
        if (requestedMonth <= CONTRIBUTION_CAP_BASE.effectiveMonth) return fallback;

        const cacheKey = `tb-contribution-cap:${CONTRIBUTION_CAP_BASE.effectiveMonth}:${requestedMonth}`;
        const cached = readCache(cacheKey);
        if (cached) return cached;

        const baseMonth = CONTRIBUTION_CAP_BASE.ipcMonth;
        const targetMonth = addMonths(requestedMonth, -2);
        const ipcValues = await getNationalIpc(baseMonth, targetMonth);
        const ipcMonth = Object.keys(ipcValues).at(-1);
        if (!ipcMonth || ipcMonth <= baseMonth) return fallback;

        const value = Math.round(CONTRIBUTION_CAP_BASE.value * (ipcValues[ipcMonth] / ipcValues[baseMonth]) * 100) / 100;
        if (!Number.isFinite(value) || value <= 0) return fallback;

        const effectiveMonth = addMonths(ipcMonth, 2);
        const result = {
            value,
            effectiveMonth,
            effectiveLabel: monthLabel(effectiveMonth),
            source: 'estimated-ipc'
        };
        if (ipcMonth === targetMonth) writeCache(cacheKey, result);
        return result;
    }

    function initialArtFloor(date = new Date()) {
        const requestedPeriod = artPeriodStart(argentinaYearMonth(date));
        const fallback = latestFallback(ART_FLOOR_FALLBACKS, requestedPeriod);
        const end = artPeriodEnd(fallback.month);
        return {
            value: fallback.value,
            periodStart: fallback.month,
            periodEnd: end,
            periodEndDay: daysInMonth(end),
            periodLabel: periodLabel(fallback.month, end),
            source: 'official-fallback'
        };
    }

    async function getArtFloor(date = new Date()) {
        const requestedPeriod = artPeriodStart(argentinaYearMonth(date));
        const cacheKey = `tb-art-floor:${requestedPeriod}`;
        const cached = readCache(cacheKey);
        if (cached) return cached;

        const fallback = initialArtFloor(date);
        if (requestedPeriod < ART_FLOOR_BASE.periodStart) return fallback;

        try {
            const ripteValues = await fetchSeries(RIPTE_SERIES_ID, 48);
            const targetRipteMonth = addMonths(requestedPeriod, -3);
            const baseRipte = ripteValues[ART_FLOOR_BASE.ripteMonth];
            const targetRipte = ripteValues[targetRipteMonth];
            if (!baseRipte || !targetRipte) return fallback;

            const value = Math.round(ART_FLOOR_BASE.value * (targetRipte / baseRipte));
            if (!Number.isFinite(value) || value <= 0) return fallback;

            const end = artPeriodEnd(requestedPeriod);
            const result = {
                value,
                periodStart: requestedPeriod,
                periodEnd: end,
                periodEndDay: daysInMonth(end),
                periodLabel: periodLabel(requestedPeriod, end),
                source: 'official-api-ripte'
            };
            writeCache(cacheKey, result);
            return result;
        } catch (error) {
            return fallback;
        }
    }

    global.TBOfficialCalculatorValues = {
        getContributionCap,
        getArtFloor,
        getNationalIpc,
        initialContributionCap,
        initialArtFloor
    };
})(window);
