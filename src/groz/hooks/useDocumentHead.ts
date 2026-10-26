// @ts-nocheck
import { useEffect } from 'react';
import { NavRoute, Language } from '../types';

const TITLES: Record<NavRoute, { en: string; bn: string; descEn: string; descBn: string }> = {
  home: {
    en: 'GROZ Atelier | Maijdee Court & Dhaka',
    bn: 'গ্রোজ অ্যাটেলিয়ার | মাইজদী কোর্ট ও ঢাকা',
    descEn: 'Architectural streetwear and artisanal artifacts from Maijdee Court, Noakhali & Dhaka.',
    descBn: 'মাইজদী কোর্ট, নোয়াখালী ও ঢাকার স্থাপত্য বিষয়ক স্ট্রিটওয়্যার ও হস্তশিল্প স্পেসিমেন।',
  },
  shop: {
    en: 'GROZ | Archive Collection',
    bn: 'গ্রোজ | আর্কাইভ কালেকশন',
    descEn: 'Explore the archival catalog of GROZ Atelier garments and specimens.',
    descBn: 'গ্রোজ অ্যাটেলিয়ারের পোশাক ও স্পেসিমেনসমূহের আর্কাইভ কালেকশন অন্বেষণ করুন।',
  },
  cart: {
    en: 'GROZ | Cart Archive',
    bn: 'গ্রোজ | কার্ট আর্কাইভ',
    descEn: 'Review selected specimens in your GROZ dispatch container.',
    descBn: 'আপনার গ্রোজ ডিসপ্যাচ কন্টেইনারে নির্বাচিত স্পেসিমেনসমূহ পর্যালোচনা করুন।',
  },
  checkout: {
    en: 'GROZ | Dispatch & Acquisition',
    bn: 'গ্রোজ | ডিসপ্যাচ ও অ্যাকুইজিশন',
    descEn: 'Complete your secure acquisition from GROZ Atelier.',
    descBn: 'গ্রোজ অ্যাটেলিয়ার থেকে আপনার নিরাপদ অ্যাকুইজিশন সম্পন্ন করুন।',
  },
  about: {
    en: 'GROZ | Manifesto & Atelier',
    bn: 'গ্রোজ | ম্যানিফেস্টো ও অ্যাটেলিয়ার',
    descEn: 'Discover the philosophy, provenance, and architectural vision of GROZ.',
    descBn: 'গ্রোজের দর্শন, প্রোভেন্যান্স এবং স্থাপত্য বিষয়ক দৃষ্টিভঙ্গি আবিষ্কার করুন।',
  },
  contact: {
    en: 'GROZ | Dispatch & Inquiries',
    bn: 'গ্রোজ | ডিসপ্যাচ ও যোগাযোগ',
    descEn: 'Connect with GROZ Atelier in Maijdee Court & Dhaka.',
    descBn: 'মাইজদী কোর্ট ও ঢাকার গ্রোজ অ্যাটেলিয়ারের সাথে যোগাযোগ করুন।',
  },
  admin: {
    en: 'GROZ | Atelier Portal',
    bn: 'গ্রোজ | অ্যাটেলিয়ার পোর্টাল',
    descEn: 'Secure administrative management portal for GROZ Atelier.',
    descBn: 'গ্রোজ অ্যাটেলিয়ারের সুরক্ষিত প্রশাসনিক পরিচালনা পোর্টাল।',
  },
};

export function useDocumentHead(route: NavRoute, language: Language) {
  useEffect(() => {
    const meta = TITLES[route] || TITLES.home;
    const title = language === 'bn' ? meta.bn : meta.en;
    const description = language === 'bn' ? meta.descBn : meta.descEn;

    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', description);
    }
  }, [route, language]);
}
