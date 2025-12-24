/**
 * Système d'internationalisation (i18n)
 * Supporte FR et EN avec détection automatique
 */

const translations = {
    fr: {
        app_title: "Vibe Detector",
        token_btn: "TOKEN",
        scan_btn: "Lancer le Scan",
        loading: "Initialisation...",
        loading_warn: "⚠️ Ne fermez pas cette fenêtre pendant le scan",
        tab_overview: "Vue d'ensemble",
        tab_files: "Fichiers",
        tab_patterns: "Patterns",
        human: "Humain",
        uncertain: "Incertain",
        ai_likely: "IA Probable",
        verdict_waiting: "En attente...",
        confidence: "Confiance:",
        files_analyzed: "Fichiers analysés:",
        modal_file_title: "Sélectionner un fichier",
        modal_settings_title: "Paramètres",
        label_token: "Token GitHub (Optionnel)",
        desc_token: "Ajoutez un token pour augmenter la limite d'appels API (5000/heure au lieu de 60).",
        help_token: "Créer un token ici",
        btn_save: "Sauvegarder",
        placeholder_url: "Entrez l'URL du repo GitHub...",
        verdict_human: "✅ Probablement code humain",
        verdict_ai_very: "🤖 Très probablement généré par IA",
        verdict_ai: "⚠️ Probablement généré par IA",
        verdict_mixed: "❓ Possiblement IA ou code mixte",
        verdict_uncertain: "🤷 Incertain - pas assez de signaux",
        cat_linguistic: "Linguistique",
        cat_structure: "Structure du Code",
        cat_naming: "Nommage",
        cat_error: "Gestion d'erreurs",
        cat_doc: "Documentation",
        cat_special: "Caractères Spéciaux",
        cat_vocab: "Vocabulaire",
        cat_vocab: "Vocabulaire",
        cat_human: "Marqueurs Humains",
        label_appearance: "Apparence",
        label_language: "Langue",
        theme_dark: "Mode Sombre",
        theme_light: "Mode Clair",
        lang_fr: "Français",
        lang_en: "English"
    },
    en: {
        app_title: "Vibe Detector",
        token_btn: "TOKEN",
        scan_btn: "Start Scan",
        loading: "Initializing...",
        loading_warn: "⚠️ Do not close this window during scan",
        tab_overview: "Overview",
        tab_files: "Files",
        tab_patterns: "Patterns",
        human: "Human",
        uncertain: "Uncertain",
        ai_likely: "Likely AI",
        verdict_waiting: "Waiting...",
        confidence: "Confidence:",
        files_analyzed: "Files analyzed:",
        modal_file_title: "Select a file",
        modal_settings_title: "Settings",
        label_token: "GitHub Token (Optional)",
        desc_token: "Add a token to increase API rate limit (5000/hour instead of 60).",
        help_token: "Create a token here",
        btn_save: "Save",
        placeholder_url: "Enter GitHub repo URL...",
        verdict_human: "✅ Likely Human Code",
        verdict_ai_very: "🤖 Very Likely AI Generated",
        verdict_ai: "⚠️ Likely AI Generated",
        verdict_mixed: "❓ Possibly AI or Mixed Code",
        verdict_uncertain: "🤷 Uncertain - not enough signals",
        cat_linguistic: "Linguistic",
        cat_structure: "Code Structure",
        cat_naming: "Naming",
        cat_error: "Error Handling",
        cat_doc: "Documentation",
        cat_special: "Special Characters",
        cat_vocab: "Vocabulary",
        cat_human: "Human Markers",
        label_appearance: "Appearance",
        label_language: "Language",
        theme_dark: "Dark Mode",
        theme_light: "Light Mode",
        lang_fr: "French",
        lang_en: "English"
    },
    es: {
        app_title: "Detector de Vibe",
        token_btn: "TOKEN",
        scan_btn: "Iniciar Escaneo",
        loading: "Inicializando...",
        loading_warn: "⚠️ No cierre esta ventana",
        tab_overview: "Resumen",
        tab_files: "Archivos",
        tab_patterns: "Patrones",
        human: "Humano",
        uncertain: "Incierto",
        ai_likely: "Probable IA",
        verdict_waiting: "Esperando...",
        confidence: "Confianza:",
        files_analyzed: "Archivos:",
        modal_file_title: "Seleccionar archivo",
        modal_settings_title: "Ajustes",
        label_token: "Token GitHub",
        desc_token: "Añadir token para límite API.",
        help_token: "Crear token",
        btn_save: "Guardar",
        placeholder_url: "URL del repo...",
        verdict_human: "✅ Probablemente Humano",
        verdict_ai_very: "🤖 Muy Probablemente IA",
        verdict_ai: "⚠️ Probablemente IA",
        verdict_mixed: "❓ Posiblemente IA/Mixto",
        verdict_uncertain: "🤷 Incierto",
        cat_linguistic: "Lingüístico",
        cat_structure: "Estructura",
        cat_naming: "Nombres",
        cat_error: "Errores",
        cat_doc: "Documentación",
        cat_special: "Caracteres Especiales",
        cat_vocab: "Vocabulario",
        cat_human: "Marcas Humanas",
        label_appearance: "Apariencia",
        label_language: "Idioma",
        theme_dark: "Modo Oscuro",
        theme_light: "Modo Claro"
    },
    de: {
        app_title: "Vibe Detektor",
        token_btn: "TOKEN",
        scan_btn: "Scan Starten",
        loading: "Initialisiere...",
        loading_warn: "⚠️ Fenster nicht schließen",
        tab_overview: "Übersicht",
        tab_files: "Dateien",
        tab_patterns: "Muster",
        human: "Mensch",
        uncertain: "Unsicher",
        ai_likely: "Wahrscheinlich KI",
        verdict_waiting: "Warten...",
        confidence: "Vertrauen:",
        files_analyzed: "Dateien:",
        modal_file_title: "Datei auswählen",
        modal_settings_title: "Einstellungen",
        label_token: "GitHub Token",
        desc_token: "Token hinzufügen für API-Limit.",
        help_token: "Token erstellen",
        btn_save: "Speichern",
        placeholder_url: "GitHub Repo URL...",
        verdict_human: "✅ Wahrscheinlich Mensch",
        verdict_ai_very: "🤖 Sehr wahrscheinlich KI",
        verdict_ai: "⚠️ Wahrscheinlich KI",
        verdict_mixed: "❓ Eventuell KI/Gemischt",
        verdict_uncertain: "🤷 Unsicher",
        cat_linguistic: "Linguistisch",
        cat_structure: "Struktur",
        cat_naming: "Benennung",
        cat_error: "Fehlerbehandlung",
        cat_doc: "Doku",
        cat_special: "Sonderzeichen",
        cat_vocab: "Wortschatz",
        cat_human: "Menschliche Merkmale",
        label_appearance: "Aussehen",
        label_language: "Sprache",
        theme_dark: "Dunkelmodus",
        theme_light: "Lichtmodus"
    },
    it: {
        app_title: "Rilevatore Vibe",
        token_btn: "TOKEN",
        scan_btn: "Avvia Scansione",
        loading: "Inizializzazione...",
        loading_warn: "⚠️ Non chiudere questa finestra",
        tab_overview: "Panoramica",
        tab_files: "File",
        tab_patterns: "Pattern",
        human: "Umano",
        uncertain: "Incerto",
        ai_likely: "Probabile IA",
        verdict_waiting: "In attesa...",
        confidence: "Confidenza:",
        files_analyzed: "File analizzati:",
        modal_file_title: "Seleziona file",
        modal_settings_title: "Impostazioni",
        label_token: "Token GitHub",
        desc_token: "Aggiungi token per limite API.",
        help_token: "Crea token",
        btn_save: "Salva",
        placeholder_url: "URL repo GitHub...",
        verdict_human: "✅ Probabilmente Umano",
        verdict_ai_very: "🤖 Molto Probabilmente IA",
        verdict_ai: "⚠️ Probabilmente IA",
        verdict_mixed: "❓ Possibilmente IA/Misto",
        verdict_uncertain: "🤷 Incerto",
        cat_linguistic: "Linguistico",
        cat_structure: "Struttura",
        cat_naming: "Nomi",
        cat_error: "Errori",
        cat_doc: "Documentazione",
        cat_special: "Caratteri Speciali",
        cat_vocab: "Vocabolario",
        cat_human: "Segnali Umani",
        label_appearance: "Aspetto",
        label_language: "Lingua",
        theme_dark: "Modalità Scura",
        theme_light: "Modalità Chiara"
    },
    pt: {
        app_title: "Detector de Vibe",
        token_btn: "TOKEN",
        scan_btn: "Iniciar Scan",
        loading: "Inicializando...",
        loading_warn: "⚠️ Não feche esta janela",
        tab_overview: "Visão Geral",
        tab_files: "Arquivos",
        tab_patterns: "Padrões",
        human: "Humano",
        uncertain: "Incerto",
        ai_likely: "Provável IA",
        verdict_waiting: "Aguardando...",
        confidence: "Confiança:",
        files_analyzed: "Arquivos:",
        modal_file_title: "Selecionar arquivo",
        modal_settings_title: "Configurações",
        label_token: "Token GitHub",
        desc_token: "Adicionar token para limite API.",
        help_token: "Criar token",
        btn_save: "Salvar",
        placeholder_url: "URL do repo...",
        verdict_human: "✅ Provavelmente Humano",
        verdict_ai_very: "🤖 Muito Provavelmente IA",
        verdict_ai: "⚠️ Provavelmente IA",
        verdict_mixed: "❓ Possivelmente IA/Misto",
        verdict_uncertain: "🤷 Incerto",
        cat_linguistic: "Linguístico",
        cat_structure: "Estrutura",
        cat_naming: "Nomes",
        cat_error: "Erros",
        cat_doc: "Documentação",
        cat_special: "Caracteres Especiais",
        cat_vocab: "Vocabulário",
        cat_human: "Marcas Humanas",
        label_appearance: "Aparência",
        label_language: "Idioma",
        theme_dark: "Modo Escuro",
        theme_light: "Modo Claro"
    },
    zh: {
        app_title: "Vibe Detector (CN)",
        token_btn: "TOKEN",
        scan_btn: "Start Scan",
        loading: "Initializing...",
        loading_warn: "Do not close window",
        tab_overview: "Overview",
        tab_files: "Files",
        tab_patterns: "Patterns",
        human: "Human",
        uncertain: "Uncertain",
        ai_likely: "Likely AI",
        verdict_waiting: "Waiting...",
        confidence: "Confidence:",
        files_analyzed: "Files analyzed:",
        modal_file_title: "Select File",
        modal_settings_title: "Settings",
        label_token: "GitHub Token",
        desc_token: "Add token to increase API limit",
        help_token: "Create token",
        btn_save: "Save",
        placeholder_url: "Enter GitHub repo URL...",
        verdict_human: "Likely Human Code",
        verdict_ai_very: "Very Likely AI",
        verdict_ai: "Likely AI",
        verdict_mixed: "Possibly AI/Mixed",
        verdict_uncertain: "Uncertain",
        cat_linguistic: "Linguistic",
        cat_structure: "Code Structure",
        cat_naming: "Naming",
        cat_error: "Error Handling",
        cat_doc: "Documentation",
        cat_special: "Special Characters",
        cat_vocab: "Vocabulary",
        cat_human: "Human Markers",
        label_appearance: "Appearance",
        label_language: "Language",
        theme_dark: "Dark Mode",
        theme_light: "Light Mode"
    },
    ja: {
        app_title: "Vibe Detector (JP)",
        token_btn: "TOKEN",
        scan_btn: "Start Scan",
        loading: "Initializing...",
        loading_warn: "Do not close window",
        tab_overview: "Overview",
        tab_files: "Files",
        tab_patterns: "Patterns",
        human: "Human",
        uncertain: "Uncertain",
        ai_likely: "Likely AI",
        verdict_waiting: "Waiting...",
        confidence: "Confidence:",
        files_analyzed: "Files analyzed:",
        modal_file_title: "Select File",
        modal_settings_title: "Settings",
        label_token: "GitHub Token",
        desc_token: "Add token for API limit",
        help_token: "Create token",
        btn_save: "Save",
        placeholder_url: "GitHub Repo URL...",
        verdict_human: "Likely Human Code",
        verdict_ai_very: "Very Likely AI",
        verdict_ai: "Likely AI",
        verdict_mixed: "Possibly AI/Mixed",
        verdict_uncertain: "Uncertain",
        cat_linguistic: "Linguistic",
        cat_structure: "Structure",
        cat_naming: "Naming",
        cat_error: "Error Handling",
        cat_doc: "Documentation",
        cat_special: "Special Characters",
        cat_vocab: "Vocabulary",
        cat_human: "Human Markers",
        label_appearance: "Appearance",
        label_language: "Language",
        theme_dark: "Dark Mode",
        theme_light: "Light Mode"
    }
};

