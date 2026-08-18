/**
 * Comprehensive Multi-Language Error Messages System
 * Provides localized error strings for all validation, authentication, media, and form errors
 * across all supported application languages.
 */

export type ErrorCode =
  // Name Validation
  | 'NAME_REQUIRED'
  | 'NAME_EN_MIN_WORDS'
  | 'NAME_EN_EXACT_WORDS'
  | 'NAME_AR_MIN_WORDS'
  | 'NAME_AR_EXACT_WORDS'
  | 'NAME_EN_INVALID_CHARS'
  | 'NAME_AR_INVALID_CHARS'
  | 'NAME_COLLISION_EN'
  | 'NAME_COLLISION_AR'
  // National ID
  | 'NATIONAL_ID_REQUIRED'
  | 'NATIONAL_ID_INVALID_14_DIGITS'
  | 'NATIONAL_ID_INVALID_CENTURY'
  | 'NATIONAL_ID_INVALID_DATE'
  | 'NATIONAL_ID_INVALID_GOVERNORATE'
  | 'NATIONAL_ID_COLLISION'
  // Date of Birth
  | 'DOB_REQUIRED'
  | 'DOB_INVALID'
  | 'DOB_FUTURE_DATE'
  | 'DOB_OVER_MAX_AGE'
  // Phone & Email
  | 'PHONE_REQUIRED'
  | 'PHONE_INVALID_EGYPT'
  | 'PHONE_INVALID_GLOBAL'
  | 'EMAIL_INVALID'
  | 'LANDLINE_INVALID'
  // Password
  | 'PASSWORD_REQUIRED'
  | 'PASSWORD_TOO_SHORT'
  | 'PASSWORD_WEAK'
  | 'PASSWORD_MISMATCH'
  // Media / Camera
  | 'CAMERA_INSECURE_CONTEXT'
  | 'CAMERA_ACCESS_DENIED'
  | 'CAMERA_NOT_FOUND'
  | 'AVATAR_REQUIRED'
  | 'AVATAR_TOO_LARGE'
  | 'AVATAR_INVALID_FORMAT'
  // Relations / Address / Church
  | 'GUARDIAN_NAME_REQUIRED'
  | 'GUARDIAN_PHONE_REQUIRED'
  | 'STREET_ADDRESS_REQUIRED'
  | 'CITY_REQUIRED'
  | 'PRIMARY_CHURCH_REQUIRED'
  // General & Network
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface LocalizedErrorRecord {
  en: string;
  ar: string;
  fr?: string;
  de?: string;
  es?: string;
  it?: string;
  el?: string;
  ru?: string;
}

