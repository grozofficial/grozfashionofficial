import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const GrozApp = lazy(async () => {
  const { installLocalApi } = await import("@/groz/localApi");
  installLocalApi();
  return import("@/groz/App");
});

export const Route = createFileRoute("/")({
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
  component: Index,
});

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-groz-main text-groz-main">
      <span className="font-serif-editorial text-4xl tracking-[0.4em]">GROZ</span>
    </div>
  );
}

function Index() {
  return (
    <ClientOnly fallback={<Splash />}>
      <Suspense fallback={<Splash />}>
        <GrozApp />
      </Suspense>
    </ClientOnly>
  );
}
