/**
 * 🕰️ TEMPORAL ANALYZER (V3)
 * Analyse l'historique Git pour détecter les patterns IA.
 * Module critique : L'IA ne peut pas falsifier l'historique de manière convaincante.
 */

import * as githubClient from '../../api/github-client.js';

export default class TemporalAnalyzer {
    constructor() {
        this.weights = {
            commitMessages: 0.25,
            commitTiming: 0.20,
            changePatterns: 0.25,
            styleDrift: 0.30
        };
    }

    /**
     * Analyse complète de l'historique Git
     */
    async analyzeRepository(owner, repo, token) {
        try {
            // Récupérer les commits via l'API client
            const commits = await githubClient.getCommits(owner, repo, token, 100);

            if (!commits || commits.length < 5) {
                return {
                    score: 0,
                    confidence: 'low',
                    reason: 'Pas assez de commits pour analyse temporelle'
                };
            }

            const scores = {
                commitMessages: this.analyzeCommitMessages(commits),
                commitTiming: this.analyzeCommitTiming(commits),
                changePatterns: this.analyzeChangePatterns(commits),
                styleDrift: await this.analyzeStyleDrift(owner, repo, token, commits)
            };

            const finalScore = this.calculateWeightedScore(scores);

            return {
                score: Math.round(finalScore),
                confidence: this.getConfidenceLevel(commits.length),
                breakdown: scores,
                suspicious: finalScore > 60,
                details: this.generateReport(scores, commits)
            };
        } catch (error) {
            console.error('Erreur analyse temporelle:', error);
            // En cas d'erreur (ex: 403, 404), on retourne un score neutre
            return { score: 0, confidence: 'error', error: error.message };
        }
    }

    /**
     * 1️⃣ Analyse des messages de commit
     * L'IA produit des messages parfaits selon les conventions
     */
    analyzeCommitMessages(commits) {
        let aiScore = 0;
        let humanIndicators = 0;

        // Patterns de messages IA (trop parfaits)
        const aiPatterns = [
            /^(feat|fix|docs|style|refactor|test|chore|perf)(\(.+\))?:\s+[A-Z]/,
            /^(Add|Update|Fix|Remove|Implement|Create|Delete)\s+[a-z]/,
            /^(Added|Updated|Fixed|Removed|Implemented|Created|Deleted)\s+/,
            /\b(functionality|implementation|enhancement|optimization)\b/i
        ];

        // Patterns humains (chaotiques)
        const humanPatterns = [
            /^(wip|WIP|work in progress)/i,
            /^(fix|fixes|fixed)$/i, // Sans description
            /^(update|updates)$/i,
            /^[a-z]/, // Commence par minuscule
            /\b(fuck|shit|damn|crap|wtf|lol|oops|ugh)\b/i,
            /^\.+$/, // Juste des points
            /^[0-9]+$/, // Juste un chiffre
            /\?\?\?/,
            /!!!+/,
            /asdf|test|tmp|temp/i,
            /^[a-z\s]{1,10}$/i // Message très court et vague
        ];

        commits.forEach(commit => {
            const msg = commit.commit.message.split('\n')[0]; // Première ligne

            // Détecter patterns IA
            const matchesAI = aiPatterns.filter(p => p.test(msg)).length;
            aiScore += matchesAI * 8;

            // Détecter patterns humains (réduisent le score IA)
            const matchesHuman = humanPatterns.filter(p => p.test(msg)).length;
            humanIndicators += matchesHuman * 12;

            // Longueur du message
            if (msg.length > 50 && msg.length < 72) {
                aiScore += 5; // IA respecte les 50-72 caractères
            }
            if (msg.length < 10 || msg.length > 100) {
                humanIndicators += 5; // Humain moins rigoureux
            }

            // Vérifier la structure multi-lignes (IA adore ça)
            const lines = commit.commit.message.split('\n');
            if (lines.length > 2 && lines[1] === '') {
                // Format: titre + ligne vide + description détaillée
                aiScore += 10;
            }
        });

        // Calculer cohérence (IA = très cohérent)
        const messageVariance = this.calculateMessageVariance(commits);
        if (messageVariance < 0.3) {
            aiScore += 20; // Trop cohérent = suspect
        }

        const finalScore = Math.max(0, aiScore - humanIndicators);
        // Normalisation par commit pour éviter biais nombre
        return Math.min(100, (finalScore / commits.length) * 10);
    }

