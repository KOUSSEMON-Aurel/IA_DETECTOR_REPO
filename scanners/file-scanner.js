/**
 * Scanner de fichier unique (Mode 2)
 */

import { analyzeFile } from '../analyzer/scorer.js';

/**
 * Scanne un fichier unique
 * @param {string} content - Contenu du fichier
 * @param {Object} context - Contexte (nom fichier, repo, etc.)
 * @returns {Object} Résultats détaillés
 */
export function scanFile(content, context = {}) {
    try {
        const results = analyzeFile(content, context);

        // Ajouter l'analyse ligne par ligne
        const lineAnalysis = analyzeLines(content, results.patterns);

        return {
            ...results,
            lineAnalysis,
            fileName: context.fileName || 'unknown',
            filePath: context.filePath || '',
            linesOfCode: content.split('\n').length
        };

    } catch (error) {
        console.error('Erreur scan fichier:', error);
        throw error;
    }
}

/**
 * Analyse ligne par ligne pour highlight
 */
function analyzeLines(content, patterns) {
    const lines = content.split('\n');
    const suspiciousLines = [];

    lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const matchedPatterns = [];

        // Vérifier quels patterns matchent cette ligne
        patterns.forEach(pattern => {
            if (lineContainsPattern(line, pattern)) {
                matchedPatterns.push({
                    id: pattern.id,
                    name: pattern.name
                });
            }
        });

        if (matchedPatterns.length > 0) {
            suspiciousLines.push({
                lineNumber,
                line: line.trim(),
                patterns: matchedPatterns,
                severity: calculateLineSeverity(matchedPatterns)
            });
        }
    });

    return {
        suspiciousLines,
        totalSuspiciousLines: suspiciousLines.length,
        distribution: calculateDistribution(suspiciousLines, lines.length)
    };
}

/**
 * Vérifie si une ligne contient un pattern
 */
function lineContainsPattern(line, pattern) {
    // Patterns de commentaires
    if (pattern.category === 'linguistic' || pattern.category === 'vocabulary') {
        // Vérifier si la ligne est un commentaire
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) {
            // Vérifier les phrases typiques IA
            const aiPhrases = [
                /let'?s\s+(break|explore|dive)/i,
                /here'?s\s+(how|what|why)/i,
                /note\s+that/i,
                /ensure|utilize|leverage/i
            ];
            return aiPhrases.some(regex => regex.test(line));
        }
    }

    // Patterns d'emojis
    if (pattern.category === 'special_chars') {
        return /[✅❌⚠️🔧💡🚀📝🎯]/.test(line);
    }

    // Patterns de nommage
    if (pattern.category === 'naming') {
        return /\b[a-z][a-zA-Z0-9]{30,}\b/.test(line);
    }

    return false;
}

/**
 * Calcule la sévérité d'une ligne
 */
function calculateLineSeverity(matchedPatterns) {
    const totalWeight = matchedPatterns.reduce((sum, p) => sum + (p.weight || 5), 0);

    if (totalWeight > 15) return 'high';
    if (totalWeight > 8) return 'medium';
    return 'low';
}

/**
 * Calcule la distribution des lignes suspectes
 */
function calculateDistribution(suspiciousLines, totalLines) {
    const ratio = suspiciousLines.length / totalLines;

    return {
        percentage: Math.round(ratio * 100),
        density: ratio > 0.3 ? 'high' : ratio > 0.15 ? 'medium' : 'low'
    };
}

export default {
    scanFile,
    analyzeLines
};
