import AnimeParadise from "../src/providers/AnimeParadise";

test("crawl", async () => {
  const api = new AnimeParadise();

  const search = await api.search("One Piece");
  const id = search.results[0].id;

  const info = await api.fetchInfo(id);
  const episodeId = info.episodes ? info.episodes[5].id : "";

  const sources = await api.fetchSources(episodeId);

  console.log(sources);
}, 20000);
