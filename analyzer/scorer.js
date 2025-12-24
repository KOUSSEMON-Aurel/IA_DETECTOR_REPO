/**
 * Système de scoring multi-dimensionnel pour détecter le code IA
 */

import { ALL_PATTERNS, PATTERN_CATEGORIES } from './patterns.js';
import { detectAutoFormatting } from './formatter-detector.js';
import { analyzeJavaScript } from './language-analyzers/javascript.js';
import { analyzePython } from './language-analyzers/python.js';
import { analyzeShellScript } from './language-analyzers/shell.js';
import CONFIG from '../config/settings.js';

/**
 * Calcule le score IA d'un fichier
 * @param {string} code - Contenu du fichier
 * @param {Object} context - Contexte (repo, formatters détectés, etc.)
 * @returns {Object} Résultat de l'analyse
 */
export function analyzeFile(code, context = {}) {
    // Vérifier si fichier auto-généré
    if (isGeneratedFile(code)) {
        return {
            score: 0,
            confidence: 100,
            verdict: 'Fichier auto-généré (exclu)',
            patterns: [],
            breakdown: {}
        };
    }

    // Détection du formatage automatique
    const formatterInfo = context.formatterDetected || { hasFormatter: false, formatWeightMultiplier: 1.0 };

    // Analyser tous les patterns
    const patternResults = analyzePatterns(code, formatterInfo);

    // Calculer les scores par dimension
    const dimensionScores = calculateDimensionScores(patternResults, formatterInfo);

    // Score final pondéré
    const finalScore = calculateFinalScore(dimensionScores);

    // Calcul de la confiance
    const confidence = calculateConfidence(patternResults, formatterInfo, context);

    // Verdict
    const verdict = getVerdict(finalScore, confidence);

    return {
        score: Math.round(finalScore),
        confidence: Math.round(confidence),
        verdict,
        patterns: patternResults,
        breakdown: dimensionScores,
        details: {
            totalPatterns: patternResults.length,
            aiPatterns: patternResults.filter(p => p.weight > 0).length,
            humanMarkers: patternResults.filter(p => p.weight < 0).length,
            formatterDetected: formatterInfo.hasFormatter
        }
    };
}

/**
 * Analyse tous les patterns
 */
function analyzePatterns(code, formatterInfo) {
    const results = [];

    ALL_PATTERNS.forEach(pattern => {
        try {
            const count = pattern.detect(code);

            if (count > 0 || count < 0) {
                // Ajuster le poids si pattern affecté par formatage
                let adjustedWeight = pattern.weight;
                if (!pattern.immuneToFormatting && formatterInfo.hasFormatter) {
                    adjustedWeight *= formatterInfo.formatWeightMultiplier;
                }

                results.push({
                    id: pattern.id,
                    name: pattern.name,
                    category: pattern.category,
                    count,
                    weight: adjustedWeight,
                    totalScore: count * adjustedWeight,
                    immuneToFormatting: pattern.immuneToFormatting
                });
            }
        } catch (error) {
            console.error(`Erreur pattern ${pattern.id}:`, error);
        }
    });

    return results;
}

/**
 * Calcule les scores par dimension
 */
function calculateDimensionScores(patternResults, formatterInfo) {
    const dimensions = {
        structure: 0,      // 40% du score
        lexical: 0,        // 30% du score
        behavior: 0,       // 20% du score
        context: 0         // 10% du score
    };

    patternResults.forEach(result => {
        const score = result.totalScore;

        switch (result.category) {
            case PATTERN_CATEGORIES.CODE_STRUCTURE:
            case PATTERN_CATEGORIES.ERROR_HANDLING:
                dimensions.structure += score;
                break;

            case PATTERN_CATEGORIES.LINGUISTIC:
            case PATTERN_CATEGORIES.VOCABULARY:
            case PATTERN_CATEGORIES.SPECIAL_CHARS:
                dimensions.lexical += score;
                break;

            case PATTERN_CATEGORIES.NAMING:
            case PATTERN_CATEGORIES.DOCUMENTATION:
                dimensions.behavior += score;
                break;

            case PATTERN_CATEGORIES.FORMATTING:
                dimensions.context += score;
                break;

            case PATTERN_CATEGORIES.HUMAN_MARKERS:
                // Les marqueurs humains réduisent tous les scores
                dimensions.structure += score * 0.4;
                dimensions.lexical += score * 0.3;
                dimensions.behavior += score * 0.2;
                dimensions.context += score * 0.1;
                break;
        }
    });

    return dimensions;
}

/**
 * Calcule le score final pondéré
 */
function calculateFinalScore(dimensionScores) {
    const weights = {
        structure: 0.40,
        lexical: 0.30,
        behavior: 0.20,
        context: 0.10
    };

    let rawScore = 0;
    Object.keys(weights).forEach(dimension => {
        rawScore += dimensionScores[dimension] * weights[dimension];
    });

    // Normalisation : mapper le score brut sur 0-100
    // Score max théorique estimé : ~300 points
    const maxScore = 300;
    const normalized = (rawScore / maxScore) * 100;

    // Clamper entre 0 et 100
    return Math.max(0, Math.min(100, normalized));
}

/**
 * Calcule le score de confiance
 */
