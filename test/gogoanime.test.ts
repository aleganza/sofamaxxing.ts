import Gogoanime from "@consumet/extensions/dist/providers/anime/gogoanime";

test("crawl", async () => {
  const api = new Gogoanime();

  const search = await api.search("jujutsu kaisen");
  const id = search.results[0].id;

  const info = await api.fetchAnimeInfo(id);
  const episodeId = info.episodes ? info.episodes[0].id : '';
  
  const sources = await api.fetchEpisodeSources(episodeId);

  console.log(sources);
}, 20000);
