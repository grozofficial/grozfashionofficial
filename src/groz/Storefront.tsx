import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import seahorseLogo from "@/assets/groz-seahorse.jpg.asset.json";

// Loading screen lasts exactly one second: fade in, then fade out.
const SPLASH_MS = 1000;
const SPLASH_EXIT_MS = 300;

const GrozApp = lazy(async () => {
  const { installLocalApi } = await import("@/groz/localApi");
  installLocalApi();
  return import("@/groz/App");
});

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
    const exit = setTimeout(() => setLeaving(true), SPLASH_MS - SPLASH_EXIT_MS);
    const end = setTimeout(() => setDone(true), SPLASH_MS);
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
