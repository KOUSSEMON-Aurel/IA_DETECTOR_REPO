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
        cat_human: "Marqueurs Humains"
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
        cat_human: "Human Markers"
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
