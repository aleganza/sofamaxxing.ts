import axios from "axios";

import CustomProvider from "../models/custom-provider";
import {
  UnifiedSearch,
  UnifiedMediaResult,
  UnifiedMediaInfo,
  UnifiedSources,
} from "src/models/unifiedTypes";
import { MediaInfo, MediaSeason } from "src/models/types";

const cheerio = require("react-native-cheerio");

class OnePace extends CustomProvider {
  override readonly name = "OnePace";
  override baseUrl = "https://pixeldra.in";
  private onePaceUrl = "https://www.onepace.net";
  languages: string[] = [
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
  ] as const;
  colorHEX = "#66c0ef";
  override logo = `${this.onePaceUrl}/favicon.ico`;
  override readonly forRN: boolean = true;
  override readonly custom: boolean = false;

  constructor(customBaseURL?: string) {
    super();
    if (customBaseURL) {
      if (!customBaseURL.startsWith("https://")) {
        throw new Error(
          `Invalid URL: "${customBaseURL}". The base URL must start with "https://".`
        );
      }
      this.baseUrl = customBaseURL;
    }
  }

  search(query: string): Promise<UnifiedSearch<UnifiedMediaResult>> {
    throw new Error("Method not implemented.");
  }

  async fetchInfo(
    // lang: (typeof this.languages)[number] = "en",
    season: number = 1,
    dubbed: boolean = false
  ): Promise<UnifiedMediaInfo> {
    const lang = "en";
    const res = await axios.get(`${this.onePaceUrl}/${lang}/watch`);
    const $ = cheerio.load(res.data);

    const totalSeasons = $("ol li.scroll-my-6").toArray().length;

    const result: MediaInfo = {
      id: "onepace",
      hasSeasons: true,
      title: "One Pace",
      totalSeasons,
      seasons: $("ol li.scroll-my-6")
        .toArray()
        .map((el: any, index: number): MediaSeason => {
          const format = $("ul li.flex")
            .toArray()
            .filter(
              (el: any) =>
                $(el).find("h3 span").text().trim() ===
                (dubbed ? "English Dub" : "English Subtitles")
            );

          const links = $(el)
            .find("ul li.flex ol li")
            .toArray()
            .map((elL: any) => ({
              id: `l/${$(elL).find("a").attr("href").split("/l/")[1].split("#item")[0]}`,
              quality: $(elL).find("a span").eq(1).text().trim(),
            }));

          const qualityOrder: any = { "1080p": 3, "720p": 2, "480p": 1 };
          const bestLink = links
            .sort(
              (
                a: { quality: string | number },
                b: { quality: string | number }
              ) =>
                (qualityOrder[b.quality] || 0) - (qualityOrder[a.quality] || 0)
            )
            .at(0);

          return {
            id: bestLink.id,
            number: index + 1,
            title: `${$(el).find("h2").text().trim()} (${bestLink.quality})`,
          };
        }),
    };

    if (season < 1 || season > totalSeasons)
      throw new Error(
        `Argument 'season' must be between 1 and ${totalSeasons}! (You passed ${season})`
      );

    const res2 = await axios.get(
      `${this.baseUrl}/${result.seasons![season - 1].id}`
    );
    const $2 = cheerio.load(res2.data);

    const data = JSON.parse(
      $2("script")
        .html()
        .toString()
        .split("window.viewer_data = ")[1]
        .split("window.user_authenticated")[0]
        .trim()
        .replace(/;$/, "")
    ).api_response;

    result.episodes = data.files.map((el: any, index: number) => ({
      id: el.id,
      number: index + 1,
      title: el.name.replace(".mp4", "").split("Pace]")[1].split("[En")[0], // 💅
      description: el.description,
      image: `${this.baseUrl}/api${el.thumbnail_href}`,
    }));

    return result;
  }

  fetchSources(id: string): UnifiedSources {
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

export default OnePace;
