// const key = "96313c7105mshab2cef56e1d86e2p1c79cajsn9b955836cbfb";
// const host = "instagram-scraper-stable-api.p.rapidapi.com";
// const code = "DZoWiCbTKDR";

// async function test() {
//   const getUrl = `https://${host}/get_media_data.php?media_code=${code}`;
//   const response = await fetch(getUrl, {
//     method: "GET",
//     headers: {
//       "x-rapidapi-host": host,
//       "x-rapidapi-key": key,
//     }
//   });
//   if (response.ok) {
//     const json = await response.json();
//     console.log("Top-level keys:", Object.keys(json));
//     console.log("Is video?", json.is_video);
//     console.log("Video URL?", json.video_url);
//     console.log("Display URL?", json.display_url);
//     console.log("Caption?", json.edge_media_to_caption?.edges?.[0]?.node?.text);
//     console.log("Likes count?", json.edge_media_preview_like?.count);
//     console.log("Comments count?", json.edge_media_to_comment?.count);
//     console.log("Owner username?", json.owner?.username);
//     if (json.edge_sidecar_to_children) {
//       console.log("Carousel slides count?", json.edge_sidecar_to_children.edges.length);
//     }
//   } else {
//     console.log("Fail:", response.status);
//   }
// }

// test();
