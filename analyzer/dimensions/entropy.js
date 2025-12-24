/**
 * Analyse de l'Entropie Sémantique
 * L'IA tend à avoir une "régularité robotique" (faible variance).
 * L'humain est "chaotique mais cohérent".
 */

export function analyzeEntropy(code) {
    const lines = code.split('\n').filter(l => l.trim().length > 0);

    if (lines.length === 0) {
        return {
            score: 0,
            details: { lowEntropy: false, variance: 0 }
        };
    }

    // 1. Variance de la longueur des lignes
    const lengths = lines.map(ls => ls.length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((a, b) => a + Math.pow(b - avgLength, 2), 0) / lengths.length;

    // 2. Uniformité de l'espacement (Lignes vides consécutives, régularité des blocs)
    // On cherche si les fonctions sont espacées de manière trop parfaite (ex: tjs 2 lignes)
    const rawLines = code.split('\n');
    let emptyLineGaps = [];
    let currentGap = 0;

    for (const line of rawLines) {
        if (line.trim().length === 0) {
            currentGap++;
        } else {
            if (currentGap > 0) {
                emptyLineGaps.push(currentGap);
                currentGap = 0;
            }
        }
    }

    // Si code trop court, pas d'analyse pertinente
    if (emptyLineGaps.length < 3) {
        return {
            score: 0,
            metric: 0, // Neutre
            details: {
                lowEntropy: false,
                variance: variance,
                spacingUniformity: 0,
                parenthesesRatio: 0
            }
        };
    }

    // Calcul perfection espacement (si 80% des gaps sont identiques)
    const gapCounts = {};
    let maxGapCount = 0;
    emptyLineGaps.forEach(g => {
        gapCounts[g] = (gapCounts[g] || 0) + 1;
        if (gapCounts[g] > maxGapCount) maxGapCount = gapCounts[g];
    });
    const spacingUniformity = maxGapCount / emptyLineGaps.length;

    // 3. Surcharge de parenthèses (Tic IA: (a && b) là où a && b suffit)
    const parenthesesCount = (code.match(/\(|\)/g) || []).length;
    const parenthesesRatio = parenthesesCount / lines.length;

    // === VERDICT ===
    // Une variance très faible (< 150) sur un fichier moyen est suspecte
    const isLowVariance = variance < 150 && lines.length > 20;
    const isRoboticSpacing = spacingUniformity > 0.8;

    let entropyScore = 0;
    if (isLowVariance) entropyScore += 40;
    if (isRoboticSpacing) entropyScore += 30;
    if (parenthesesRatio > 1.5) entropyScore += 10; // Bonus suspiscion

    return {
        score: entropyScore, // 0 à ~100
        metric: variance,
        details: {
            lowEntropy: isLowVariance,
            variance: Math.round(variance),
            spacingUniformity: spacingUniformity.toFixed(2),
            parenthesesRatio: parenthesesRatio.toFixed(2)
        }
    };
}
