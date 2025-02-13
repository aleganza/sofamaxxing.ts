import { UnifiedMediaInfo, UnifiedSources } from "../models/unifiedTypes";

import HttpClient from "../models/http-client";
import Provider from "../models/provider";
import { MediaResult, Search, Sources } from "../models/types";

const cheerio = require("react-native-cheerio");

class AnimeParadise extends Provider {
  override readonly name = "AnimeParadise";
  override baseUrl = "https://www.animeparadise.moe";
  languages = "en";
  colorHEX = "#e83635";
  override logo = `${this.baseUrl}/icon/favicon-32x32.png`;
  override readonly forRN: boolean = true;

  private httpClient: HttpClient;

  constructor(customBaseURL?: string) {
    super(customBaseURL);
    this.httpClient = new HttpClient(this.baseUrl);
  }

  override async search(query: string): Promise<Search<MediaResult>> {
    try {
      const res = await this.httpClient.get(
        `${this.baseUrl}/search?q=${query}`
      );
      const $ = cheerio.load(res.data);

      if (!$) return { results: [] };

      const searchResult: {
        hasNextPage: boolean;
        results: MediaResult[];
      } = {
        hasNextPage: false,
        results: [],
      };

      $(".style_container__EkpBD").each((_: any, el: any) => {
        searchResult.results.push({
          id: $(el).find("a").attr("href").split("/anime/")[1].trim(),
          title: $(el).find(".style_title__z1PLj").text().trim(),
          image: $(el).find("img").attr("src"),
        });
      });

      return searchResult;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }
  async fetchInfo(id: string): Promise<UnifiedMediaInfo> {
    try {
      const res = await this.httpClient.get(`${this.baseUrl}/anime/${id}`);
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
        episodes: info.ep.map((el: any, index: number) => ({
          id: `${el}?origin=${info._id}`,
          number: index + 1,
        })),
      };
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  async fetchSources(id: string): Promise<UnifiedSources> {
    try {
      const res = await this.httpClient.get(`${this.baseUrl}/watch/${id}`);
      const $ = cheerio.load(res.data);

      const episode = JSON.parse($("#__NEXT_DATA__").html().toString()).props
        .pageProps.episode;

      console.log(`${this.baseUrl}/watch/${id}`);
      console.log($);
      console.log("gay");

      const episodeSources: Sources = {
        sources: [
          {
            url: episode.streamLink,
            quality: `default`,
            isM3U8: episode.streamLink.includes("m3u8"),
          },
        ],
        subtitles: episode.subData.map((el: any) => ({
          url: el.src,
          lang: el.label,
          type: el.type,
        })),
      };

      const m3u8Content = (await this.httpClient.get(
        episode.streamLink
      )) as any;

      if (m3u8Content.data.includes("EXTM3U")) {
        const videoList = m3u8Content.data.split("#EXT-X-STREAM-INF:");
        for (const video of videoList ?? []) {
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
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }
}

export default AnimeParadise;
