import AnimeToast from "../src/providers/AnimeToast";

test("crawl", async () => {
  const api = new AnimeToast();

  const search = await api.search("DanDaDan");
  const id = search.results[0].id;

  const info = await api.fetchInfo(id)
  const episodeId = info.episodes ? info.episodes[0].id : '';

  const sources = await api.fetchSources(episodeId);

  // console.log(sources);
});
