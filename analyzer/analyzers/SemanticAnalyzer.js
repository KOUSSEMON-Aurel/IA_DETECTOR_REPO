/**
 * 🗣️ SEMANTIC ANALYZER
 * Analyse le langage naturel dans les commentaires.
 * L'IA utilise des tournures de phrases spécifiques ("We use X...", "This function...").
 */

export default class SemanticAnalyzer {
    analyze(code) {
        let aiScore = 0;

        // Extraire les commentaires
        const comments = this.extractComments(code);
        if (comments.length === 0) return 0;

        const aiTemplates = [
            /^This (function|method|class) (does|is|performs)/i,
            /^(Here|Below) (is|we have|you can find)/i,
            /^(Note|Important|Please note) that/i,
            /^(First|Then|Next|Finally),/i,
            /We (use|leverage|utilize)/i,
            /In order to/i,
            /As shown in/i
        ];

        const humanCasualPatterns = [
            /\b(lol|lmao|wtf|ffs|tbh|idk|dunno)\b/i,
            /\?\?\?/,
            /!!!+/,
            /(hack|workaround|ugly|dirty|messy|stupid|dumb)/i,
            /\b(stuff|thingy|crap|shit)\b/i,
            /TODO:.*\?/, // TODO interrogatif
            /FIXME/       // Souvent humain, l'IA met TODO
        ];

        let matchesAI = 0;
        let matchesHuman = 0;

        comments.forEach(comment => {
            if (aiTemplates.some(t => t.test(comment))) matchesAI++;
            if (humanCasualPatterns.some(p => p.test(comment))) matchesHuman++;
        });

        // Ratio
        const aiRatio = matchesAI / comments.length;
        const humanRatio = matchesHuman / comments.length;

        if (aiRatio > 0.3) aiScore += 40; // Beaucoup de templates
        if (humanRatio > 0.05) aiScore -= 30; // Traces humaines claires

        return Math.max(0, Math.min(100, aiScore));
    }

    extractComments(code) {
        const comments = [];
        // Block comments
        const block = code.match(/\/\*[\s\S]*?\*\//g) || [];
        block.forEach(c => {
            // Nettoyer les * et /
            const clean = c.replace(/\/\*|\*\/|\*/g, '').trim();
            if (clean) comments.push(clean);
        });

        // Line comments
        const lines = code.match(/\/\/.*/g) || [];
        lines.forEach(c => {
            const clean = c.replace(/\/\//, '').trim();
            if (clean) comments.push(clean);
        });

        return comments;
    }
}
