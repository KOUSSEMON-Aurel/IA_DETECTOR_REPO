/**
 * Base de données des extensions de fichiers par langage
 * Couvre l'ensemble des langages demandés
 */
export const EXTENSIONS_MAP = {
    // Langages compilés traditionnels
    c: ['.c', '.h'],
    cpp: ['.cpp', '.hpp', '.cc', '.cxx', '.c++', '.h++'],
    csharp: ['.cs'],
    java: ['.java'],
    go: ['.go'],
    rust: ['.rs'],
    swift: ['.swift'],
    objectivec: ['.m', '.mm', '.h'],
    ada: ['.adb', '.ads'],
    pascal: ['.pas', '.pp'],
    fortran: ['.f', '.f90', '.f95'],
    cobol: ['.cbl', '.cob'],
    d: ['.d'],
    nim: ['.nim'],
    zig: ['.zig'],
    haskell: ['.hs', '.lhs'],
    ocaml: ['.ml', '.mli'],
    fsharp: ['.fs', '.fsi', '.fsx'],
    erlang: ['.erl', '.hrl'],
    elixir: ['.ex', '.exs'],

    // Langages interprétés et de script
    python: ['.py', '.pyw', '.ipynb'],
    javascript: ['.js', '.mjs', '.cjs'],
    typescript: ['.ts', '.tsx'],
    ruby: ['.rb', '.rake'],
    perl: ['.pl', '.pm'],
    php: ['.php', '.phtml'],
    lua: ['.lua'],
    r: ['.r', '.R'],
    julia: ['.jl'],
    tcl: ['.tcl'],
    rexx: ['.rexx', '.rex'],

    // Shell et script système
    shell: ['.sh', '.bash', '.zsh', '.ksh', '.fish', '.csh'],
    powershell: ['.ps1', '.psm1'],
    batch: ['.bat', '.cmd'],

    // Langages web
    html: ['.html', '.htm'],
    css: ['.css', '.scss', '.sass', '.less'],
    dart: ['.dart'],
    coffeescript: ['.coffee'],
    elm: ['.elm'],
    purescript: ['.purs'],

    // Langages fonctionnels
    lisp: ['.lisp', '.lsp'],
    scheme: ['.scm', '.ss'],
    clojure: ['.clj', '.cljs', '.cljc'],
    racket: ['.rkt'],
    scala: ['.scala', '.sc'],
    kotlin: ['.kt', '.kts'],

    // Requête et DB
    sql: ['.sql'],
    plsql: ['.pks', '.pkb'],
    tsql: ['.sql'], // Souvent extension .sql générique
    graphql: ['.graphql', '.gql'],
    solidity: ['.sol'],

    // Spécialisés
    matlab: ['.m'],
    prolog: ['.pl', '.pro'],
    verilog: ['.v', '.sv'],
    vhdl: ['.vhd', '.vhdl'],
    assembly: ['.asm', '.s'],
    cuda: ['.cu', '.cuh'],
    opencl: ['.cl'],
    apex: ['.cls'],
    groovy: ['.groovy', '.gvy'],
    smalltalk: ['.st'],

    // Config / Data
    xml: ['.xml'],
    json: ['.json'],
    yaml: ['.yaml', '.yml'],
    toml: ['.toml'],
    ini: ['.ini'],
    markdown: ['.md'],
    latex: ['.tex', '.sty'],
    dockerfile: ['Dockerfile'],
    makefile: ['Makefile', '.mk']
};

/**
 * Génère la configuration SUPPORTED_LANGUAGES pour settings.js
 */
export function generateSupportedLanguagesHelper() {
    const supported = {};
    Object.keys(EXTENSIONS_MAP).forEach(lang => {
        supported[lang] = {
            extensions: EXTENSIONS_MAP[lang],
            enabled: true
        };
    });
    return supported;
}
