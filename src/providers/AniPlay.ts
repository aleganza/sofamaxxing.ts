import { UnifiedMediaInfo, UnifiedSources } from "../models/unifiedTypes";

import HttpClient from "../models/http-client";
import Provider from "../models/provider";
import { MediaResult, Search, Sources } from "../models/types";
import axios from "axios";

const cheerio = require("react-native-cheerio");

class AniPlay extends Provider {
  override readonly name = "AniPlay";
  override baseUrl = "https://aniplaynow.live";
  languages = "en";
  colorHEX = "#cdaaf5";
  override logo = `${this.baseUrl}/favicon-16x16.png`;
  override readonly forRN: boolean = true;

  private httpClient: HttpClient;

  constructor(customBaseURL?: string) {
    super(customBaseURL);
    this.httpClient = new HttpClient(this.baseUrl);
  }

  override async search(query: string): Promise<Search<MediaResult>> {
    try {
      const res = await axios({
        url: "https://graphql.anilist.co/",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        data: JSON.stringify({
          query:
            "\nquery ($type: MediaType, $search: String, $sort:[MediaSort]=[POPULARITY_DESC,SCORE_DESC], $isAdult: Boolean) {\nPage(perPage: 30) {\npageInfo {\n  total\n  hasNextPage\n}\nresults: media(type: $type, search: $search, sort: $sort, isAdult: $isAdult) {\n  id\n  title {\n    romaji\n    english\n  }\n  coverImage {\n    medium\n  }\n  type\n  format\n  nextAiringEpisode {\n    airingAt\n    timeUntilAiring\n    episode\n  }\n  episodes\n  status\n  averageScore\n  genres\n  startDate {\n    year\n  }\n}\n}\n}   \n",
          variables: { search: query, type: "ANIME", isAdult: false },
        }),
      });

      const results = res.data.data.Page.results;

      const searchResult: {
        hasNextPage: boolean;
        results: MediaResult[];
      } = {
        hasNextPage: false,
        results: [],
      };

      results.map((i: any) =>
        searchResult.results.push({
          id: i.id,
          title: i.title ? (i.title.english ?? i.title.romaji ?? "") : "",
          image: i?.coverImage?.medium,
          releaseDate: i?.startDate?.year,
        })
      );

      return searchResult;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  private getDetailFromText = ($: any, text: any) => {
    const div = $(".AnimeDetailsBottom_singlecontent__bW8T7").filter(
      (i: any, el: any) => $(el).find("span").first().text().trim() === text
    );

    const secondSpan = div.find("span").eq(1);
    return secondSpan;
  };

  async fetchInfo(id: string): Promise<UnifiedMediaInfo> {
    try {
      const res = await this.httpClient.get(`${this.baseUrl}/anime/info/${id}`);
      const $ = cheerio.load(res.data);

      const totalEpisodes = parseInt(
        this.getDetailFromText($, "Episodes").text().trim()
      );

      return {
        id,
        hasSeasons: false,
        title: $(".AnimeDetailsTop_title__THumD").text().trim(),
        genres: this.getDetailFromText($, "Genres")
          .find(".AnimeDetailsBottom_con__uOKud")
          .map((i: any, el: any) => {
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
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  async fetchSources(
    id: string,
    host: "maze" | "pahe" | "yuki" = "yuki",
    type: "sub" | "dub" = "sub",
    proxy: boolean = false // unstable, use only when you know you absolutely need one
  ): Promise<UnifiedSources> {
    try {
      // https://aniplay-cors.yqizw7.easypanel.host/fetch?url=https://anime-eu.1stkmgv1.com/anime/2024/01/20/playlist_65ab49d30508f-1705724371_.m3u8&ref=https://animez.org

      const [anilistId, ep] = id.split("?ep=");

      const providersRes = await this.httpClient.post(
        `${this.baseUrl}/anime/info/${anilistId}`,
        JSON.stringify([anilistId, false, false]),
        {
          headers: {
            "Next-Action": "f3422af67c84852f5e63d50e1f51718f1c0225c4",
            "Content-Type": "text/plain",
          },
        }
      );

      const pData = JSON.parse((providersRes.data as string).split("1:")[1]);
      const animeId = (() => {
        if (!Array.isArray(pData)) return null;

        const provider = pData.find((p: any) => p?.providerId === host);
        if (!provider || !Array.isArray(provider.episodes)) return null;

        const episode = provider.episodes[ep];
        if (!episode || typeof episode.id === "undefined") return null;

        return episode.id;
      })();

      const sourcesRes = await this.httpClient.post(
        `${this.baseUrl}/anime/watch/${id}&host=${host}&type=${type}`,
        JSON.stringify([anilistId, host, animeId, ep, type]),
        {
          headers: {
            "Next-Action": "5dbcd21c7c276c4d15f8de29d9ef27aef5ea4a5e",
            "Content-Type": "text/plain",
          },
        }
      );
      const data = JSON.parse((sourcesRes.data as string).split("1:")[1]);
      if (data === null) throw new Error("Episode not available");

      const episodeSources: Sources = {
        sources: data.sources?.map((el: any) => ({
          url: proxy
            ? `https://aniplay-cors.yqizw7.easypanel.host/fetch?url=${el.url}&ref=${data.headers.Referer}`
            : el.url,
          quality: el.quality,
          isM3U8: true,
        })),
        subtitles: [],
      };

      data.subtitles?.map((el: any) => {
        episodeSources.subtitles?.push({
          url: el.url,
          lang: el.lang,
        });
      });

      if (data.headers) episodeSources.headers = data.headers;

      return episodeSources;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }
}

export default AniPlay;
