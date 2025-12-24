/**
 * 🎨 HUMAN SMELL DETECTOR (V3)
 * Détecte les défauts et traces typiquement humains.
 * L'IA est trop parfaite. L'humain laisse des "odeurs" (Smells).
 * Score NÉGATIF : Plus on en trouve, plus le score IA baisse.
 */

export default class HumanSmellDetector {
    /**
     * Analyse un fichier pour trouver des traces humaines
     */
    detectTraces(code) {
        let humanScore = 0;
        const traces = [];

        // 1. Dead code (Code commenté en masse)
        const commentedBlocks = code.match(/\/\/\s*(const|let|var|function|if|return)\s+/g) || [];
        if (commentedBlocks.length > 0) {
            humanScore += commentedBlocks.length * 5;
            traces.push('Blocs de code commenté');
        }

        // 2. Magic Numbers (ex: if (val > 42))
        // L'IA utilise des constantes nommées (MAX_RETRIES), l'humain des chiffres bruts
        const magicNumbers = code.match(/[^a-zA-Z_0-9](3000|8080|42|100|500)[^a-zA-Z_0-9]/g);
        if (magicNumbers && magicNumbers.length > 0) {
            humanScore += magicNumbers.length * 3;
            traces.push('Nombres magiques non déclarés');
        }

        // 3. Debugging leftovers (console.log 'test', 'here')
        const debugPatterns = [
            /console\.(log|debug|warn)\(['"](test|here|coucou|wtf|check)['"]\)/i,
            /console\.log\(['"][-=]{5,}/, // Séparateurs de debug visuel
            /debugger;/
        ];

        debugPatterns.forEach(p => {
            if (p.test(code)) {
                humanScore += 20;
                traces.push('Traces de debug (console/debugger)');
            }
        });

        // 4. Frustration & Langage familier
        const emotionPatterns = [
            /TODO:?\s*(fix|refactor|remove)/i,
            /FIXME/i,
            /HACK/i,
            /wtf/i,
            /shit|crap|damn/i,
            /bizarre/i,
            /pas toucher/i,
            /ne marche pas/i
        ];

        emotionPatterns.forEach(p => {
            if (p.test(code)) {
                humanScore += 15;
                traces.push('Commentaires émotionnels/argotiques');
            }
        });

        // 5. Typos communes (L'IA ne fait pas de fautes)
        const typos = [
            /lenght/, /heigth/, /widht/, /referrence/, /adress/, /succes/
        ];
        typos.forEach(p => {
            if (p.test(code)) {
                humanScore += 10;
                traces.push('Fautes de frappe (Typos)');
            }
        });

        return {
            score: Math.min(100, humanScore),
            traces: [...new Set(traces)] // Uniques
        };
    }
}
