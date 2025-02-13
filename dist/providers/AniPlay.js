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
const http_client_1 = __importDefault(require("../models/http-client"));
const provider_1 = __importDefault(require("../models/provider"));
const axios_1 = __importDefault(require("axios"));
const cheerio = require("react-native-cheerio");
class AniPlay extends provider_1.default {
    constructor(customBaseURL) {
        super(customBaseURL);
        this.name = "AniPlay";
        this.baseUrl = "https://aniplaynow.live";
        this.languages = "en";
        this.colorHEX = "#cdaaf5";
        this.logo = `${this.baseUrl}/favicon-16x16.png`;
        this.forRN = true;
        this.getDetailFromText = ($, text) => {
            const div = $(".AnimeDetailsBottom_singlecontent__bW8T7").filter((i, el) => $(el).find("span").first().text().trim() === text);
            const secondSpan = div.find("span").eq(1);
            return secondSpan;
        };
        this.httpClient = new http_client_1.default(this.baseUrl);
    }
    search(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield (0, axios_1.default)({
                    url: "https://graphql.anilist.co/",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    data: JSON.stringify({
                        query: "\nquery ($type: MediaType, $search: String, $sort:[MediaSort]=[POPULARITY_DESC,SCORE_DESC], $isAdult: Boolean) {\nPage(perPage: 30) {\npageInfo {\n  total\n  hasNextPage\n}\nresults: media(type: $type, search: $search, sort: $sort, isAdult: $isAdult) {\n  id\n  title {\n    romaji\n    english\n  }\n  coverImage {\n    medium\n  }\n  type\n  format\n  nextAiringEpisode {\n    airingAt\n    timeUntilAiring\n    episode\n  }\n  episodes\n  status\n  averageScore\n  genres\n  startDate {\n    year\n  }\n}\n}\n}   \n",
                        variables: { search: query, type: "ANIME", isAdult: false },
                    }),
                });
                const results = res.data.data.Page.results;
                const searchResult = {
                    hasNextPage: false,
                    results: [],
                };
                results.map((i) => {
                    var _a, _b, _c, _d;
                    return searchResult.results.push({
                        id: i.id,
                        title: i.title ? ((_b = (_a = i.title.english) !== null && _a !== void 0 ? _a : i.title.romaji) !== null && _b !== void 0 ? _b : "") : "",
                        image: (_c = i === null || i === void 0 ? void 0 : i.coverImage) === null || _c === void 0 ? void 0 : _c.medium,
                        releaseDate: (_d = i === null || i === void 0 ? void 0 : i.startDate) === null || _d === void 0 ? void 0 : _d.year,
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
            try {
                const res = yield this.httpClient.get(`${this.baseUrl}/anime/info/${id}`);
                const $ = cheerio.load(res.data);
                const totalEpisodes = parseInt(this.getDetailFromText($, "Episodes").text().trim());
                return {
                    id,
                    hasSeasons: false,
                    title: $(".AnimeDetailsTop_title__THumD").text().trim(),
                    genres: this.getDetailFromText($, "Genres")
                        .find(".AnimeDetailsBottom_con__uOKud")
                        .map((i, el) => {
                        return $(el).text().trim();
                    })
                        .get(),
                    totalEpisodes,
                    cover: $(".AnimeDetailsTop_detailsimage__JoMvk").attr("src"),
                    description: $(".AnimeDetailsBottom_descriptioncontent__v_ijv p")
                        .text()
                        .trim(),
                    episodes: Array.from({ length: totalEpisodes }, (_, index) => ({
                        id: `${id}?ep=${index + 1}`,
                        number: index + 1,
                    })),
                };
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
    }
    fetchSources(id_1) {
        return __awaiter(this, arguments, void 0, function* (id, host = "yuki", type = "sub") {
            var _a, _b;
            try {
                // f3422af67c84852f5e63d50e1f51718f1c0225c4
                const [anilistId, ep] = id.split("?ep=");
                const sourcesRes = yield this.httpClient.post(`${this.baseUrl}/anime/watch/${id}&host=${host}&type=${type}`, JSON.stringify([anilistId, host, null, ep, type]), {
                    headers: {
                        "Next-Action": "5dbcd21c7c276c4d15f8de29d9ef27aef5ea4a5e",
                        "Content-Type": "text/plain",
                    },
                });
                const data = JSON.parse(sourcesRes.data.split("1:")[1]);
                if (data === null)
                    throw new Error("Episode not available");
                const episodeSources = {
                    sources: (_a = data.sources) === null || _a === void 0 ? void 0 : _a.map((el) => ({
                        url: el.url,
                        quality: el.quality,
                        isM3U8: true,
                    })),
                };
                (_b = data.subtitles) === null || _b === void 0 ? void 0 : _b.map((el) => {
                    var _a;
                    (_a = episodeSources.subtitles) === null || _a === void 0 ? void 0 : _a.push({
                        url: el.url,
                        lang: el.lang,
                    });
                });
                if (data.headers)
                    episodeSources.headers = data.headers;
                return episodeSources;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
    }
}
exports.default = AniPlay;