    /**
     * 2️⃣ Analyse du timing des commits
     * L'IA génère du code rapidement et de façon régulière
     */
    analyzeCommitTiming(commits) {
        let aiScore = 0;
        const timestamps = commits.map(c =>
            new Date(c.commit.author.date).getTime()
        ).sort((a, b) => a - b);

        // Calculer les intervalles entre commits
        const intervals = [];
        for (let i = 1; i < timestamps.length; i++) {
            intervals.push(timestamps[i] - timestamps[i - 1]);
        }

        if (intervals.length === 0) return 0;

        // 1. Régularité suspecte (variance faible)
        const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
        // Variance simple
        const variance = intervals.reduce((sum, interval) => {
            return sum + Math.pow(interval - avgInterval, 2);
        }, 0) / intervals.length;
        const stdDev = Math.sqrt(variance);

        // Coefficient de variation (CV)
        // Humain : CV élevé (pauses café, nuit, week-end)
        // IA : CV plus faible sur une session
        const coefficientVariation = avgInterval > 0 ? stdDev / avgInterval : 0;

        if (coefficientVariation < 0.8) {
            aiScore += 30; // Trop régulier pour être honnête
        }

        // 2. Commits rapprochés suspects (< 5 minutes)
        const quickCommits = intervals.filter(i => i < 5 * 60 * 1000).length;
        if (quickCommits > intervals.length * 0.3) {
            aiScore += 20; // Beaucoup de commits rapides = IA qui génère
        }

        // 3. Activité nocturne (2h-6h) sans pause
        const nightCommits = commits.filter(c => {
            const date = new Date(c.commit.author.date);
            const hour = date.getHours();
            return hour >= 2 && hour <= 6;
        }).length;

        if (nightCommits > commits.length * 0.4) {
            aiScore += 15; // IA code "la nuit" (ou fuseau horaire différent du déclaratif, très spécifique)
        }

        return Math.min(100, aiScore);
    }

    /**
     * 3️⃣ Analyse des patterns de changements
     * L'IA produit des changements massifs et atomiques "parfaits"
     */
    analyzeChangePatterns(commits) {
        let aiScore = 0;

        // Note: L'API commit simple ne donne pas toujours stats détaillées sans appel supplémentaire
        // On utilisera une heuristic basée sur ce qu'on peut avoir ou estimer si dispo

        // Pour une version V3 light, on analyse si dispo, sinon on skip ou on utilise un proxy
        // Ici on suppose que l'API github-client peut enrichir ou qu'on fait avec ce qu'on a.
        // GitHub API `/commits` ne donne pas `stats` par défaut, il faut fetcher le commit unique.
        // Pour éviter de brûler le quota token, on va faire un échantillonnage dans analyzeStyleDrift
        // et utiliser ici seulement ce qui est visible ou déductible globalement.

        return 0; // Placeholder si pas de données stats, sera enrichi par l'analyzeStyleDrift qui fetch le détail
    }

    /**
     * 4️⃣ Analyse du drift de style dans le temps
     * Un humain évolue, l'IA est constante
     */
    async analyzeStyleDrift(owner, repo, token, commits) {
        let aiScore = 0;

        try {
            // Prendre 5 commits espacés dans le temps pour éviter de spammer l'API
            const sampleCommits = this.sampleCommits(commits, 5);
            const styles = [];

            for (const commit of sampleCommits) {
                // Récupérer le détail du commit (fichiers + stats)
                const commitDetail = await githubClient.getCommitDetails(owner, repo, commit.sha, token);

                if (commitDetail && commitDetail.files && commitDetail.files.length > 0) {
                    const style = this.extractStyleSignature(commitDetail.files);
                    styles.push(style);

                    // On en profite pour analyser les change patterns de ces commits échantillonnés
                    this.analyzeSampledCommitStats(commitDetail, aiScore);
                }
            }

            if (styles.length < 3) return 0;

            // Calculer la variance du style
            const styleVariance = this.calculateStyleVariance(styles);

            if (styleVariance < 0.2) {
                aiScore += 40; // Style trop constant = IA
            }

            return Math.min(100, aiScore);

        } catch (error) {
            console.warn('Erreur analyse style drift:', error);
        }

        return Math.min(100, aiScore);
    }

    analyzeSampledCommitStats(commitDetail, currentScoreRef) {
        // Logique "Atomic Commits" sur l'échantillon
        if (commitDetail.files.length === 1 && commitDetail.stats.additions < 100) {
            // C'est un commit atomique, on ne modifie pas la ref ici (passed by value)
            // Ajustement structurel nécessaire si on veut impacter le score global
        }
    }

