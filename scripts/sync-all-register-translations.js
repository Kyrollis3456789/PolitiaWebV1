const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '..', 'messages');
const enTemplate = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en-US', 'register.json'), 'utf8'));
const arTemplate = JSON.parse(fs.readFileSync(path.join(messagesDir, 'ar-EG', 'register.json'), 'utf8'));

// Language base packs
const frBase = {
  createAccountTitle: "Créer un compte Politia",
  enterNameSubtitle: "Saisissez vos coordonnées",
  milestones: {
    step_1: { title: "Informations personnelles", badge: "Étape 1 sur 7: Informations personnelles" },
    step_2: { title: "Contact & Réseaux", badge: "Étape 2 sur 7: Contact & Réseaux" },
    step_3: { title: "Relations familiales", badge: "Étape 3 sur 7: Relations familiales" },
    step_4: { title: "Éducation & Travail", badge: "Étape 4 sur 7: Éducation & Travail" },
    step_5: { title: "Adresses & Résidence", badge: "Étape 5 sur 7: Adresses & Résidence" },
    step_6: { title: "Engagement ecclésial", badge: "Étape 6 sur 7: Engagement ecclésial" },
    step_7: { title: "Informations complémentaires", badge: "Étape 7 sur 7: Informations complémentaires" }
  },
  fields: {
    fullNameEn: {
      label: "Nom complet (en anglais)",
      errorRequired: "Veuillez saisir votre nom complet",
      errorFourPart: "Veuillez saisir votre nom complet en 4 parties en anglais (Prénom, Père, Grand-père, Nom)",
      errorLatinOnly: "Veuillez utiliser uniquement des lettres anglaises/latines"
    },
    fullNameAr: {
      label: "Nom complet (en arabe)",
      errorRequired: "Veuillez saisir votre nom en arabe",
      errorFourPart: "Veuillez saisir votre nom complet en 4 parties en arabe",
      errorArabicOnly: "Veuillez utiliser uniquement des caractères arabes"
    },
    gender: { label: "Genre", male: "Homme", female: "Femme" },
    dob: { label: "Date de naissance", ageText: "Âge: {age} ans" },
    nationalId: {
      label: "Numéro national d'identité (14 chiffres)",
      governoratePrefix: "📍 Gouvernorat: ",
      errorInvalid: "Veuillez saisir un numéro national valide à 14 chiffres",
      errorDobMismatch: "La date de naissance du numéro national ne correspond pas à la date saisie",
      errorGenderMismatch: "Le genre du numéro national ne correspond pas au genre sélectionné"
    },
    avatar: {
      label: "Photo de profil",
      subtitle: "Ajoutez une photo pour personnaliser votre profil",
      upload: "Téléverser",
      takePhoto: "Prendre une photo",
      editPhoto: "Modifier la photo",
      skip: "Ignorer pour l'instant"
    },
    phone: {
      label: "Numéro de téléphone portable",
      countryCode: "+20",
      errorRequired: "Veuillez saisir votre numéro de portable",
      errorInvalid: "Veuillez saisir un numéro de portable valide (11 chiffres commençant par 010, 011, 012 ou 015)"
    },
    email: {
      label: "Adresse e-mail (facultatif)",
      errorInvalid: "Veuillez saisir une adresse e-mail valide"
    },
    landline: {
      label: "Téléphone fixe (facultatif)",
      areaCode: "Indicatif régional (ex. 02)",
      phoneNumber: "Numéro fixe (ex. 23456789)"
    },
    socials: {
      label: "Comptes de réseaux sociaux",
      facebook: "URL du profil Facebook (facultatif)",
      instagram: "URL du profil Instagram (facultatif)",
      linkedin: "URL du profil LinkedIn (facultatif)"
    },
    password: {
      label: "Mot de passe",
      confirmLabel: "Confirmer le mot de passe",
      errorLength: "Le mot de passe doit comporter au moins 8 caractères",
      errorMatch: "Les mots de passe ne correspondent pas"
    }
  },
  buttons: {
    next: "Suivant",
    back: "Retour",
    skip: "Ignorer pour l'instant",
    createAccount: "Créer un compte",
    signInInstead: "Se connecter plutôt"
  },
  footer: {
    help: "Aide",
    privacy: "Confidentialité",
    terms: "Conditions",
    searchLanguages: "Rechercher des langues...",
    noLanguagesFound: "Aucune langue trouvée"
  }
};

