import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const GrozApp = lazy(async () => {
  const { installLocalApi } = await import("@/groz/localApi");
  installLocalApi();
  return import("@/groz/App");
});

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-groz-main text-groz-main">
      <span className="font-serif-editorial text-4xl tracking-[0.4em]">GROZ</span>
    </div>
  );
}

export function Storefront() {
  return (
    <ClientOnly fallback={<Splash />}>
      <Suspense fallback={<Splash />}><GrozApp /></Suspense>
    </ClientOnly>
  );
}