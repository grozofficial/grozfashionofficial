import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, ArrowRight, Sparkles, Eye } from 'lucide-react';

export const NewArrivalsSection: React.FC = () => {
  const { products, setRoute, setActiveProductId, formatMoney, language } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter published products, prioritizing new arrivals
  const publishedProducts = products.filter((p) => p.isPublished !== false);
  const newArrivals = publishedProducts.filter((p) => p.isNewArrival);
  const displayProducts = newArrivals.length > 0 ? newArrivals : publishedProducts.slice(0, 4);

  if (displayProducts.length === 0) {
    return (
      <section className="py-20 border-b border-groz px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <div className="text-xs font-mono-editorial text-groz-red uppercase tracking-[0.25em]">
          <span>New Arrivals &bull; Maijdee Court Archive</span>
        </div>
        <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold uppercase text-groz-main">
          {language === 'bn' ? 'নতুন আগমন' : 'NEW ARRIVALS'}
        </h2>
        <p className="font-serif-editorial text-sm text-groz-muted italic">
          {language === 'bn' ? 'শীঘ্রই নতুন স্পেসিমেন ক্যাটালগ প্রকাশ করা হবে।' : 'Curating inaugural collection specimens. Check back shortly.'}
        </p>
      </section>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayProducts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === displayProducts.length - 1 ? 0 : prev + 1));
  };

  const currentProduct = displayProducts[currentIndex] || displayProducts[0];

  return (
    <section className="py-20 border-b border-groz px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-10 border-b border-groz gap-4">
        <div>
          <div className="text-xs font-mono-editorial text-groz-red uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-groz-red animate-pulse" />
            <span>{language === 'bn' ? 'সরাসরি স্টুডিও থেকে' : 'Fresh from Maijdee Court Studio'}</span>
          </div>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight uppercase text-groz-main">
            {language === 'bn' ? 'নতুন আগমন' : 'NEW ARRIVALS'}
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-4">
          <p className="text-sm font-serif-editorial text-groz-muted italic max-w-sm">
            {language === 'bn' ? 'গ্রোজ কালেকশনের সর্বশেষ সংযোজনগুলো অন্বেষণ করুন।' : 'Discover the latest additions to the GROZ collection.'}
          </p>
          {displayProducts.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous specimen"
                className="p-3 border border-groz hover:border-groz-red hover:text-groz-red bg-groz-main text-groz-main transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next specimen"
                className="p-3 border border-groz hover:border-groz-red hover:text-groz-red bg-groz-main text-groz-main transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Featured New Arrival Showcase Grid / Carousel */}
      <div className="py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left: Large Premium Product Image Frame with Red Lighting & Chrome Details */}
        <div className="lg:col-span-7 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-groz-red/30 via-transparent to-groz-red/20 rounded-none blur-sm opacity-75 group-hover:opacity-100 transition duration-500" />
          
          <div className="relative aspect-[4/3] sm:aspect-[16/10] border border-groz bg-groz-surface overflow-hidden flex items-center justify-center">
            {/* NEW Badge */}
            <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-groz-red text-white text-[10px] font-mono-editorial uppercase tracking-widest font-semibold flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3 h-3" />
              <span>{language === 'bn' ? 'নতুন' : 'NEW'}</span>
            </span>

            <img
              src={currentProduct.image}
              alt={language === 'bn' ? currentProduct.nameBn : currentProduct.nameEn}
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />

            {/* Subtle Overlay & View Action on Hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button
                onClick={() => {
                  setActiveProductId(currentProduct.id);
                  setRoute('shop');
                }}
                className="px-6 py-3 bg-groz-main text-groz-main border border-groz hover:border-groz-red font-mono-editorial text-xs uppercase tracking-[0.2em] font-semibold transition-colors flex items-center gap-2 shadow-2xl"
              >
                <Eye className="w-4 h-4 text-groz-red" />
                <span>{language === 'bn' ? 'বিস্তারিত দেখুন' : 'VIEW SPECIMEN'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Product Details & Quick Switcher */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="text-xs font-mono-editorial text-groz-red uppercase tracking-[0.2em]">
              Category &bull; {currentProduct.category}
            </div>
            <h3 className="font-serif-editorial text-3xl sm:text-4xl font-bold uppercase tracking-tight text-groz-main">
              {language === 'bn' ? currentProduct.nameBn : currentProduct.nameEn}
            </h3>
            <p className="font-serif-editorial text-sm text-groz-muted italic leading-relaxed">
              {language === 'bn' ? currentProduct.subtitleBn : currentProduct.subtitleEn}
            </p>
          </div>

          <div className="p-4 border border-groz bg-groz-surface space-y-2">
            <div className="text-xs font-mono-editorial text-groz-muted uppercase">Acquisition Price</div>
            <div className="text-2xl font-mono-editorial font-bold text-groz-main">
              {formatMoney(currentProduct.salePriceBDT || currentProduct.priceBDT)}
              {currentProduct.salePriceBDT && (
                <span className="text-xs font-normal text-groz-muted line-through ml-3">
                  {formatMoney(currentProduct.priceBDT)}
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={() => {
                setActiveProductId(currentProduct.id);
                setRoute('shop');
              }}
              className="flex-1 py-4 px-6 bg-groz-red hover:bg-red-700 text-white font-mono-editorial text-xs uppercase tracking-[0.2em] font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span>{language === 'bn' ? 'পণ্যটি দেখুন' : 'VIEW PRODUCT'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Thumbnail Selector for Multiple New Arrivals */}
          {displayProducts.length > 1 && (
            <div className="pt-4 border-t border-groz space-y-2">
              <div className="text-[11px] font-mono-editorial text-groz-muted uppercase tracking-wider">
                {language === 'bn' ? 'অন্যান্য নতুন স্পেসিমেন' : 'Select Specimen'} ({currentIndex + 1} / {displayProducts.length})
              </div>
              <div className="grid grid-cols-4 gap-2">
                {displayProducts.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative aspect-square border overflow-hidden transition-all ${
                      idx === currentIndex ? 'border-groz-red ring-1 ring-groz-red' : 'border-groz opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={p.image} alt={p.nameEn} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