function calculateConfidence(patternResults, formatterInfo, context) {
    let confidence = 50; // Base

    // 1. Nombre de patterns détectés
    const aiPatterns = patternResults.filter(p => p.weight > 0 && p.immuneToFormatting);
    const humanMarkers = patternResults.filter(p => p.weight < 0);

    if (aiPatterns.length > 5) confidence += 20;
    if (aiPatterns.length > 10) confidence += 15;

    // 2. Présence de marqueurs humains forts
    if (humanMarkers.length > 3) {
        confidence += 25;
    }

    // 3. Formatter détecté = confiance réduite sur patterns formatage
    if (formatterInfo.hasFormatter) {
        confidence -= 10;
    }

    // 4. Mix patterns IA + humains = confiance réduite
    if (aiPatterns.length > 5 && humanMarkers.length > 2) {
        confidence -= 20;
    }

    // 5. Patterns immuns dominants = confiance augmentée
    const immuneScore = aiPatterns.reduce((sum, p) => sum + Math.abs(p.totalScore), 0);
    const totalScore = patternResults.reduce((sum, p) => sum + Math.abs(p.totalScore), 0);

    if (totalScore > 0 && immuneScore / totalScore > 0.7) {
        confidence += 15;
    }

    return Math.max(0, Math.min(100, confidence));
}

/**
 * Génère le verdict basé sur score et confiance
 */
export function getVerdict(score, confidence) {
    const thresholds = CONFIG.THRESHOLDS;

    if (confidence < 50) {
        return '🤷 Incertain - pas assez de signaux';
    }

    if (score < thresholds.HUMAN_MAX && confidence > 70) {
        return '✅ Probablement code humain';
    }

    if (score > thresholds.AI_VERY_LIKELY && confidence > 80) {
        return '🤖 Très probablement généré par IA';
    }

    if (score > thresholds.AI_LIKELY_MAX && confidence > 60) {
        return '⚠️ Probablement généré par IA';
    }

    if (score > thresholds.UNCERTAIN_MAX && confidence > 50) {
        return '❓ Possiblement IA ou code mixte';
    }

    return '❓ Mix probable IA/Humain';
}

/**
 * Vérifie si le fichier est auto-généré
 */
function isGeneratedFile(code) {
    const markers = CONFIG.GENERATED_FILE_MARKERS;

    // Vérifier les 50 premières lignes
    const firstLines = code.split('\n').slice(0, 50).join('\n');

    return markers.some(marker => firstLines.includes(marker));
}

/**
 * Analyse un repository complet
 * @param {Array} files - Liste des fichiers avec leur contenu
 * @param {Object} repoContext - Contexte du repo
 * @returns {Object} Résultats agrégés
 */
export function analyzeRepository(files, repoContext) {
    const results = files.map(file => ({
        path: file.path,
        ...analyzeFile(file.content, repoContext)
    }));

    // Calculer le score global
    const validResults = results.filter(r => r.score >= 0);
    const globalScore = validResults.length > 0
        ? validResults.reduce((sum, r) => sum + r.score, 0) / validResults.length
        : 0;

    // Calculer la confiance globale
    const globalConfidence = validResults.length > 0
        ? validResults.reduce((sum, r) => sum + r.confidence, 0) / validResults.length
        : 0;

    // Identifier les hotspots (fichiers les plus suspects)
    const hotspots = results
        .filter(r => r.score > 70)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

    // Stats par dossier
    const folderStats = calculateFolderStats(results);

    // Aggregate patterns
    const patternMap = {};
    results.forEach(fileResult => {
        if (fileResult.patterns) {
            fileResult.patterns.forEach(p => {
                if (!patternMap[p.id]) {
                    patternMap[p.id] = { ...p, count: 0, totalScore: 0 };
                }
                patternMap[p.id].count += p.count;
                patternMap[p.id].totalScore += p.totalScore;
            });
        }
    });
    const aggregatedPatterns = Object.values(patternMap).sort((a, b) => b.totalScore - a.totalScore);

    return {
        score: Math.round(globalScore), // Renommé pour correspondre à popup.js (results.score)
        confidence: Math.round(globalConfidence), // Ajouté
        totalFiles: files.length,
        analyzedFiles: validResults.length,
        results,
        hotspots,
        patterns: aggregatedPatterns, // Added aggregated patterns
        folderStats,
        summary: generateSummary(results)
    };
}

/**
 * Calcule les stats par dossier
 */
function calculateFolderStats(results) {
    const folderMap = {};

    results.forEach(result => {
        const parts = result.path.split('/');
        parts.pop(); // Retirer le nom du fichier

        let currentPath = '';
        parts.forEach(part => {
            currentPath += (currentPath ? '/' : '') + part;

            if (!folderMap[currentPath]) {
                folderMap[currentPath] = {
                    path: currentPath,
                    files: [],
                    totalScore: 0,
                    count: 0
                };
            }

            folderMap[currentPath].files.push(result);
            folderMap[currentPath].totalScore += result.score;
            folderMap[currentPath].count++;
        });
    });

    // Calculer les moyennes
    Object.values(folderMap).forEach(folder => {
        folder.averageScore = Math.round(folder.totalScore / folder.count);
    });

    return Object.values(folderMap);
}

/**
 * Génère un résumé textuel
 */
function generateSummary(results) {
    const thresholds = CONFIG.THRESHOLDS;

    const human = results.filter(r => r.score < thresholds.HUMAN_MAX).length;
    const uncertain = results.filter(r => r.score >= thresholds.HUMAN_MAX && r.score < thresholds.AI_LIKELY_MAX).length;
    const aiLikely = results.filter(r => r.score >= thresholds.AI_LIKELY_MAX).length;

    return {
        human,
        uncertain,
        aiLikely,
        total: results.length
    };
}

export default {
    analyzeFile,
    analyzeRepository
};
