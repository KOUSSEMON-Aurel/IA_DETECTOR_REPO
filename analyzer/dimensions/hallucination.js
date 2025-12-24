/**
 * Détection d'Hallucination Corrigée
 * L'IA fait des erreurs subtiles (imports inutilisés, variables fantômes).
 * Elle déclare des choses "au cas où".
 */

export function analyzeHallucination(code) {
    const lines = code.split('\n');
    let ghostScore = 0;
    let details = [];

    // 1. Imports fantômes (Basic Regex Check - imparfait mais statiquement efficace)
    // On extrait les imports et on cherche si le nom est utilisé ailleurs
    const importRegex = /import\s+(?:{\s*([\w,\s]+)\s*}|(\w+))\s+from/g;
    let match;

    // Note: Pour une vraie robustesse, il faudrait un parser AST complet.
    // Ici on fait une approximation textuelle suffisante pour le "Vibe Check".

    // On nettoie le code des imports pour la recherche
    const codeBody = code.replace(/import\s+.*;/g, '');

    while ((match = importRegex.exec(code)) !== null) {
        const namedImports = match[1]; // { Foo, Bar }
        const defaultImport = match[2]; // Baz

        const importsToCheck = [];
        if (defaultImport) importsToCheck.push(defaultImport);
        if (namedImports) {
            importsToCheck.push(...namedImports.split(',').map(s => s.trim()));
        }

        importsToCheck.forEach(imp => {
            if (imp) {
                // Recherche simple du token (attention aux faux positifs partielles, on utilise \b)
                const usageRegex = new RegExp(`\\b${imp}\\b`);
                if (!usageRegex.test(codeBody)) {
                    ghostScore += 15;
                    details.push(`Unused import: ${imp}`);
                }
            }
        });
    }

    // 2. Variables déclarées mais inutilisées (const x = ...)
    // Difficile sans AST, on cible les patterns évidents de l'IA
    // L'IA fait souvent : const result = await service.call(); return []; (relicat)
    const unusedConstRegex = /const\s+(\w+)\s*=\s*[^;]+;/g;
    while ((match = unusedConstRegex.exec(code)) !== null) {
        const varName = match[1];
        // On cherche si varName est utilisé APRES sa déclaration
        const restOfCode = code.substring(match.index + match[0].length);
        if (!restOfCode.includes(varName)) {
            // C'est un gros indicateur d'IA (ou de dev très étourdi)
            ghostScore += 10;
            details.push(`Unused var: ${varName}`);
        }
    }

    return {
        score: Math.min(100, ghostScore),
        details: {
            ghosts: details
        }
    };
}
