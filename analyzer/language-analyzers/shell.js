/**
 * Analyseur spécifique pour les langages de script (Bash, PowerShell, Batch)
 */

/**
 * Patterns spécifiques Bash/Shell
 */
export const SHELL_PATTERNS = [
    {
        id: 'sh-echo-headers-excessive',
        name: "En-têtes 'echo' décoratifs excessifs",
        weight: 6,
        detect: (code) => {
            // Détecte les blocs echo décoratifs que les IA adorent
            // ex: echo "=================================="
            const decorationRegex = /echo\s+['"][-=#*]{10,}['"]/g;
            return (code.match(decorationRegex) || []).length;
        }
    },
    {
        id: 'sh-set-euo-pipefail-comment',
        name: "Commentaire explicatif pour 'set -euo pipefail'",
        weight: 7,
        detect: (code) => {
            // L'IA explique TOUJOURS ce que fait set -euo pipefail
            const regex = /set\s+-euo\s+pipefail[\s\S]{0,100}#.*(exit|stop|fail)/i;
            return regex.test(code) ? 1 : 0;
        }
    },
    {
        id: 'sh-if-then-fi-perfect',
        name: "Safeguards paranoïaques sur chaque variable",
        weight: 5,
        detect: (code) => {
            // Vérification systématique si variable vide : if [ -z "$VAR" ]; then
            const checkRegex = /if\s*\[\s*-z\s+"\$\w+"\s*\];\s*then/g;
            const count = (code.match(checkRegex) || []).length;
            return count > 3 ? 1 : 0;
        }
    }
];

/**
 * Patterns spécifiques PowerShell
 */
export const POWERSHELL_PATTERNS = [
    {
        id: 'ps-write-host-colors',
        name: "Write-Host avec couleurs (Cyan/Green)",
        weight: 6,
        detect: (code) => {
            // IA aime Write-Host "Message" -ForegroundColor Green
            const regex = /Write-Host\s+.*-ForegroundColor\s+(Green|Cyan|Yellow)/gi;
            const count = (code.match(regex) || []).length;
            return count > 2 ? 1 : 0;
        }
    },
    {
        id: 'ps-param-blocks-perfect',
        name: "Blocs Param() complets pour scripts simples",
        weight: 7,
        detect: (code) => {
            // Bloc Parmam avec [Parameter(Mandatory=$true)] pour tout
            const regex = /\[Parameter\(Mandatory\s*=\s*\$true\)\]/gi;
            const count = (code.match(regex) || []).length;
            return count > 2 ? 1 : 0;
        }
    },
    {
        id: 'ps-try-catch-everything',
        name: "Try-Catch autour de commandes simples",
        weight: 5,
        detect: (code) => {
            const tryCount = (code.match(/try\s*\{/gi) || []).length;
            const lines = code.split('\n').length;
            // Si beaucoup de try pour un petit script
            return (tryCount > 0 && lines < 20) || tryCount > 5 ? 1 : 0;
        }
    }
];

/**
 * Patterns spécifiques Batch (Windows .bat/.cmd)
 */
export const BATCH_PATTERNS = [
    {
        id: 'bat-goto-eof',
        name: "GOTO :EOF systématique",
        weight: 6,
        detect: (code) => {
            const regex = /GOTO\s+:EOF/gi;
            return (code.match(regex) || []).length > 2 ? 1 : 0;
        }
    },
    {
        id: 'bat-echo-off-comment',
        name: "Commentaire '@echo off'",
        weight: 4,
        detect: (code) => {
            // IA commente souvent pourquoi elle met echo off
            return /@echo off\s*rem\s+/i.test(code) ? 1 : 0;
        }
    },
    {
        id: 'bat-pause-nul',
        name: "pause >nul pour attendre",
        weight: 5,
        detect: (code) => {
            // IA utilise souvent pause >nul au lieu de timeout
            return /pause\s*>\s*nul/i.test(code) ? 1 : 0;
        }
    }
];

/**
 * Analyseur unifié pour les scripts
 */
export function analyzeShellScript(code, extension) {
    const results = [];
    let patternsToUse = [];

    if (extension === '.ps1') {
        patternsToUse = POWERSHELL_PATTERNS;
    } else if (extension === '.bat' || extension === '.cmd') {
        patternsToUse = BATCH_PATTERNS;
    } else {
        // .sh, .bash, .zsh
        patternsToUse = SHELL_PATTERNS;
    }

    patternsToUse.forEach(pattern => {
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
    analyzeShellScript,
    SHELL_PATTERNS,
    POWERSHELL_PATTERNS,
    BATCH_PATTERNS
};
