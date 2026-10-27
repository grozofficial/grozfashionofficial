import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import seahorseLogo from "@/assets/groz-seahorse.jpg.asset.json";

// The loading screen lasts one second from the moment the page starts loading.
const SPLASH_MS = 1000;
const SPLASH_EXIT_MS = 300;

function loadApp() {
  return import("@/groz/localApi").then(({ installLocalApi }) => {
    installLocalApi();
    return import("@/groz/App");
  });
}

// Start fetching the storefront as soon as this module runs, so it is ready
// when the loading screen ends.
const preloaded = typeof window !== "undefined" ? loadApp() : null;
if (preloaded) preloaded.catch(() => {});

const GrozApp = lazy(() => preloaded ?? loadApp());

function Splash({ leaving = false }: { leaving?: boolean }) {
  return (
    <div
      className={
        "flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-6 motion-safe:transition-opacity motion-safe:duration-300 motion-safe:ease-out " +
        (leaving ? "opacity-0" : "opacity-100")
      }
    >
      <img
        src={seahorseLogo.url}
        alt="GROZ seahorse emblem"
        className="w-24 select-none sm:w-32 motion-safe:animate-[groz-splash-fade_0.6s_ease-out_both]"
        draggable={false}
      />
      <span className="font-serif-editorial text-3xl tracking-[0.4em] text-white sm:text-4xl motion-safe:animate-[groz-splash-fade_0.6s_ease-out_0.1s_both]">
        GROZ
      </span>
      <span className="h-px w-16 bg-groz-red opacity-80 motion-safe:animate-[groz-splash-line_0.5s_ease-out_0.2s_both]" />
    </div>
  );
}

export function Storefront() {
  const [leaving, setLeaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Count from when the page started loading, not from when this mounted.
    const elapsed = performance.now();
    const remaining = Math.max(0, SPLASH_MS - elapsed);
    const exit = setTimeout(() => setLeaving(true), Math.max(0, remaining - SPLASH_EXIT_MS));
    const end = setTimeout(() => setDone(true), remaining);
    return () => {
      clearTimeout(exit);
      clearTimeout(end);
    };
  }, []);

  return (
    <ClientOnly fallback={<Splash />}>
      <div className="relative">
        <Suspense fallback={<Splash />}>
          <GrozApp />
        </Suspense>
        {!done && (
          <div className="fixed inset-0 z-[100]">
            <Splash leaving={leaving} />
          </div>
        )}
      </div>
    </ClientOnly>
  );
}