const deBase = {
  createAccountTitle: "Politia-Konto erstellen",
  enterNameSubtitle: "Geben Sie Ihre Daten ein",
  milestones: {
    step_1: { title: "Persönliche Daten", badge: "Schritt 1 von 7: Persönliche Daten" },
    step_2: { title: "Kontakt & Soziales", badge: "Schritt 2 von 7: Kontakt & Soziales" },
    step_3: { title: "Familie & Verwandte", badge: "Schritt 3 von 7: Familie & Verwandte" },
    step_4: { title: "Bildung & Beruf", badge: "Schritt 4 von 7: Bildung & Beruf" },
    step_5: { title: "Wohnort & Adressen", badge: "Schritt 5 von 7: Wohnort & Adressen" },
    step_6: { title: "Kirchliches Engagement", badge: "Schritt 6 von 7: Kirchliches Engagement" },
    step_7: { title: "Zusätzliche Angaben", badge: "Schritt 7 von 7: Zusätzliche Angaben" }
  },
  fields: {
    fullNameEn: {
      label: "Vollständiger Name (Englisch)",
      errorRequired: "Bitte geben Sie Ihren vollständigen Namen ein",
      errorFourPart: "Bitte geben Sie Ihren 4-teiligen Namen auf Englisch ein (Vorname, Vater, Großvater, Nachname)",
      errorLatinOnly: "Bitte nur lateinische/englische Buchstaben verwenden"
    },
    fullNameAr: {
      label: "Vollständiger Name (Arabisch)",
      errorRequired: "Bitte geben Sie Ihren arabischen Namen ein",
      errorFourPart: "Bitte geben Sie Ihren 4-teiligen Namen auf Arabisch ein",
      errorArabicOnly: "Bitte nur arabische Schriftzeichen verwenden"
    },
    gender: { label: "Geschlecht", male: "Männlich", female: "Weiblich" },
    dob: { label: "Geburtsdatum", ageText: "Alter: {age} Jahre" },
    nationalId: {
      label: "Nationale ID (14 Ziffern)",
      governoratePrefix: "📍 Gouvernement: ",
      errorInvalid: "Bitte geben Sie eine gültige 14-stellige nationale ID ein",
      errorDobMismatch: "Geburtsdatum in der ID stimmt nicht mit dem eingegebenen Geburtsdatum überein",
      errorGenderMismatch: "Geschlecht in der ID stimmt nicht mit dem ausgewählten Geschlecht überein"
    },
    avatar: {
      label: "Profilbild",
      subtitle: "Fügen Sie ein Foto hinzu, um Ihr Profil zu personalisieren",
      upload: "Hochladen",
      takePhoto: "Foto aufnehmen",
      editPhoto: "Foto bearbeiten",
      skip: "Vorerst überspringen"
    },
    phone: {
      label: "Handynummer",
      countryCode: "+20",
      errorRequired: "Bitte geben Sie Ihre Handynummer ein",
      errorInvalid: "Bitte geben Sie eine gültige Handynummer ein (11 Ziffern beginnend mit 010, 011, 012 oder 015)"
    },
    email: {
      label: "E-Mail-Adresse (Optional)",
      errorInvalid: "Bitte geben Sie eine gültige E-Mail-Adresse ein"
    },
    landline: {
      label: "Festnetz (Optional)",
      areaCode: "Vorwahl (z. B. 02)",
      phoneNumber: "Festnetznummer (z. B. 23456789)"
    },
    socials: {
      label: "Social-Media-Konten",
      facebook: "Facebook-Profil-URL (Optional)",
      instagram: "Instagram-Profil-URL (Optional)",
      linkedin: "LinkedIn-Profil-URL (Optional)"
    },
    password: {
      label: "Passwort",
      confirmLabel: "Passwort bestätigen",
      errorLength: "Das Passwort muss mindestens 8 Zeichen lang sein",
      errorMatch: "Passwörter stimmen nicht überein"
    }
  },
  buttons: {
    next: "Weiter",
    back: "Zurück",
    skip: "Vorerst überspringen",
    createAccount: "Konto erstellen",
    signInInstead: "Stattdessen anmelden"
  },
  footer: {
    help: "Hilfe",
    privacy: "Datenschutz",
    terms: "AGB",
    searchLanguages: "Sprachen suchen...",
    noLanguagesFound: "Keine Sprachen gefunden"
  }
};

