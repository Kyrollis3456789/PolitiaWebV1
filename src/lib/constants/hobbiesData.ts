export interface HobbyItem {
  id: string;
  category: 'church' | 'arts' | 'music' | 'sports' | 'tech' | 'crafts' | 'reading' | 'outdoors' | 'social';
  emoji: string;
  labelEn: string;
  labelAr: string;
}

export interface HobbyCategory {
  id: string;
  labelEn: string;
  labelAr: string;
  emoji: string;
}

export const HOBBY_CATEGORIES: HobbyCategory[] = [
  { id: 'all', labelEn: 'All Hobbies', labelAr: 'جميع الاهتمامات', emoji: '✨' },
  { id: 'church', labelEn: 'Church & Ministry', labelAr: 'الخدمة الكنسية', emoji: '⛪' },
  { id: 'arts', labelEn: 'Arts & Design', labelAr: 'الفنون والتصميم', emoji: '🎨' },
  { id: 'music', labelEn: 'Music & Singing', labelAr: 'الموسيقى والعزف', emoji: '🎵' },
  { id: 'sports', labelEn: 'Sports & Fitness', labelAr: 'الرياضة واللياقة', emoji: '⚽' },
  { id: 'tech', labelEn: 'Tech & Gaming', labelAr: 'التكنولوجيا والألعاب', emoji: '💻' },
  { id: 'crafts', labelEn: 'Cooking & Crafts', labelAr: 'الطبخ والأشغال', emoji: '🍳' },
  { id: 'reading', labelEn: 'Reading & Learning', labelAr: 'القراءة والتعلم', emoji: '📚' },
  { id: 'outdoors', labelEn: 'Travel & Nature', labelAr: 'السفر والطبيعة', emoji: '🌍' },
  { id: 'social', labelEn: 'Community & Volunteer', labelAr: 'العمل التطوعي', emoji: '🤝' },
];

