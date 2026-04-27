import { describe, expect, it } from "vitest";
import { parseGithubRemote } from "../src/util/git.js";

describe("parseGithubRemote", () => {
  it.each([
    ["git@github.com:cryptly-dev/cryptly.git", { owner: "cryptly-dev", name: "cryptly" }],
    ["git@github.com:cryptly-dev/cryptly", { owner: "cryptly-dev", name: "cryptly" }],
    ["https://github.com/cryptly-dev/cryptly.git", { owner: "cryptly-dev", name: "cryptly" }],
    ["https://github.com/cryptly-dev/cryptly", { owner: "cryptly-dev", name: "cryptly" }],
    ["ssh://git@github.com/cryptly-dev/cryptly.git", { owner: "cryptly-dev", name: "cryptly" }],
  ])("parses %s", (input, expected) => {
    expect(parseGithubRemote(input)).toEqual(expected);
  });

  it.each([["git@gitlab.com:foo/bar.git"], ["https://example.com/foo/bar"], ["not a url"]])(
    "returns null for non-github remote %s",
    (input) => {
      expect(parseGithubRemote(input)).toBeNull();
    },
  );
});
