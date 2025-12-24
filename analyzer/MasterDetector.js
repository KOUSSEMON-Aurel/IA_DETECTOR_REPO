/**
 * 🎯 MASTER DETECTOR (V3 Ultimate)
 * Orchestre tous les analyseurs (V1 Patterns, V2 Dimensions, V3 Temporal/Smells/Cognitive/etc)
 * et produit le verdict final pondéré.
 */

import TemporalAnalyzer from './analyzers/TemporalAnalyzer.js';
import HumanSmellDetector from './analyzers/HumanSmellDetector.js';
import CrossFileAnalyzer from './analyzers/CrossFileAnalyzer.js';
import CognitiveAnalyzer from './analyzers/CognitiveAnalyzer.js';
import SemanticAnalyzer from './analyzers/SemanticAnalyzer.js';
import PerformanceAnalyzer from './analyzers/PerformanceAnalyzer.js';

// Import V2 Analyzers (Legacy core)
import { analyzeFile as analyzeV2 } from './scorer.js';

export default class MasterDetector {
    constructor() {
        // Poids de chaque dimension (total = ~1.0)
        // Basé sur la demande "Vibe Coding Detector - Améliorations Avancées"
        this.weights = {
            // V2 Components (Legacy remapped) - 27%
            linguistic: 0.06,
            structure: 0.06,
            naming: 0.05,
            documentation: 0.05,
            formatting: 0.05,

            // V3 New Components - 73%
            temporal: 0.18,      // ⭐ Git History
            humanSmells: -0.17,  // ⭐ Preuves humaines (Bonus négatif)
            crossFile: 0.14,     // ⭐ Cohérence globale
            cognitive: 0.10,     // ⭐ Profondeur
            contextual: 0.08,    // ⭐ Intégration repo
            semantic: 0.06,      // ⭐ NLP
            errorPatterns: -0.05,// ⭐ Erreurs humaines (Bonus négatif)
            performance: 0.05    // ⭐ Over-engineering
        };

        // Initialiser les analyseurs
        this.temporalAnalyzer = new TemporalAnalyzer();
        this.humanSmellDetector = new HumanSmellDetector();
        this.crossFileAnalyzer = new CrossFileAnalyzer();
        this.cognitiveAnalyzer = new CognitiveAnalyzer();
        this.semanticAnalyzer = new SemanticAnalyzer();
        this.performanceAnalyzer = new PerformanceAnalyzer();
    }

    /**
     * 🚀 Analyse COMPLÈTE d'un repository
     */
    async analyzeRepository(owner, repo, token, files, options = {}) {
        const startTime = Date.now();

        try {
            // Étape 1 : Analyse Temporelle (Git History)
            let temporalResult = { score: 0, confidence: 'low', details: null };
            if (options.deepScan !== false && token) {
                temporalResult = await this.temporalAnalyzer.analyzeRepository(owner, repo, token);
            }

            // Étape 2 : Analyse Cross-Fichiers (Cohérence)
            const crossFileResult = await this.crossFileAnalyzer.analyze(files);

            // Étape 3 : Analyse approfondie par fichier
            const fileResults = await Promise.all(files.map(file => this.analyzeOneFile(file, files)));

            // Étape 4 : Score Global
            const globalScore = this.calculateGlobalScore({
                temporal: temporalResult.score,
                crossFile: crossFileResult.score,
                files: fileResults
            });

            // Étape 5 : Génération Rapport
            return this.generateReport({
                globalScore,
                temporalResult,
                crossFileResult,
                fileResults,
                metadata: {
                    owner,
                    repo,
                    fileCount: files.length,
                    scanDuration: Date.now() - startTime,
                    deepScan: !!options.deepScan
                }
            });

        } catch (error) {
            console.error('[MasterDetector] Fatal Error:', error);
            throw error;
        }
    }

