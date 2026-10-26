import { createFileRoute } from "@tanstack/react-router";
import { Storefront } from "@/groz/Storefront";
import { SEO_DICTIONARY } from "@/groz/utils/seo";

const meta = SEO_DICTIONARY.about.en;
export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: meta.title },
      { name: "description", content: meta.description },
      { property: "og:title", content: meta.title },
      { property: "og:description", content: meta.description },
      { property: "og:type", content: meta.ogType },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://grozfashionofficial.lovable.app/about" }],
  }),
  component: Storefront,
});