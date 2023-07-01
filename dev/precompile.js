const Babel = require('@rollup/plugin-babel');
const Fs = require('fs');
const Path = require('path');
const Rollup = require('rollup');
const MermaidFixes = require('./rollup-plugin-mermaid-fixes');

const root = Path.join(__dirname, '..');

async function compileMermaid() {
    const dest = `${root}/src/precompiled/js/plugins/mermaid.min.js`;

    const output = {
        name: 'Mermaid',
        compact: true,
        file: dest,
        format: 'iife',
        inlineDynamicImports: true,
        sourcemap: false
    };

    const input = {
        input: `${root}/node_modules/mermaid/dist/mermaid.esm.mjs`,
        output: [output],
        plugins: [
            Babel({ babelHelpers: 'bundled', compact: true }),
            MermaidFixes()
        ]
    };

    const bundle = await Rollup.rollup(input);
    await bundle.write(output);

    // We need to stop Mermaids default behavior of auto loading.
    Fs.appendFileSync(
        dest,
        'Mermaid.initialize({startOnLoad: false, theme: \'neutral\'});'
    );
}

compileMermaid();
