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
const custom_provider_1 = __importDefault(require("../models/custom-provider"));
const cheerio = require("react-native-cheerio");
class OnePace extends custom_provider_1.default {
    constructor(customBaseURL) {
        super();
        this.name = "OnePace";
        this.baseUrl = "https://pixeldra.in";
        this.onePaceUrl = "https://www.onepace.net";
        this.languages = [
            "en",
            "de",
            "es",
            "fr",
            "it",
            "pt",
            "el",
            "ru",
            "ja",
            "ar",
        ];
        this.colorHEX = "#66c0ef";
        this.logo = `${this.onePaceUrl}/favicon.ico`;
        this.forRN = true;
        this.custom = false;
        if (customBaseURL) {
            if (!customBaseURL.startsWith("https://")) {
                throw new Error(`Invalid URL: "${customBaseURL}". The base URL must start with "https://".`);
            }
            this.baseUrl = customBaseURL;
        }
    }
    search(query) {
        throw new Error("Method not implemented.");
    }
    fetchInfo() {
        return __awaiter(this, arguments, void 0, function* (
        // lang: (typeof this.languages)[number] = "en",
        season = 1, dubbed = false) {
            const lang = "en";
            const res = yield axios_1.default.get(`${this.onePaceUrl}/${lang}/watch`);
            const $ = cheerio.load(res.data);
            const totalSeasons = $("ol li.scroll-my-6").toArray().length;
            const result = {
                id: "onepace",
                hasSeasons: true,
                title: "One Pace",
                totalSeasons,
                seasons: $("ol li.scroll-my-6")
                    .toArray()
                    .map((el, index) => {
                    const format = $("ul li.flex")
                        .toArray()
                        .filter((el) => $(el).find("h3 span").text().trim() ===
                        (dubbed ? "English Dub" : "English Subtitles"));
                    const links = $(el)
                        .find("ul li.flex ol li")
                        .toArray()
                        .map((elL) => ({
                        id: `l/${$(elL).find("a").attr("href").split("/l/")[1].split("#item")[0]}`,
                        quality: $(elL).find("a span").eq(1).text().trim(),
                    }));
                    const qualityOrder = { "1080p": 3, "720p": 2, "480p": 1 };
                    const bestLink = links
                        .sort((a, b) => (qualityOrder[b.quality] || 0) - (qualityOrder[a.quality] || 0))
                        .at(0);
                    return {
                        id: bestLink.id,
                        number: index + 1,
                        title: `${$(el).find("h2").text().trim()} (${bestLink.quality})`,
                    };
                }),
            };
            if (season < 1 || season > totalSeasons)
                throw new Error(`Argument 'season' must be between 1 and ${totalSeasons}! (You passed ${season})`);
            const res2 = yield axios_1.default.get(`${this.baseUrl}/${result.seasons[season - 1].id}`);
            const $2 = cheerio.load(res2.data);
            const data = JSON.parse($2("script")
                .html()
                .toString()
                .split("window.viewer_data = ")[1]
                .split("window.user_authenticated")[0]
                .trim()
                .replace(/;$/, "")).api_response;
            result.episodes = data.files.map((el, index) => ({
                id: el.id,
                number: index + 1,
                title: el.name.replace(".mp4", "").split("Pace]")[1].split("[En")[0], // 💅
                description: el.description,
                image: `${this.baseUrl}/api${el.thumbnail_href}`,
            }));
            return result;
        });
    }
    fetchSources(id) {
        return {
            sources: [
                {
                    url: `${this.baseUrl}/api/file/${id}`,
                    quality: "default",
                },
            ],
        };
    }
}
exports.default = OnePace;
