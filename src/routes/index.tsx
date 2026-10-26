import { createFileRoute } from "@tanstack/react-router";
import { Storefront } from "@/groz/Storefront";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "GROZ — Premium Fashion & Accessories | Maijdee Court, Noakhali" },
      {
        name: "description",
        content:
          "GROZ is a premium fashion and accessories brand in Maijdee Court, Noakhali. Minimalist silhouettes and precision craftsmanship.",
      },
      { property: "og:title", content: "GROZ — Premium Fashion & Accessories" },
      {
        property: "og:description",
        content: "Editorial fashion and accessories from Maijdee Court, Noakhali, Bangladesh.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Storefront,
});
