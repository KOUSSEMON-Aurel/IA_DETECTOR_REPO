/**
 * ⚡ PERFORMANCE ANALYZER
 * Détecte les patterns d'optimisation prématurée ou académiques typiques de l'IA.
 */

export default class PerformanceAnalyzer {
    analyze(code) {
        let aiScore = 0;

        // L'IA utilise des structures complexes inutilement (Over-engineering)
        const overEngineeredPatterns = [
            /new Map\(\).*\.set\(.*\.set\(/s, // Chaining Map set
            /new Set\(\[.*\]\)/,               // Set init avec array literal statique
            /\.reduce\(.*\).*\.map\(/s,        // Chaines fonctionnelles complexes (vs boucle simple)
            /Object\.freeze\(/,                // Obsession immutabilité
            /WeakMap|WeakSet/,                 // Structures rares
            /Array\.from\({.*length:/,         // Array.from pour range
            /useCallback\(.*\[\]\)/            // React optimisation triviale
        ];

        overEngineeredPatterns.forEach(pattern => {
            if (pattern.test(code)) aiScore += 15;
        });

        // Loop unrolling manuel (tres rare mtn mais l'IA aime bien parfois)
        // ou recursion terminale explicite

        return Math.min(100, aiScore);
    }
}
