const express = require("express");
const axios = require("axios");

const nseRouter = express.Router();

const BASE = "https://www.nseindia.in";
const MARQUEE_PATH = "/api/NextApi/apiClient?functionName=getMarqueData";
const CACHE_MS = 15000;

// Same headers as the working curl request
const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36",
    Accept: "*/*",
    "Accept-Language": "en-GB,en;q=0.6",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Referer: BASE + "/",
    "sec-ch-ua": '"Chromium";v="158", "Not.A/Brand";v="24", "Brave";v="158"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Linux"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
};

const client = axios.create({
    baseURL: BASE,
    headers: HEADERS,
    timeout: 10000,
    validateStatus: () => true,
});

let cookie = "";
let cache = null;
let rawCache = null;
let cachedAt = 0;

async function refreshCookie() {
    const res = await client.get("/");
    const setCookies = res.headers["set-cookie"] || [];
    cookie = setCookies.map((c) => c.split(";")[0]).join("; ");
    console.log(
        `[nse] cookie refreshed (${setCookies.length} cookies, status ${res.status})`,
    );
}

async function callNse(path, retry = true) {
    if (!cookie) await refreshCookie();
    const res = await client.get(path, { headers: { Cookie: cookie } });

    if ((res.status === 401 || res.status === 403) && retry) {
        await refreshCookie();
        return callNse(path, false);
    }
    if (res.status >= 400) throw new Error(`NSE responded ${res.status}`);
    if (typeof res.data !== "object") {
        throw new Error(
            "NSE returned non-JSON (likely blocked): " +
                String(res.data).slice(0, 120),
        );
    }
    return res.data;
}

async function getTicker() {
    if (cache && Date.now() - cachedAt < CACHE_MS) return cache;

    const json = await callNse(MARQUEE_PATH);
    rawCache = json;

    if (!Array.isArray(json.data))
        throw new Error("Unexpected response shape — check /nse/ticker/raw");

    cache = json.data.map((d) => ({
        symbol: d.symbol,
        price: d.lastTradedPrice,
        change: d.change,
        pChange: d.perChange,
    }));
    cachedAt = Date.now();
    return cache;
}

const errorReason = (e) => e.cause?.code || e.code || e.cause?.message || "";

nseRouter.get("/nse/ticker", async (req, res) => {
    try {
        res.json(await getTicker());
    } catch (e) {
        cookie = ""; // force fresh NSE cookies on the next call
        const reason = errorReason(e);
        console.error("[nse]", e.message, reason);
        if (cache) return res.json(cache); // serve stale data
        res.status(502).json({ error: e.message, reason });
    }
});

nseRouter.get("/nse/ticker/raw", async (req, res) => {
    try {
        await getTicker();
        res.json(rawCache);
    } catch (e) {
        res.status(502).json({
            error: e.message,
            reason: errorReason(e),
            raw: rawCache,
        });
    }
});

module.exports = nseRouter;
