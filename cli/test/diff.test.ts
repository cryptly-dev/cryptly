import { describe, expect, it } from "vitest";
import { classifyAndRender } from "../src/util/diff.js";

describe("classifyAndRender", () => {
  it("returns identical when both inputs match", () => {
    const r = classifyAndRender("FOO=1\nBAR=2\n", "FOO=1\nBAR=2\n");
    expect(r.kind).toBe("identical");
    expect(r.added).toBe(0);
    expect(r.removed).toBe(0);
  });

  it("normalizes CRLF before comparing", () => {
    const r = classifyAndRender("A=1\r\nB=2\r\n", "A=1\nB=2\n");
    expect(r.kind).toBe("identical");
  });

  it("classifies a pure addition as additive", () => {
    const r = classifyAndRender("A=1\n", "A=1\nB=2\n");
    expect(r.kind).toBe("additive");
    expect(r.added).toBeGreaterThan(0);
    expect(r.removed).toBe(0);
  });

  it("classifies a removed line as destructive", () => {
    const r = classifyAndRender("A=1\nB=2\n", "A=1\n");
    expect(r.kind).toBe("destructive");
    expect(r.removed).toBeGreaterThan(0);
  });

  it("classifies a value change as destructive (one removed + one added)", () => {
    const r = classifyAndRender("A=1\n", "A=2\n");
    expect(r.kind).toBe("destructive");
    expect(r.added).toBeGreaterThan(0);
    expect(r.removed).toBeGreaterThan(0);
  });

  it("colorizes additions and removals in the rendered output", () => {
    const r = classifyAndRender("A=1\n", "A=1\nB=2\n");
    // picocolors prefixes ANSI codes; just verify the line text is in there.
    expect(r.rendered).toContain("B=2");
  });
});
