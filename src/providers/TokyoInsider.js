"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const provider_1 = __importDefault(require("../models/provider"));
const tokyoinsider_1 = require("../modules/utils/tokyoinsider");
const cheerio = require("react-native-cheerio");
class TokyoInsider extends provider_1.default {
    constructor(customBaseURL) {
        super(customBaseURL);
        this.name = "TokyoInsider";
        this.baseUrl = "https://www.tokyoinsider.com";
        this.languages = "en";
        this.colorHEX = "#f568cf";
        this.logo = "https://www.tokyoinsider.com/favicon.ico";
        this.forRN = true;
    }
    search(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, page = 1) {
            try {
                const res = yield axios_1.default.get(`${this.baseUrl}/anime/search?k=${query}&start=${(page - 1) * 20}`);
                const $ = cheerio.load(res.data);
                if (!$)
                    return { results: [] };
                const pager = $(".pager");
                const totalPages = pager.length > 0 && pager.find("a:not([class])").length > 0
                    ? Number(pager.find("a:not([class])").eq(-1).text().trim()) || 1
                    : 1;
                const searchResult = {
                    currentPage: page,
                    hasNextPage: totalPages > page,
                    totalPages,
                    results: [],
                };
                const table = $('table[width="100%"][border="0"][cellspacing="0"][cellpadding="3"]');
                table.find("tr").each((_, el) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                    const col1 = (_b = (_a = $(el)) === null || _a === void 0 ? void 0 : _a.find("td")) === null || _b === void 0 ? void 0 : _b.eq(0);
                    const col2 = (_d = (_c = $(el)) === null || _c === void 0 ? void 0 : _c.find("td")) === null || _d === void 0 ? void 0 : _d.eq(1);
                    searchResult.results.push({
                        id: (_h = (_g = (_f = (_e = $(col1)) === null || _e === void 0 ? void 0 : _e.find("a")) === null || _f === void 0 ? void 0 : _f.attr("href")) === null || _g === void 0 ? void 0 : _g.split("/anime/")[1]) !== null && _h !== void 0 ? _h : "",
                        title: $(col2).find("div").eq(0).find("a").text().trim(),
                        image: (_j = $(col1)) === null || _j === void 0 ? void 0 : _j.find("a img").attr("src"),
                    });
                });
                return searchResult;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
    }
    fetchInfo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            try {
                const res = yield axios_1.default.get(`${this.baseUrl}/anime/${id}`);
                const $ = cheerio.load(res.data);
                const tableRow = (eq) => $("#inner_page table")
                    .first()
                    .find("tbody tr td")
                    .eq(1)
                    .find("tr")
                    .eq(eq)
                    .find("td")
                    .eq(1);
                const totalEpisodes = Number($(".episode").first().find("a.download-link strong").text().trim());
                const episodesDivs = $(".episode").slice(0, totalEpisodes);
                const info = {
                    id,
                    hasSeasons: false,
                    title: $("#bc").first().find("a").last().text().trim(),
                    totalEpisodes,
                    genres: (_b = (_a = tableRow(2)) === null || _a === void 0 ? void 0 : _a.find("a")) === null || _b === void 0 ? void 0 : _b.map((_, el) => { var _a; return (_a = $(el)) === null || _a === void 0 ? void 0 : _a.text().trim(); }).get(),
                    releaseDate: {
                        year: Number((_c = tableRow(4).text()) === null || _c === void 0 ? void 0 : _c.split(", ")[1]),
                        month: tokyoinsider_1.MONTHS[(_d = tableRow(4).text()) === null || _d === void 0 ? void 0 : _d.split(" ")[0]],
                        day: Number((_f = (_e = tableRow(4).text()) === null || _e === void 0 ? void 0 : _e.split(" ")[1]) === null || _f === void 0 ? void 0 : _f.split(",")[0]),
                    },
                    cover: $("img.a_img").first().attr("src"),
                    description: tableRow(6)
                        .text()
                        .replace(/[\t\n]/g, "")
                        .trim(),
                    synonyms: (_h = (_g = tableRow(0)) === null || _g === void 0 ? void 0 : _g.html()) === null || _h === void 0 ? void 0 : _h.split("<br>").map((title) => title.trim()).filter((title) => title !== ""),
                    episodes: [],
                };
                episodesDivs.each((_, el) => {
                    var _a, _b, _c;
                    (_a = info.episodes) === null || _a === void 0 ? void 0 : _a.push({
                        id: (_c = (_b = $(el).find("a").attr("href")) === null || _b === void 0 ? void 0 : _b.split("/anime/")[1]) !== null && _c !== void 0 ? _c : "",
                        number: Number($(el).find("a strong").text().trim()),
                    });
                });
                return info;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
    }
    fetchSources(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield axios_1.default.get(`${this.baseUrl}/anime/${id}`);
                const $ = cheerio.load(res.data);
                const sourcesDivs = $("#inner_page .c_h2, #inner_page .c_h2b");
                const extractSource = (eq) => sourcesDivs.eq(eq).find("div").first().find("a").last().attr("href");
                const episodeSources = {
                    sources: [],
                    download: extractSource(0),
                };
                let foundFirst = false;
                sourcesDivs.each((i) => {
                    const s = extractSource(i);
                    if (s && (s === null || s === void 0 ? void 0 : s.includes(".mp4"))) {
                        episodeSources.sources.push({
                            url: s,
                            quality: foundFirst ? "backup" : "default",
                        });
                        foundFirst = true;
                    }
                });
                return episodeSources;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
    }
}
exports.default = TokyoInsider;