    /**
     * Analyse unitaire d'un fichier (Aggrégation V2 + V3)
     */
    async analyzeOneFile(file, allFiles) {
        const code = file.content;

        // 1. Analyse V2 (Patterns de base)
        const v2Result = analyzeV2(code);
        // On décompose le score V2 pour remplir les dimensions linguistic/structure/etc
        // (Approximation car scorer.js donne un score unifié, on projette selon les patterns trouvés)
        const v2Dimensions = this.projectV2Score(v2Result);

        // 2. Nouvelles Analyses V3
        const smells = this.humanSmellDetector.detectTraces(code); // Retourne { score: 0-100, traces: [] } (Human proof)
        // Humain Smells inclut Dead Code, Magic Numbers, Debugging traces...

        const cognitive = this.cognitiveAnalyzer.analyze(code);
        const semantic = this.semanticAnalyzer.analyze(code);
        const performance = this.performanceAnalyzer.analyze(code);

        // Contextual (Heuristique simple: ressemblance style indentation avec les autres)
        const contextual = this.analyzeContext(file, allFiles);

        // Error Patterns (partie de human smells ou séparé?)
        // On va dire que smells couvre aussi les "Error Patterns" pour simplifier ou créer un mini-detecteur inline
        const errorPatterns = this.detectErrorPatterns(code);

        // Aggrégation des scores
        const scores = {
            ...v2Dimensions, // linguistic, structure, naming, documentation, formatting
            humanSmells: smells.score, // Négatif
            cognitive: cognitive,
            contextual: contextual,
            semantic: semantic,
            errorPatterns: errorPatterns, // Négatif
            performance: performance
        };

        // Score fichier unifié pour l'affichage liste
        // On exclut temporal et crossFile qui sont globaux
        // On recalcule un weighted score local
        const finalScore = this.calculateLocalFileScore(scores);

        return {
            path: file.path,
            filename: file.path.split('/').pop(),
            score: Math.round(finalScore), // Anciennement finalScore
            finalScore: Math.round(finalScore), // Compatibilité
            verdict: this.getVerdict(finalScore),
            confidence: v2Result.confidence,
            breakdown: scores, // Détail V3
            details: v2Result.details, // Détail V2 (entropy etc)
            smells: smells, // Pour l'affichage "Human"
            lineCount: code.split('\n').length,
            language: 'javascript' // TODO: detecter real lang
        };
    }

    calculateGlobalScore({ temporal, crossFile, files }) {
        const avgFileScore = files.reduce((acc, f) => acc + f.score, 0) / files.length;

        // Poids globaux vs locaux
        // On suit la logique: Temporal (Global) + CrossFile (Global) + Moyenne Fichiers
        // On utilise les poids définis dans le constructor, mais appliqués au niveau global

        // On simplifie pour avoir un score global cohérent :
        // 30% Temporal + 15% CrossFile + 55% Moyenne Fichiers

        // Ou mieux, on utilise les poids atomiques si possible. 
        // Mais "temporal" est une dimension unique.

        let score = 0;
        let totalWeight = 0;

        // 1. Temporal
        score += temporal * 0.30;
        totalWeight += 0.30;

        // 2. CrossFile
        score += crossFile * 0.15;
        totalWeight += 0.15;

        // 3. Moyenne Fichiers
        score += avgFileScore * 0.55;
        totalWeight += 0.55;

        return Math.min(100, Math.round(score));
    }

    calculateLocalFileScore(scores) {
        // Exclut Temporal et CrossFile
        let total = 0;
        let weightSum = 0;

        // Dimensions locales
        const localDims = ['linguistic', 'structure', 'naming', 'documentation', 'formatting',
            'cognitive', 'semantic', 'performance', 'contextual'];
        const bonusDims = ['humanSmells', 'errorPatterns']; // Négatifs

        localDims.forEach(key => {
            total += (scores[key] || 0) * this.weights[key];
            weightSum += this.weights[key];
        });

        // Appliquer Malus/Bonus (score négatif = preuve humain = baisse le score IA)
        bonusDims.forEach(key => {
            // scores[key] est 0-100. weight est négatif.
            // ex: smells=50 * -0.17 = -8.5 points sur le score IA
            total += (scores[key] || 0) * this.weights[key];
            // On n'ajoute pas au weightSum car c'est un modifieur
        });

        // Normaliser sur la somme des poids positifs
        const normalized = weightSum > 0 ? (total / weightSum) * (weightSum * 100) : total;
        // Wait, ma logique de pondération est un peu "custom". 
        // Simplifions: Somme pondérée directe. Si tout est IA max => ~100.

        // Recalcul simple:
        // On assume que la somme des poids positifs ~ 0.8 (car ~0.2 est global)
        // Donc on divise par la somme des poids locaux pour ramener sur 100

        let localWeightSum = localDims.reduce((acc, k) => acc + this.weights[k], 0); // ex: 0.5
        let baseScore = 0;
        localDims.forEach(key => baseScore += (scores[key] || 0) * this.weights[key]);

        let final = (baseScore / localWeightSum); // 0-100 théorique si smells=0

        // Appliquer bonus
        let deduction = 0;
        bonusDims.forEach(key => {
            deduction += (scores[key] || 0) * Math.abs(this.weights[key]);
        });

        return Math.max(0, Math.min(100, final - deduction));
    }

