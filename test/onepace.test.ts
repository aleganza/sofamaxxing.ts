import OnePace from "../src/providers/OnePace";

test("crawl", async () => {
  const api = new OnePace("https://pixeldra.in");
  const info = await api.fetchInfo(35); // wano
  const episodeId = info.episodes ? info.episodes[13].id : '';
  
  const sources = await api.fetchSources(episodeId)

  console.log(sources);
});
