/**
 * Fingerprinting par Modèle
 * Détecte les signatures spécifiques des LLMs populaires (GPT, Claude, Copilot, Gemini)
 */

const SIGNATURES = {
    GPT: {
        name: 'GPT-4/ChatGPT',
        patterns: [
            /\/\/ Helper function to/i,
            /\/\/ Function to/i,
            /const \w+ = async \(\) =>/g, // Arrow functions asynchrones constantes
            /if \(!\w+\) return;/g, // Guard clauses minimalistes
            /module\.exports =/g // CommonJS dominance
        ],
        weight: 1.2
    },
    CLAUDE: {
        name: 'Claude 3/3.5',
        patterns: [
            /\/\/ This function (handles|manages|provides)/i,
            /Object\.freeze\(/g,
            /new (Map|Set)\(/g, // Adore les structures de données ES6
            /\.reduce\(\(acc, \w+\) =>/g, // Adore les reduce clean
            /import \{ .* \} from/g // ESM preference
        ],
        weight: 1.3
    },
    COPILOT: {
        name: 'GitHub Copilot',
        patterns: [
            /\/\/ Path: .*/i, // Metadata souvent ajoutée
            /var \w+/g, // Parfois archaïque
            /console\.log\('Error:',/g,
        ],
        weight: 1.1
    },
    GEMINI: {
        name: 'Gemini',
        patterns: [
            /\?\?/g, // Nullish coalescing abuse
            /\?\. /g, // Optional chaining abuse
            /const \{ .* \} = require/g // Destructuring require
        ],
        weight: 1.1
    }
};

export function analyzeFingerprint(code) {
    let strongMatch = null;
    let maxMatches = 0;
    let totalSignatures = 0;

    const detectedModels = [];

    Object.entries(SIGNATURES).forEach(([key, model]) => {
        let matches = 0;
        model.patterns.forEach(regex => {
            const count = (code.match(regex) || []).length;
            matches += count;
        });

        if (matches > 0) {
            detectedModels.push({ model: model.name, count: matches });
            totalSignatures += matches;

            if (matches > maxMatches) {
                maxMatches = matches;
                strongMatch = model.name;
            }
        }
    });

    // Scoring
    // Si on trouve > 3-5 signatures d'un modèle, c'est très suspect
    let fingerprintScore = 0;
    if (maxMatches >= 3) fingerprintScore = 40;
    if (maxMatches >= 5) fingerprintScore = 80;
    if (maxMatches >= 8) fingerprintScore = 100;

    return {
        score: fingerprintScore,
        metric: maxMatches,
        details: {
            detected: strongMatch,
            matches: detectedModels
        }
    };
}
