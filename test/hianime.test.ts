import HiAnime from "../src/providers/HiAnime";

test("crawl", async () => {
  const api = new HiAnime();

  const search = await api.search("dandadan");
  const id = search.results[0].id;

  const info = await api.fetchInfo(id);
  const episodeId = info.episodes ? info.episodes[0].id : '';
  
  const sources = await api.fetchSources(episodeId)

  console.log(sources);
});