    projectV2Score(v2Result) {
        // Scorer V2 retourne un score unique. On le diffuse.
        // Si patterns trouvés, on pourrait affiner.
        const s = v2Result.score;
        return {
            linguistic: s,
            structure: s,
            naming: s,
            documentation: s,
            formatting: s
        };
    }

    analyzeContext(file, allFiles) {
        // Comparaison simple indentation vs moyenne autres
        return 0; // TODO implémenter pour V4
    }

    detectErrorPatterns(code) {
        // Check "human errors" like typos in strings
        const typos = ['teh ', 'recieve', 'seperator', 'calender'];
        let count = 0;
        typos.forEach(t => { if (code.includes(t)) count++; });

        // Off-by-one check simple
        if (code.match(/<= \w+\.length/)) count++;

        return Math.min(100, count * 20);
    }

    generateReport(data) {
        const { globalScore, temporalResult, crossFileResult, fileResults, metadata } = data;

        const suspicious = fileResults.filter(r => r.score >= 65);
        const questionable = fileResults.filter(r => r.score >= 30 && r.score < 65);
        const clean = fileResults.filter(r => r.score < 30);

        return {
            summary: {
                globalScore,
                verdict: this.getVerdict(globalScore),
                confidence: metadata.deepScan ? 'high' : 'medium',
                scanDuration: metadata.scanDuration,
                fileCount: metadata.fileCount
            },
            temporal: temporalResult,
            crossFile: crossFileResult,
            distribution: {
                suspicious: suspicious.length,
                questionable: questionable.length,
                clean: clean.length
            },
            files: {
                suspicious: suspicious.slice(0, 50),
                questionable: questionable.slice(0, 50),
                clean: clean.slice(0, 50)
            },
            topPatterns: this.extractUltimatePatterns(fileResults, temporalResult)
        };
    }

    extractUltimatePatterns(fileResults, temporalResult) {
        // Combiner patterns V2 + V3
        const counts = {};

        // Patterns fichiers
        fileResults.forEach(r => {
            // V3 High Scores
            if (r.breakdown.cognitive > 60) counts['🧠 Complexité Cognitive IA'] = (counts['🧠 Complexité Cognitive IA'] || 0) + 1;
            if (r.breakdown.semantic > 60) counts['💬 Sémantique IA'] = (counts['💬 Sémantique IA'] || 0) + 1;
            if (r.breakdown.performance > 60) counts['⚡ Over-engineering'] = (counts['⚡ Over-engineering'] || 0) + 1;
            if (r.smells.score > 30) counts['👤 Traces Humaines'] = (counts['👤 Traces Humaines'] || 0) + 1;

            // V2 Patterns (si dispos dans details.reasons)
            if (r.details && r.details.reasons) {
                r.details.reasons.forEach(reason => counts[reason] = (counts[reason] || 0) + 1);
            }
        });

        // Patterns Temporal
        if (temporalResult && temporalResult.breakdown) {
            if (temporalResult.breakdown.commitTiming > 60) counts['🕰️ Timing Commit Suspect'] = 1;
            if (temporalResult.breakdown.styleDrift > 60) counts['🤖 Style Statique (Drift 0)'] = 1;
        }

        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10) // Top 10
            .map(([pattern, count]) => ({
                pattern,
                occurrences: count,
                percentage: Math.round((count / (fileResults.length || 1)) * 100)
            }));
    }

    getVerdict(score) {
        if (score >= 80) return '🤖 IA Quasi-Certaine';
        if (score >= 60) return '⚠️ Probablement IA';
        if (score >= 40) return '❓ Code Mixte';
        if (score >= 20) return '✅ Probablement Humain';
        return '✅ Code Humain';
    }
}
