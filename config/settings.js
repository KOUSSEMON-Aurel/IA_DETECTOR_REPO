/**
 * Configuration globale de Vibe Coding Detector
 */

export const CONFIG = {
    // Seuils de détection
    THRESHOLDS: {
        HUMAN_MAX: 30,        // 0-30% : Probablement humain
        UNCERTAIN_MAX: 60,    // 30-60% : Mix ou incertain
        AI_LIKELY_MAX: 80,    // 60-80% : Probablement IA
        AI_VERY_LIKELY: 80    // 80-100% : Très probablement IA
    },

    // Langages supportés
    // Langages supportés (Liste exhaustive)
    SUPPORTED_LANGUAGES: {
        // === Cœur & Web ===
        javascript: { extensions: ['.js', '.jsx', '.mjs', '.cjs'], enabled: true },
        typescript: { extensions: ['.ts', '.tsx'], enabled: true },
        html: { extensions: ['.html', '.htm'], enabled: true },
        css: { extensions: ['.css', '.scss', '.sass', '.less'], enabled: true },

        // === Scripting & Backend ===
        python: { extensions: ['.py', '.pyw', '.ipynb'], enabled: true },
        php: { extensions: ['.php', '.phtml', '.laravel'], enabled: true },
        ruby: { extensions: ['.rb', '.rake', 'Gemfile'], enabled: true },
        perl: { extensions: ['.pl', '.pm'], enabled: true },
        lua: { extensions: ['.lua'], enabled: true },
        tcl: { extensions: ['.tcl'], enabled: true },

        // === Compilés & Système ===
        java: { extensions: ['.java', '.jsp'], enabled: true },
        c: { extensions: ['.c', '.h'], enabled: true },
        cpp: { extensions: ['.cpp', '.hpp', '.cc', '.cxx', '.h++'], enabled: true },
        csharp: { extensions: ['.cs'], enabled: true },
        go: { extensions: ['.go'], enabled: true },
        rust: { extensions: ['.rs'], enabled: true },
        swift: { extensions: ['.swift'], enabled: true },
        kotlin: { extensions: ['.kt', '.kts'], enabled: true },
        scala: { extensions: ['.scala', '.sc'], enabled: true },
        objectivec: { extensions: ['.m', '.mm'], enabled: true },

        // === Shell & Ops ===
        shell: { extensions: ['.sh', '.bash', '.zsh', '.ksh', '.fish'], enabled: true },
        powershell: { extensions: ['.ps1', '.psm1'], enabled: true },
        batch: { extensions: ['.bat', '.cmd'], enabled: true },
        docker: { extensions: ['Dockerfile', '.dockerignore'], enabled: true },
        makefile: { extensions: ['Makefile', '.mk'], enabled: true },
        cmake: { extensions: ['CMakeLists.txt', '.cmake'], enabled: true },

        // === Data & Config ===
        sql: { extensions: ['.sql', '.mysql', '.pgsql'], enabled: true },
        graphql: { extensions: ['.graphql', '.gql'], enabled: true },
        yaml: { extensions: ['.yaml', '.yml'], enabled: true },
        json: { extensions: ['.json', '.json5'], enabled: true },
        xml: { extensions: ['.xml', '.xaml'], enabled: true },
        markdown: { extensions: ['.md', '.markdown'], enabled: true },
        toml: { extensions: ['.toml'], enabled: true },
        ini: { extensions: ['.ini', '.cfg', '.conf'], enabled: true },

        // === Autres / Historiques / Spécialisés ===
        r: { extensions: ['.r', '.R'], enabled: true },
        julia: { extensions: ['.jl'], enabled: true },
        dart: { extensions: ['.dart'], enabled: true },
        elixir: { extensions: ['.ex', '.exs'], enabled: true },
        haskell: { extensions: ['.hs'], enabled: true },
        erlang: { extensions: ['.erl'], enabled: true },
        clojure: { extensions: ['.clj', '.cljs'], enabled: true },
        fsharp: { extensions: ['.fs', '.fsx'], enabled: true },
        ocaml: { extensions: ['.ml', '.mli'], enabled: true },
        visualbasic: { extensions: ['.vb', '.vbs', '.bas'], enabled: true },
        assembly: { extensions: ['.asm', '.s'], enabled: true },
        solidity: { extensions: ['.sol'], enabled: true },
        cobol: { extensions: ['.cbl', '.cob'], enabled: true },
        fortran: { extensions: ['.f', '.f90'], enabled: true },
        pascal: { extensions: ['.pas'], enabled: true },
        ada: { extensions: ['.adb', '.ads'], enabled: true },
        prolog: { extensions: ['.pl', '.pro'], enabled: true },
        lisp: { extensions: ['.lisp', '.lsp'], enabled: true },
        apex: { extensions: ['.cls'], enabled: true },
        matlab: { extensions: ['.m'], enabled: true },
        verilog: { extensions: ['.v', '.sv'], enabled: true },
        vhdl: { extensions: ['.vhd', '.vhdl'], enabled: true }
    },

    // Exclusions de fichiers/dossiers
    EXCLUSIONS: [
        'node_modules',
        'dist',
        'build',
        '.next',
        'vendor',
        'venv',
        '__pycache__',
        '.git',
        'coverage',
        'out',
        '.cache',
        'tmp',
        'temp',
        'public/assets',
        'static/vendor',
        // Fichiers générés
        '*.min.js',
        '*.bundle.js',
        '*.generated.*',
        'package-lock.json',
        'yarn.lock',
        'poetry.lock'
    ],

    // Fichiers auto-générés (score = 0)
    GENERATED_FILE_MARKERS: [
        '// This file is auto-generated',
        '// @generated',
        '// DO NOT EDIT',
        '# AUTO-GENERATED',
        '# @generated',
        '@generated SignedSource',
        'Code generated by'
    ],

    // Configs de formatage automatique
    FORMATTER_CONFIGS: [
        '.prettierrc',
        '.prettierrc.json',
        '.prettierrc.js',
        'prettier.config.js',
        '.eslintrc',
        '.eslintrc.json',
        '.eslintrc.js',
        '.eslintrc.yml',
        'pyproject.toml',
        '.editorconfig',
        '.clang-format',
        'phpcs.xml',
        '.php-cs-fixer.php'
    ],

    // Cache
    CACHE: {
        enabled: true,
        ttl: 24 * 60 * 60 * 1000, // 24 heures
        maxSize: 100 // nombre max de repos en cache
    },

    // Limites de performance
    PERFORMANCE: {
        maxConcurrentScans: 5,
        maxFileSize: 1024 * 1024, // 1MB
        scanTimeout: 30000, // 30 secondes par fichier
        maxFilesPerRepo: 1000 // limite pour éviter surcharge
    },

    // API Rate Limiting
    RATE_LIMIT: {
        github: {
            requestsPerHour: 60, // sans auth
            requestsPerHourAuthenticated: 5000
        },
        gitlab: {
            requestsPerHour: 600
        }
    },

    // Stockage
    STORAGE: {
        saveHistory: false, // Par défaut stateless
        maxHistoryEntries: 50
    },

    // UI
    UI: {
        theme: 'auto', // 'light', 'dark', 'auto'
        animations: true,
        showDetailedPatterns: true
    }
};

export default CONFIG;
