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
        theme_dark: "Mörkt läge",
        theme_light: "Ljust läge"
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
        app_title: "Vibe检测器",
        token_btn: "令牌",
        scan_btn: "开始扫描",
        loading: "正在初始化...",
        loading_warn: "⚠️ 扫描期间请勿关闭此窗口",
        tab_overview: "概览",
        tab_files: "文件",
        tab_patterns: "模式",
        human: "人工",
        uncertain: "不确定",
        ai_likely: "可能是AI",
        verdict_waiting: "等待中...",
        confidence: "置信度:",
        files_analyzed: "已分析文件:",
        modal_file_title: "选择文件",
        modal_settings_title: "设置",
        label_token: "GitHub令牌",
        desc_token: "添加令牌以增加API限制。",
        help_token: "创建令牌",
        btn_save: "保存",
        placeholder_url: "输入GitHub仓库URL...",
        verdict_human: "✅ 可能是人工代码",
        verdict_ai_very: "🤖 极可能是AI生成",
        verdict_ai: "⚠️ 可能是AI生成",
        verdict_mixed: "❓ 可能是AI/混合",
        verdict_uncertain: "🤷 不确定",
        cat_linguistic: "语言特征",
        cat_structure: "代码结构",
        cat_naming: "命名规范",
        cat_error: "错误处理",
        cat_doc: "文档",
        cat_special: "特殊字符",
        cat_vocab: "词汇",
        cat_human: "人工标记",
        label_appearance: "外观",
        label_language: "语言",
        theme_dark: "深色模式",
        theme_light: "浅色模式"
    },
    ja: {
        app_title: "Vibe検出器",
        token_btn: "トークン",
        scan_btn: "スキャン開始",
        loading: "初期化中...",
        loading_warn: "⚠️ スキャン中はウィンドウを閉じないでください",
        tab_overview: "概要",
        tab_files: "ファイル",
        tab_patterns: "パターン",
        human: "人間",
        uncertain: "不明",
        ai_likely: "AIの可能性",
        verdict_waiting: "待機中...",
        confidence: "信頼度:",
        files_analyzed: "分析ファイル:",
        modal_file_title: "ファイル選択",
        modal_settings_title: "設定",
        label_token: "GitHubトークン",
        desc_token: "API制限を増やす。",
        help_token: "トークン作成",
        btn_save: "保存",
        placeholder_url: "GitHubリポジトリURL...",
        verdict_human: "✅ 人間のコードの可能性",
        verdict_ai_very: "🤖 AI生成の可能性大",
        verdict_ai: "⚠️ AI生成の可能性",
        verdict_mixed: "❓ AI/混合の可能性",
        verdict_uncertain: "🤷 不明",
        cat_linguistic: "言語的",
        cat_structure: "構造",
        cat_naming: "命名",
        cat_error: "エラー処理",
        cat_doc: "ドキュメント",
        cat_special: "特殊文字",
        cat_vocab: "語彙",
        cat_human: "人間の特徴",
        label_appearance: "外観",
        label_language: "言語",
        theme_dark: "ダークモード",
        theme_light: "ライトモード"
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
