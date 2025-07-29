
export type Language = 'en' | 'tr' | 'es' | 'fr' | 'ar' | 'hi' | 'bn' | 'ru' | 'pt' | 'id';

export const languages: { name: string; code: Language }[] = [
    { name: "English", code: "en" },
    { name: "Türkçe", code: "tr" },
    { name: "Español", code: "es" },
    { name: "Français", code: "fr" },
    { name: "العربية", code: "ar" },
    { name: "हिन्दी", code: "hi" },
    { name: "বাংলা", code: "bn" },
    { name: "Русский", code: "ru" },
    { name: "Português", code: "pt" },
    { name: "Bahasa Indonesia", code: "id" },
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

const es: typeof en = {
    home: 'Inicio',
    explore: 'Explorar',
    notifications: 'Notificaciones',
    profile: 'Perfil',
    createPost: 'Crear Publicación',
    settings: 'Ajustes',
    appearance: 'Apariencia',
    toggleTheme: 'Cambiar tema',
    colorTheme: 'Tema de color',
    language: 'Idioma',
    logout: 'Cerrar Sesión',
};

const fr: typeof en = {
    home: 'Accueil',
    explore: 'Explorer',
    notifications: 'Notifications',
    profile: 'Profil',
    createPost: 'Créer une publication',
    settings: 'Paramètres',
    appearance: 'Apparence',
    toggleTheme: 'Changer de thème',
    colorTheme: 'Thème de couleur',
    language: 'Langue',
    logout: 'Se déconnecter',
};

const ar: typeof en = {
    home: 'الرئيسية',
    explore: 'استكشف',
    notifications: 'الإشعارات',
    profile: 'الملف الشخصي',
    createPost: 'إنشاء منشور',
    settings: 'الإعدادات',
    appearance: 'المظهر',
    toggleTheme: 'تبديل السمة',
    colorTheme: 'سمة اللون',
    language: 'اللغة',
    logout: 'تسجيل الخروج',
};

const hi: typeof en = {
    home: 'होम',
    explore: 'अन्वेषण करें',
    notifications: 'सूचनाएं',
    profile: 'प्रोफ़ाइल',
    createPost: 'पोस्ट बनाएं',
    settings: 'सेटिंग्स',
    appearance: 'दिखावट',
    toggleTheme: 'थीम बदलें',
    colorTheme: 'रंग थीम',
    language: 'भाषा',
    logout: 'लॉग आउट',
};

const bn: typeof en = {
    home: 'হোম',
    explore: 'অন্বেষণ',
    notifications: 'বিজ্ঞপ্তি',
    profile: 'প্রোফাইল',
    createPost: 'পোস্ট তৈরি করুন',
    settings: 'সেটিংস',
    appearance: 'চেহারা',
    toggleTheme: 'থিম পরিবর্তন করুন',
    colorTheme: 'রঙের থিম',
    language: 'ভাষা',
    logout: 'লগ আউট',
};

const ru: typeof en = {
    home: 'Главная',
    explore: 'Исследовать',
    notifications: 'Уведомления',
    profile: 'Профиль',
    createPost: 'Создать пост',
    settings: 'Настройки',
    appearance: 'Внешний вид',
    toggleTheme: 'Сменить тему',
    colorTheme: 'Цветовая тема',
    language: 'Язык',
    logout: 'Выйти',
};

const pt: typeof en = {
    home: 'Início',
    explore: 'Explorar',
    notifications: 'Notificações',
    profile: 'Perfil',
    createPost: 'Criar Publicação',
    settings: 'Configurações',
    appearance: 'Aparência',
    toggleTheme: 'Alternar tema',
    colorTheme: 'Tema de Cores',
    language: 'Idioma',
    logout: 'Sair',
};

const id: typeof en = {
    home: 'Beranda',
    explore: 'Jelajahi',
    notifications: 'Notifikasi',
    profile: 'Profil',
    createPost: 'Buat Postingan',
    settings: 'Pengaturan',
    appearance: 'Tampilan',
    toggleTheme: 'Ganti tema',
    colorTheme: 'Tema Warna',
    language: 'Bahasa',
    logout: 'Keluar',
};


export const appStrings = {
    en,
    tr,
    es,
    fr,
    ar,
    hi,
    bn,
    ru,
    pt,
    id,
};

export type AppStrings = typeof appStrings;
