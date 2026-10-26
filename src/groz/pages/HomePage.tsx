// @ts-nocheck
import React from 'react';
import { useApp } from '../context/AppContext';
import { TravellingProduct } from '../components/TravellingProduct';
import { NewArrivalsSlideshow } from '../components/NewArrivalsSlideshow';
import { ArrowRight, ChevronRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t, setRoute } = useApp();

  return (
    <div className="w-full relative overflow-hidden bg-groz-main text-groz-main transition-colors">
      {/* Travelling Product Cutout bound to scroll */}
      <TravellingProduct />

      {/* =========================================================================
          SECTION 1: HERO
          ========================================================================= */}
      <section className="relative min-h-[92vh] flex flex-col justify-between pt-12 pb-8 border-b border-groz px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Top Micro Eyebrow */}
        <div className="flex items-center justify-between border-b border-groz pb-3">
          <div className="flex items-center gap-2 text-xs font-mono-editorial text-groz-red uppercase tracking-[0.3em]">
            <span className="w-2 h-2 bg-groz-red inline-block" />
            <span>Atelier Registry &bull; Maijdee Court</span>
          </div>
          <div className="text-xs font-mono-editorial text-groz-muted">
            01604985164
          </div>
        </div>

        {/* Hero Central Editorial Composition */}
        <div className="my-auto py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-6">
            <h1 className="font-serif-editorial text-4xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-[1.05] text-groz-main">
              {t('heroHeadline')}
            </h1>

            <p className="font-serif-editorial text-lg sm:text-xl text-groz-muted max-w-2xl leading-relaxed italic">
              {t('heroIntro')}
            </p>

            {/* Two Clear Primary CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setRoute('shop')}
                className="px-8 py-4 bg-groz-red hover:bg-red-700 text-white font-mono-editorial text-xs uppercase tracking-[0.25em] font-semibold transition-colors flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-groz-red"
              >
                <span>{t('shopNow')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setRoute('about')}
                className="px-8 py-4 border border-groz hover:border-groz-red text-groz-main font-mono-editorial text-xs uppercase tracking-[0.25em] transition-colors flex items-center gap-2 focus:outline-none focus:ring-1 focus:ring-groz-red"
              >
                <span>{t('discoverGroz')}</span>
                <ChevronRight className="w-4 h-4 text-groz-red" />
              </button>
            </div>
          </div>

          {/* Reserved space on the right for the floating travelling product cutout */}
          <div className="hidden lg:block lg:col-span-4 h-72" aria-hidden="true" />
        </div>

        {/* Thin Ruled Strip showing Confirmed Brand Information */}
        <div className="pt-4 border-t border-groz grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono-editorial text-groz-muted">
          <div className="flex items-center gap-2">
            <span className="text-groz-red font-semibold">LOCATION:</span>
            <span>Maijdee Court, Noakhali, Bangladesh</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-groz-red font-semibold">CONTACT:</span>
            <a href="tel:+8801604985164" className="hover:text-groz-red transition-colors">
              +880 1604 985164
            </a>
          </div>
          <div className="flex items-center justify-start md:justify-end gap-2 text-groz-muted">
            <span className="text-groz-red">&bull;</span>
            <span>{t('heroScrollPrompt')}</span>
          </div>
        </div>

        {/* Oversized GROZ Wordmark spanning the bottom of the viewport */}
        <div 
          aria-hidden="true" 
          className="w-full select-none pointer-events-none mt-6 -mb-4 text-center overflow-hidden border-t border-groz-subtle pt-2"
        >
          <span className="font-serif-editorial text-[14vw] leading-none tracking-[0.3em] font-bold block whitespace-nowrap opacity-10 dark:opacity-20 text-groz-main">
            GROZ
          </span>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1.5: NEW ARRIVALS 5-PHOTO AUTOMATIC FADE SLIDESHOW
          ========================================================================= */}
      <NewArrivalsSlideshow />
    </div>
  );
};
