/**
 * Analyseur spécifique pour JavaScript/TypeScript
 */

/**
 * Patterns spécifiques JavaScript/TypeScript
 */
export const JS_SPECIFIC_PATTERNS = [
    {
        id: 'js-async-await-only',
        name: "Async/await uniquement (jamais .then())",
        weight: 7,
        detect: (code) => {
            const asyncAwaitCount = (code.match(/\b(async|await)\b/g) || []).length;
            const thenCount = (code.match(/\.then\(/g) || []).length;

            // Si beaucoup d'async/await mais JAMAIS de .then = suspect
            return asyncAwaitCount > 5 && thenCount === 0 ? 1 : 0;
        }
    },
    {
        id: 'js-const-excessive',
        name: "Utilisation excessive de const (>95%)",
        weight: 6,
        detect: (code) => {
            const constCount = (code.match(/\bconst\s+/g) || []).length;
            const letCount = (code.match(/\blet\s+/g) || []).length;
            const total = constCount + letCount;

            if (total === 0) return 0;
            const ratio = constCount / total;

            return ratio > 0.95 ? 1 : 0;
        }
    },
    {
        id: 'js-arrow-functions-only',
        name: "Arrow functions uniquement",
        weight: 5,
        detect: (code) => {
            const arrowCount = (code.match(/=>\s*{/g) || []).length;
            const functionCount = (code.match(/\bfunction\s+\w+/g) || []).length;

            return arrowCount > 5 && functionCount === 0 ? 1 : 0;
        }
    },
    {
        id: 'ts-perfect-typing',
        name: "TypeScript: Type annotations parfaites partout",
        weight: 7,
        detect: (code) => {
            // Vérifier si c'est du TypeScript
            if (!code.includes(': ') || !code.match(/:\s*(string|number|boolean|any)/)) {
                return 0;
            }

            // Compter les fonctions avec types vs sans types
            const functionRegex = /function\s+\w+\([^)]*\):\s*\w+/g;
            const typedFunctions = (code.match(functionRegex) || []).length;

            const allFunctions = (code.match(/function\s+\w+/g) || []).length;

            if (allFunctions === 0) return 0;
            const ratio = typedFunctions / allFunctions;

            // 100% de typage = suspect pour du code réel
            return ratio === 1.0 && allFunctions > 3 ? 1 : 0;
        }
    },
    {
        id: 'react-useCallback-excessive',
        name: "React: useCallback/useMemo excessifs",
        weight: 6,
        detect: (code) => {
            if (!code.includes('React') && !code.includes('useState')) {
                return 0;
            }

            const useCallbackCount = (code.match(/useCallback\(/g) || []).length;
            const useMemoCount = (code.match(/useMemo\(/g) || []).length;
            const functionComponentCount = (code.match(/const\s+\w+\s*=\s*\([^)]*\)\s*=>/g) || []).length;

            const total = useCallbackCount + useMemoCount;

            // Si presque toutes les fonctions sont wrapped = over-optimization
            return functionComponentCount > 0 && total / functionComponentCount > 0.8 ? 1 : 0;
        }
    },
    {
        id: 'react-cleanup-always-present',
        name: "React: cleanup dans useEffect toujours présent",
        weight: 5,
        detect: (code) => {
            const useEffectRegex = /useEffect\(\(\)\s*=>\s*{[\s\S]*?return\s*\(\)\s*=>/g;
            const cleanupCount = (code.match(useEffectRegex) || []).length;
            const totalUseEffect = (code.match(/useEffect\(/g) || []).length;

            // Si 100% des useEffect ont cleanup = suspect (pas toujours nécessaire)
            return totalUseEffect > 0 && cleanupCount === totalUseEffect && totalUseEffect > 2 ? 1 : 0;
        }
    }
];

/**
 * Analyse spécifique JavaScript/TypeScript
 */
export function analyzeJavaScript(code) {
    const results = [];

    JS_SPECIFIC_PATTERNS.forEach(pattern => {
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
    analyzeJavaScript,
    JS_SPECIFIC_PATTERNS
};
