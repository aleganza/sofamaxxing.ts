import OnePace from "../src/providers/OnePace";

test("crawl", async () => {
  const api = new OnePace("https://pixeldra.in");

  const list = await api.fetchList("en");
  const arcId = list[5].formats[0].links[1].id;
  const arc = await api.fetchArc(arcId);

  console.log(api.fetchSource(arc.episodes[3].id));
});
