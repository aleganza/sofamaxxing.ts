import AnimeUnity from "../src/providers/AnimeUnity";

test("crawl", async () => {
  const api = new AnimeUnity();

  const search = await api.search("DanDaDan");
  const id = search.results[0].id;

  const info = await api.fetchInfo(id);
  const episodeId = info.episodes ? info.episodes[0].id : '';
  
  const sources = await api.fetchSources(episodeId);

  console.log(sources);
}, 20000);