let currentLang = 'fr'; // Default

/**
 * Initialise la langue basée sur le navigateur ou le stockage
 */
export function initI18n() {
    // Détecter la langue du navigateur
    const sysLang = navigator.language.split('-')[0];
    if (translations[sysLang]) {
        currentLang = sysLang;
    } else {
        currentLang = 'en'; // Fallback to English if not FR
    }

    applyTranslations();
    return currentLang;
}

/**
 * Applique les traductions au DOM
 */
export function applyTranslations() {
    const t = translations[currentLang];

    // Traduire les éléments avec data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            // Gérer les placeholders pour les inputs
            if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                // Pour l'input URL, c'est un cas spécial car le placeholder est le seul texte
                if (key === 'placeholder_url') el.placeholder = t[key];
            } else {
                el.innerText = t[key];
            }
        }
    });

    // Cas spéciaux (texte mélangé à des icônes)
    const helpLink = document.querySelector('.settings-help a');
    if (helpLink) helpLink.innerText = t.help_token;
}

/**
 * Récupère une chaîne de traduction
 */
export function t(key) {
    return translations[currentLang][key] || key;
}

export function setLang(lang) {
    if (translations[lang]) {
        currentLang = lang;
        applyTranslations();
        return true;
    }
    return false;
}

export function getCurrentLang() {
    return currentLang;
}
