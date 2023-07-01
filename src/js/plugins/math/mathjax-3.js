const defaultOptions = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']]
    },
    options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
    },
    startup: {
        ready: () => {
            MathJax.startup.defaultReady();
            MathJax.startup.promise.then(() => {
                Reveal.layout();
            });
        }
    }
};

module.exports = function MathJax2() {
    return {
        id: 'mathjax3',

        init(deck) {

            const base = deck.getUrlBase();
            if (!base) {
                return;
            }

            const revealOptions = deck.getConfig().mathjax3 || {};
            const options = { ...defaultOptions, ...revealOptions };
            options.tex = { ...defaultOptions.tex, ...revealOptions.tex };
            options.options = { ...defaultOptions.options, ...revealOptions.options };
            options.startup = { ...defaultOptions.startup, ...revealOptions.startup };
            options.versionWarnings = false;
            options.mathjax = null;
            window.MathJax = options;

            const renderMath = () => {
                // Reprocess equations in slides when they turn visible
                deck.addEventListener('slidechanged', (event) => {
                    MathJax.typeset();
                });
            };

            deck.loadScript([`${base}/js/plugins/math/mathjax-3.min.js`]).then(() => {
                if (deck.isReady()) {
                    renderMath();
                } else {
                    deck.on('ready', renderMath.bind(this));
                }
            });
        }
    };
};
