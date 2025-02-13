import axios from "axios";
const cheerio = require("react-native-cheerio");

import Provider from "../models/provider";
import { MediaInfo, MediaResult, Search, Sources } from "../models/types";

class AnimeHeaven extends Provider {
  override readonly name = "AnimeHeaven";
  override baseUrl = "https://animeheaven.me";
  languages = "en";
  colorHEX = "#e81e2f";
  override logo = "https://animeheaven.me/favicon.ico";
  override readonly forRN: boolean = true

  constructor(customBaseURL?: string) {
    super(customBaseURL);
  }

  override async search(query: string): Promise<Search<MediaResult>> {
    try {
      const res = await axios.get(`${this.baseUrl}/search.php?s=${query}`);
      const $ = cheerio.load(res.data);

      if (!$) return { results: [] };

      const searchResult: {
        hasNextPage: boolean;
        results: MediaResult[];
      } = {
        hasNextPage: false,
        results: [],
      };

      $(".similarimg").each((_: any, el: any) => {
        searchResult.results.push({
          id: $(el)?.find("a")?.attr("href")?.split("anime.php?")[1] ?? "",
          title: $(el)?.find(".similarname.c a.c")?.text().trim(),
          image: `${this.baseUrl}/${$(el)?.find("img.coverimg")?.attr("src")}`,
        });
      });

      return searchResult;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  override async fetchInfo(id: string): Promise<MediaInfo> {
    try {
      // don't ask
      const res = await fetch(`${this.baseUrl}/anime.php?${id}`, {
        method: "GET",
      });
      const $ = cheerio.load(await res.text());

      const info: MediaInfo = {
        id,
        hasSeasons: false,
        title: $(".infotitle.c")?.text().trim(),
        description: $(".infodes.c")?.text().trim(),
        genres: $("boxitem.bc2.c1")
          .map((_: any, el: any) => $(el).text().trim())
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

      $(".ac3").each((_: any, el: any) => {
        info.episodes?.push({
          id: $(el).attr("href")?.split("episode.php?")[1] ?? "",
          number: parseFloat($(el).find(".watch2.bc").text().trim()),
        });
      });

      return info;
    } catch (err) {
      console.log(err);
      throw new Error((err as Error).message);
    }
  }

  override async fetchSources(id: string): Promise<Sources> {
    try {
      const res = await fetch(`${this.baseUrl}/episode.php?${id}`, {
        method: "GET",
      });
      const $ = cheerio.load(await res.text());

      const episodeSources: Sources = {
        sources: [],
      };

      const source = $("#vid")?.find("source")?.eq(0)?.attr("src");
      if (source)
        episodeSources.sources.push({
          url: source,
          quality: "default",
        });

      const altSource = $("#vid")?.find("source")?.eq(1)?.attr("src");
      if (altSource)
        episodeSources.sources.push({
          url: altSource,
          quality: "backup",
        });

      return episodeSources;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }
}

export default AnimeHeaven;
