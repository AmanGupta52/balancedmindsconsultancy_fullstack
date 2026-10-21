const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");
const { newsApiKey } = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

const router = express.Router();
const cache = new NodeCache({ stdTTL: 600 });

const DEFAULT_QUERY =
  '"mental health" OR wellness OR therapy OR anxiety OR depression OR "stress management" OR mindfulness';

router.get(
  "/",
  asyncHandler(async (req, res) => {
    if (!newsApiKey) throw new HttpError(503, "News service is not configured");

    const q = String(req.query.q || "").trim().slice(0, 100) || DEFAULT_QUERY;
    const key = `news:${q}`;
    const cached = cache.get(key);
    if (cached) return res.json(cached);

    try {
      const { data } = await axios.get("https://newsapi.org/v2/everything", {
        params: { q, language: "en", sortBy: "publishedAt", pageSize: 24 },
        headers: { "X-Api-Key": newsApiKey }, // header keeps the key out of URLs/logs
        timeout: 10000,
      });
      const payload = {
        articles: (data.articles || []).filter((a) => a.title && a.title !== "[Removed]"),
      };
      cache.set(key, payload);
      res.json(payload);
    } catch (err) {
      throw new HttpError(err.response?.status === 429 ? 429 : 502, "Could not load news right now");
    }
  })
);

module.exports = router;