const esBase = {
  createAccountTitle: "Crear una cuenta en Politia",
  enterNameSubtitle: "Ingrese sus datos",
  milestones: {
    step_1: { title: "Información personal", badge: "Paso 1 de 7: Información personal" },
    step_2: { title: "Contacto y redes", badge: "Paso 2 de 7: Contacto y redes" },
    step_3: { title: "Relaciones familiares", badge: "Paso 3 de 7: Relaciones familiares" },
    step_4: { title: "Educación y trabajo", badge: "Paso 4 de 7: Educación y trabajo" },
    step_5: { title: "Ubicaciones y residencia", badge: "Paso 5 de 7: Ubicaciones y residencia" },
    step_6: { title: "Compromiso eclesiástico", badge: "Paso 6 de 7: Compromiso eclesiástico" },
    step_7: { title: "Información adicional", badge: "Paso 7 de 7: Información adicional" }
  },
  fields: {
    fullNameEn: {
      label: "Nombre completo (en inglés)",
      errorRequired: "Por favor ingrese su nombre completo",
      errorFourPart: "Por favor ingrese su nombre de 4 partes en inglés (Nombre, Padre, Abuelo, Apellido)",
      errorLatinOnly: "Por favor use solo letras inglesas/latinas"
    },
    fullNameAr: {
      label: "Nombre completo (en árabe)",
      errorRequired: "Por favor ingrese su nombre en árabe",
      errorFourPart: "Por favor ingrese su nombre de 4 partes en árabe",
      errorArabicOnly: "Por favor use solo caracteres árabes"
    },
    gender: { label: "Género", male: "Masculino", female: "Femenino" },
    dob: { label: "Fecha de nacimiento", ageText: "Edad: {age} años" },
    nationalId: {
      label: "ID Nacional (14 dígitos)",
      governoratePrefix: "📍 Gobernación: ",
      errorInvalid: "Por favor ingrese una identificación nacional válida de 14 dígitos",
      errorDobMismatch: "La fecha de nacimiento en la ID no coincide con la ingresada",
      errorGenderMismatch: "El género en la ID no coincide con el seleccionado"
    },
    avatar: {
      label: "Foto de perfil",
      subtitle: "Agregue una foto para personalizar su perfil",
      upload: "Subir foto",
      takePhoto: "Tomar foto",
      editPhoto: "Editar foto",
      skip: "Omitir por ahora"
    },
    phone: {
      label: "Número de teléfono móvil",
      countryCode: "+20",
      errorRequired: "Por favor ingrese su número de teléfono",
      errorInvalid: "Ingrese un número válido (11 dígitos que comiencen con 010, 011, 012 o 015)"
    },
    email: {
      label: "Correo electrónico (Opcional)",
      errorInvalid: "Por favor ingrese un correo válido"
    },
    landline: {
      label: "Teléfono fijo (Opcional)",
      areaCode: "Código de área (ej. 02)",
      phoneNumber: "Número fijo (ej. 23456789)"
    },
    socials: {
      label: "Redes sociales",
      facebook: "URL de Facebook (Opcional)",
      instagram: "URL de Instagram (Opcional)",
      linkedin: "URL de LinkedIn (Opcional)"
    },
    password: {
      label: "Contraseña",
      confirmLabel: "Confirmar contraseña",
      errorLength: "La contraseña debe tener al menos 8 caracteres",
      errorMatch: "Las contraseñas no coinciden"
    }
  },
  buttons: {
    next: "Siguiente",
    back: "Atrás",
    skip: "Omitir por ahora",
    createAccount: "Crear cuenta",
    signInInstead: "Iniciar sesión en su lugar"
  },
  footer: {
    help: "Ayuda",
    privacy: "Privacidad",
    terms: "Términos",
    searchLanguages: "Buscar idiomas...",
    noLanguagesFound: "No se encontraron idiomas"
  }
};

