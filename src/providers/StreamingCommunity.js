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
const streamingcommunity_1 = require("../modules/utils/streamingcommunity");
const cheerio = require("react-native-cheerio");
class StreamingCommunity extends provider_1.default {
    constructor(customBaseURL) {
        super(customBaseURL);
        this.name = "StreamingCommunity";
        this.baseUrl = "https://streamingcommunity.paris";
        this.CDNUrl = "https://cdn.streamingcommunity.photos/images";
        this.languages = ["it", "en"];
        this.colorHEX = "#018850";
        this.logo = `${this.baseUrl}/icon/favicon-32x32.png?v=2`;
        this.forRN = true;
        this.fetchInfo = (id_1, ...args_1) => __awaiter(this, [id_1, ...args_1], void 0, function* (id, season = 1) {
            var _a, _b, _c, _d, _e;
            try {
                const res = yield axios_1.default.get(`${this.baseUrl}/titles/${id}/stagione-${season}`);
                const $ = cheerio.load(res.data);
                const data = JSON.parse("" + $("#app").attr("data-page") + "").props;
                const result = {
                    id: `${data.title.id}-${data.title.slug}`,
                    hasSeasons: true,
                    title: data.title.name,
                    description: (_a = data.title.plot) !== null && _a !== void 0 ? _a : undefined,
                    quality: (_b = data.title.quality) !== null && _b !== void 0 ? _b : undefined,
                    synonyms: data.title.original_name ? [data.title.original_name] : [],
                    runtime: (_c = data.title.runtime) !== null && _c !== void 0 ? _c : undefined,
                    score: parseFloat(data.title.score),
                    releaseDate: (0, streamingcommunity_1.parseFuzzyDate)(data.title.release_date),
                    subOrDub: data.title.sub_ita === 0 ? types_1.SubOrDub.DUB : types_1.SubOrDub.SUB,
                    totalSeasons: (_d = data.title.seasons_count) !== null && _d !== void 0 ? _d : undefined,
                    seasons: (_e = data.title.seasons.map((el) => {
                        var _a, _b, _c;
                        return {
                            id: el.id,
                            number: el.number,
                            title: (_a = el.name) !== null && _a !== void 0 ? _a : undefined,
                            description: (_b = el.plot) !== null && _b !== void 0 ? _b : undefined,
                            releaseDate: (0, streamingcommunity_1.parseFuzzyDate)(el.release_date),
                            totalEpisodes: (_c = el.episodes_count) !== null && _c !== void 0 ? _c : undefined,
                        };
                    })) !== null && _e !== void 0 ? _e : undefined,
                    images: (0, streamingcommunity_1.parseImages)(this.CDNUrl, data.title.images),
                    genres: data.title.genres.map((el) => {
                        return el.name;
                    }),
                    episodes: data.loadedSeason.episodes.map((el) => {
                        var _a, _b, _c;
                        return {
                            id: el.id,
                            number: el.number,
                            title: (_a = el.name) !== null && _a !== void 0 ? _a : undefined,
                            description: (_b = el.plot) !== null && _b !== void 0 ? _b : undefined,
                            runtime: (_c = el.duration) !== null && _c !== void 0 ? _c : undefined,
                            images: (0, streamingcommunity_1.parseImages)(this.CDNUrl, el.images),
                        };
                    }),
                    // type: data.title.type ?? undefined,
                    // originalTitle: data.title.original_name ?? undefined,
                    // status: data.title.status ?? undefined,
                    // views: data.title.views ?? undefined,
                    // dailyViews: data.title.daily_views ?? undefined,
                    // lastAirDate: parseFuzzyDate(data.title.last_air_date),
                    // preview: data.title.preview ?? undefined,
                    // keywords: data.title.keywords.map((el: any): string => {
                    //   return el.name;
                    // }),
                };
                return result;
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
        this.fetchSources = (id, episodeId) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                const res = yield axios_1.default.get(`${this.baseUrl}/iframe/${id}?episode_id=${episodeId}&next_episode=1`);
                const $ = cheerio.load(res.data);
                const url = $("iframe").attr("src");
                const episodeSources = {
                    sources: [],
                };
                if (url) {
                    const res = yield axios_1.default.get(url);
                    const $ = cheerio.load(res.data);
                    const scriptContent = $('script:contains("window.video")')
                        .html()
                        .toString();
                    const domain = (_a = scriptContent.match(/url: '(.*)'/)) === null || _a === void 0 ? void 0 : _a[1];
                    const token = (_b = scriptContent.match(/token': '(.*)'/)) === null || _b === void 0 ? void 0 : _b[1];
                    const expires = (_c = scriptContent.match(/expires': '(.*)'/)) === null || _c === void 0 ? void 0 : _c[1];
                    const canPlayFHD = (_d = scriptContent.match(/window.canPlayFHD = (true|false)/)) === null || _d === void 0 ? void 0 : _d[1];
                    episodeSources.sources.push({
                        url: `${domain}?token=${token}&expires=${expires}${canPlayFHD === "true" ? "$h=1" : ""}`,
                        quality: `default`,
                        isM3U8: true,
                    });
                }
                return episodeSources;
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    search(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, page = 1) {
            try {
                const res = yield axios_1.default.get(`${this.baseUrl}/api/search?q=${query}`);
                // pagination ain't workin :(
                // const res = await axios.get(`${this.baseUrl}/api/search?q=${query}&page=${page}`);
                const searchResult = {
                    currentPage: res.data.current_page,
                    hasNextPage: res.data.current_page !== res.data.last_page,
                    totalPages: res.data.last_page,
                    totalResults: res.data.total,
                    results: [],
                };
                res.data.data.forEach((el) => {
                    var _a, _b;
                    return searchResult.results.push({
                        id: `${el.id}-${el.slug}`,
                        title: el.name,
                        type: (_a = el.type) !== null && _a !== void 0 ? _a : undefined,
                        rating: parseFloat(el === null || el === void 0 ? void 0 : el.score),
                        subOrDub: el.sub_ita === 0 ? types_1.SubOrDub.DUB : types_1.SubOrDub.SUB,
                        lastAirDate: (0, streamingcommunity_1.parseFuzzyDate)(el.last_air_date),
                        seasonsCount: (_b = el.seasons_count) !== null && _b !== void 0 ? _b : undefined,
                        images: (0, streamingcommunity_1.parseImages)(this.CDNUrl, el.images),
                    });
                });
                return searchResult;
            }
            catch (error) {
                console.log(error);
                throw new Error(error.message);
            }
        });
    }
}
exports.default = StreamingCommunity;
