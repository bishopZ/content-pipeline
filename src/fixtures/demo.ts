import { BackgroundPlan, LocaleCopy } from '../types.js';

export const demoEnglishCopy: LocaleCopy = {
  locale: 'en',
  products: [
    {
      slug: 'suncrisp-chili-mango',
      headline: 'Summer heat, mango beat',
      body: 'Kettle chips with chili kick and sweet mango. Snack bold.',
    },
    {
      slug: 'purepour-coconut-electrolyte',
      headline: 'Hydrate the commute',
      body: 'Coconut electrolyte refreshment for hot days on the move.',
    },
  ],
};

export const demoLocalizedCopy: LocaleCopy[] = [
  demoEnglishCopy,
  {
    locale: 'fr',
    products: [
      {
        slug: 'suncrisp-chili-mango',
        headline: "Chaleur d'été, saveur mangue",
        body: "Chips artisanales piment-mangue pour l'apéro estival.",
      },
      {
        slug: 'purepour-coconut-electrolyte',
        headline: 'Hydratez votre été',
        body: 'Boisson électrolyte à la noix de coco pour les journées chaudes.',
      },
    ],
  },
  {
    locale: 'zh',
    products: [
      {
        slug: 'suncrisp-chili-mango',
        headline: '夏日热辣芒果片',
        body: '夜宵市集同款酥脆口感，芒果与辣椒的平衡。',
      },
      {
        slug: 'purepour-coconut-electrolyte',
        headline: '通勤也要补水',
        body: '轻椰子电解质饮料，专为炎热夏日通勤设计。',
      },
    ],
  },
  {
    locale: 'ar',
    products: [
      {
        slug: 'suncrisp-chili-mango',
        headline: 'نكهة الصيف الحارة',
        body: 'رقائق المانجو والفلفل الحار لسهرة صيفية مميزة.',
      },
      {
        slug: 'purepour-coconut-electrolyte',
        headline: 'ترطيب لأيام الحر',
        body: 'مشروب إلكتروليت بجوز الهند للأيام النشطة outdoors.',
      },
    ],
  },
];

export const demoBackgroundPlans: BackgroundPlan[] = [
  {
    slug: 'suncrisp-chili-mango',
    mood: 'Warm sunset market energy',
    palette: ['#E76F51', '#F4A261', '#E9C46A'],
    prompt:
      'Bright summer sunset over an urban rooftop gathering, warm golden light, festive string lights, open counter space at bottom third, no food products visible, photorealistic.',
  },
  {
    slug: 'purepour-coconut-electrolyte',
    mood: 'Fresh coastal morning',
    palette: ['#2A9D8F', '#2D6A4F', '#E9F5F2'],
    prompt:
      'Clean modern city park at morning golden hour, palm shadows, refreshing summer atmosphere, negative space for product placement, no bottles or packaging, photorealistic.',
  },
];