const itBase = {
  createAccountTitle: "Crea un account Politia",
  enterNameSubtitle: "Inserisci i tuoi dati",
  milestones: {
    step_1: { title: "Dati personali", badge: "Passo 1 di 7: Dati personali" },
    step_2: { title: "Contatti e Social", badge: "Passo 2 di 7: Contatti e Social" },
    step_3: { title: "Relazioni familiari", badge: "Passo 3 di 7: Relazioni familiari" },
    step_4: { title: "Istruzione e Lavoro", badge: "Passo 4 di 7: Istruzione e Lavoro" },
    step_5: { title: "Indirizzi e Residenza", badge: "Passo 5 di 7: Indirizzi e Residenza" },
    step_6: { title: "Impegno ecclesiale", badge: "Passo 6 di 7: Impegno ecclesiale" },
    step_7: { title: "Informazioni aggiuntive", badge: "Passo 7 di 7: Informazioni aggiuntive" }
  },
  fields: {
    fullNameEn: {
      label: "Nome completo (in inglese)",
      errorRequired: "Inserisci il tuo nome completo",
      errorFourPart: "Inserisci il nome completo in 4 parti in inglese (Nome, Padre, Nonno, Cognome)",
      errorLatinOnly: "Usa solo lettere inglesi/latine"
    },
    fullNameAr: {
      label: "Nome completo (in arabo)",
      errorRequired: "Inserisci il tuo nome in arabo",
      errorFourPart: "Inserisci il nome completo in 4 parti in arabo",
      errorArabicOnly: "Usa solo caratteri arabi"
    },
    gender: { label: "Genere", male: "Maschio", female: "Femmina" },
    dob: { label: "Data di nascita", ageText: "Età: {age} anni" },
    nationalId: {
      label: "Documento d'identità (14 cifre)",
      governoratePrefix: "📍 Governatorato: ",
      errorInvalid: "Inserisci un ID nazionale valido a 14 cifre",
      errorDobMismatch: "La data di nascita nell'ID non corrisponde alla data inserita",
      errorGenderMismatch: "Il genere nell'ID non corrisponde al genere selezionato"
    },
    avatar: {
      label: "Foto del profilo",
      subtitle: "Aggiungi una foto per personalizzare il tuo profilo",
      upload: "Carica",
      takePhoto: "Scatta foto",
      editPhoto: "Modifica foto",
      skip: "Salta per ora"
    },
    phone: {
      label: "Numero di cellulare",
      countryCode: "+20",
      errorRequired: "Inserisci il tuo numero di cellulare",
      errorInvalid: "Inserisci un numero valido (11 cifre che iniziano con 010, 011, 012 o 015)"
    },
    email: {
      label: "Indirizzo e-mail (Facoltativo)",
      errorInvalid: "Inserisci un indirizzo e-mail valido"
    },
    landline: {
      label: "Telefono fisso (Facoltativo)",
      areaCode: "Prefisso (es. 02)",
      phoneNumber: "Numero fisso (es. 23456789)"
    },
    socials: {
      label: "Profili social",
      facebook: "URL Facebook (Facoltativo)",
      instagram: "URL Instagram (Facoltativo)",
      linkedin: "URL LinkedIn (Facoltativo)"
    },
    password: {
      label: "Password",
      confirmLabel: "Conferma password",
      errorLength: "La password deve contenere almeno 8 caratteri",
      errorMatch: "Le password non corrispondono"
    }
  },
  buttons: {
    next: "Avanti",
    back: "Indietro",
    skip: "Salta per ora",
    createAccount: "Crea account",
    signInInstead: "Accedi invece"
  },
  footer: {
    help: "Aiuto",
    privacy: "Privacy",
    terms: "Termini",
    searchLanguages: "Cerca lingue...",
    noLanguagesFound: "Nessuna lingua trovata"
  }
};

function deepMerge(target, source) {
  const output = { ...(source || {}), ...(target || {}) };
  for (const key of Object.keys(source || {})) {
    const sVal = source[key];
    const tVal = target ? target[key] : undefined;
    if (sVal && typeof sVal === 'object' && !Array.isArray(sVal)) {
      output[key] = deepMerge(tVal && typeof tVal === 'object' && !Array.isArray(tVal) ? tVal : {}, sVal);
    } else if (tVal === undefined) {
      output[key] = sVal;
    }
  }
  return output;
}

const locales = fs.readdirSync(messagesDir);
let updatedCount = 0;

for (const loc of locales) {
  const regPath = path.join(messagesDir, loc, 'register.json');
  let current = {};
  if (fs.existsSync(regPath)) {
    try {
      current = JSON.parse(fs.readFileSync(regPath, 'utf8'));
    } catch {}
  }

  let template = enTemplate;
  const lang = loc.split('-')[0].toLowerCase();

  if (lang === 'ar' || loc.startsWith('ar-')) {
    template = arTemplate;
  } else if (lang === 'fr') {
    template = frBase;
  } else if (lang === 'de') {
    template = deBase;
  } else if (lang === 'es') {
    template = esBase;
  } else if (lang === 'it') {
    template = itBase;
  }

  const merged = deepMerge(current, template);
  fs.writeFileSync(regPath, JSON.stringify(merged, null, 2), 'utf8');
  updatedCount++;
}

console.log(`Successfully synced and completed register.json for all ${updatedCount} locales!`);
