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
const cheerio = require("react-native-cheerio");
const provider_1 = __importDefault(require("../models/provider"));
class AnimeHeaven extends provider_1.default {
    constructor(customBaseURL) {
        super(customBaseURL);
        this.name = "AnimeHeaven";
        this.baseUrl = "https://animeheaven.me";
        this.languages = "en";
        this.colorHEX = "#e81e2f";
        this.logo = "https://animeheaven.me/favicon.ico";
        this.forRN = true;
    }
    search(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield axios_1.default.get(`${this.baseUrl}/search.php?s=${query}`);
                const $ = cheerio.load(res.data);
                if (!$)
                    return { results: [] };
                const searchResult = {
                    hasNextPage: false,
                    results: [],
                };
                $(".similarimg").each((_, el) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    searchResult.results.push({
                        id: (_d = (_c = (_b = (_a = $(el)) === null || _a === void 0 ? void 0 : _a.find("a")) === null || _b === void 0 ? void 0 : _b.attr("href")) === null || _c === void 0 ? void 0 : _c.split("anime.php?")[1]) !== null && _d !== void 0 ? _d : "",
                        title: (_f = (_e = $(el)) === null || _e === void 0 ? void 0 : _e.find(".similarname.c a.c")) === null || _f === void 0 ? void 0 : _f.text().trim(),
                        image: `${this.baseUrl}/${(_h = (_g = $(el)) === null || _g === void 0 ? void 0 : _g.find("img.coverimg")) === null || _h === void 0 ? void 0 : _h.attr("src")}`,
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
            var _a, _b;
            try {
                // don't ask
                const res = yield fetch(`${this.baseUrl}/anime.php?${id}`, {
                    method: "GET",
                });
                const $ = cheerio.load(yield res.text());
                const info = {
                    id,
                    hasSeasons: false,
                    title: (_a = $(".infotitle.c")) === null || _a === void 0 ? void 0 : _a.text().trim(),
                    description: (_b = $(".infodes.c")) === null || _b === void 0 ? void 0 : _b.text().trim(),
                    genres: $("boxitem.bc2.c1")
                        .map((_, el) => $(el).text().trim())
                        .get(),
                    totalEpisodes: parseInt($($(".inline.c2")[0]).text().trim()),
                    releaseDate: {
                        year: parseInt($($(".inline.c2")[1]).text().split("/")[0].trim()),
                    },
                    rating: parseFloat($($(".inline.c2")[2]).text().trim().split("/")[0]),
                    cover: $(".posterimg").attr("src"),
                    synonyms: $(".infotitlejp.c")
                        ? [$(".infotitlejp.c").text().trim()]
                        : undefined,
                    episodes: [],
                };
                $(".ac3").each((_, el) => {
                    var _a, _b, _c;
                    (_a = info.episodes) === null || _a === void 0 ? void 0 : _a.push({
                        id: (_c = (_b = $(el).attr("href")) === null || _b === void 0 ? void 0 : _b.split("episode.php?")[1]) !== null && _c !== void 0 ? _c : "",
                        number: parseFloat($(el).find(".watch2.bc").text().trim()),
                    });
                });
                return info;
            }
            catch (err) {
                console.log(err);
                throw new Error(err.message);
            }
        });
    }
    fetchSources(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            try {
                const res = yield fetch(`${this.baseUrl}/episode.php?${id}`, {
                    method: "GET",
                });
                const $ = cheerio.load(yield res.text());
                const episodeSources = {
                    sources: [],
                };
                const source = (_c = (_b = (_a = $("#vid")) === null || _a === void 0 ? void 0 : _a.find("source")) === null || _b === void 0 ? void 0 : _b.eq(0)) === null || _c === void 0 ? void 0 : _c.attr("src");
                if (source)
                    episodeSources.sources.push({
                        url: source,
                        quality: "default",
                    });
                const altSource = (_f = (_e = (_d = $("#vid")) === null || _d === void 0 ? void 0 : _d.find("source")) === null || _e === void 0 ? void 0 : _e.eq(1)) === null || _f === void 0 ? void 0 : _f.attr("src");
                if (altSource)
                    episodeSources.sources.push({
                        url: altSource,
                        quality: "backup",
                    });
                return episodeSources;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
    }
}
exports.default = AnimeHeaven;
