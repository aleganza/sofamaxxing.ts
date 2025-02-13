import AniPlay from "../src/providers/AniPlay";

test("crawl", async () => {
  const api = new AniPlay();

  const search = await api.search("re:zero");
  const id = search.results[3].id;

  const info = await api.fetchInfo(id);
  const episodeId = info.episodes ? info.episodes[0].id : "";

  const sources = await api.fetchSources(episodeId, "maze");
  console.log(sources);
});
