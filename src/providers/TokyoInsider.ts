import axios from 'axios';

import Provider from '../models/provider';
import { MediaInfo, MediaResult, Search, Sources } from '../models/types';
import { MONTHS } from '../modules/utils/tokyoinsider';

const cheerio = require("react-native-cheerio");

class TokyoInsider extends Provider {
  override readonly name = "TokyoInsider";
  override baseUrl = "https://www.tokyoinsider.com";
  languages = "en";
  colorHEX = "#f568cf";
  override logo = "https://www.tokyoinsider.com/favicon.ico";
  override readonly forRN: boolean = true

  constructor(customBaseURL?: string) {
    super(customBaseURL);
  }

  async search(query: string, page: number = 1): Promise<Search<MediaResult>> {
    try {
      const res = await axios.get(
        `${this.baseUrl}/anime/search?k=${query}&start=${(page - 1) * 20}`
      );
      const $ = cheerio.load(res.data);

      if (!$) return { results: [] };

      const pager = $(".pager");
      const totalPages =
        pager.length > 0 && pager.find("a:not([class])").length > 0
          ? Number(pager.find("a:not([class])").eq(-1).text().trim()) || 1
          : 1;

      const searchResult: Search<MediaResult> = {
        currentPage: page,
        hasNextPage: totalPages > page,
        totalPages,
        results: [],
      };

      const table = $(
        'table[width="100%"][border="0"][cellspacing="0"][cellpadding="3"]'
      );
      table.find("tr").each((_: any, el: any) => {
        const col1 = $(el)?.find("td")?.eq(0);
        const col2 = $(el)?.find("td")?.eq(1);

        searchResult.results.push({
          id: $(col1)?.find("a")?.attr("href")?.split("/anime/")[1] ?? "",
          title: $(col2).find("div").eq(0).find("a").text().trim(),
          image: $(col1)?.find("a img").attr("src"),
        });
      });

      return searchResult;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  async fetchInfo(id: string): Promise<MediaInfo> {
    try {
      const res = await axios.get(`${this.baseUrl}/anime/${id}`);
      const $ = cheerio.load(res.data);

      const tableRow = (eq: number) =>
        $("#inner_page table")
          .first()
          .find("tbody tr td")
          .eq(1)
          .find("tr")
          .eq(eq)
          .find("td")
          .eq(1);

      const totalEpisodes = Number(
        $(".episode").first().find("a.download-link strong").text().trim()
      );
      const episodesDivs = $(".episode").slice(0, totalEpisodes);

      const info: MediaInfo = {
        id,
        hasSeasons: false,
        title: $("#bc").first().find("a").last().text().trim(),
        totalEpisodes,
        genres: tableRow(2)
          ?.find("a")
          ?.map((_: any, el: any) => $(el)?.text().trim())
          .get(),
        releaseDate: {
          year: Number(tableRow(4).text()?.split(", ")[1]),
          month: MONTHS[tableRow(4).text()?.split(" ")[0]],
          day: Number(tableRow(4).text()?.split(" ")[1]?.split(",")[0]),
        },
        cover: $("img.a_img").first().attr("src"),
        description: tableRow(6)
          .text()
          .replace(/[\t\n]/g, "")
          .trim(),
        synonyms: tableRow(0)
          ?.html()
          ?.split("<br>")
          .map((title: string) => title.trim())
          .filter((title: string) => title !== ""),
        episodes: [],
      };

      episodesDivs.each((_: any, el: any) => {
        info.episodes?.push({
          id: $(el).find("a").attr("href")?.split("/anime/")[1] ?? "",
          number: Number($(el).find("a strong").text().trim()),
        });
      });

      return info;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  async fetchSources(id: string): Promise<Sources> {
    try {
      const res = await axios.get(`${this.baseUrl}/anime/${id}`);
      const $ = cheerio.load(res.data);

      const sourcesDivs = $("#inner_page .c_h2, #inner_page .c_h2b");
      const extractSource = (eq: number) =>
        sourcesDivs.eq(eq).find("div").first().find("a").last().attr("href");

      const episodeSources: Sources = {
        sources: [],
        download: extractSource(0),
      };

      let foundFirst = false;
      sourcesDivs.each((i: number) => {
        const s = extractSource(i);
        if (s && s?.includes(".mp4")) {
          episodeSources.sources.push({
            url: s,
            quality: foundFirst ? "backup" : "default",
          });
          foundFirst = true;
        }
      });

      return episodeSources;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }
}

export default TokyoInsider;
