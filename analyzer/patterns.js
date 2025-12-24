/**
 * Base de données complète des patterns de détection IA
 * Chaque pattern a : id, nom, poids, catégorie, immunité au formatage, fonction de détection
 */

export const PATTERN_CATEGORIES = {
    LINGUISTIC: 'linguistic',
    CODE_STRUCTURE: 'code_structure',
    NAMING: 'naming',
    ERROR_HANDLING: 'error_handling',
    DOCUMENTATION: 'documentation',
    FORMATTING: 'formatting',
    SPECIAL_CHARS: 'special_chars',
    VOCABULARY: 'vocabulary',
    HUMAN_MARKERS: 'human_markers'
};

/**
 * Patterns linguistiques dans les commentaires
 */
export const LINGUISTIC_PATTERNS = [
    {
        id: 'ai-phrase-lets',
        name: "Phrase \"Let's\" dans commentaires",
        weight: 10,
        category: PATTERN_CATEGORIES.LINGUISTIC,
        immuneToFormatting: true,
        detect: (code) => {
            const comments = extractComments(code);
            const regex = /\blet'?s\s+(break|explore|dive|look|see|create|implement)/gi;
            return countMatches(comments, regex);
        }
    },
    {
        id: 'ai-phrase-heres',
        name: "Phrases \"Here's how/what/why\"",
        weight: 10,
        category: PATTERN_CATEGORIES.LINGUISTIC,
        immuneToFormatting: true,
        detect: (code) => {
            const comments = extractComments(code);
            const regex = /\bhere'?s\s+(how|what|why|the)/gi;
            return countMatches(comments, regex);
        }
    },
    {
        id: 'ai-phrase-first',
        name: "Structure \"First, we need to\" (EN/FR)",
        weight: 9,
        category: PATTERN_CATEGORIES.LINGUISTIC,
        immuneToFormatting: true,
        detect: (code) => {
            const comments = extractComments(code);
            const patterns = [
                // Anglais
                /first,?\s+we\s+(need|will|should)/gi,
                /then,?\s+we\s+(need|will|should)/gi,
                /next,?\s+we\s+(need|will|should)/gi,
                /finally,?\s+we\s+(need|will|should)/gi,
                // Français
                /(tout\s+)?d'abord,?\s+nous\s+(devons|allons)/gi,
                /ensuite,?\s+nous\s+(devons|allons)/gi,
                /enfin,?\s+nous\s+(devons|allons)/gi,
                /pour\s+commencer,?\s+/gi
            ];
            return patterns.reduce((sum, p) => sum + countMatches(comments, p), 0);
        }
    },
    {
        id: 'ai-phrase-here-is',
        name: "Phrases de présentation (EN/FR)",
        weight: 10,
        category: PATTERN_CATEGORIES.LINGUISTIC,
        immuneToFormatting: true,
        detect: (code) => {
            const comments = extractComments(code);
            const patterns = [
                /\bhere'?s\s+(how|what|why|the)/gi,
                /\bvoici\s+(comment|ce\s+que|pourquoi|le|la|un|une)/gi,
                /\bje\s+vais\s+(vous\s+)?(expliquer|montrer)/gi,
                /\bceci\s+est\s+un\s+exemple/gi
            ];
            return patterns.reduce((sum, p) => sum + countMatches(comments, p), 0);
        }
    },
    {
        id: 'ai-phrase-note-that',
        name: "Expressions \"Note that\" (EN/FR)",
        weight: 8,
        category: PATTERN_CATEGORIES.LINGUISTIC,
        immuneToFormatting: true,
        detect: (code) => {
            const comments = extractComments(code);
            const patterns = [
                /\bnote\s+that\b/gi,
                /\bkeep\s+in\s+mind\b/gi,
                /\bit'?s\s+worth\s+noting/gi,
                /\bimportant\s+to\s+note/gi,
                // Français
                /\bnoter?\s+que\b/gi,
                /\b(il\s+)?faut\s+noter\s+que/gi,
                /\bimportant\s+de\s+noter/gi,
                /\bgarder?\s+(à|a)\s+l'esprit/gi,
                /\battention\s+(:|à)/gi
            ];
            return patterns.reduce((sum, p) => sum + countMatches(comments, p), 0);
        }
    },
    {
        id: 'ai-phrase-ensure',
        name: "\"This ensures that\", \"This allows us to\"",
        weight: 8,
        category: PATTERN_CATEGORIES.LINGUISTIC,
        immuneToFormatting: true,
        detect: (code) => {
            const comments = extractComments(code);
            const patterns = [
                /\bthis\s+(ensures|allows|enables)\s+(that|us\s+to)/gi,
                /\bin\s+order\s+to\b/gi,
                /\bwith\s+regards?\s+to\b/gi
            ];
            return patterns.reduce((sum, p) => sum + countMatches(comments, p), 0);
        }
    },
    {
        id: 'complete-sentences',
        name: "Commentaires en phrases complètes",
        weight: 6,
        category: PATTERN_CATEGORIES.LINGUISTIC,
        immuneToFormatting: true,
        detect: (code) => {
            const comments = extractComments(code);
            let completeSentences = 0;

            comments.forEach(comment => {
                const clean = comment.replace(/^[\/\*#\s]+/, '').trim();
                // Phrase complète = commence par majuscule, finit par point, > 40 chars
                if (/^[A-Z].*\.\s*$/.test(clean) && clean.length > 40) {
                    completeSentences++;
                }
            });

            const ratio = comments.length > 0 ? completeSentences / comments.length : 0;
            return ratio > 0.5 ? Math.floor(ratio * 10) : 0;
        }
    }
];

/**
 * Patterns de structure de code
 */
export const CODE_STRUCTURE_PATTERNS = [
    {
        id: 'wrapper-functions',
        name: "Wrapper functions inutiles",
        weight: 9,
        category: PATTERN_CATEGORIES.CODE_STRUCTURE,
        immuneToFormatting: true,
        detect: (code) => {
            // Détecte les fonctions avec un seul return qui appelle une autre fonction
            const regex = /function\s+\w+\([^)]*\)\s*{\s*return\s+\w+\([^)]*\);\s*}/gs;
            return countMatches(code, regex);
        }
    },
    {
        id: 'excessive-try-catch',
        name: "Try-catch excessif",
        weight: 8,
        category: PATTERN_CATEGORIES.CODE_STRUCTURE,
        immuneToFormatting: true,
        detect: (code) => {
            const tryCount = (code.match(/\btry\s*{/g) || []).length;
            const functionCount = countFunctions(code);

            if (functionCount === 0) return 0;
            const ratio = tryCount / functionCount;

            // Si >70% des fonctions ont try-catch = suspect
            return ratio > 0.7 ? Math.floor(ratio * 10) : 0;
        }
    },
    {
        id: 'intermediate-variables',
        name: "Variables intermédiaires inutiles",
        weight: 7,
        category: PATTERN_CATEGORIES.CODE_STRUCTURE,
        immuneToFormatting: true,
        detect: (code) => {
            // Détecte : const x = y; return x; (variable utilisée une seule fois)
            const regex = /(const|let|var)\s+(\w+)\s*=\s*([^;]+);[\s\S]*?return\s+\2;/g;
            return countMatches(code, regex);
        }
    },
    {
        id: 'perfect-consistency',
        name: "Cohérence parfaite (suspect)",
        weight: 7,
        category: PATTERN_CATEGORIES.CODE_STRUCTURE,
        immuneToFormatting: false, // Affecté par formatage
        detect: (code) => {
            const lines = code.split('\n');

            // Vérifier la cohérence des quotes
            const singleQuotes = (code.match(/'/g) || []).length;
            const doubleQuotes = (code.match(/"/g) || []).length;
            const total = singleQuotes + doubleQuotes;
            const quoteConsistency = total > 0 ? Math.max(singleQuotes, doubleQuotes) / total : 0;

            // Cohérence parfaite = suspect
            return quoteConsistency > 0.98 ? 1 : 0;
        }
    },
    {
        id: 'over-decomposition',
        name: "Décomposition excessive en micro-fonctions",
        weight: 8,
        category: PATTERN_CATEGORIES.CODE_STRUCTURE,
        immuneToFormatting: true,
        detect: (code) => {
            const functions = extractFunctions(code);
            let tinyFunctions = 0;

            functions.forEach(fn => {
                const lines = fn.split('\n').filter(l => l.trim() && !l.trim().startsWith('//')).length;
                if (lines <= 3) tinyFunctions++;
            });

            return functions.length > 0 && tinyFunctions / functions.length > 0.4 ?
                Math.floor((tinyFunctions / functions.length) * 10) : 0;
        }
    }
];

/**
 * Patterns de nommage
 */
export const NAMING_PATTERNS = [
    {
        id: 'verbose-names',
        name: "Noms ultra-descriptifs/verbeux",
        weight: 6,
        category: PATTERN_CATEGORIES.NAMING,
        immuneToFormatting: true,
        detect: (code) => {
            // Détecte les identifiers > 30 caractères
            const regex = /\b[a-z][a-zA-Z0-9]{30,}\b/g;
            return countMatches(code, regex);
        }
    },
    {
        id: 'perfect-boolean-prefix',
        name: "Préfixes boolean parfaits (is/has/should à 100%)",
        weight: 5,
        category: PATTERN_CATEGORIES.NAMING,
        immuneToFormatting: true,
        detect: (code) => {
            const booleanAssignments = code.match(/(const|let|var)\s+\w+\s*=\s*(true|false)/g) || [];
            let perfectPrefixes = 0;

            booleanAssignments.forEach(assignment => {
                if (/\b(is|has|should|can|will)[A-Z]/.test(assignment)) {
                    perfectPrefixes++;
                }
            });

            const ratio = booleanAssignments.length > 0 ? perfectPrefixes / booleanAssignments.length : 0;
            return ratio > 0.95 ? 1 : 0;
        }
    },
    {
        id: 'handle-prefix-excessive',
        name: "Préfixe 'handle' systématique",
        weight: 5,
        category: PATTERN_CATEGORIES.NAMING,
        immuneToFormatting: true,
        detect: (code) => {
            const handleFunctions = (code.match(/\bhandle[A-Z]\w+/g) || []).length;
            const totalFunctions = countFunctions(code);

            const ratio = totalFunctions > 0 ? handleFunctions / totalFunctions : 0;
            return ratio > 0.5 ? Math.floor(ratio * 10) : 0;
        }
    }
];

/**
 * Patterns de gestion d'erreurs
 */
export const ERROR_HANDLING_PATTERNS = [
    {
        id: 'formal-error-messages',
        name: "Messages d'erreur trop formels",
        weight: 7,
        category: PATTERN_CATEGORIES.ERROR_HANDLING,
        immuneToFormatting: true,
        detect: (code) => {
            const errorPatterns = [
                /An error occurred while/gi,
                /Unable to proceed with/gi,
                /Failed to successfully/gi,
                /Could not complete the/gi
            ];
            return errorPatterns.reduce((sum, p) => sum + countMatches(code, p), 0);
        }
    },
    {
        id: 'excessive-validation',
        name: "Validations excessives",
        weight: 8,
        category: PATTERN_CATEGORIES.ERROR_HANDLING,
        immuneToFormatting: true,
        detect: (code) => {
            const functions = extractFunctions(code);
            let functionsWithManyValidations = 0;

            functions.forEach(fn => {
                const validationCount = (fn.match(/if\s*\(\s*!/g) || []).length;
                const linesCount = fn.split('\n').length;

                // Si >50% des lignes sont des validations
                if (validationCount > linesCount * 0.5) {
                    functionsWithManyValidations++;
                }
            });

            return functionsWithManyValidations;
        }
    }
];

/**
 * Patterns de documentation
 */
export const DOCUMENTATION_PATTERNS = [
    {
        id: 'jsdoc-trivial',
        name: "JSDoc complet pour fonctions triviales",
        weight: 7,
        category: PATTERN_CATEGORIES.DOCUMENTATION,
        immuneToFormatting: true,
        detect: (code) => {
            // Détecte JSDoc >5 lignes pour fonctions <10 lignes
            const jsdocRegex = /\/\*\*[\s\S]*?\*\/\s*(function|const|let)\s+\w+/g;
            let trivialDocs = 0;

            const matches = [...code.matchAll(jsdocRegex)];
            matches.forEach(match => {
                const doc = match[0];
                const docLines = doc.split('\n').length;

                // Extraire la fonction qui suit
                const remaining = code.substring(match.index + match[0].length);
                const nextBrace = remaining.indexOf('{');
                const closingBrace = findMatchingBrace(remaining, nextBrace);
                const functionBody = remaining.substring(nextBrace, closingBrace);
                const functionLines = functionBody.split('\n').length;

                if (docLines > 5 && functionLines < 10) {
                    trivialDocs++;
                }
            });

            return trivialDocs;
        }
    },
    {
        id: 'redundant-comments',
        name: "Commentaires redondants avec le code",
        weight: 8,
        category: PATTERN_CATEGORIES.DOCUMENTATION,
        immuneToFormatting: true,
        detect: (code) => {
            const lines = code.split('\n');
            let redundant = 0;

            for (let i = 0; i < lines.length - 1; i++) {
                const comment = lines[i].trim();
                const codeLine = lines[i + 1].trim();

                if (comment.startsWith('//')) {
                    const commentText = comment.replace(/^\/\/\s*/, '').toLowerCase();
                    const codeText = codeLine.toLowerCase();

                    // Si le commentaire répète essentiellement le code
                    const similarity = calculateSimilarity(commentText, codeText);
                    if (similarity > 0.6) {
                        redundant++;
                    }
                }
            }

            return redundant;
        }
    }
];

/**
 * Patterns de caractères spéciaux et emojis
 */
export const SPECIAL_CHAR_PATTERNS = [
    {
        id: 'emoji-checkmarks',
        name: "Emojis checkmarks dans commentaires (✅❌⚠️)",
        weight: 10,
        category: PATTERN_CATEGORIES.SPECIAL_CHARS,
        immuneToFormatting: true,
        detect: (code) => {
            const emojiRegex = /[✅❌⚠️✓✔✗✘]/g;
            return countMatches(code, emojiRegex);
        }
    },
    {
        id: 'emoji-common',
        name: "Emojis courants IA (🔧💡🚀📝🎯)",
        weight: 8,
        category: PATTERN_CATEGORIES.SPECIAL_CHARS,
        immuneToFormatting: true,
        detect: (code) => {
            const emojiRegex = /[🔧💡🚀📝🎯⭐✨📊🎨⚡🌟]/g;
            return countMatches(code, emojiRegex);
        }
    },
    {
        id: 'emoji-suspicious',
        name: "Emojis très suspects (🤔💪🎉👍🔥)",
        weight: 12,
        category: PATTERN_CATEGORIES.SPECIAL_CHARS,
        immuneToFormatting: true,
        detect: (code) => {
            const emojiRegex = /[🤔💪🎉👍🔥💯]/g;
            return countMatches(code, emojiRegex);
        }
    },
    {
        id: 'unicode-decorative',
        name: "Caractères Unicode décoratifs (│═→•)",
        weight: 7,
        category: PATTERN_CATEGORIES.SPECIAL_CHARS,
        immuneToFormatting: true,
        detect: (code) => {
            const regex = /[│┃║┤┌┐└┘├┬┴┼═→←↑↓⇒⇐•·]/g;
            return countMatches(code, regex);
        }
    }
];

/**
 * Patterns de vocabulaire formel
 */
export const VOCABULARY_PATTERNS = [
    {
        id: 'vocab-utilize',
        name: "\"Utilize\" au lieu de \"use\"",
        weight: 6,
        category: PATTERN_CATEGORIES.VOCABULARY,
        immuneToFormatting: true,
        detect: (code) => {
            const comments = extractComments(code);
            return countMatches(comments, /\butilize\b/gi);
        }
    },
    {
        id: 'vocab-leverage',
        name: "\"Leverage\" dans commentaires",
        weight: 7,
        category: PATTERN_CATEGORIES.VOCABULARY,
        immuneToFormatting: true,
        detect: (code) => {
            const comments = extractComments(code);
            return countMatches(comments, /\bleverage\b/gi);
        }
    },
    {
        id: 'vocab-ensure',
        name: "Sur-utilisation de \"ensure\"",
        weight: 6,
        category: PATTERN_CATEGORIES.VOCABULARY,
        immuneToFormatting: true,
        detect: (code) => {
            const comments = extractComments(code);
            const count = countMatches(comments, /\bensure\b/gi);
            return count > 3 ? count : 0;
        }
    },
    {
        id: 'vocab-adverbs',
        name: "Adverbes formels (simply, essentially, basically)",
        weight: 5,
        category: PATTERN_CATEGORIES.VOCABULARY,
        immuneToFormatting: true,
        detect: (code) => {
            const comments = extractComments(code);
            const adverbs = /\b(simply|essentially|basically|fundamentally|effectively|appropriately)\b/gi;
            return countMatches(comments, adverbs);
        }
    }
];

/**
 * Contre-patterns : marqueurs de code humain
 */
export const HUMAN_MARKER_PATTERNS = [
    {
        id: 'debug-prints',
        name: "Debug prints informels",
        weight: -15,
        category: PATTERN_CATEGORIES.HUMAN_MARKERS,
        immuneToFormatting: true,
        detect: (code) => {
            const patterns = [
                /console\.log\(['"]here['"]\)/gi,
                /console\.log\(['"]debug['"]\)/gi,
                /console\.log\(['"]wtf['"]\)/gi,
                /print\(['"]debug['"]\)/gi,
                /print\(['"]here['"]\)/gi
            ];
            return patterns.reduce((sum, p) => sum + countMatches(code, p), 0);
        }
    },
    {
        id: 'informal-comments',
        name: "Commentaires informels (wtf, hack, todo fix)",
        weight: -12,
        category: PATTERN_CATEGORIES.HUMAN_MARKERS,
        immuneToFormatting: true,
        detect: (code) => {
            const comments = extractComments(code);
            const patterns = [
                /\bwtf\b/gi,
                /\bhack\b/gi,
                /todo.*(fix|mess|later)/gi,
                /temporary/gi,
                /dirty/gi
            ];
            return patterns.reduce((sum, p) => sum + countMatches(comments, p), 0);
        }
    },
    {
        id: 'temp-vars',
        name: "Variables temporaires (temp, tmp, foo, bar)",
        weight: -10,
        category: PATTERN_CATEGORIES.HUMAN_MARKERS,
        immuneToFormatting: true,
        detect: (code) => {
            const regex = /\b(temp|tmp|foo|bar|baz|test|dummy)\b/g;
            return countMatches(code, regex);
        }
    },
    {
        id: 'commented-code',
        name: "Code commenté (temporaire)",
        weight: -8,
        category: PATTERN_CATEGORIES.HUMAN_MARKERS,
        immuneToFormatting: true,
        detect: (code) => {
            const lines = code.split('\n');
            let commentedCodeLines = 0;

            lines.forEach(line => {
                const trimmed = line.trim();
                // Ligne commentée qui ressemble à du code
                if ((trimmed.startsWith('//') || trimmed.startsWith('#')) &&
                    /[{};=()]/.test(trimmed)) {
                    commentedCodeLines++;
                }
            });

            return commentedCodeLines > 5 ? 1 : 0;
        }
    },
    {
        id: 'typos-in-comments',
        name: "Fautes de frappe dans commentaires",
        weight: -10,
        category: PATTERN_CATEGORIES.HUMAN_MARKERS,
        immuneToFormatting: true,
        detect: (code) => {
            // Implémentation simplifiée - pourrait être améliorée avec un spell checker
            const comments = extractComments(code);
            const typoPatterns = [
                /\bteh\b/gi,  // the
                /\bfunciton\b/gi, // function
                /\bretrun\b/gi, // return
                /\brecieve\b/gi // receive
            ];
            return typoPatterns.reduce((sum, p) => sum + countMatches(comments, p), 0);
        }
    }
];

/**
 * Patterns de chaos humain (Incohérences = Humain)
 * L'IA est généralement trop cohérente.
 */
export const HUMAN_CHAOS_PATTERNS = [
    {
        id: 'mixed-quotes',
        name: "Mélange de quotes (' et \")",
        weight: -8,
        category: PATTERN_CATEGORIES.HUMAN_MARKERS,
        immuneToFormatting: false, // Le formatage corrige ça
        detect: (code) => {
            const single = (code.match(/'/g) || []).length;
            const double = (code.match(/"/g) || []).length;
            if (single === 0 || double === 0) return 0;

            // Si mélange significatif (pas juste 1 ou 2 exceptions)
            const ratio = Math.min(single, double) / Math.max(single, double);
            return ratio > 0.2 ? 1 : 0;
        }
    },
    {
        id: 'inconsistent-spacing',
        name: "Espacement inconsistant",
        weight: -7,
        category: PATTERN_CATEGORIES.HUMAN_MARKERS,
        immuneToFormatting: false,
        detect: (code) => {
            const lines = code.split('\n');
            let spaces2 = 0;
            let spaces4 = 0;

            lines.forEach(line => {
                const leadingSpaces = line.match(/^\s*/)[0].length;
                if (leadingSpaces > 0) {
                    if (leadingSpaces % 4 === 0) spaces4++;
                    else if (leadingSpaces % 2 === 0) spaces2++;
                }
            });

            // Si mélange de styles d'indentation
            if (spaces2 > 5 && spaces4 > 5) return 1;
            return 0;
        }
    },
    {
        id: 'aggressive-swearing',
        name: "Vocabulaire informel/vulgaire",
        weight: -20, // Très fort indicateur humain
        category: PATTERN_CATEGORIES.HUMAN_MARKERS,
        immuneToFormatting: true,
        detect: (code) => {
            const regex = /\b(fuck|shit|damn|crap|hell|sucks|stupid|idiot|bastard|useless)\b/gi;
            return countMatches(code, regex);
        }
    },
    {
        id: 'weird-variable-names',
        name: "Noms de variables arbitraires (x, y, data2, temp_new)",
        weight: -5,
        category: PATTERN_CATEGORIES.HUMAN_MARKERS,
        immuneToFormatting: true,
        detect: (code) => {
            const regex = /\b(x|y|z|i|j|k|val|obj|data2|str|res|tmp|temp)\b/g;
            return countMatches(code, regex);
        }
    }
];

/**
 * Tous les patterns combinés
 */
export const ALL_PATTERNS = [
    ...LINGUISTIC_PATTERNS,
    ...CODE_STRUCTURE_PATTERNS,
    ...NAMING_PATTERNS,
    ...ERROR_HANDLING_PATTERNS,
    ...DOCUMENTATION_PATTERNS,
    ...SPECIAL_CHAR_PATTERNS,
    ...VOCABULARY_PATTERNS,
    ...HUMAN_MARKER_PATTERNS,
    ...HUMAN_CHAOS_PATTERNS
];

/**
 * Fonctions utilitaires
 */

function extractComments(code) {
    const comments = [];

    // Commentaires //
    const singleLineRegex = /\/\/.*$/gm;
    const singleLineMatches = code.match(singleLineRegex) || [];
    comments.push(...singleLineMatches);

    // Commentaires /* */
    const multiLineRegex = /\/\*[\s\S]*?\*\//g;
    const multiLineMatches = code.match(multiLineRegex) || [];
    comments.push(...multiLineMatches);

    // Commentaires Python #
    const pythonCommentRegex = /#.*$/gm;
    const pythonMatches = code.match(pythonCommentRegex) || [];
    comments.push(...pythonMatches);

    return comments.join('\n');
}

function countMatches(text, regex) {
    const matches = text.match(regex);
    return matches ? matches.length : 0;
}

function countFunctions(code) {
    const patterns = [
        /function\s+\w+/g,
        /\w+\s*=\s*function/g,
        /\w+\s*=\s*\([^)]*\)\s*=>/g,
        /def\s+\w+/g // Python
    ];
    return patterns.reduce((sum, p) => sum + countMatches(code, p), 0);
}

function extractFunctions(code) {
    // Implémentation simplifiée
    const functions = [];
    const regex = /(function\s+\w+[^{]*{[\s\S]*?})|(\w+\s*=\s*\([^)]*\)\s*=>\s*{[\s\S]*?})/g;
    const matches = code.match(regex) || [];
    return matches;
}

function findMatchingBrace(code, openIndex) {
    let depth = 0;
    for (let i = openIndex; i < code.length; i++) {
        if (code[i] === '{') depth++;
        if (code[i] === '}') {
            depth--;
            if (depth === 0) return i;
        }
    }
    return code.length;
}

function calculateSimilarity(str1, str2) {
    // Simple similarity basée sur mots communs
    const words1 = str1.split(/\s+/).filter(w => w.length > 3);
    const words2 = str2.split(/\s+/).filter(w => w.length > 3);

    let commonWords = 0;
    words1.forEach(w => {
        if (words2.includes(w)) commonWords++;
    });

    const maxLength = Math.max(words1.length, words2.length);
    return maxLength > 0 ? commonWords / maxLength : 0;
}

export default ALL_PATTERNS;
