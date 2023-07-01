const MagicString = require('magic-string');

module.exports = function MermaidFixes() {
    return {
        name: 'mermaid-fixes',
        renderChunk: (code, chunk, { sourcemap }) => {
            if (code.includes('returnnew')) {
                const ms = new MagicString(code);
                ms.replace(/returnnew/g, 'return new');
                return {
                    code: ms.toString(),
                    map: sourcemap ? ms.generateMap() : null
                };
            }
            return null;
        }
    };
};
