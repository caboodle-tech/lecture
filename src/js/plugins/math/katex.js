const defaultOptions = {
    version: 'latest',
    delimiters: [
        { left: '$$', right: '$$', display: true }, // Note: $$ has to come before $
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true }
    ],
    ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre']
};

module.exports = function KaTeX() {
    return {
        id: 'katex',
        init: (deck) => {

            const base = deck.getUrlBase();
            if (!base) {
                return;
            }

            const revealOptions = deck.getConfig().katex || {};

            const options = { ...defaultOptions, ...revealOptions };
            const {
                local, version, extensions, ...katexOptions
            } = options;

            const katexScripts = [
                `${base}/js/plugins/math/katex.min.js`,
                `${base}/js/plugins/math/katex-mhchem.min.js`,
                `${base}/js/plugins/math/katex-auto-render.min.js`
            ];

            const renderMath = () => {
                // eslint-disable-next-line no-undef
                renderMathInElement(deck.getSlidesElement(), katexOptions);
                deck.layout();
            };

            deck.loadCss(`${base}/themes/ctl/math/katex.min.css`);

            deck.loadScripts(katexScripts).then(() => {
                if (deck.isReady()) {
                    renderMath();
                } else {
                    deck.on('ready', renderMath.bind(this));
                }
            });
        }
    };
};
