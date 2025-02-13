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
const cheerio = require("react-native-cheerio");
class AnimeParadise extends provider_1.default {
    constructor(customBaseURL) {
        super(customBaseURL);
        this.name = "AnimeParadise";
        this.baseUrl = "https://www.animeparadise.moe";
        this.languages = "en";
        this.colorHEX = "#e83635";
        this.logo = `${this.baseUrl}/icon/favicon-32x32.png`;
        this.forRN = true;
        this.httpClient = new http_client_1.default(this.baseUrl);
    }
    search(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.httpClient.get(`${this.baseUrl}/search?q=${query}`);
                const $ = cheerio.load(res.data);
                if (!$)
                    return { results: [] };
                const searchResult = {
                    hasNextPage: false,
                    results: [],
                };
                $(".style_container__EkpBD").each((_, el) => {
                    searchResult.results.push({
                        id: $(el).find("a").attr("href").split("/anime/")[1].trim(),
                        title: $(el).find(".style_title__z1PLj").text().trim(),
                        image: $(el).find("img").attr("src"),
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
                const res = yield this.httpClient.get(`${this.baseUrl}/anime/${id}`);
                const $ = cheerio.load(res.data);
                const info = JSON.parse($("#__NEXT_DATA__").html().toString()).props
                    .pageProps.data;
                return {
                    id,
                    hasSeasons: false,
                    title: info.title,
                    description: info.synopsys,
                    genres: info.genres,
                    synonyms: info.synonyms,
                    totalEpisodes: info.episodes,
                    episodes: info.ep.map((el, index) => ({
                        id: `${el}?origin=${info._id}`,
                        number: index + 1,
                    })),
                };
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
    }
    fetchSources(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.httpClient.get(`${this.baseUrl}/watch/${id}`);
                const $ = cheerio.load(res.data);
                const episode = JSON.parse($("#__NEXT_DATA__").html().toString()).props
                    .pageProps.episode;
                console.log(`${this.baseUrl}/watch/${id}`);
                console.log($);
                console.log("gay");
                const episodeSources = {
                    sources: [
                        {
                            url: episode.streamLink,
                            quality: `default`,
                            isM3U8: episode.streamLink.includes("m3u8"),
                        },
                    ],
                    subtitles: episode.subData.map((el) => ({
                        url: el.src,
                        lang: el.label,
                        type: el.type,
                    })),
                };
                const m3u8Content = (yield this.httpClient.get(episode.streamLink));
                if (m3u8Content.data.includes("EXTM3U")) {
                    const videoList = m3u8Content.data.split("#EXT-X-STREAM-INF:");
                    for (const video of videoList !== null && videoList !== void 0 ? videoList : []) {
                        if (video.includes("BANDWIDTH")) {
                            const url = video.split("\n")[1];
                            const quality = video
                                .split("RESOLUTION=")[1]
                                .split("\n")[0]
                                .split("x")[1]
                                .split(",FRAME-RATE")[0];
                            episodeSources.sources.push({
                                url: episode.streamLink.replace("master.m3u8", url),
                                quality: `${quality}p`,
                                isM3U8: true,
                            });
                        }
                    }
                }
                return episodeSources;
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
    }
}
exports.default = AnimeParadise;
