/**
 * CORTEX ENGINE V2 - Système de scoring comportemental avancé
 * Remplace l'ancien système linéaire par une approche multi-dimensionnelle non-linéaire.
 */

import { ALL_PATTERNS } from './patterns.js';
import { detectAutoFormatting } from './formatter-detector.js';
import CONFIG from '../config/settings.js';

// Import des nouvelles dimensions V2
import { analyzeEntropy } from './dimensions/entropy.js';
import { analyzeFingerprint } from './dimensions/fingerprint.js';
import { analyzeCognitive } from './dimensions/cognitive.js';
import { analyzeHallucination } from './dimensions/hallucination.js';
import { analyzeChaos } from './dimensions/chaos.js';

/**
 * Analyse un fichier avec le moteur V2
 */
export function analyzeFile(code, context = {}) {
    // 0. Vérification préliminaire (Fichiers auto-générés)
    if (isGeneratedFile(code)) {
        return { score: 0, confidence: 100, verdict: 'Fichier auto-généré (exclu)', details: {} };
    }

    const formatterInfo = detectAutoFormatting([]); // Améliorable avec contexte réel

    // === PHASE 1 : EXTRACTION DES SIGNAUX (Dimensions) ===

    // 1. Entropie & Régularité (Low Variance = AI)
    const entropyResult = analyzeEntropy(code);

    // 2. Fingerprinting (Modèles spécifiques)
    const fingerprintResult = analyzeFingerprint(code);

    // 3. Complexité Cognitive (Académique vs Pragmatique)
    const cognitiveResult = analyzeCognitive(code);

    // 4. Hallucinations & Logique (Erreurs IA)
    const hallucinationResult = analyzeHallucination(code);

    // 5. Chaos Constructif (Humanité)
    const chaosResult = analyzeChaos(code);

    // 6. Analyse Stylistique V1 (Patterns classiques)
    // On garde l'ancien moteur comme "6ème sens" stylistique
    const stylisticResult = runLegacyPatterns(code, formatterInfo);

    // === PHASE 2 : FUSION & RAISONNEMENT (Méta-scoring) ===

    const finalAnalysis = computeBayesianScore({
        entropy: entropyResult,
        fingerprint: fingerprintResult,
        cognitive: cognitiveResult,
        hallucination: hallucinationResult,
        chaos: chaosResult,
        stylistic: stylisticResult
    });

    return {
        score: Math.round(finalAnalysis.score),
        confidence: Math.round(finalAnalysis.confidence),
        verdict: getVerdict(finalAnalysis.score, finalAnalysis.confidence),

        // Structure de données enrichie pour l'UI
        details: {
            dimensions: {
                entropy: entropyResult,
                fingerprint: fingerprintResult,
                cognitive: cognitiveResult,
                hallucination: hallucinationResult,
                chaos: chaosResult,
                stylistic: stylisticResult
            },
            reasons: finalAnalysis.reasons,
            humanSigns: finalAnalysis.humanSigns
        },
        // Rétro-compatibilité pour l'UI existante
        patterns: stylisticResult.patterns,
        breakdown: finalAnalysis.breakdown
    };
}

/**
 * Moteur de raisonnement non-linéaire
 */
