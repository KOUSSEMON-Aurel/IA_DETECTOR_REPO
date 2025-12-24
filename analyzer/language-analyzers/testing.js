/**
 * Analyseur spécifique pour les fichiers de tests
 * Détecte les patterns typiques des tests générés par IA
 */

export const TEST_PATTERNS = [
    {
        id: 'test-naming-convention-verbose',
        name: "Noms de tests ultra-descriptifs (Should...When...)",
        weight: 8,
        detect: (code) => {
            // Ex: it('should return user data when valid id provided', ...)
            const regex = /['"]should\s+[a-z\s]+when\s+[a-z\s]+['"]/gi;
            const count = (code.match(regex) || []).length;
            return count > 2 ? 1 : 0;
        }
    },
    {
        id: 'test-aaa-pattern',
        name: "Commentaires AAA explicites (Arrange, Act, Assert)",
        weight: 7,
        detect: (code) => {
            const arrange = /^\s*\/\/\s*Arrange/mi.test(code);
            const act = /^\s*\/\/\s*Act/mi.test(code);
            const assert = /^\s*\/\/\s*Assert/mi.test(code);
            // IA aime mettre les 3 systématiquement
            return (arrange && act && assert) ? 1 : 0;
        }
    },
    {
        id: 'test-trivial-getters',
        name: "Tests de getters/setters triviaux",
        weight: 9,
        detect: (code) => {
            // Ex: expect(user.getName()).toBe('John')
            // Souvent généré pour booster la coverage artificiellement
            const regex = /expect\(\w+\.get\w+\(\)\)\.toBe\(/g;
            const count = (code.match(regex) || []).length;
            return count > 3 ? 1 : 0;
        }
    },
    {
        id: 'test-mock-everything',
        name: "Mocks excessifs et répétitifs",
        weight: 6,
        detect: (code) => {
            const mockRegex = /jest\.fn\(\)|mockReturnValue|spyOn/g;
            const formatRegex = /beforeEach\(\(\)\s*=>\s*{[\s\S]*?}\)/g;

            const mockCount = (code.match(mockRegex) || []).length;
            const hasBeforeEach = formatRegex.test(code);

            // Si beaucoup de mocks et setup systématique
            return mockCount > 5 && hasBeforeEach ? 1 : 0;
        }
    },
    {
        id: 'test-given-when-then',
        name: "Structure Gherkin rigide dans commentaires",
        weight: 6,
        detect: (code) => {
            const regex = /\/\/\s*(Given|When|Then):/g;
            return (code.match(regex) || []).length > 3 ? 1 : 0;
        }
    }
];

/**
 * Patterns pour scripts de test/automation (Python/Shell)
 */
export const SCRIPT_TEST_PATTERNS = [
    {
        id: 'script-echo-steps',
        name: "Script: Echo de chaque étape (Step 1, Step 2...)",
        weight: 7,
        detect: (code) => {
            const regex = /echo\s+['"]Step\s+\d+:/gi;
            return (code.match(regex) || []).length > 2 ? 1 : 0;
        }
    },
    {
        id: 'script-hardcoded-sleep',
        name: "Script: Sleep arbitraires pour 'attendre' que ça marche",
        weight: 5,
        detect: (code) => {
            return (code.match(/sleep\s+[1-5]\b/g) || []).length > 2 ? 1 : 0;
        }
    },
    {
        id: 'script-cleanup-paranoid',
        name: "Script: Nettoyage paranoïaque (rm -rf forcés)",
        weight: 6,
        detect: (code) => {
            // IA aime faire du rm -rf sur des vars temporaires avec garde-fous
            const regex = /rm\s+-rf\s+"\$\w+"/g;
            return (code.match(regex) || []).length > 1 ? 1 : 0;
        }
    }
];

/**
 * Analyseur spécifique pour fichiers de test
 */
export function analyzeTestFile(code, filename) {
    const results = [];
    const isTestFile = filename.includes('test') || filename.includes('spec');
    const isScript = filename.match(/\.(sh|py|bat|ps1)$/);

    if (isTestFile) {
        TEST_PATTERNS.forEach(pattern => {
            if (pattern.detect(code)) {
                results.push({
                    id: pattern.id,
                    name: pattern.name,
                    weight: pattern.weight,
                    count: 1,
                    category: 'testing'
                });
            }
        });
    }

    if (isScript) {
        SCRIPT_TEST_PATTERNS.forEach(pattern => {
            if (pattern.detect(code)) {
                results.push({
                    id: pattern.id,
                    name: pattern.name,
                    weight: pattern.weight,
                    count: 1,
                    category: 'script_automation'
                });
            }
        });
    }

    return results;
}

export default {
    analyzeTestFile,
    TEST_PATTERNS,
    SCRIPT_TEST_PATTERNS
};
