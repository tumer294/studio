export interface Wisdom {
  type: 'Ayah' | 'Hadith';
  text: string;
  source: string;
}

export const wisdomData: Wisdom[] = [
  {
    type: 'Ayah',
    text: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    source: "Qur'an 2:152"
  },
  {
    type: 'Hadith',
    text: "The best among you are those who have the best manners and character.",
    source: "Sahih al-Bukhari"
  },
  {
    type: 'Ayah',
    text: "And He is with you wherever you are.",
    source: "Qur'an 57:4"
  },
  {
    type: 'Hadith',
    text: "Whosoever is not thankful to the people, is not thankful to Allah.",
    source: "Tirmidhi"
  },
  {
    type: 'Ayah',
    text: "Verily, with hardship, there is relief.",
    source: "Qur'an 94:6"
  },
  {
    type: 'Hadith',
    text: "A good word is a form of charity.",
    source: "Sahih Muslim"
  },
  {
    type: 'Ayah',
    text: "Öyle ise siz beni anın ki ben de sizi anayım. Bana şükredin, nankörlük etmeyin.",
    source: "Kur'an 2:152 (Türkçe)"
  },
  {
    type: 'Hadith',
    text: "Sizin en hayırlınız, ahlakı en güzel olanınızdır.",
    source: "Sahih-i Buhari (Türkçe)"
  },
  {
    type: 'Ayah',
    text: "Nerede olursanız olun, O sizinle beraberdir.",
    source: "Kur'an 57:4 (Türkçe)"
  },
  {
    type: 'Ayah',
    text: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    source: "القرآن 2:152 (العربية)"
  },
  {
    type: 'Hadith',
    text: "خيركم أحاسنكم أخلاقا.",
    source: "صحيح البخاري (العربية)"
  },
  {
    type: 'Ayah',
    text: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ",
    source: "القرآن 57:4 (العربية)"
  },
  {
    type: 'Ayah',
    text: "Así pues, acordaos de Mí, que Yo Me acordaré de vosotros. Y sedme agradecidos y no Me neguéis.",
    source: "Corán 2:152 (Español)"
  },
  {
    type: 'Hadith',
    text: "Los mejores de entre vosotros sois los que tenéis mejor carácter y modales.",
    source: "Sahih al-Bukhari (Español)"
  },
  {
    type: 'Ayah',
    text: "Invocadme, pues, y Yo os invocaré; sedme agradecidos y no Me neguéis.",
    source: "Coran 2:152 (Français)"
  },
  {
    type: 'Hadith',
    text: "Les meilleurs d'entre vous sont ceux qui ont les meilleures manières et le meilleur caractère.",
    source: "Sahih al-Bukhari (Français)"
  }
];
