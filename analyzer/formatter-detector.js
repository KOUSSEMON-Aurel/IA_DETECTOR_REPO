/**
 * Détection des outils de formatage automatique
 * pour ajuster le poids des patterns affectés
 */

import CONFIG from '../config/settings.js';

/**
 * Détecte si le projet utilise un formatage automatique
 * @param {Array} repoFiles - Liste des fichiers du repo racine
 * @returns {Object} Info sur le formatage
 */
export function detectAutoFormatting(repoFiles) {
    const formatterConfigs = CONFIG.FORMATTER_CONFIGS;

    let hasFormatter = false;
    const detectorsFound = [];

    // Vérifier la présence de fichiers de config
    repoFiles.forEach(file => {
        const basename = file.split('/').pop();
        if (formatterConfigs.includes(basename)) {
            hasFormatter = true;
            detectorsFound.push(basename);
        }
    });

    // Analyser package.json si présent
    const packageJsonFile = repoFiles.find(f => f.endsWith('package.json'));
    if (packageJsonFile) {
        // Note: il faudrait lire le contenu pour vérifier les scripts
        // Pour l'instant on suppose que si prettier/eslint config existe = utilisé
    }

    return {
        hasFormatter,
        detectorsFound,
        // Réduire le poids des patterns de formatage si formatter détecté
        formatWeightMultiplier: hasFormatter ? 0.3 : 1.0
    };
}

/**
 * Patterns immuns au formatage automatique
 * Ces patterns persistent même avec Prettier, Black, ESLint, etc.
 */
export const FORMATTING_IMMUNE_PATTERNS = [
    'comments',           // Contenu des commentaires
    'naming',            // Noms de variables/fonctions
    'logic',             // Structure logique
    'emojis',            // Emojis dans commentaires
    'vocabulary',        // Vocabulaire utilisé
    'documentation',     // Contenu docstrings/JSDoc
    'error_messages',    // Messages d'erreur
    'verbosity'          // Verbosité du code
];

/**
 * Patterns affectés par le formatage
 * Ne PAS scorer fortement si formatter détecté
 */
export const FORMATTING_AFFECTED_PATTERNS = [
    'indentation',       // Tabs vs spaces
    'spacing',           // Espaces autour opérateurs
    'quotes',            // Simple vs double quotes
    'semicolons',        // Présence/absence
    'line_length',       // Coupures de lignes
    'import_order',      // Ordre alphabétique
    'trailing_commas'    // Virgules finales
];

export default {
    detectAutoFormatting,
    FORMATTING_IMMUNE_PATTERNS,
    FORMATTING_AFFECTED_PATTERNS
};
