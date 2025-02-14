import AniPlay from "../src/providers/AniPlay";

test("crawl", async () => {
  const api = new AniPlay();

  const search = await api.search("Ms. vampire who lives in my neighborhood");
  const id = search.results[0].id;

  const info = await api.fetchInfo(id);
  const episodeId = info.episodes ? info.episodes[0].id : "";

  const sources = await api.fetchSources(episodeId, "pahe", undefined, true);
  console.log(sources);
});
