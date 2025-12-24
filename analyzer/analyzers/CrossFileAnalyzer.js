/**
 * 🌐 CROSS-FILE ANALYZER
 * Analyse la cohérence statistique entre plusieurs fichiers.
 * L'IA est trop constante, l'humain a des variations.
 */

export default class CrossFileAnalyzer {
    async analyze(files) {
        if (!files || files.length < 2) {
            return { score: 0, consistency: 'N/A', anomalies: 0 };
        }

        const metrics = files.map(f => ({
            name: f.name || f.path,
            avgLineLength: this.getAvgLineLength(f.content),
            commentRatio: this.getCommentRatio(f.content),
            namingVerbosity: this.getNamingVerbosity(f.content),
            indentation: this.detectIndentation(f.content)
        }));

        // Calculer l'écart-type (Standard Deviation) pour détecteur l'uniformité excessive
        const variabilities = {
            lineLength: this.calculateStdDev(metrics.map(m => m.avgLineLength)),
            commentRatio: this.calculateStdDev(metrics.map(m => m.commentRatio)),
            namingVerbosity: this.calculateStdDev(metrics.map(m => m.namingVerbosity))
        };

        let aiScore = 0;

        // 1. Uniformité Excessive (Signature IA)
        // L'IA tend à avoir une longueur de ligne moyenne très contrôlée (~40-60 chars) partout
        if (variabilities.lineLength < 5) aiScore += 25;

        // Ratio de commentaire constant (ex: toujours 10%)
        if (variabilities.commentRatio < 0.02) aiScore += 25;

        // Verbesité de nommage constante
        if (variabilities.namingVerbosity < 1.5) aiScore += 25;

        // 2. Duplication de Structure (Templates IA)
        // Difficile à faire cheap, on utilise une heuristique simple sur l'indentation
        const indentStyles = metrics.map(m => m.indentation);
        const uniqueIndents = new Set(indentStyles);
        // Si tout est parfaitement indenté pareil (ex: que des espaces 2), c'est suspect pour un vieux repo, 
        // mais normal pour un projet avec linter. On pondère moins.
        if (uniqueIndents.size === 1 && files.length > 5) aiScore += 10;

        return {
            score: Math.min(100, aiScore),
            consistency: aiScore > 50 ? 'High (Suspicious)' : 'Normal',
            anomalies: 0 // Placeholder pour détecter fichiers outliers
        };
    }

    // --- Helpers ---

    getAvgLineLength(code) {
        const lines = code.split('\n').filter(l => l.trim().length > 0);
        if (lines.length === 0) return 0;
        const total = lines.reduce((acc, l) => acc + l.length, 0);
        return total / lines.length;
    }

    getCommentRatio(code) {
        const lines = code.split('\n');
        let comments = 0;
        let codeLines = 0;
        lines.forEach(l => {
            const t = l.trim();
            if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*')) comments++;
            else if (t.length > 0) codeLines++;
        });
        return codeLines === 0 ? 0 : comments / codeLines;
    }

    getNamingVerbosity(code) {
        // Longueur moyenne des identifieurs (approx)
        const words = code.match(/\b[a-zA-Z_]\w*\b/g) || [];
        if (words.length === 0) return 0;
        const total = words.reduce((acc, w) => acc + w.length, 0);
        return total / words.length;
    }

    detectIndentation(code) {
        const match = code.match(/\n( +)\S/);
        return match ? match[1].length : 4; // Default 4
    }

    calculateStdDev(values) {
        if (values.length === 0) return 0;
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const squareDiffs = values.map(v => Math.pow(v - avg, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(avgSquareDiff);
    }
}
