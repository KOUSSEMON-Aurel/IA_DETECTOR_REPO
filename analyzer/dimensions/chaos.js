/**
 * Analyse du "Chaos Constructif"
 * Les humains font des trucs bizarres mais efficaces.
 * Un code "trop propre" est suspect. Un code "organiquement sale" est humain.
 */

export function analyzeChaos(code) {
    let humanScore = 0;
    const signs = [];

    // 1. Hacks explicites et commentaires honnêtes
    // L'IA est toujours polie et professionnelle. L'humain est... humain.
    const hackPatterns = [
        /HACK:/i,
        /FIXME:/i,
        /TODO: fix/i,
        /quick fix/i,
        /dirty/i,
        /wtf/i,
        /temporary solution/i,
        /don'?t touch/i
    ];

    hackPatterns.forEach(p => {
        if (p.test(code)) {
            humanScore += 20;
            signs.push("Constructive Hack found");
        }
    });

    // 2. Code mort laissé en commentaire
    // L'IA ne laisse pas de vieux code commenté par défaut.
    const commentedCodeRegex = /\/\/\s*(const|let|var|function|if|return)\s+/g;
    const commentedBlocks = (code.match(commentedCodeRegex) || []).length;

    if (commentedBlocks > 2) {
        humanScore += 25;
        signs.push("Dead code artifacts");
    }

    // 3. Incohérence des Quotes (Mélange ' et ")
    // Si c'est mélangé, c'est souvent humain (copier-coller de différentes sources sans Prettier)
    const singleQuotes = (code.match(/'/g) || []).length;
    const doubleQuotes = (code.match(/"/g) || []).length;

    if (singleQuotes > 5 && doubleQuotes > 5) {
        // Calcul ratio pour éviter le cas où y'a juste 1 quote isolée
        const ratio = Math.min(singleQuotes, doubleQuotes) / Math.max(singleQuotes, doubleQuotes);
        if (ratio > 0.2) {
            humanScore += 15;
            signs.push("Inconsistent Quotes");
        }
    }

    // 4. Debug prints laissés "oops"
    const debugPatterns = [
        /console\.log\(['"]here['"]\)/,
        /console\.log\(['"]test['"]\)/,
        /console\.log\(['"]aaaaaaaa['"]\)/
    ];
    if (debugPatterns.some(p => p.test(code))) {
        humanScore += 30; // Très humain
        signs.push("Debug leftovers");
    }

    return {
        // Le score Chaos est un score "HUMANITÉ". Il viendra soustraire le score IA.
        score: Math.min(100, humanScore),
        details: {
            signs
        }
    };
}
