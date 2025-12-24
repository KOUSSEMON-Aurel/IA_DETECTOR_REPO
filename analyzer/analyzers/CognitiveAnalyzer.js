/**
 * 🧠 COGNITIVE ANALYZER
 * Détecte la "profondeur de pensée" du code.
 * L'IA tend à produire du code plat (faible nesting) et sans "hacks" créatifs.
 */

export default class CognitiveAnalyzer {
    constructor() {
        // Poids et Seuils
    }

    analyze(ast) {
        // Note: Sans un vrai parser AST complet (comme Babel/Acorn) disponible dans l'environnement extension,
        // on fait une analyse heuristique basée sur les tokens et l'indentation qui simule la complexité.
        // Si AST est fourni (ex: via un parser léger), on l'utilise.
        // Ici on suppose qu'on reçoit l'AST ou qu'on analyse le code brut si AST manquant.

        // Pour cette implémentation, on va faire une analyse lexicale avancée
        // car embarquer un full parser JS est lourd pour une extension.

        // Si AST est passé et valide, on l'utiliserait. Sinon -> analyse textuelle intelligente.
        return this.analyzeCognitiveComplexityText(ast); // ast est ici potentiellement le code ou un objet
    }

    analyzeCognitiveComplexityText(sourceCode) {
        if (typeof sourceCode !== 'string') return 0;

        let maxNestingDepth = 0;
        let avgNestingDepth = 0;
        let unconventionalPatterns = 0;
        let currentDepth = 0;
        let totalDepth = 0;
        let lines = sourceCode.split('\n');
        let logicLines = 0;

        // 1. Analyse Nesting (par indentation et accolades)
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;
            logicLines++;

            // Heuristique simple pour la profondeur (indentation 2 ou 4 espaces)
            const spaces = line.match(/^(\s*)/)[0].length;
            const indentLevel = Math.floor(spaces / 2); // Assume 2 spaces per indent

            if (trimmed.endsWith('{')) currentDepth++;
            if (trimmed.startsWith('}')) currentDepth--;

            maxNestingDepth = Math.max(maxNestingDepth, currentDepth);
            totalDepth += currentDepth;
        });

        avgNestingDepth = logicLines > 0 ? totalDepth / logicLines : 0;

        // 2. Détection patterns non-conventionnels (Human Hacks)
        const humanHacks = [
            /\!\!/, // Double bang
            /~~/, // Double tilde
            /\|0/, // Asm.js style int cast
            /void 0/, // undefined safe
            /\? \S+ : \S+ \?/, // Nested ternary (souvent déconseillé mais utilisé par humains)
            /for\s*\(\s*;/ // Infinite for loop (vs while true)
        ];

        humanHacks.forEach(img => {
            if (img.test(sourceCode)) unconventionalPatterns++;
        });

        // 3. Score Cognitive
        // L'IA évite le nesting profond (>4) et les ambiguités
        let aiScore = 0;

        // Pénalité pour code trop plat (typique IA simple)
        if (maxNestingDepth < 3 && logicLines > 20) {
            aiScore += 30;
        }

        // Pénalité pour code trop "propre/standard" (pas de hacks)
        if (unconventionalPatterns === 0 && logicLines > 10) {
            aiScore += 20;
        }

        // Bonus si structure " textbook" (if-else if-else if...)
        const elseIfCount = (sourceCode.match(/else if/g) || []).length;
        if (elseIfCount > 3) aiScore += 15;

        return Math.min(100, aiScore);
    }
}
