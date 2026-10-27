import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import seahorseLogo from "@/assets/groz-seahorse.jpg.asset.json";

const GrozApp = lazy(async () => {
  const { installLocalApi } = await import("@/groz/localApi");
  installLocalApi();
  return import("@/groz/App");
});

function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-6">
      <img
        src={seahorseLogo.url}
        alt="GROZ seahorse emblem"
        className="w-24 select-none sm:w-32 motion-safe:animate-[groz-splash-fade_1.6s_ease-out_both]"
        draggable={false}
      />
      <span className="font-serif-editorial text-3xl tracking-[0.4em] text-white sm:text-4xl motion-safe:animate-[groz-splash-fade_1.6s_ease-out_0.2s_both]">
        GROZ
      </span>
      <span className="h-px w-16 bg-groz-red/80 motion-safe:animate-[groz-splash-line_1.4s_ease-out_0.4s_both]" />
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
