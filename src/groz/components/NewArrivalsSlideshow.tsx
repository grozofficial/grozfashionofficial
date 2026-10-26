// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ArrowRight, Image as ImageIcon } from 'lucide-react';

export const NewArrivalsSlideshow: React.FC = () => {
  const { products, setRoute, setActiveProductId, formatMoney, language } = useApp();
  
  // Get published new arrival products from the secure product database
  const publishedProducts = products.filter((p) => p.isPublished !== false);
  const newArrivals = publishedProducts.filter((p) => p.isNewArrival);
  const sourceItems = newArrivals.length > 0 ? newArrivals : publishedProducts.slice(0, 5);

  // Exactly 5 slideshow slots. If fewer than 5 products exist, use clean stylish black placeholders with "IMAGE COMING SOON".
  const slides = [];
  for (let i = 0; i < 5; i++) {
    if (sourceItems[i]) {
      slides.push({
        ...sourceItems[i],
        isPlaceholder: false,
      });
    } else {
      slides.push({
        id: `groz-placeholder-${i + 1}`,
        nameEn: `Atelier Specimen Slot 0${i + 1}`,
        nameBn: `স্টুডিও স্পেসিমেন স্লট ০${i + 1}`,
        subtitleEn: 'Pending Owner Upload',
        subtitleBn: 'মালিক কর্তৃক ছবি আপলোডের অপেক্ষায়',
        priceBDT: 0,
        image: null,
        isPlaceholder: true,
      });
    }
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 3-second automatic crossfade interval
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 5);
    }, 3000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  return (
    <section 
      className="py-16 sm:py-24 border-b border-groz bg-groz-main px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section Header with Red Accent Line */}
      <div className="text-center space-y-3 pb-12 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-mono-editorial text-groz-red uppercase tracking-[0.3em]">
          <span className="w-1.5 h-1.5 bg-groz-red inline-block" />
          <span>{language === 'bn' ? 'স্টুডিও কালেকশন' : 'Atelier Archive Showcase'}</span>
        </div>
        <h2 className="font-serif-editorial text-3xl sm:text-5xl font-bold uppercase tracking-tight text-groz-main">
          {language === 'bn' ? 'নতুন আগমন' : 'NEW ARRIVALS'}
        </h2>
        <div className="w-16 h-0.5 bg-groz-red mx-auto" />
        <p className="font-serif-editorial text-base sm:text-lg text-groz-muted italic">
          {language === 'bn' ? 'গ্রোজ কালেকশনের নতুন সংযোজনগুলো অন্বেষণ করুন।' : 'Discover the latest additions to the GROZ collection.'}
        </p>
      </div>

      {/* Slideshow Container with Subtle Red Glow & Thin Borders */}
      <div className="relative max-w-5xl mx-auto">
        <div className="absolute -inset-2 bg-gradient-to-r from-groz-red/20 via-transparent to-groz-red/10 blur-md opacity-75 pointer-events-none" />

        <div className="relative aspect-[16/10] sm:aspect-[21/9] border border-groz-red/40 bg-groz-surface overflow-hidden shadow-2xl flex items-center justify-center">
          {/* NEW Badge */}
          <span className="absolute top-4 left-4 z-20 px-3 py-1 bg-groz-red text-white text-[10px] font-mono-editorial uppercase tracking-widest font-semibold flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-3 h-3" />
            <span>{language === 'bn' ? 'নতুন' : 'NEW'}</span>
          </span>

          {/* 5-Photo Automatic Crossfade Slides */}
          {slides.map((slide: any, idx) => {
            const isActive = idx === currentIndex;
            const name = language === 'bn' ? (slide.nameBn || slide.nameEn) : slide.nameEn;
            const subtitle = language === 'bn' ? (slide.subtitleBn || slide.subtitleEn || 'মাইজদী কোর্ট সংস্করণ') : (slide.subtitleEn || 'Maijdee Court Edition');
            const price = slide.salePriceBDT || slide.priceBDT || 0;

            return (
              <div
                key={slide.id || idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {slide.isPlaceholder || !slide.image ? (
                  /* Clean, Stylish Black Placeholder with Subtle Red Border and "IMAGE COMING SOON" */
                  <div className="w-full h-full bg-black border border-groz-red/30 flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full border border-groz-red/40 flex items-center justify-center bg-groz-surface/50 text-groz-red animate-pulse">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-mono-editorial text-groz-red uppercase tracking-[0.3em]">
                        IMAGE COMING SOON &bull; SLOT 0{idx + 1} OF 5
                      </div>
                      <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold uppercase text-white tracking-wide">
                        {name}
                      </h3>
                      <p className="font-serif-editorial text-xs text-groz-muted italic">
                        Upload real product photo via Admin Dashboard (/admin)
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <img
                      src={slide.image}
                      alt={name}
                      className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-1000 ease-out"
                    />

                    {/* Dark Editorial Gradient Overlay & Product Caption */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-10">
                      <div className="max-w-xl space-y-2">
                        <div className="text-xs font-mono-editorial text-groz-red uppercase tracking-[0.25em]">
                          {subtitle} &bull; Slot {idx + 1} of 5
                        </div>
                        <h3 className="font-serif-editorial text-2xl sm:text-4xl font-bold uppercase tracking-tight text-white">
                          {name}
                        </h3>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-lg font-mono-editorial font-bold text-white">
                            {formatMoney ? formatMoney(price) : `৳ ${price.toLocaleString()}`}
                          </span>
                          <button
                            onClick={() => {
                              if (slide.id && !slide.id.startsWith('groz-placeholder-')) {
                                setActiveProductId(slide.id);
                              }
                              setRoute('shop');
                            }}
                            className="px-5 py-2.5 bg-groz-red hover:bg-red-700 text-white font-mono-editorial text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-2 shadow-lg"
                          >
                            <span>{language === 'bn' ? 'পণ্যটি দেখুন' : 'VIEW PRODUCT'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Five Small Navigation Dots for Manual Selection */}
        <div className="flex items-center justify-center gap-3 pt-6">
          {slides.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setCurrentIndex(dotIdx)}
              aria-label={`Go to slide ${dotIdx + 1}`}
              className={`h-2.5 transition-all duration-300 rounded-none ${
                dotIdx === currentIndex
                  ? 'w-8 bg-groz-red'
                  : 'w-2.5 bg-groz-muted/50 hover:bg-groz-main'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
