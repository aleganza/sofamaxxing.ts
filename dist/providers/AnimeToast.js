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
const types_1 = require("../models/types");
const cheerio = require("react-native-cheerio");
class AnimeToast extends provider_1.default {
    constructor(customBaseURL) {
        super(customBaseURL);
        this.name = "AnimeToast";
        this.baseUrl = "https://www.animetoast.cc";
        this.languages = "de";
        this.colorHEX = "#694ba1";
        this.logo = "https://www.animetoast.cc/wp-content/uploads/2018/03/toastfavi-300x300.png";
        this.forRN = true;
    }
    search(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, page = 1) {
            try {
                const res = yield axios_1.default.get(`${this.baseUrl}/page/${page}/?s=${query}`);
                const $ = cheerio.load(res.data);
                if (!$)
                    return { results: [] };
                const pagesSource = $("section.video-listing .wp-pagenavi .pages");
                const totalPages = pagesSource && pagesSource.text().includes("von ")
                    ? Number(pagesSource.text().trim().split("von ")[1]) || 1
                    : 1;
                const searchResult = {
                    currentPage: page,
                    hasNextPage: totalPages > page,
                    totalPages,
                    results: [],
                };
                $("div.blog-item:not([id])").each((_, el) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                    searchResult.results.push({
                        id: (_e = (_d = (_c = (_b = (_a = $(el)) === null || _a === void 0 ? void 0 : _a.find(".item-thumbnail a")) === null || _b === void 0 ? void 0 : _b.attr("href")) === null || _c === void 0 ? void 0 : _c.split(`${this.baseUrl}/`)[1]) === null || _d === void 0 ? void 0 : _d.split("/")[0]) !== null && _e !== void 0 ? _e : "",
                        title: (_g = (_f = $(el)) === null || _f === void 0 ? void 0 : _f.find(".item-head h3 a")) === null || _g === void 0 ? void 0 : _g.text().trim(),
                        image: (_j = (_h = $(el)) === null || _h === void 0 ? void 0 : _h.find(".item-thumbnail a img")) === null || _j === void 0 ? void 0 : _j.attr("src"),
                    });
                });
                return searchResult;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
    }
    /**
     * PAGES SYSTEMS IS RARELY BROKEN (url pattern mismatch)
     *
     * @param id
     * @param page
     * @returns
     */
    fetchInfo(id_1) {
        return __awaiter(this, arguments, void 0, function* (id, page = 1) {
            var _a, _b;
            try {
                const res = yield axios_1.default.get(`${this.baseUrl}/${id}/?link=0`);
                const $ = cheerio.load(res.data);
                // const individualEpisodes
                const ps = ".single-inbox .item-content p";
                const info = {
                    id: id,
                    hasSeasons: false,
                    title: $("h1.light-title.entry-title").text().trim(),
                    subOrDub: $("h1.light-title.entry-title").text().trim().includes(" Dub")
                        ? types_1.SubOrDub.DUB
                        : types_1.SubOrDub.SUB,
                    description: $(ps).first().text().trim(),
                    cover: $(ps).first().find("img").attr("src"),
                    genres: $(ps)
                        .filter((_, p) => $(p).find("strong").text().trim() === "Genre:")
                        .contents()
                        .not("strong")
                        .text()
                        .trim()
                        .split(", "),
                    releaseDate: {
                        year: Number($(ps)
                            .filter((_, p) => $(p).find("strong").text().trim() === "Season Start:")
                            .contents()
                            .not("strong")
                            .text()
                            .trim()
                            .split(" ")[1]),
                    },
                    episodes: [],
                };
                const link = $("ul.nav.nav-tabs")
                    .find("li:has(a) a")
                    .filter((_, a) => $(a).text().trim() === "Voe")
                    .attr("href");
                const btns = $(link).find("a");
                const epBtns = btns.filter((_, el) => !$(el).text().includes("S") && !$(el).text().includes("-"));
                const hasPages = btns
                    .toArray()
                    .some((el) => $(el).text().includes("S") || $(el).text().includes("-"));
                let totalPages;
                // --- no pages
                // individual links are already provided like `Ep. 10`
                if (!hasPages) {
                    totalPages = 1;
                    if (page < 1 || page > totalPages)
                        throw new Error(`Argument 'page' for ${id} must be 1!`);
                    epBtns.each((_, el) => {
                        var _a, _b, _c;
                        (_a = info.episodes) === null || _a === void 0 ? void 0 : _a.push({
                            id: (_c = (_b = $(el).attr("href")) === null || _b === void 0 ? void 0 : _b.split(`${this.baseUrl}/`)[1]) !== null && _c !== void 0 ? _c : "",
                            number: Number($(el).text().trim().split("Ep. ")[1]),
                        });
                    });
                    return info;
                }
                // --- with pages
                // pages links are provided like `S21:E892-1072` or `E892-1072` (hypehenBtn)
                // there may be invididual links too, like `E1100`  (eBtns)
                // each page link is a page + all the individual is the last page
                const hypehenBtns = btns.filter((_, el) => $(el).text().includes("-"));
                const eBtns = btns.filter((_, el) => $(el).text().includes("E") && !$(el).text().includes("-"));
                totalPages = hypehenBtns.length;
                if (eBtns.length > 0)
                    totalPages++;
                if (page < 1 || page > totalPages)
                    throw new Error(`Argument 'page' for ${id} must be between 1 and ${totalPages}! (You passed ${page})`);
                if (page != totalPages + (eBtns.length > 0 ? 0 : 1)) {
                    // pages with hypehenBtn
                    const mockPlayerHref = $("#player-embed a").attr("href");
                    const mockId = (_a = mockPlayerHref === null || mockPlayerHref === void 0 ? void 0 : mockPlayerHref.split(`${this.baseUrl}/`)[1].split("-")[0]) !== null && _a !== void 0 ? _a : "";
                    const res2 = yield axios_1.default.get((_b = mockPlayerHref === null || mockPlayerHref === void 0 ? void 0 : mockPlayerHref.replace(mockId, (Number(mockId) + (page - 1) * 2).toString())) !== null && _b !== void 0 ? _b : "");
                    const $2 = cheerio.load(res2.data);
                    $2(".tab-content .multilink-btn").each((_, el) => {
                        var _a, _b, _c;
                        (_a = info.episodes) === null || _a === void 0 ? void 0 : _a.push({
                            id: (_c = (_b = $(el).attr("href")) === null || _b === void 0 ? void 0 : _b.split(`${this.baseUrl}/`)[1]) !== null && _c !== void 0 ? _c : "",
                            number: Number($(el).text().trim().replace("Ep. ", "").replace("E", "")),
                        });
                    });
                }
                else {
                    // page with eBtn (last page) if exists
                    eBtns.each((_, el) => {
                        var _a, _b, _c;
                        (_a = info.episodes) === null || _a === void 0 ? void 0 : _a.push({
                            id: (_c = (_b = $(el).attr("href")) === null || _b === void 0 ? void 0 : _b.split(`${this.baseUrl}/`)[1]) !== null && _c !== void 0 ? _c : "",
                            number: Number($(el).text().trim().replace("Ep. ", "").replace("E", "")),
                        });
                    });
                }
                info.currentPage = page;
                info.hasNextPage = totalPages > page;
                info.totalPages = totalPages;
                return info;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
    }
    fetchSources(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const res = yield axios_1.default.get(`${this.baseUrl}/${id}`);
                const $ = cheerio.load(res.data);
                const playerUrl = (_a = $("#player-embed a").attr("href")) !== null && _a !== void 0 ? _a : "";
                const res2 = yield axios_1.default.get(playerUrl);
                const $2 = cheerio.load(res2.data);
                const streamUrl = $2("script")
                    .html()
                    .toString()
                    .match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/)[1];
                const res3 = yield axios_1.default.get(streamUrl);
                const $3 = cheerio.load(res3.data);
                const episodeSources = {
                    sources: [],
                };
                $3("script").each((_, script) => {
                    var _a;
                    const scriptContent = $3(script).html();
                    if (scriptContent === null || scriptContent === void 0 ? void 0 : scriptContent.includes("DOMContentLoaded")) {
                        const urls = (_a = scriptContent
                            .match(/\/\/ https[^\n]*/g)) === null || _a === void 0 ? void 0 : _a.map((s) => s.replace("//", "").trim());
                        if (urls) {
                            episodeSources.sources.push({
                                url: urls[0],
                                quality: "default",
                                isM3U8: true,
                            });
                            episodeSources.sources.push({
                                url: urls[1],
                                quality: "backup",
                            });
                            episodeSources.download = urls[2];
                        }
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
exports.default = AnimeToast;
