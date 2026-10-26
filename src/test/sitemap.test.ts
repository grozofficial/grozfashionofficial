import { QueryClient } from "@tanstack/react-query";
import { createRouter, createRootRoute, createRoute } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { sitemapStaticPaths, sitemapXML } from "@/lib/sitemap";
import { buildCanonicalURL } from "@/groz/utils/seo";

describe("GROZ sitemap", () => {
  it("includes all existing public pages and excludes the sitemap itself", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(sitemapStaticPaths(router)).toEqual(["/", "/about", "/contact", "/shop"]);
  });

  it("automatically includes a newly opted-in route", () => {
    const root = createRootRoute({ staticData: { sitemap: false } });
    const page = createRoute({ getParentRoute: () => root, path: "/products", staticData: { sitemap: true } });
    const router = createRouter({ routeTree: root.addChildren([page]) });
    expect(sitemapStaticPaths(router)).toEqual(["/products"]);
  });

  it("never includes descendants of an excluded private section", () => {
    const root = createRootRoute({ staticData: { sitemap: false } });
    const admin = createRoute({ getParentRoute: () => root, path: "/admin", staticData: { sitemap: "exclude-subtree" } });
    const child = createRoute({ getParentRoute: () => admin, path: "/orders", staticData: { sitemap: true } });
    const router = createRouter({ routeTree: root.addChildren([admin.addChildren([child])]) });
    expect(sitemapStaticPaths(router)).toEqual([]);
  });

  it("uses the published origin and omits unsubstantiated modification dates", () => {
    const xml = sitemapXML("https://grozfashionofficial.lovable.app", [{ path: "/" }, { path: "/about" }]);
    expect(xml).toContain("<loc>https://grozfashionofficial.lovable.app/about</loc>");
    expect(xml).not.toContain("<lastmod>");
  });

  it("rejects hash URLs instead of presenting them as crawlable pages", () => {
    expect(() => sitemapXML("https://grozfashionofficial.lovable.app", [{ path: "/#about" }])).toThrow("Invalid sitemap path");
  });

  it("canonicalizes public pages to their real paths", () => {
    expect(buildCanonicalURL("https://grozfashionofficial.lovable.app", "/about", "shop")).toBe("https://grozfashionofficial.lovable.app/shop");
    expect(buildCanonicalURL("https://grozfashionofficial.lovable.app", "/about", "home")).toBe("https://grozfashionofficial.lovable.app/");
  });
});