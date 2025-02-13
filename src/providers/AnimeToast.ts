import axios from 'axios';

import Provider from '../models/provider';
import { MediaInfo, MediaResult, Search, Sources, SubOrDub } from '../models/types';

const cheerio = require("react-native-cheerio");

class AnimeToast extends Provider {
  override readonly name = "AnimeToast";
  override baseUrl = "https://www.animetoast.cc";
  languages = "de";
  colorHEX = "#694ba1";
  override logo =
    "https://www.animetoast.cc/wp-content/uploads/2018/03/toastfavi-300x300.png";
  override readonly forRN: boolean = true

  constructor(customBaseURL?: string) {
    super(customBaseURL);
  }

  async search(query: string, page: number = 1): Promise<Search<MediaResult>> {
    try {
      const res = await axios.get(`${this.baseUrl}/page/${page}/?s=${query}`);
      const $ = cheerio.load(res.data);

      if (!$) return { results: [] };

      const pagesSource = $("section.video-listing .wp-pagenavi .pages");
      const totalPages =
        pagesSource && pagesSource.text().includes("von ")
          ? Number(pagesSource.text().trim().split("von ")[1]) || 1
          : 1;

      const searchResult: Search<MediaResult> = {
        currentPage: page,
        hasNextPage: totalPages > page,
        totalPages,
        results: [],
      };

      $("div.blog-item:not([id])").each((_: any, el: any) => {
        searchResult.results.push({
          id:
            $(el)
              ?.find(".item-thumbnail a")
              ?.attr("href")
              ?.split(`${this.baseUrl}/`)[1]
              ?.split("/")[0] ?? "",
          title: $(el)?.find(".item-head h3 a")?.text().trim(),
          image: $(el)?.find(".item-thumbnail a img")?.attr("src"),
        });
      });

      return searchResult;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  /**
   * PAGES SYSTEMS IS RARELY BROKEN (url pattern mismatch)
   *
   * @param id
   * @param page
   * @returns
   */
  async fetchInfo(id: string, page: number = 1): Promise<MediaInfo> {
    try {
      const res = await axios.get(`${this.baseUrl}/${id}/?link=0`);
      const $ = cheerio.load(res.data);

      // const individualEpisodes
      const ps = ".single-inbox .item-content p";
      const info: MediaInfo = {
        id: id,
        hasSeasons: false,
        title: $("h1.light-title.entry-title").text().trim(),
        subOrDub: $("h1.light-title.entry-title").text().trim().includes(" Dub")
          ? SubOrDub.DUB
          : SubOrDub.SUB,
        description: $(ps).first().text().trim(),
        cover: $(ps).first().find("img").attr("src"),
        genres: $(ps)
          .filter((_: any, p: any) => $(p).find("strong").text().trim() === "Genre:")
          .contents()
          .not("strong")
          .text()
          .trim()
          .split(", "),
        releaseDate: {
          year: Number(
            $(ps)
              .filter(
                (_: any, p: any) => $(p).find("strong").text().trim() === "Season Start:"
              )
              .contents()
              .not("strong")
              .text()
              .trim()
              .split(" ")[1]
          ),
        },

        episodes: [],
      };

      const link = $("ul.nav.nav-tabs")
        .find("li:has(a) a")
        .filter((_: any, a: any) => $(a).text().trim() === "Voe")
        .attr("href");
      const btns = $(link).find("a");
      const epBtns = btns.filter(
        (_: any, el: any) => !$(el).text().includes("S") && !$(el).text().includes("-")
      );
      const hasPages = btns
        .toArray()
        .some((el: any) => $(el).text().includes("S") || $(el).text().includes("-"));

      let totalPages;

      // --- no pages
      // individual links are already provided like `Ep. 10`
      if (!hasPages) {
        totalPages = 1;
        if (page < 1 || page > totalPages)
          throw new Error(`Argument 'page' for ${id} must be 1!`);

        epBtns.each((_: any, el: any) => {
          info.episodes?.push({
            id: $(el).attr("href")?.split(`${this.baseUrl}/`)[1] ?? "",
            number: Number($(el).text().trim().split("Ep. ")[1]),
          });
        });

        return info;
      }

      // --- with pages
      // pages links are provided like `S21:E892-1072` or `E892-1072` (hypehenBtn)
      // there may be invididual links too, like `E1100`  (eBtns)
      // each page link is a page + all the individual is the last page

      const hypehenBtns = btns.filter((_: any, el: any) => $(el).text().includes("-"));
      const eBtns = btns.filter(
        (_: any, el: any) => $(el).text().includes("E") && !$(el).text().includes("-")
      );
      totalPages = hypehenBtns.length;
      if (eBtns.length > 0) totalPages++;

      if (page < 1 || page > totalPages)
        throw new Error(
          `Argument 'page' for ${id} must be between 1 and ${totalPages}! (You passed ${page})`
        );

      if (page != totalPages + (eBtns.length > 0 ? 0 : 1)) {
        // pages with hypehenBtn
        const mockPlayerHref = $("#player-embed a").attr("href");
        const mockId =
          mockPlayerHref?.split(`${this.baseUrl}/`)[1].split("-")[0] ?? "";

        const res2 = await axios.get(
          mockPlayerHref?.replace(
            mockId,
            (Number(mockId) + (page - 1) * 2).toString()
          ) ?? ""
        );
        const $2 = cheerio.load(res2.data);

        $2(".tab-content .multilink-btn").each((_: any, el: any) => {
          info.episodes?.push({
            id: $(el).attr("href")?.split(`${this.baseUrl}/`)[1] ?? "",
            number: Number(
              $(el).text().trim().replace("Ep. ", "").replace("E", "")
            ),
          });
        });
      } else {
        // page with eBtn (last page) if exists
        eBtns.each((_: any, el: any) => {
          info.episodes?.push({
            id: $(el).attr("href")?.split(`${this.baseUrl}/`)[1] ?? "",
            number: Number(
              $(el).text().trim().replace("Ep. ", "").replace("E", "")
            ),
          });
        });
      }

      info.currentPage = page;
      info.hasNextPage = totalPages > page;
      info.totalPages = totalPages;

      return info;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  async fetchSources(id: string): Promise<Sources> {
    try {
      const res = await axios.get(`${this.baseUrl}/${id}`);
      const $ = cheerio.load(res.data);

      const playerUrl = $("#player-embed a").attr("href") ?? "";
      const res2 = await axios.get(playerUrl);
      const $2 = cheerio.load(res2.data);

      const streamUrl = $2("script")
        .html()!
        .toString()
        .match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/)![1];
      const res3 = await axios.get(streamUrl);
      const $3 = cheerio.load(res3.data);

      const episodeSources: Sources = {
        sources: [],
      };

      $3("script").each((_: any, script: any) => {
        const scriptContent = $3(script).html();
        if (scriptContent?.includes("DOMContentLoaded")) {
          const urls = scriptContent
            .match(/\/\/ https[^\n]*/g)
            ?.map((s: string) => s.replace("//", "").trim());

          if (urls) {
            episodeSources.sources.push({
              url: urls[0],
              quality: "default",
              isM3U8: true,
            });

            episodeSources.sources.push({
              url: urls[1],
              quality: "backup",
            });

            episodeSources.download = urls[2];
          }
        }
      });

      return episodeSources;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }
}

export default AnimeToast;
