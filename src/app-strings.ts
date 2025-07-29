
export type Language = 'en' | 'tr';

export const languages: { name: string; code: Language }[] = [
    { name: "English", code: "en" },
    { name: "Türkçe", code: "tr" },
    // Future languages can be added here
];

const en = {
    home: 'Home',
    explore: 'Explore',
    notifications: 'Notifications',
    profile: 'Profile',
    createPost: 'Create Post',
    settings: 'Settings',
    appearance: 'Appearance',
    toggleTheme: 'Toggle theme',
    colorTheme: 'Color Theme',
    language: 'Language',
    logout: 'Logout',
};

const tr: typeof en = {
    home: 'Anasayfa',
    explore: 'Keşfet',
    notifications: 'Bildirimler',
    profile: 'Profil',
    createPost: 'Gönderi Oluştur',
    settings: 'Ayarlar',
    appearance: 'Görünüm',
    toggleTheme: 'Temayı değiştir',
    colorTheme: 'Renk Teması',
    language: 'Dil',
    logout: 'Çıkış Yap',
};


export const appStrings = {
    en,
    tr,
};

export type AppStrings = typeof appStrings;