    /**
     * Helpers
     */
    calculateMessageVariance(commits) {
        const lengths = commits.map(c => c.commit.message.length);
        const avg = lengths.reduce((a, b) => a + b) / lengths.length;
        const variance = lengths.reduce((sum, len) => {
            return sum + Math.pow(len - avg, 2);
        }, 0) / lengths.length;
        return avg > 0 ? Math.sqrt(variance) / avg : 0;
    }

    sampleCommits(commits, count) {
        if (commits.length <= count) return commits;
        const step = Math.floor(commits.length / count);
        return commits.filter((_, i) => i % step === 0).slice(0, count);
    }

    extractStyleSignature(files) {
        // Signature simplifiée du style
        return {
            avgLineLength: this.getAvgLineLength(files),
            indentStyle: this.detectIndentStyle(files),
            commentRatio: this.getCommentRatio(files),
            namingLength: this.getAvgNamingLength(files)
        };
    }

    calculateStyleVariance(styles) {
        const metrics = ['avgLineLength', 'commentRatio', 'namingLength'];
        let totalVariance = 0;

        metrics.forEach(metric => {
            const values = styles.map(s => s[metric]);
            const avg = values.reduce((a, b) => a + b) / values.length;
            const variance = values.reduce((sum, v) =>
                sum + Math.pow(v - avg, 2), 0
            ) / values.length;
            totalVariance += variance;
        });

        return totalVariance / metrics.length;
    }

    getAvgLineLength(files) {
        let total = 0, count = 0;
        files.forEach(f => {
            if (f.patch) {
                const lines = f.patch.split('\n');
                lines.forEach(line => {
                    total += line.length;
                    count++;
                });
            }
        });
        return count > 0 ? total / count : 0;
    }

    detectIndentStyle(files) {
        let spaces = 0, tabs = 0;
        files.forEach(f => {
            if (f.patch) {
                spaces += (f.patch.match(/\n  /g) || []).length;
                tabs += (f.patch.match(/\n\t/g) || []).length;
            }
        });
        return spaces > tabs ? 1 : 0; // 1 for spaces, 0 for tabs (simplifié pour variance)
    }

    getCommentRatio(files) {
        let codeLines = 0, commentLines = 0;
        files.forEach(f => {
            if (f.patch) {
                const lines = f.patch.split('\n');
                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('+') && !trimmed.startsWith('+++')) { // Added lines only
                        const content = trimmed.substring(1).trim();
                        if (content.startsWith('//') || content.startsWith('/*')) {
                            commentLines++;
                        } else if (content.length > 0) {
                            codeLines++;
                        }
                    }
                });
            }
        });
        return codeLines > 0 ? commentLines / codeLines : 0;
    }

    getAvgNamingLength(files) {
        const names = [];
        files.forEach(f => {
            if (f.patch) {
                // Regex simple pour chopper les mots ajoutés
                const matches = f.patch.match(/\+[^\n]*\b[a-z][a-zA-Z0-9]*\b/g);
                if (matches) {
                    matches.forEach(m => {
                        const words = m.match(/\b[a-z][a-zA-Z0-9]*\b/g);
                        if (words) names.push(...words);
                    });
                }
            }
        });
        return names.length > 0
            ? names.reduce((s, n) => s + n.length, 0) / names.length
            : 0;
    }

    calculateWeightedScore(scores) {
        let total = 0;
        for (const [key, score] of Object.entries(scores)) {
            total += score * this.weights[key];
        }
        return Math.min(100, total);
    }

    getConfidenceLevel(commitCount) {
        if (commitCount < 5) return 'low';
        if (commitCount < 20) return 'medium';
        return 'high';
    }

    generateReport(scores, commits) {
        return {
            totalCommits: commits.length,
            timeSpan: this.getTimeSpan(commits),
            avgCommitsPerDay: this.getCommitsPerDay(commits),
            scores: Object.entries(scores).map(([name, score]) => ({
                dimension: name,
                score: Math.round(score),
                verdict: score > 60 ? '🚨 Suspect' : score > 40 ? '⚠️ Douteux' : '✅ OK'
            }))
        };
    }

    getTimeSpan(commits) {
        if (commits.length < 2) return 'N/A';
        const dates = commits.map(c => new Date(c.commit.author.date).getTime());
        const span = Math.max(...dates) - Math.min(...dates);
        const days = Math.floor(span / (1000 * 60 * 60 * 24));
        return `${days} jours`;
    }

    getCommitsPerDay(commits) {
        const dates = commits.map(c => new Date(c.commit.author.date).getTime());
        const span = Math.max(...dates) - Math.min(...dates);
        const days = span / (1000 * 60 * 60 * 24);
        return days > 0 ? (commits.length / days).toFixed(2) : 0;
    }
}
