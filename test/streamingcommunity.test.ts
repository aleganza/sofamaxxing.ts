import StreamingCommunity from "../src/providers/StreamingCommunity";

test("crawl", async () => {
  const api = new StreamingCommunity();

  const search = await api.search("Arcane");
  const id = search.results[0].id;

  const info = await api.fetchInfo(id);
  const episodeId = info.id;

  const sources = await api.fetchSources(id, episodeId);

  console.log(sources);
});