export const ERROR_MESSAGES: Record<ErrorCode, LocalizedErrorRecord> = {
  // Name Validation
  NAME_REQUIRED: {
    en: 'Please enter your name.',
    ar: 'يرجى إدخال الاسم.',
    fr: 'Veuillez saisir votre nom.',
    de: 'Bitte geben Sie Ihren Namen ein.',
    es: 'Por favor, introduzca su nombre.',
    it: 'Si prega di inserire il proprio nome.',
    el: 'Παρακαλώ εισάγετε το όνομά σας.',
    ru: 'Пожалуйста, введите ваше имя.',
  },
  NAME_EN_MIN_WORDS: {
    en: 'Please enter at least 4 names in English.',
    ar: 'يرجى إدخال 4 أسماء على الأقل باللغة الإنجليزية.',
    fr: 'Veuillez saisir au moins 4 noms en anglais.',
    de: 'Bitte geben Sie mindestens 4 Namen auf Englisch ein.',
    es: 'Por favor, introduzca al menos 4 nombres en inglés.',
    it: 'Inserisci almeno 4 nomi in inglese.',
    el: 'Εισαγάγετε τουλάχιστον 4 ονόματα στα αγγλικά.',
    ru: 'Пожалуйста, введите как минимум 4 имени на английском языке.',
  },
  NAME_EN_EXACT_WORDS: {
    en: 'Please enter exactly 4 names in English (First, Father, Grandfather, Family).',
    ar: 'يرجى إدخال 4 أسماء باللغة الإنجليزية (الاسم، اسم الأب، اسم الجد، اسم العائلة).',
    fr: 'Veuillez saisir 4 noms en anglais (Prénom, Père, Grand-père, Famille).',
    de: 'Bitte geben Sie 4 Namen auf Englisch ein (Vorname, Vater, Großvater, Familie).',
    es: 'Por favor ingrese 4 nombres en inglés (Nombre, Padre, Abuelo, Apellido).',
    it: 'Inserisci 4 nomi in inglese (Nome, Padre, Nonno, Famiglia).',
    el: 'Εισαγάγετε 4 ονόματα στα αγγλικά (Όνομα, Πατέρας, Παππούς, Οικογένεια).',
    ru: 'Пожалуйста, введите 4 имени на английском (Имя, Отчество, Имя деда, Фамилия).',
  },
  NAME_AR_MIN_WORDS: {
    en: 'Please enter at least 4 names in Arabic.',
    ar: 'يرجى إدخال 4 أسماء على الأقل باللغة العربية.',
    fr: 'Veuillez saisir au moins 4 noms en arabe.',
    de: 'Bitte geben Sie mindestens 4 Namen auf Arabisch ein.',
    es: 'Por favor ingrese al menos 4 nombres en árabe.',
    it: 'Inserisci almeno 4 nomi in arabo.',
    el: 'Εισαγάγετε τουλάχιστον 4 ονόματα στα αραβικά.',
    ru: 'Пожалуйста, введите как минимум 4 имени на арабском языке.',
  },
  NAME_AR_EXACT_WORDS: {
    en: 'Please enter exactly 4 names in Arabic.',
    ar: 'يرجى إدخال 4 أسماء باللغة العربية (الاسم، اسم الأب، اسم الجد، اللقب).',
    fr: 'Veuillez saisir 4 noms en arabe.',
    de: 'Bitte geben Sie 4 Namen auf Arabisch ein.',
    es: 'Por favor ingrese 4 nombres en árabe.',
    it: 'Inserisci 4 nomi in arabo.',
    el: 'Εισαγάγετε 4 ονόματα στα αραβικά.',
    ru: 'Пожалуйста, введите 4 имени на арабском языке.',
  },
  NAME_EN_INVALID_CHARS: {
    en: 'Only English letters (A-Z) and spaces are allowed.',
    ar: 'مسموح فقط بالحروف الإنجليزية (A-Z) والمسافات.',
    fr: 'Seules les lettres anglaises (A-Z) et les espaces sont autorisés.',
    de: 'Nur englische Buchstaben (A-Z) und Leerzeichen sind erlaubt.',
    es: 'Solo se permiten letras en inglés (A-Z) y espacios.',
    it: 'Sono consentite solo lettere inglesi (A-Z) e spazi.',
    el: 'Επιτρέπονται μόνο αγγλικά γράμματα (A-Z) και διαστήματα.',
    ru: 'Разрешены только буквы английского алфавита (A-Z) и пробелы.',
  },
  NAME_AR_INVALID_CHARS: {
    en: 'Only Arabic letters and spaces are allowed.',
    ar: 'مسموح فقط بالحروف العربية والمسافات.',
    fr: 'Seules les lettres arabes et les espaces sont autorisés.',
    de: 'Nur arabische Buchstaben und Leerzeichen sind erlaubt.',
    es: 'Solo se permiten letras árabes y espacios.',
    it: 'Sono consentite solo lettere arabe e spazi.',
    el: 'Επιτρέπονται μόνο αραβικά γράμματα και διαστήματα.',
    ru: 'Разрешены только арабские буквы и пробелы.',
  },
  NAME_COLLISION_EN: {
    en: 'This 4-part English name is already registered. Please add a 5th name (e.g. Clan or Surname).',
    ar: 'هذا الاسم الرباعي بالإنجليزية مسجل بالفعل. يرجى إضافة اسم خامس (اسم العائلة أو اللقب).',
    fr: 'Ce nom en 4 parties est déjà enregistré. Veuillez ajouter un 5ème nom.',
    de: 'Dieser 4-teilige Name ist bereits registriert. Bitte fügen Sie einen 5. Namen hinzu.',
    es: 'Este nombre cuádruple ya está registrado. Añada un 5º nombre.',
    it: 'Questo nome è già registrato. Aggiungi un quinto nome.',
    el: 'Αυτό το όνομα είναι ήδη καταχωρημένο. Προσθέστε ένα 5ο όνομα.',
    ru: 'Это 4-составное имя уже зарегистрировано. Пожалуйста, добавьте 5-е имя.',
  },
  NAME_COLLISION_AR: {
    en: 'This 4-part Arabic name is already registered. Please add a 5th name.',
    ar: 'هذا الاسم الرباعي بالعربية مسجل بالفعل. يرجى إضافة اسم خامس (اللقب أو اسم العائلة).',
    fr: 'Ce nom en 4 parties en arabe est déjà enregistré. Veuillez ajouter un 5ème nom.',
    de: 'Dieser 4-teilige arabische Name ist bereits registriert. Bitte fügen Sie einen 5. Namen hinzu.',
    es: 'Este nombre en árabe ya está registrado. Añada un 5º nombre.',
    it: 'Questo nome in arabo è già registrato. Aggiungi un quinto nome.',
    el: 'Αυτό το αραβικό όνομα είναι ήδη καταχωρημένο. Προσθέστε ένα 5ο όνομα.',
    ru: 'Это 4-составное имя на арабском уже зарегистрировано. Добавьте 5-е имя.',
  },

  // National ID
  NATIONAL_ID_REQUIRED: {
    en: 'Please enter your 14-digit National ID.',
    ar: 'يرجى إدخال الرقم القومي المكون من 14 رقماً.',
    fr: 'Veuillez saisir votre identifiant national à 14 chiffres.',
    de: 'Bitte geben Sie Ihre 14-stellige nationale Identifikationsnummer ein.',
    es: 'Por favor ingrese su identificación nacional de 14 dígitos.',
    it: 'Inserisci il tuo documento di identità nazionale a 14 cifre.',
    el: 'Εισαγάγετε τον 14ψήφιο εθνικό αριθμό ταυτότητας.',
    ru: 'Пожалуйста, введите ваш 14-значный национальный идентификационный номер.',
  },
  NATIONAL_ID_INVALID_14_DIGITS: {
    en: 'National ID must be exactly 14 numerical digits.',
    ar: 'يجب أن يتكون الرقم القومي من 14 رقماً بالتمام.',
    fr: 'Le numéro national doit comporter exactement 14 chiffres.',
    de: 'Die nationale ID muss genau 14 Ziffern lang sein.',
    es: 'La identificación nacional debe tener exactamente 14 dígitos.',
    it: "L'identificativo nazionale deve essere composto da 14 cifre esatte.",
    el: 'Ο εθνικός αριθμός πρέπει να είναι ακριβώς 14 ψηφία.',
    ru: 'Национальный идентификационный номер должен состоять ровно из 14 цифр.',
  },
  NATIONAL_ID_INVALID_CENTURY: {
    en: 'Invalid century digit in National ID (must start with 2 or 3).',
    ar: 'رقم القرن غير صحيح بالرقم القومي (يجب أن يبدأ بـ 2 أو 3).',
    fr: 'Chiffre du siècle invalide dans le numéro national (doit commencer par 2 ou 3).',
    de: 'Ungültige Jahrhundert-Ziffer (muss mit 2 oder 3 beginnen).',
    es: 'Dígito de siglo no válido (debe comenzar con 2 o 3).',
    it: 'Cifra del secolo non valida (deve iniziare con 2 o 3).',
    el: 'Μη έγκυρο ψηφίο αιώνα (πρέπει να ξεκινά με 2 ή 3).',
    ru: 'Неверная цифра века (должна начинаться с 2 или 3).',
  },
  NATIONAL_ID_INVALID_DATE: {
    en: 'The birth date encoded in the National ID is invalid.',
    ar: 'تاريخ الميلاد المتضمن في الرقم القومي غير صحيح.',
    fr: 'La date de naissance encodée dans le numéro national est invalide.',
    de: 'Das in der nationalen ID codierte Geburtsdatum ist ungültig.',
    es: 'La fecha de nacimiento codificada en la identificación no es válida.',
    it: 'La data di nascita codificata non è valida.',
    el: 'Η ημερομηνία γέννησης δεν είναι έγκυρη.',
    ru: 'Дата рождения в номере недействительна.',
  },
  NATIONAL_ID_INVALID_GOVERNORATE: {
    en: 'The governorate code in the National ID is invalid.',
    ar: 'كود المحافظة في الرقم القومي غير صحيح.',
    fr: 'Le code de gouvernorat dans le numéro national est invalide.',
    de: 'Der Gouvernements-Code in der nationalen ID ist ungültig.',
    es: 'El código de gobernación no es válido.',
    it: 'Il codice del governatorato non è valido.',
    el: 'Ο κωδικός κυβερνείου δεν είναι έγκυρος.',
    ru: 'Код провинции/губернаторства неверен.',
  },
  NATIONAL_ID_COLLISION: {
    en: 'This National ID is already registered to another account.',
    ar: 'الرقم القومي مسجل بالفعل لحساب آخر.',
    fr: 'Ce numéro national est déjà enregistré pour un autre compte.',
    de: 'Diese nationale ID ist bereits für ein anderes Konto registriert.',
    es: 'Esta identificación nacional ya está registrada en otra cuenta.',
    it: 'Questo documento è già registrato su un altro account.',
    el: 'Αυτός ο εθνικός αριθμός είναι ήδη καταχωρημένος.',
    ru: 'Этот национальный номер уже зарегистрирован на другую учетную запись.',
  },

  // Date of Birth
  DOB_REQUIRED: {
    en: 'Please enter your date of birth.',
    ar: 'يرجى إدخال تاريخ الميلاد.',
    fr: 'Veuillez saisir votre date de naissance.',
    de: 'Bitte geben Sie Ihr Geburtsdatum ein.',
    es: 'Por favor ingrese su fecha de nacimiento.',
    it: 'Inserisci la tua data di nascita.',
    el: 'Εισαγάγετε την ημερομηνία γέννησής σας.',
    ru: 'Пожалуйста, введите дату рождения.',
  },
  DOB_INVALID: {
    en: 'Invalid calendar date format (YYYY-MM-DD).',
    ar: 'تاريخ غير صحيح (السنة-الشهر-اليوم).',
    fr: 'Format de date invalide (AAAA-MM-JJ).',
    de: 'Ungültiges Datumsformat (JJJJ-MM-TT).',
    es: 'Formato de fecha no válido (AAAA-MM-DD).',
    it: 'Formato data non valido (AAAA-MM-GG).',
    el: 'Μη έγκυρη μορφή ημερομηνίας (ΕΕΕΕ-ΜΜ-ΗΗ).',
    ru: 'Неверный формат даты (ГГГГ-ММ-ДД).',
  },
  DOB_FUTURE_DATE: {
    en: 'Date of birth cannot be in the future.',
    ar: 'لا يمكن أن يكون تاريخ الميلاد في المستقبل.',
    fr: 'La date de naissance ne peut pas être dans le futur.',
    de: 'Das Geburtsdatum darf nicht in der Zukunft liegen.',
    es: 'La fecha de nacimiento no puede ser en el futuro.',
    it: 'La data di nascita non può essere nel futuro.',
    el: 'Η ημερομηνία γέννησης δεν μπορεί να είναι στο μέλλον.',
    ru: 'Дата рождения не может быть в будущем.',
  },
  DOB_OVER_MAX_AGE: {
    en: 'Date of birth cannot exceed 120 years in the past.',
    ar: 'لا يمكن أن يتجاوز العمر 120 عاماً في الماضي.',
    fr: 'La date de naissance ne peut pas dépasser 120 ans dans le passé.',
    de: 'Das Geburtsdatum darf nicht mehr als 120 Jahre zurückliegen.',
    es: 'La fecha de nacimiento no puede tener más de 120 años.',
    it: 'La data di nascita non può superare i 120 anni nel passato.',
    el: 'Η ημερομηνία γέννησης δεν μπορεί να υπερβαίνει τα 120 έτη.',
    ru: 'Дата рождения не может превышать 120 лет назад.',
  },

  // Phone & Email
  PHONE_REQUIRED: {
    en: 'Please enter your mobile phone number.',
    ar: 'يرجى إدخال رقم الهاتف المحمول.',
    fr: 'Veuillez saisir votre numéro de téléphone mobile.',
    de: 'Bitte geben Sie Ihre Mobiltelefonnummer ein.',
    es: 'Por favor ingrese su número de teléfono móvil.',
    it: 'Inserisci il tuo numero di cellulare.',
    el: 'Εισαγάγετε τον αριθμό του κινητού σας τηλεφώνου.',
    ru: 'Пожалуйста, введите номер мобильного телефона.',
  },
  PHONE_INVALID_EGYPT: {
    en: 'Please enter a valid Egyptian mobile number (11 digits starting with 010, 011, 012, or 015).',
    ar: 'يرجى إدخال رقم محمول مصري صحيح (11 رقماً يبدأ بـ 010، 011، 012، أو 015).',
    fr: 'Veuillez saisir un numéro égyptien valide (11 chiffres commençant par 010, 011, 012 ou 015).',
    de: 'Bitte geben Sie eine gültige ägyptische Handynummer ein (11 Ziffern beginnend mit 010, 011, 012 oder 015).',
    es: 'Ingrese un número móvil egipcio válido (11 dígitos que comiencen con 010, 011, 012 o 015).',
    it: 'Inserisci un numero di cellulare egiziano valido (11 cifre che iniziano con 010, 011, 012 o 015).',
    el: 'Εισαγάγετε έναν έγκυρο αιγυπτιακό αριθμό (11 ψηφία που ξεκινούν με 010, 011, 012 ή 015).',
    ru: 'Пожалуйста, введите действующий номер Египта (11 цифр, начинающихся с 010, 011, 012 или 015).',
  },
  PHONE_INVALID_GLOBAL: {
    en: 'Please enter a valid phone number (7 to 15 digits).',
    ar: 'يرجى إدخال رقم هاتف صحيح (من 7 إلى 15 رقماً).',
    fr: 'Veuillez saisir un numéro de téléphone valide (7 à 15 chiffres).',
    de: 'Bitte geben Sie eine gültige Telefonnummer ein (7 bis 15 Ziffern).',
    es: 'Por favor ingrese un número de teléfono válido (7 a 15 dígitos).',
    it: 'Inserisci un numero di telefono valido (da 7 a 15 cifre).',
    el: 'Εισαγάγετε έναν έγκυρο αριθμό τηλεφώνου (7 έως 15 ψηφία).',
    ru: 'Пожалуйста, введите корректный номер телефона (от 7 до 15 цифр).',
  },
  EMAIL_INVALID: {
    en: 'Please enter a valid email address.',
    ar: 'يرجى إدخال بريد إلكتروني صحيح.',
    fr: 'Veuillez saisir une adresse e-mail valide.',
    de: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    es: 'Por favor ingrese una dirección de correo electrónico válida.',
    it: 'Inserisci un indirizzo email valido.',
    el: 'Εισαγάγετε μια έγκυρη διεύθυνση ηλεκτρονικού ταχυδρομείου.',
    ru: 'Пожалуйста, введите действующий адрес электронной почты.',
  },
  LANDLINE_INVALID: {
    en: 'Please enter a valid landline number.',
    ar: 'يرجى إدخال رقم أرضي صحيح.',
    fr: 'Veuillez saisir un numéro de téléphone fixe valide.',
    de: 'Bitte geben Sie eine gültige Festnetznummer ein.',
    es: 'Por favor ingrese un número de teléfono fijo válido.',
    it: 'Inserisci un numero di rete fissa valido.',
    el: 'Εισαγάγετε έναν έγκυρο αριθμό σταθερού τηλεφώνου.',
    ru: 'Пожалуйста, введите действующий городской номер телефона.',
  },

  // Password
  PASSWORD_REQUIRED: {
    en: 'Password is required.',
    ar: 'كلمة المرور مطلوبة.',
    fr: 'Le mot de passe est requis.',
    de: 'Passwort ist erforderlich.',
    es: 'Se requiere contraseña.',
    it: 'La password è obbligatoria.',
    el: 'Απαιτείται κωδικός πρόσβασης.',
    ru: 'Требуется пароль.',
  },
  PASSWORD_TOO_SHORT: {
    en: 'Password must be at least 8 characters long.',
    ar: 'يجب أن لا تقل كلمة المرور عن 8 أحرف.',
    fr: 'Le mot de passe doit comporter au moins 8 caractères.',
    de: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
    es: 'La contraseña debe tener al menos 8 caracteres.',
    it: 'La password deve contenere almeno 8 caratteri.',
    el: 'Ο κωδικός πρόσβασης πρέπει να έχει μήκος τουλάχιστον 8 χαρακτήρες.',
    ru: 'Пароль должен содержать не менее 8 символов.',
  },
  PASSWORD_WEAK: {
    en: 'Password must include uppercase, lowercase, numbers, and symbols.',
    ar: 'يجب أن تحتوي كلمة المرور على أحرف كبيرة وصغيرة وأرقام ورموز.',
    fr: 'Le mot de passe doit contenir des majuscules, minuscules, chiffres et symboles.',
    de: 'Das Passwort muss Groß-, Kleinbuchstaben, Zahlen und Sonderzeichen enthalten.',
    es: 'La contraseña debe incluir mayúsculas, minúsculas, números y símbolos.',
    it: 'La password deve includere lettere maiuscole, minuscole, numeri e simboli.',
    el: 'Ο κωδικός πρέπει να περιλαμβάνει πεζά, κεφαλαία, αριθμούς και σύμβολα.',
    ru: 'Пароль должен содержать прописные и строчные буквы, цифры и спецсимволы.',
  },
  PASSWORD_MISMATCH: {
    en: 'Passwords do not match.',
    ar: 'كلمتا المرور غير متطابقتين.',
    fr: 'Les mots de passe ne correspondent pas.',
    de: 'Passwörter stimmen nicht überein.',
    es: 'Las contraseñas no coinciden.',
    it: 'Le password non corrispondono.',
    el: 'Οι κωδικοί πρόσβασης δεν ταιριάζουν.',
    ru: 'Пароли не совпадают.',
  },

  // Media / Camera
  CAMERA_INSECURE_CONTEXT: {
    en: 'Live camera is unavailable on insecure HTTP connections (requires HTTPS or localhost). Please use file upload.',
    ar: 'المتصفح لا يتيح الكاميرا عبر هذا الاتصال (يلزم اتصال HTTPS آمن أو localhost)، يرجى استخدام خيار رفع ملف.',
    fr: 'La caméra nécessite une connexion sécurisée (HTTPS). Veuillez utiliser le téléchargement de fichier.',
    de: 'Für den Kamerazugriff ist HTTPS erforderlich. Bitte Datei-Upload nutzen.',
    es: 'El acceso a la cámara requiere HTTPS. Utilice la carga de archivos.',
    it: 'La fotocamera richiede una connessione sicura (HTTPS). Utilizza il caricamento file.',
    el: 'Η πρόσβαση στην κάμερα απαιτεί HTTPS. Χρησιμοποιήστε τη μεταφόρτωση αρχείου.',
    ru: 'Для доступа к камере требуется HTTPS или localhost. Пожалуйста, используйте загрузку файла.',
  },
  CAMERA_ACCESS_DENIED: {
    en: 'Camera access denied. Please grant camera permission in your browser.',
    ar: 'تم رفض الوصول للكاميرا. يرجى منح الإذن من إعدادات المتصفح.',
    fr: "Accès à la caméra refusé. Veuillez accorder l'autorisation.",
    de: 'Kamerazugriff verweigert. Bitte Berechtigung im Browser erteilen.',
    es: 'Acceso a la cámara denegado. Conceda permiso.',
    it: 'Accesso alla telecamera negato. Concedi le autorizzazioni.',
    el: 'Δεν επιτρέπεται η πρόσβαση στην κάμερα. Παραχωρήστε άδεια.',
    ru: 'Доступ к камере запрещен. Предоставьте разрешение в браузере.',
  },
  CAMERA_NOT_FOUND: {
    en: 'No camera device found on this system.',
    ar: 'لم يتم العثور على كاميرا في هذا الجهاز.',
    fr: 'Aucun appareil photo trouvé sur ce système.',
    de: 'Keine Kamera auf diesem System gefunden.',
    es: 'No se encontró ninguna cámara en este sistema.',
    it: 'Nessuna fotocamera trovata su questo sistema.',
    el: 'Δεν βρέθηκε κάμερα σε αυτό το σύστημα.',
    ru: 'Устройство камеры не обнаружено.',
  },
  AVATAR_REQUIRED: {
    en: 'Please select a profile photo or click Skip.',
    ar: 'يرجى اختيار صورة شخصية أو الضغط على "تخطي مؤقتاً".',
    fr: 'Veuillez sélectionner une photo de profil ou cliquer sur Ignorer.',
    de: 'Bitte wählen Sie ein Profilfoto oder klicken Sie auf Überspringen.',
    es: 'Seleccione una foto de perfil o haga clic en Omitir.',
    it: 'Seleziona una foto del profilo o fai clic su Salta.',
    el: 'Επιλέξτε μια φωτογραφία προφίλ ή κάντε κλικ στο Παράλειψη.',
    ru: 'Пожалуйста, выберите фотографию профиля или нажмите «Пропустить».',
  },
  AVATAR_TOO_LARGE: {
    en: 'Image file size cannot exceed 5MB.',
    ar: 'حجم الصورة لا يمكن أن يتجاوز 5 ميجابايت.',
    fr: "La taille du fichier image ne peut pas dépasser 5 Mo.",
    de: 'Die Bilddatei darf nicht größer als 5 MB sein.',
    es: 'El tamaño de la imagen no puede superar los 5 MB.',
    it: "La dimensione dell'immagine non può superare i 5 MB.",
    el: 'Το μέγεθος της εικόνας δεν μπορεί να υπερβαίνει τα 5MB.',
    ru: 'Размер файла изображения не должен превышать 5 МБ.',
  },
  AVATAR_INVALID_FORMAT: {
    en: 'Only JPG, PNG, and WebP image formats are supported.',
    ar: 'صيغ الصور المدعومة هي JPG و PNG و WebP فقط.',
    fr: 'Seuls les formats JPG, PNG et WebP sont pris en charge.',
    de: 'Nur die Formate JPG, PNG und WebP werden unterstützt.',
    es: 'Solo se admiten los formatos JPG, PNG y WebP.',
    it: 'Sono supportati solo i formati JPG, PNG e WebP.',
    el: 'Υποστηρίζονται μόνο μορφές JPG, PNG και WebP.',
    ru: 'Поддерживаются только форматы JPG, PNG и WebP.',
  },

  // Relations & Details
  GUARDIAN_NAME_REQUIRED: {
    en: 'Guardian full name is required for minors.',
    ar: 'اسم ولي الأمر مطلوب للقُصّر.',
    fr: 'Le nom complet du tuteur est obligatoire pour les mineurs.',
    de: 'Der vollständige Name des Erziehungsberechtigten ist für Minderjährige erforderlich.',
    es: 'El nombre del tutor es obligatorio para menores.',
    it: 'Il nome del tutore è obbligatorio per i minori.',
    el: 'Το όνομα του κηδεμόνα είναι απαραίτητο για ανηλίκους.',
    ru: 'Имя опекуна обязательно для несовершеннолетних.',
  },
  GUARDIAN_PHONE_REQUIRED: {
    en: 'Guardian phone number is required.',
    ar: 'رقم هاتف ولي الأمر مطلوب.',
    fr: 'Le numéro de téléphone du tuteur est obligatoire.',
    de: 'Die Telefonnummer des Erziehungsberechtigten ist erforderlich.',
    es: 'El teléfono del tutor es obligatorio.',
    it: 'Il numero di telefono del tutore è obbligatorio.',
    el: 'Το τηλέφωνο του κηδεμόνα είναι απαραίτητο.',
    ru: 'Номер телефона опекуна обязателен.',
  },
  STREET_ADDRESS_REQUIRED: {
    en: 'Street address is required.',
    ar: 'عنوان الشارع مطلوب.',
    fr: 'La rue est requise.',
    de: 'Straßenadresse ist erforderlich.',
    es: 'La dirección de la calle es obligatoria.',
    it: "L'indirizzo è obbligatorio.",
    el: 'Η διεύθυνση οδού είναι υποχρεωτική.',
    ru: 'Адрес улицы обязателен.',
  },
  CITY_REQUIRED: {
    en: 'City is required.',
    ar: 'اسم المدينة أو المركز مطلوب.',
    fr: 'La ville est requise.',
    de: 'Stadt ist erforderlich.',
    es: 'La ciudad es obligatoria.',
    it: 'La città è obbligatoria.',
    el: 'Η πόλη είναι υποχρεωτική.',
    ru: 'Город обязателен.',
  },
  PRIMARY_CHURCH_REQUIRED: {
    en: 'Primary church name is required.',
    ar: 'اسم الكنيسة الأساسية مطلوب.',
    fr: "Le nom de l'église principale est obligatoire.",
    de: 'Name der Hauptkirche ist erforderlich.',
    es: 'El nombre de la iglesia principal es obligatorio.',
    it: 'Il nome della chiesa principale è obbligatorio.',
    el: 'Το όνομα της κύριας εκκλησίας είναι υποχρεωτικό.',
    ru: 'Название основной церкви обязательно.',
  },

  // Server & Network
  SERVER_ERROR: {
    en: 'A server error occurred. Please try again.',
    ar: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى.',
    fr: 'Une erreur de serveur est survenue. Veuillez réessayer.',
    de: 'Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es erneut.',
    es: 'Se produjo un error en el servidor. Inténtalo de nuevo.',
    it: 'Si è verificato un errore del server. Riprova.',
    el: 'Παρουσιάστηκε σφάλμα διακομιστή. Δοκιμάστε ξανά.',
    ru: 'Произошла ошибка сервера. Пожалуйста, повторите попытку.',
  },
  NETWORK_ERROR: {
    en: 'Network connection error. Please check your internet connection.',
    ar: 'خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.',
    fr: 'Erreur de connexion réseau. Veuillez vérifier votre connexion.',
    de: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
    es: 'Error de red. Por favor, compruebe su conexión.',
    it: 'Errore di connessione di rete. Controlla la tua connessione.',
    el: 'Σφάλμα σύνδεσης δικτύου. Ελέγξτε τη σύνδεσή σας.',
    ru: 'Ошибка сетевого соединения. Пожалуйста, проверьте подключение к Интернету.',
  },
  UNKNOWN_ERROR: {
    en: 'An unexpected error occurred. Please try again.',
    ar: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
    fr: 'Une erreur inattendue est survenue. Veuillez réessayer.',
    de: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
    es: 'Se produjo un error inesperado. Inténtalo de nuevo.',
    it: 'Si è verificato un errore imprevisto. Riprova.',
    el: 'Παρουσιάστηκε μη αναμενόμενο σφάλμα. Δοκιμάστε ξανά.',
    ru: 'Произошла непредвиденная ошибка. Пожалуйста, попробуйте еще раз.',
  },
};

/**
 * Returns the localized error message for a given error code and locale.
 */
export function getErrorMessage(code: ErrorCode, locale: string = 'en'): string {
  const record = ERROR_MESSAGES[code];
  if (!record) return ERROR_MESSAGES.UNKNOWN_ERROR.en;

  const langCode = locale.split('-')[0].toLowerCase();
  if (langCode === 'ar') return record.ar;
  if (langCode === 'fr' && record.fr) return record.fr;
  if (langCode === 'de' && record.de) return record.de;
  if (langCode === 'es' && record.es) return record.es;
  if (langCode === 'it' && record.it) return record.it;
  if (langCode === 'el' && record.el) return record.el;
  if (langCode === 'ru' && record.ru) return record.ru;

  return record.en || record.ar;
}