export const COMPREHENSIVE_HOBBIES: HobbyItem[] = [
  // ⛪ Church & Ministry (12)
  { id: 'hymns_chants', category: 'church', emoji: '🎶', labelEn: 'Hymns & Tasbeha', labelAr: 'الألحان والتسبحة' },
  { id: 'deaconship', category: 'church', emoji: '⛪', labelEn: 'Deaconship & Altar Service', labelAr: 'الخدمة الشماسية والمذبح' },
  { id: 'sunday_school', category: 'church', emoji: '📖', labelEn: 'Sunday School Ministry', labelAr: 'مدارس الأحد والتربية الكنسية' },
  { id: 'church_scouts', category: 'church', emoji: '⛺', labelEn: 'Church Scouts & Camps', labelAr: 'الكشافة والمعسكرات الكنسية' },
  { id: 'church_choir', category: 'church', emoji: '🎤', labelEn: 'Church Choir', labelAr: 'كورال وترانيم الكنيسة' },
  { id: 'coptic_language', category: 'church', emoji: '📜', labelEn: 'Coptic Language Studies', labelAr: 'دراسة اللغة القبطية' },
  { id: 'bible_study', category: 'church', emoji: '✝️', labelEn: 'Bible Study Groups', labelAr: 'دراسات الكتاب المقدس' },
  { id: 'church_theater', category: 'church', emoji: '🎭', labelEn: 'Church Drama & Theater', labelAr: 'المسرح وفريق التمثيل الكنسي' },
  { id: 'church_media', category: 'church', emoji: '🎥', labelEn: 'Church Media & Broadcasting', labelAr: 'ميديا وبث الصلوات الكنسية' },
  { id: 'youth_ministry', category: 'church', emoji: '👥', labelEn: 'Youth & Graduates Meeting', labelAr: 'اجتماع الشباب والخريجين' },
  { id: 'elderly_care', category: 'church', emoji: '🤍', labelEn: 'Elderly & Sick Visitation', labelAr: 'افتقاد المرضى وكبار السن' },
  { id: 'church_library', category: 'church', emoji: '📚', labelEn: 'Church Library & Archives', labelAr: 'مكتبة وتوثيق الكنيسة' },

  // 🎨 Arts & Design (11)
  { id: 'drawing_sketching', category: 'arts', emoji: '✏️', labelEn: 'Drawing & Sketching', labelAr: 'الرسم والتخطيط' },
  { id: 'painting', category: 'arts', emoji: '🎨', labelEn: 'Oil & Acrylic Painting', labelAr: 'الرسم الزيتي والأكريليك' },
  { id: 'graphic_design', category: 'arts', emoji: '💻', labelEn: 'Graphic Design & UI/UX', labelAr: 'تصميم الجرافيك والواجهات' },
  { id: 'coptic_iconography', category: 'arts', emoji: '🖼️', labelEn: 'Coptic Iconography', labelAr: 'فن كتابة الأيقونات القبطية' },
  { id: 'calligraphy', category: 'arts', emoji: '✒️', labelEn: 'Calligraphy & Lettering', labelAr: 'فن الخط العربي والقبطي' },
  { id: 'photography', category: 'arts', emoji: '📷', labelEn: 'Photography', labelAr: 'التصوير الفوتوغرافي' },
  { id: 'filmmaking', category: 'arts', emoji: '🎬', labelEn: 'Video Editing & Filmmaking', labelAr: 'المونتاج وصناعة الأفلام' },
  { id: '3d_animation', category: 'arts', emoji: '🧊', labelEn: '3D Art & Animation', labelAr: 'التصميم ثلاثي الأبعاد والتحريك' },
  { id: 'digital_art', category: 'arts', emoji: '🖌️', labelEn: 'Digital Illustration', labelAr: 'الرسم الرقمي' },
  { id: 'sculpture', category: 'arts', emoji: '🗿', labelEn: 'Sculpture & Pottery', labelAr: 'النحت وفنون الخزف' },
  { id: 'interior_design', category: 'arts', emoji: '🛋️', labelEn: 'Interior Decoration', labelAr: 'الديكور والتصميم الداخلي' },

  // 🎵 Music & Singing (8)
  { id: 'piano_keyboard', category: 'music', emoji: '🎹', labelEn: 'Piano & Keyboard', labelAr: 'عزف البيانو والأورج' },
  { id: 'guitar', category: 'music', emoji: '🎸', labelEn: 'Acoustic & Electric Guitar', labelAr: 'عزف الجيتار' },
  { id: 'violin', category: 'music', emoji: '🎻', labelEn: 'Violin & Strings', labelAr: 'عزف الكمان والوتريات' },
  { id: 'oud_oriental', category: 'music', emoji: '🪕', labelEn: 'Oud & Oriental Music', labelAr: 'عزف العود والآلات الشرقية' },
  { id: 'cymbals_percussion', category: 'music', emoji: '🥁', labelEn: 'Cymbals, Triangle & Drums', labelAr: 'الدف والتريانتو والإيقاع' },
  { id: 'solo_singing', category: 'music', emoji: '🎙️', labelEn: 'Vocal Singing', labelAr: 'الغناء الفردي وتدريب الصوت' },
  { id: 'music_production', category: 'music', emoji: '🎧', labelEn: 'Audio Engineering & Mixing', labelAr: 'الهندسة الصوتية والتوزيع' },
  { id: 'flute_nay', category: 'music', emoji: '🪈', labelEn: 'Flute & Wind Instruments', labelAr: 'عزف الفلوت والناي' },

  // ⚽ Sports & Fitness (12)
  { id: 'football', category: 'sports', emoji: '⚽', labelEn: 'Football (Soccer)', labelAr: 'كرة القدم' },
  { id: 'basketball', category: 'sports', emoji: '🏀', labelEn: 'Basketball', labelAr: 'كرة السلة' },
  { id: 'volleyball', category: 'sports', emoji: '🏐', labelEn: 'Volleyball', labelAr: 'كرة الطائرة' },
  { id: 'table_tennis', category: 'sports', emoji: '🏓', labelEn: 'Table Tennis (Ping Pong)', labelAr: 'تنس الطاولة (بينج بونج)' },
  { id: 'tennis_padel', category: 'sports', emoji: '🎾', labelEn: 'Tennis & Padel', labelAr: 'التنس الأرضي والبادل' },
  { id: 'swimming_diving', category: 'sports', emoji: '🏊', labelEn: 'Swimming & Water Sports', labelAr: 'السباحة والرياضات المائية' },
  { id: 'running_marathon', category: 'sports', emoji: '🏃', labelEn: 'Running & Marathons', labelAr: 'الجري والماراثون' },
  { id: 'cycling', category: 'sports', emoji: '🚴', labelEn: 'Cycling & Biking', labelAr: 'ركوب الدراجات' },
  { id: 'bodybuilding_gym', category: 'sports', emoji: '🏋️', labelEn: 'Gym & Bodybuilding', labelAr: 'كمال الأجسام واللياقة بالجيم' },
  { id: 'martial_arts', category: 'sports', emoji: '🥋', labelEn: 'Martial Arts & Self Defense', labelAr: 'الفنون القتالية والدفاع عن النفس' },
  { id: 'chess', category: 'sports', emoji: '♟️', labelEn: 'Chess & Mind Games', labelAr: 'الشطرنج وألعاب الذكاء' },
  { id: 'yoga_calisthenics', category: 'sports', emoji: '🧘', labelEn: 'Yoga & Calisthenics', labelAr: 'اليوغا والتمارين السويدية' },

  // 💻 Tech & Gaming (10)
  { id: 'coding_programming', category: 'tech', emoji: '💻', labelEn: 'Coding & Software Dev', labelAr: 'البرمجة وتطوير البرمجيات' },
  { id: 'ai_machine_learning', category: 'tech', emoji: '🤖', labelEn: 'AI & Data Science', labelAr: 'الذكاء الاصطناعي وعلوم البيانات' },
  { id: 'cybersecurity', category: 'tech', emoji: '🔒', labelEn: 'Cybersecurity & Ethical Hacking', labelAr: 'الأمن السيبراني وحماية البيانات' },
  { id: 'robotics_hardware', category: 'tech', emoji: '🦾', labelEn: 'Robotics & Arduino/IoT', labelAr: 'الروبوتات وإنترنت الأشياء' },
  { id: 'gaming_esports', category: 'tech', emoji: '🎮', labelEn: 'Video Games & Esports', labelAr: 'ألعاب الفيديو والرياضات الإلكترونية' },
  { id: 'pc_building', category: 'tech', emoji: '🖥️', labelEn: 'PC Building & Hardware', labelAr: 'تجميع الحواسيب والعتاد التقني' },
  { id: 'crypto_fintech', category: 'tech', emoji: '📈', labelEn: 'Fintech & Investments', labelAr: 'التكنولوجيا المالية والاستثمار' },
  { id: 'mobile_tech', category: 'tech', emoji: '📱', labelEn: 'Mobile Tech & Gadgets', labelAr: 'أجهزة الموبايل والتكنولوجيا الذكية' },
  { id: 'game_development', category: 'tech', emoji: '🕹️', labelEn: 'Game Development', labelAr: 'صناعة وتطوير الألعاب' },
  { id: 'open_source', category: 'tech', emoji: '🌐', labelEn: 'Open Source Projects', labelAr: 'المشاريع مفتوحة المصدر' },

  // 🍳 Cooking & Crafts (9)
  { id: 'cooking', category: 'crafts', emoji: '🍳', labelEn: 'Cooking & Gastronomy', labelAr: 'الطهي وفنون المطبخ' },
  { id: 'baking_pastry', category: 'crafts', emoji: '🧁', labelEn: 'Baking & Pastries', labelAr: 'صناعة المخبوزات والحلويات' },
  { id: 'specialty_coffee', category: 'crafts', emoji: '☕', labelEn: 'Specialty Coffee & Barista', labelAr: 'القهوة المختصة وفنون الباريستا' },
  { id: 'gardening', category: 'crafts', emoji: '🌱', labelEn: 'Gardening & Plants', labelAr: 'البستنة ورعاية النباتات المنزلية' },
  { id: 'woodworking', category: 'crafts', emoji: '🪵', labelEn: 'Woodworking & Carpentry', labelAr: 'الأعمال الخشبية والنجارة' },
  { id: 'knitting_crochet', category: 'crafts', emoji: '🧶', labelEn: 'Crochet & Sewing', labelAr: 'الكروشيه والتريكو والخياطة' },
  { id: 'diy_crafts', category: 'crafts', emoji: '✂️', labelEn: 'DIY Crafts & Handmade', labelAr: 'الأشغال اليدوية وإعادة التدوير' },
  { id: 'candle_making', category: 'crafts', emoji: '🕯️', labelEn: 'Candle & Soap Making', labelAr: 'صناعة الشموع والصابون الطبيعي' },
  { id: 'origami', category: 'crafts', emoji: '📄', labelEn: 'Origami & Paper Arts', labelAr: 'فن طي الورق (الأوريجامي)' },

  // 📚 Reading & Learning (9)
  { id: 'reading_literature', category: 'reading', emoji: '📖', labelEn: 'Reading & Literature', labelAr: 'قراءة الروايات والأدب' },
  { id: 'theology_church_history', category: 'reading', emoji: '⛪', labelEn: 'Patristics & Church History', labelAr: 'علم الآبائيات وتاريخ الكنيسة' },
  { id: 'history_archaeology', category: 'reading', emoji: '🏛️', labelEn: 'History & Archaeology', labelAr: 'التاريخ وعلم الآثار' },
  { id: 'philosophy', category: 'reading', emoji: '🧠', labelEn: 'Philosophy & Logic', labelAr: 'الفلسفة والمنطق' },
  { id: 'creative_writing', category: 'reading', emoji: '✍️', labelEn: 'Creative Writing & Poetry', labelAr: 'الكتابة الإبداعية والشعر' },
  { id: 'language_learning', category: 'reading', emoji: '🗣️', labelEn: 'Learning New Languages', labelAr: 'تعلم لغات جديدة' },
  { id: 'psychology', category: 'reading', emoji: '🧩', labelEn: 'Psychology & Counseling', labelAr: 'علم النفس والمشورة' },
  { id: 'podcasting', category: 'reading', emoji: '🎙️', labelEn: 'Podcasts & Audiobooks', labelAr: 'استماع وصناعة البودكاست' },
  { id: 'public_speaking', category: 'reading', emoji: '📢', labelEn: 'Public Speaking & Debates', labelAr: 'الخطابة وفنون الإلقاء' },

  // 🌍 Travel & Nature (7)
  { id: 'traveling', category: 'outdoors', emoji: '✈️', labelEn: 'Traveling & Exploring', labelAr: 'السفر واكتشاف أماكن جديدة' },
  { id: 'camping_hiking', category: 'outdoors', emoji: '⛺', labelEn: 'Camping & Hiking', labelAr: 'التخييم والمشي الجبلي (هايكنج)' },
  { id: 'road_trips', category: 'outdoors', emoji: '🚗', labelEn: 'Road Trips & Adventures', labelAr: 'الرحلات البرية والمغامرات' },
  { id: 'monastery_trips', category: 'outdoors', emoji: '⛪', labelEn: 'Monastery Retreats', labelAr: 'الخلوات وزيارة الأديرة' },
  { id: 'stargazing_astronomy', category: 'outdoors', emoji: '🔭', labelEn: 'Astronomy & Stargazing', labelAr: 'علم الفلك ورصد النجوم' },
  { id: 'birdwatching_nature', category: 'outdoors', emoji: '🦜', labelEn: 'Wildlife & Nature Watching', labelAr: 'مراقبة الطيور والحياة البرية' },
  { id: 'scuba_diving', category: 'outdoors', emoji: '🤿', labelEn: 'Scuba Diving & Snorkeling', labelAr: 'الغوص واستكشاف الشعاب المرجانية' },

  // 🤝 Community & Volunteer (6)
  { id: 'charity_volunteering', category: 'social', emoji: '🤝', labelEn: 'Charity & Social Work', labelAr: 'العمل الخيري والخدمة المجتمعية' },
  { id: 'teaching_tutoring', category: 'social', emoji: '🧑‍🏫', labelEn: 'Teaching & Mentoring', labelAr: 'التدريس والتعليم التطوعي' },
  { id: 'first_aid_medical', category: 'social', emoji: '🩺', labelEn: 'First Aid & Medical Outreach', labelAr: 'الإسعافات الأولية والقوافل الطبية' },
  { id: 'event_organization', category: 'social', emoji: '🎉', labelEn: 'Event & Conference Planning', labelAr: 'تنظيم الفعاليات والمؤتمرات' },
  { id: 'animal_care', category: 'social', emoji: '🐾', labelEn: 'Animal Welfare & Rescue', labelAr: 'الرفق بالحيوان وإنقاذ الحيوانات' },
  { id: 'environmental_action', category: 'social', emoji: '♻️', labelEn: 'Environmental Conservation', labelAr: 'حماية البيئة ومبادرات التشجير' },
];
