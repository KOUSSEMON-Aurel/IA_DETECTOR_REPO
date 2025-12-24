/**
 * Analyseur spécifique pour Python
 */

/**
 * Patterns spécifiques Python
 */
export const PYTHON_SPECIFIC_PATTERNS = [
    {
        id: 'py-type-hints-perfect',
        name: "Type hints parfaits partout",
        weight: 8,
        detect: (code) => {
            const functionDefs = (code.match(/def\s+\w+\(/g) || []).length;
            const typedFunctions = (code.match(/def\s+\w+\([^)]*:\s*\w+/g) || []).length;

            if (functionDefs === 0) return 0;
            const ratio = typedFunctions / functionDefs;

            // 100% de type hints = suspect (rare en Python legacy)
            return ratio > 0.95 && functionDefs > 3 ? 1 : 0;
        }
    },
    {
        id: 'py-docstring-google-style',
        name: "Docstrings Google/NumPy style parfaits",
        weight: 7,
        detect: (code) => {
            // Détecte les docstrings structurés
            const googleStyleRegex = /"""\s*(Args:|Returns:|Raises:|Examples?:)/g;
            const docstringCount = (code.match(googleStyleRegex) || []).length;
            const functionCount = (code.match(/def\s+\w+/g) || []).length;

            if (functionCount === 0) return 0;
            const ratio = docstringCount / functionCount;

            // Si presque toutes les fonctions ont docstring structuré = suspect
            return ratio > 0.7 ? 1 : 0;
        }
    },
    {
        id: 'py-pep8-perfect',
        name: "PEP8 compliance à 100%",
        weight: 5,
        detect: (code) => {
            const lines = code.split('\n');

            // Vérifier quelques règles PEP8
            let violations = 0;

            lines.forEach(line => {
                // Lignes > 79 caractères
                if (line.length > 79) violations++;

                // Espaces autour des opérateurs
                if (/\w+[+\-*\/]=\w+/.test(line)) violations++;
            });

            // Si 0 violations = trop parfait
            return violations === 0 && lines.length > 50 ? 1 : 0;
        }
    },
    {
        id: 'py-list-comprehension-only',
        name: "List comprehensions uniquement (jamais de boucles)",
        weight: 6,
        detect: (code) => {
            const comprehensionCount = (code.match(/\[.+\s+for\s+.+\s+in\s+.+\]/g) || []).length;
            const forLoopCount = (code.match(/\bfor\s+\w+\s+in\s+/g) || []).length - comprehensionCount;

            // Si beaucoup de comprehensions mais jamais de for loops = suspect
            return comprehensionCount > 5 && forLoopCount === 0 ? 1 : 0;
        }
    },
    {
        id: 'py-pathlib-always',
        name: "Utilise toujours pathlib (jamais os.path)",
        weight: 4,
        detect: (code) => {
            const pathlibCount = (code.match(/from\s+pathlib\s+import|Path\(/g) || []).length;
            const osPathCount = (code.match(/os\.path\./g) || []).length;

            // Pathlib moderne mais refus total de os.path = suspect
            return pathlibCount > 0 && osPathCount === 0 && code.includes('path') ? 1 : 0;
        }
    },
    {
        id: 'py-f-strings-perfect',
        name: "F-strings à 100% (jamais .format() ou %)",
        weight: 5,
        detect: (code) => {
            const fStringCount = (code.match(/f["']/g) || []).length;
            const formatCount = (code.match(/\.format\(/g) || []).length;
            const percentCount = (code.match(/"%/g) || []).length;

            const total = fStringCount + formatCount + percentCount;

            if (total === 0) return 0;
            const ratio = fStringCount / total;

            // 100% f-strings = très moderne (suspect si code "legacy")
            return ratio === 1.0 && fStringCount > 3 ? 1 : 0;
        }
    }
];

/**
 * Analyse spécifique Python
 */
export function analyzePython(code) {
    const results = [];

    PYTHON_SPECIFIC_PATTERNS.forEach(pattern => {
        const count = pattern.detect(code);
        if (count > 0) {
            results.push({
                id: pattern.id,
                name: pattern.name,
                weight: pattern.weight,
                count
            });
        }
    });

    return results;
}

export default {
    analyzePython,
    PYTHON_SPECIFIC_PATTERNS
};
