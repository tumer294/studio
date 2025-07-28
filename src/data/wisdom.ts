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
  }
];
