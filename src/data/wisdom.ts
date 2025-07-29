
export interface Wisdom {
  type: 'Ayah' | 'Hadith';
  text: string;
  source: string;
  lang: string;
}

export const wisdomData: Wisdom[] = [
  // English
  {
    type: 'Ayah',
    text: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    source: "Qur'an 2:152",
    lang: 'en'
  },
  {
    type: 'Hadith',
    text: "The best among you are those who have the best manners and character.",
    source: "Sahih al-Bukhari",
    lang: 'en'
  },
  {
    type: 'Ayah',
    text: "And He is with you wherever you are.",
    source: "Qur'an 57:4",
    lang: 'en'
  },
  {
    type: 'Hadith',
    text: "Whosoever is not thankful to the people, is not thankful to Allah.",
    source: "Tirmidhi",
    lang: 'en'
  },
  {
    type: 'Ayah',
    text: "Verily, with hardship, there is relief.",
    source: "Qur'an 94:6",
    lang: 'en'
  },
  {
    type: 'Hadith',
    text: "A good word is a form of charity.",
    source: "Sahih Muslim",
    lang: 'en'
  },
  // Turkish
  {
    type: 'Ayah',
    text: "Öyle ise siz beni anın ki ben de sizi anayım. Bana şükredin, nankörlük etmeyin.",
    source: "Kur'an 2:152",
    lang: 'tr'
  },
  {
    type: 'Hadith',
    text: "Sizin en hayırlınız, ahlakı en güzel olanınızdır.",
    source: "Sahih-i Buhari",
    lang: 'tr'
  },
  {
    type: 'Ayah',
    text: "Nerede olursanız olun, O sizinle beraberdir.",
    source: "Kur'an 57:4",
    lang: 'tr'
  },
  // Arabic
  {
    type: 'Ayah',
    text: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    source: "القرآن 2:152",
    lang: 'ar'
  },
  {
    type: 'Hadith',
    text: "خيركم أحاسنكم أخلاقا.",
    source: "صحيح البخاري",
    lang: 'ar'
  },
  {
    type: 'Ayah',
    text: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ",
    source: "القرآن 57:4",
    lang: 'ar'
  },
  // Spanish
  {
    type: 'Ayah',
    text: "Así pues, acordaos de Mí, que Yo Me acordaré de vosotros. Y sedme agradecidos y no Me neguéis.",
    source: "Corán 2:152",
    lang: 'es'
  },
  {
    type: 'Hadith',
    text: "Los mejores de entre vosotros sois los que tenéis mejor carácter y modales.",
    source: "Sahih al-Bukhari",
    lang: 'es'
  },
  {
    type: 'Ayah',
    text: "Y Él está con vosotros dondequiera que estéis.",
    source: "Corán 57:4",
    lang: 'es'
  },
  // French
  {
    type: 'Ayah',
    text: "Souvenez-vous de Moi donc, Je Me souviendrai de vous. Et soyez-Moi reconnaissants et ne soyez pas ingrats envers Moi.",
    source: "Coran 2:152",
    lang: 'fr'
  },
  {
    type: 'Hadith',
    text: "Les meilleurs d'entre vous sont ceux qui ont les meilleures manières et le meilleur caractère.",
    source: "Sahih al-Bukhari",
    lang: 'fr'
  },
    {
    type: 'Ayah',
    text: "Et Il est avec vous où que vous soyez.",
    source: "Coran 57:4",
    lang: 'fr'
  },
  // Hindi
  {
    type: 'Ayah',
    text: "तो तुम मुझे याद करो, मैं तुम्हें याद करूँगा। और मेरे प्रति आभारी रहो और मेरा इनकार न करो।",
    source: "कुरान 2:152",
    lang: 'hi'
  },
  {
    type: 'Hadith',
    text: "तुममें सबसे अच्छे वे हैं जिनके आचरण और चरित्र सबसे अच्छे हैं।",
    source: "सहीह अल-बुखारी",
    lang: 'hi'
  },
  // Bengali
  {
    type: 'Ayah',
    text: "সুতরাং তোমরা আমাকে স্মরণ কর, আমিও তোমাদেরকে স্মরণ করব। আর আমার প্রতি কৃতজ্ঞ হও এবং আমাকে অস্বীকার করো না।",
    source: "কুরআন ২:১৫২",
    lang: 'bn'
  },
  {
    type: 'Hadith',
    text: "তোমাদের মধ্যে সর্বোত্তম সে-ই যে নৈতিকতা ও চরিত্রে সর্বোত্তম।",
    source: "সহীহ আল-বুখারী",
    lang: 'bn'
  },
  // Russian
  {
    type: 'Ayah',
    text: "Поминайте Меня, и Я буду помнить о вас. И благодарите Меня и не будьте неблагодарны Мне.",
    source: "Коран 2:152",
    lang: 'ru'
  },
    {
    type: 'Hadith',
    text: "Лучшие из вас те, кто обладает наилучшими нравами и характером.",
    source: "Сахих аль-Бухари",
    lang: 'ru'
  },
  // Portuguese
  {
    type: 'Ayah',
    text: "Lembrai-vos de Mim, pois Eu Me lembrarei de vós. E sede-Me gratos e não Me negueis.",
    source: "Alcorão 2:152",
    lang: 'pt'
  },
  {
    type: 'Hadith',
    text: "Os melhores dentre vós são aqueles que têm os melhores costumes e caráter.",
    source: "Sahih al-Bukhari",
    lang: 'pt'
  },
  // Indonesian
  {
    type: 'Ayah',
    text: "Karena itu, ingatlah kamu kepada-Ku niscaya Aku ingat (pula) kepadamu, dan bersyukurlah kepada-Ku, dan janganlah kamu mengingkari (nikmat)-Ku.",
    source: "Qur'an 2:152",
    lang: 'id'
  },
  {
    type: 'Hadith',
    text: "Sebaik-baik kalian adalah yang paling baik akhlak dan karakternya.",
    source: "Sahih al-Bukhari",
    lang: 'id'
  },
];