function computeBayesianScore(signals) {
    let score = 0;
    let confidence = 50;
    const reasons = [];
    const humanSigns = [];

    // --- FACTEURS D'ACCUSATION (IA) ---

    // 1. Entropie (Le robot discipliné)
    if (signals.entropy.details.lowEntropy) {
        score += 25;
        reasons.push("Entropie anormalement basse (Code robotique)");
    } else if (signals.entropy.score > 10) {
        score += 10;
        reasons.push("Régularité suspecte");
    }

    // 2. Fingerprint (Le flagrant délit)
    if (signals.fingerprint.score > 0) {
        score += signals.fingerprint.score; // +40, +80...
        reasons.push(`Signature modèle détectée : ${signals.fingerprint.details.detected || 'Inconnu'}`);
        confidence += 30; // Preuve forte
    }

    // 3. Cognitif (L'intello artificiel)
    if (signals.cognitive.details.isAcademic) {
        score += 20;
        reasons.push("Structure académique excessive");
    }
    if (signals.cognitive.details.abstractionCount > 0) {
        score += 15;
        reasons.push("Abstraction prématurée (Over-engineering)");
    }

    // 4. Hallucination (L'erreur de la machine)
    if (signals.hallucination.score > 0) {
        score += signals.hallucination.score;
        reasons.push("Artefacts ou code fantôme détectés");
    }

    // 5. Stylistique (L'accent étranger)
    // On normalise le score V1 (0-300) vers (0-40) pour le V2
    const styleContribution = Math.min(40, signals.stylistic.totalScore / 5);
    score += styleContribution;
    if (styleContribution > 20) {
        reasons.push("Patterns linguistiques IA forts");
    }

    // --- FACTEURS DE DISCULPATION (HUMAIN) ---

    // 6. Chaos (L'humain bordélique)
    if (signals.chaos.score > 0) {
        // Le chaos humain a un pouvoir "Veto" fort
        score -= signals.chaos.score;
        confidence += 20; // On est sûr que c'est humain
        signals.chaos.details.signs.forEach(s => humanSigns.push(s));
    }

    // --- NORMALISATION FINALE ---

    // Clamp 0-100
    score = Math.max(0, Math.min(100, score));

    // Calcul Confiance
    if (signals.fingerprint.score > 50) confidence = 95;
    if (signals.chaos.score > 50) confidence = 90;

    // Breakdown pour l'UI (mapping approximatif vers les anciennes catégories)
    const breakdown = {
        structure: (signals.entropy.score + signals.cognitive.score),
        lexical: (styleContribution + signals.fingerprint.score),
        behavior: (signals.hallucination.score),
        context: (signals.chaos.score * -1) // Négatif car humain
    };

    return { score, confidence, reasons, humanSigns, breakdown };
}

/**
 * Exécute les anciens patterns (V1) en mode silencieux pour le signal stylistique
 */
function runLegacyPatterns(code, formatterInfo) {
    const results = [];
    let totalScore = 0;

    ALL_PATTERNS.forEach(pattern => {
        try {
            const count = pattern.detect(code);
            if (count !== 0) {
                let weight = pattern.weight;
                if (!pattern.immuneToFormatting && formatterInfo.hasFormatter) {
                    weight *= 0.5; // On réduit l'impact du style si formatté
                }
                const pScore = count * weight;
                totalScore += pScore;

                results.push({
                    id: pattern.id,
                    name: pattern.name,
                    count,
                    weight,
                    totalScore: pScore
                });
            }
        } catch (e) { /* ignore */ }
    });

    return { patterns: results, totalScore };
}

export function getVerdict(score, confidence) {
    if (confidence < 40) return '🤷 Analyse incertaine';
    if (score > 85) return '🤖 IA Quasi-Certaine';
    if (score > 65) return '⚠️ Probablement IA';
    if (score > 40) return '❓ Code Mixte / Assisté';
    if (score < 20) return '✅ Code Humain';
    return '👤 Probablement Humain';
}

function isGeneratedFile(code) {
    const markers = CONFIG.GENERATED_FILE_MARKERS || ['GENERATED CODE', 'Auto-generated'];
    const firstLines = code.split('\n').slice(0, 20).join('\n');
    return markers.some(m => firstLines.includes(m));
}

// Stub pour compatibilité repo-scanner (à implémenter si besoin d'analyse dossier V2)
export function analyzeRepository(files, context) {
    const results = files.map(f => ({
        path: f.path,
        ...analyzeFile(f.content)
    }));

    const validResults = results.filter(r => r.score >= 0);

    // 1. Score & Confiance Global
    const globalScore = validResults.length > 0
        ? validResults.reduce((sum, r) => sum + r.score, 0) / validResults.length
        : 0;

    const globalConfidence = validResults.length > 0
        ? validResults.reduce((sum, r) => sum + r.confidence, 0) / validResults.length
        : 0;

    // 2. Verdict Global
    const verdict = getVerdict(globalScore, globalConfidence);

    // 3. Resumé (Count Human vs AI)
    const summary = {
        human: validResults.filter(r => r.score < 20).length,
        uncertain: validResults.filter(r => r.score >= 20 && r.score < 65).length,
        aiLikely: validResults.filter(r => r.score >= 65).length,
        total: files.length
    };

    // 4. Aggrégation des Patterns
    const patternMap = {};
    validResults.forEach(r => {
        if (r.patterns) {
            r.patterns.forEach(p => {
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
        score: Math.round(globalScore),
        confidence: Math.round(globalConfidence),
        verdict,
        results,
        hotspots: results.filter(r => r.score > 70).slice(0, 10),
        summary,
        patterns: aggregatedPatterns,
        totalFiles: files.length,
        analyzedFiles: validResults.length
    };
}

export default { analyzeFile, analyzeRepository };
