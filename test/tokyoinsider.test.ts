import TokyoInsider from "../src/providers/TokyoInsider";

test("crawl", async () => {
  const api = new TokyoInsider();

  const search = await api.search("Naruto");
  const id = search.results[0].id;  

  const info = await api.fetchInfo(id);
  const episodeId = info.episodes ? info.episodes[0].id : "";

  const sources = await api.fetchSources(episodeId);

  // console.log(sources);
});
