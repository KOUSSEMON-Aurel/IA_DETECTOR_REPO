/**
 * Analyse de la Complexité Cognitive
 * L'IA simplifie trop (naïf) ou complexifie inutilement (académique).
 * L'humain est pragmatique (complexité "juste milieu" ou sale).
 */

export function analyzeCognitive(code) {
    // Métriques brutes
    const ifs = (code.match(/\bif\b/g) || []).length;
    const elses = (code.match(/\belse\b/g) || []).length;
    const fors = (code.match(/\bfor\b/g) || []).length;
    const whiles = (code.match(/\bwhile\b/g) || []).length;
    const returns = (code.match(/\breturn\b/g) || []).length;
    const switches = (code.match(/\bswitch\b/g) || []).length;
    const catches = (code.match(/\bcatch\b/g) || []).length;

    const complexity = ifs + elses + fors + whiles + switches + catches;

    // Ratios
    const lines = code.split('\n').length;
    const density = lines > 0 ? complexity / lines : 0;

    // Détection "Trop Académique" (Over-engineering)
    // Ex: Beaucoup de returns par rapport aux décisions (early returns excessifs typiques IA)
    // ou Wrapper functions inutiles
    const isAcademic = returns > (ifs * 1.5) && complexity < 10;

    // Détection "Trop Simple" (Naïf)
    const isNaive = complexity < 3 && lines > 20; // Code long mais plat (ex: liste de données ou config, ou IA qui hallucine du boilerplate)

    // Score
    let cognitiveScore = 0;

    // L'IA est souvent dans une "Uncanny Valley" de complexité : 
    // soit ultra simple (boilerplate), soit inutilement complexe (patterns).

    if (isAcademic) cognitiveScore += 30;
    if (isNaive) cognitiveScore += 10;

    // Bonus: Abstraction prématurée (Classes/Factories pour rien)
    const abstractionPatterns = [
        /class \w+Factory/g,
        /interface I\w+/g,
        /abstract class/g
    ];
    let abstractionCount = 0;
    abstractionPatterns.forEach(p => abstractionCount += (code.match(p) || []).length);

    if (abstractionCount > 0 && complexity < 5) {
        cognitiveScore += 40; // Factory pour un truc simple = IA probable
    }

    return {
        score: cognitiveScore,
        details: {
            complexity,
            density: density.toFixed(2),
            isAcademic,
            isNaive,
            abstractionCount
        }
    };
}
