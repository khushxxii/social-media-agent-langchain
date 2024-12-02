import { describe, it } from "@jest/globals";
import { generatePostGraph } from "../agent/subgraphs/generate-post/graph.js";
import {
  GITHUB_MESSAGE,
  GITHUB_URL_STATE,
  TWITTER_NESTED_GITHUB_MESSAGE,
} from "./states.js";
import { TwitterApi } from "twitter-api-v2";
import { resolveTwitterUrl } from "../agent/subgraphs/verify-tweet/utils.js";
import { getGitHubContentsAndTypeFromUrl } from "../agent/subgraphs/shared/nodes/verify-github.js";
import { EXPECTED_README } from "./expected.js";
import { getYouTubeVideoDuration } from "../agent/subgraphs/shared/nodes/youtube.utils.js";
import { getPageText } from "../agent/utils.js";

describe.skip("GeneratePostGraph", () => {
  it.skip("Should be able to generate posts from a GitHub URL slack message", async () => {
    console.log("Starting graph test");
    const result = await generatePostGraph.stream(GITHUB_URL_STATE, {
      streamMode: "values",
    });

    let post = "";
    for await (const value of result) {
      console.log(
        "Event occurred",
        Object.entries(value).map(([k, v]) => ({
          [k]: !!v,
        })),
      );

      if (value.post) {
        post = value.post;
      }
    }

    if (post) {
      console.log("\nPOST:\n");
      console.log(post);
    }
  }, 60000);

  // Skip by default to prevent using up API quota
  it.skip("Can read tweets via Twitter API", async () => {
    if (!process.env.TWITTER_BEARER_TOKEN) {
      throw new Error("TWITTER_BEARER_TOKEN is not set");
    }
    const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
    const singleTweet = await client.v2.singleTweet("1861528104901984330");
    expect(singleTweet.data.text).toBeDefined();
  });

  it("can resolve twitter URLs", async () => {
    const resolvedUrl = await resolveTwitterUrl("https://t.co/GI4uWOGPO5");
    expect(resolvedUrl).toBe(
      "https://twitter.com/GergelyOrosz/status/1861528104901984330/photo/1",
    );
  });
});

test("Can get the proper markdown from a github URL", async () => {
  const url = "https://github.com/bracesproul/langgraphjs-examples";
  const contents = await getGitHubContentsAndTypeFromUrl(url);
  if (!contents) {
    throw new Error("No contents found");
  }
  expect(contents.contents).toBe(EXPECTED_README);
});

describe("generate via twitter posts", () => {
  it("Can generate a post from a tweet with a github link", async () => {
    console.log("Starting graph test");
    const result = await generatePostGraph.stream(
      TWITTER_NESTED_GITHUB_MESSAGE,
      {
        streamMode: "values",
      },
    );

    let post = "";
    for await (const value of result) {
      console.log(
        "Event occurred",
        Object.entries(value).map(([k, v]) => ({
          [k]: !!v,
        })),
      );

      if (value.post) {
        post = value.post;
      }
    }

    if (post) {
      console.log("\nPOST:\n");
      console.log(post);
    }
  }, 60000);
});

describe("generate via github repos", () => {
  it("Can generate a post from a github repo", async () => {
    console.log("Starting graph test");
    const result = await generatePostGraph.stream(GITHUB_MESSAGE, {
      streamMode: "values",
    });

    let post = "";
    for await (const value of result) {
      console.log(
        "Event occurred",
        Object.entries(value).map(([k, v]) => ({
          [k]: !!v,
        })),
      );

      if (value.post) {
        post = value.post;
      }
    }

    if (post) {
      console.log("\nPOST:\n");
      console.log(post);
    }
  }, 60000);
});

test("Can get video duration", async () => {
  const duration = await getYouTubeVideoDuration(
    "https://www.youtube.com/watch?v=BGvqeRB4Jpk",
  );
  expect(duration).toBe(91);
});

test("Can get page text", async () => {
  const text = await getPageText("https://buff.ly/4g0ZRXI");
  expect(text).toBeDefined();
  expect(text?.length).toBeGreaterThan(100);
});
