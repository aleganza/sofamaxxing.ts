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
const types_1 = require("../models/types");
const cheerio = require("react-native-cheerio");
class AnimeUnity extends provider_1.default {
    constructor(customBaseURL) {
        super(customBaseURL);
        this.name = "AnimeUnity";
        this.baseUrl = "https://www.animeunity.so";
        this.languages = "it";
        this.colorHEX = "#007bff";
        this.logo = "https://www.animeunity.to/favicon-32x32.png";
        this.forRN = true;
        this.search = (query) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const res = yield this.httpClient.get(`/archivio?title=${query}`, {
                    headers: {
                        Referer: this.baseUrl,
                    },
                });
                const $ = cheerio.load(res.data);
                if (!$)
                    return { results: [] };
                const items = JSON.parse("" + $("archivio").attr("records") + "");
                const searchResult = {
                    hasNextPage: false,
                    results: [],
                };
                for (const i in items) {
                    searchResult.results.push({
                        id: `${items[i].id}-${items[i].slug}`,
                        title: (_a = items[i].title) !== null && _a !== void 0 ? _a : items[i].title_eng,
                        url: `${this.baseUrl}/anime/${items[i].id}-${items[i].slug}`,
                        image: items[i].imageurl,
                        cover: items[i].imageurl_cover,
                        rating: parseFloat(items[i].score),
                        releaseDate: items[i].date,
                        subOrDub: `${items[i].dub ? types_1.SubOrDub.DUB : types_1.SubOrDub.SUB}`,
                    });
                }
                return searchResult;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        this.fetchInfo = (id_1, ...args_1) => __awaiter(this, [id_1, ...args_1], void 0, function* (id, page = 1) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            const url = `${this.baseUrl}/anime/${id}`;
            const episodesPerPage = 120;
            const lastPageEpisode = page * episodesPerPage;
            const firstPageEpisode = lastPageEpisode - 119;
            const url2 = `${this.baseUrl}/info_api/${id}/1?start_range=${firstPageEpisode}&end_range=${lastPageEpisode}`;
            try {
                // Richiesta alla pagina dell'anime
                const res = yield this.httpClient.get(url);
                const $ = cheerio.load(res.data);
                const totalEpisodes = parseInt((_b = (_a = $("video-player")) === null || _a === void 0 ? void 0 : _a.attr("episodes_count")) !== null && _b !== void 0 ? _b : "0");
                const totalPages = Math.round(totalEpisodes / 120) + 1;
                if (page < 1 || page > totalPages)
                    throw new Error(`Argument 'page' for ${id} must be between 1 and ${totalPages}! (You passed ${page})`);
                const animeInfo = {
                    currentPage: page,
                    hasNextPage: totalPages > page,
                    totalPages: totalPages,
                    id: id,
                    hasSeasons: false,
                    title: (_c = $("h1.title")) === null || _c === void 0 ? void 0 : _c.text().trim(),
                    genres: (_e = (_d = $(".info-wrapper.pt-3.pb-3 small")) === null || _d === void 0 ? void 0 : _d.map((_, element) => {
                        return $(element).text().replace(",", "").trim();
                    }).toArray()) !== null && _e !== void 0 ? _e : undefined,
                    totalEpisodes: totalEpisodes,
                    image: (_f = $("img.cover")) === null || _f === void 0 ? void 0 : _f.attr("src"),
                    cover: (_h = (_g = $(".banner")) === null || _g === void 0 ? void 0 : _g.attr("src")) !== null && _h !== void 0 ? _h : (_k = (_j = $(".banner")) === null || _j === void 0 ? void 0 : _j.attr("style")) === null || _k === void 0 ? void 0 : _k.replace("background: url(", ""),
                    description: $(".description").text().trim(),
                    episodes: [],
                };
                const res2 = (yield this.httpClient.get(url2));
                const items = res2.data.episodes;
                for (const i in items) {
                    (_l = animeInfo.episodes) === null || _l === void 0 ? void 0 : _l.push({
                        id: `${id}/${items[i].id}`,
                        number: parseInt(items[i].number),
                        url: `${url}/${items[i].id}`,
                    });
                }
                return animeInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
        this.fetchSources = (episodeId) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            try {
                const res = yield this.httpClient.get(`${this.baseUrl}/anime/${episodeId}`);
                const $ = cheerio.load(res.data);
                const episodeSources = {
                    headers: {},
                    sources: [],
                };
                const streamUrl = $("video-player").attr("embed_url");
                if (streamUrl) {
                    const res = yield this.httpClient.get(streamUrl);
                    const $ = cheerio.load(res.data);
                    const domain = (_a = $('script:contains("window.video")')
                        .html()
                        .toString()) === null || _a === void 0 ? void 0 : _a.match(/url: '(.*)'/)[1];
                    const token = (_b = $('script:contains("window.video")')
                        .html()
                        .toString()) === null || _b === void 0 ? void 0 : _b.match(/token': '(.*)'/)[1];
                    const expires = (_c = $('script:contains("window.video")')
                        .html()
                        .toString()) === null || _c === void 0 ? void 0 : _c.match(/expires': '(.*)'/)[1];
                    const size = Number((_e = (_d = $('script:contains("window.video")')
                        .html()
                        .toString()) === null || _d === void 0 ? void 0 : _d.match(/"size":(\d+)/)) === null || _e === void 0 ? void 0 : _e[1]);
                    const runtime = Number((_g = (_f = $('script:contains("window.video")')
                        .html()
                        .toString()) === null || _f === void 0 ? void 0 : _f.match(/"duration":(\d+)/)) === null || _g === void 0 ? void 0 : _g[1]);
                    const defaultUrl = `${domain}${domain.includes("?") ? "&" : "?"}token=${token}&referer=&expires=${expires}&h=1`;
                    const m3u8Content = (yield this.httpClient.get(defaultUrl));
                    if (m3u8Content.data.includes("EXTM3U")) {
                        const videoList = m3u8Content.data.split("#EXT-X-STREAM-INF:");
                        for (const video of videoList !== null && videoList !== void 0 ? videoList : []) {
                            if (video.includes("BANDWIDTH")) {
                                const url = video.split("\n")[1];
                                const quality = video
                                    .split("RESOLUTION=")[1]
                                    .split("\n")[0]
                                    .split("x")[1];
                                episodeSources.sources.push({
                                    url: url,
                                    quality: `${quality}p`,
                                    isM3U8: true,
                                });
                            }
                        }
                    }
                    episodeSources.sources.push({
                        url: defaultUrl,
                        quality: `default`,
                        isM3U8: true,
                        size: size * 1024,
                        runtime,
                    });
                    episodeSources.download = (_j = (_h = $('script:contains("window.downloadUrl ")')
                        .html()
                        .toString()) === null || _h === void 0 ? void 0 : _h.match(/downloadUrl = '(.*)'/)[1]) === null || _j === void 0 ? void 0 : _j.toString();
                }
                return episodeSources;
            }
            catch (err) {
                console.error("Error fetching episode sources:", err);
                throw new Error(err.message);
            }
        });
        this.httpClient = new http_client_1.default(this.baseUrl);
    }
}
exports.default = AnimeUnity;
