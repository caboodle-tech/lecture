/**
 * Reveal module declaration: MathJax3
 *
 * Lectures' controller of MathJax3 for Reveal. Allows us to control when math
 * actually loads and more importantly to provide the correct url to load the
 * library from.
 */
function MathJax3() {
    /*
    NOTE: Lecture uses MathJax differently than Reveal did so we have to do all
    this configuration in the actual MathJax file.

    const defaultOptions = {
        tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            processEscapes: true,
            processEnvironments: true,
            processRefs: true
        },
        options: {
            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
        },
        output: 'svg'
    };
    */

    return {
        id: 'mathjax3',

        init(deck) {
            // Get the presentation root.
            const elem = deck.getRevealElement();

            // Skip auto rendering if we cant find anything to render.
            if (!elem.querySelector('.mathjax-3')) {
                return;
            }

            // eslint-disable-next-line no-undef
            MathJax.typesetPromise(elem.querySelectorAll('.mathjax-3'));

            // If the user is printing we need try rendering again later.
            if (deck.isPrintingPDF()) {
                let timeouts = 0;
                const interval = setInterval(() => {
                    try {
                        if (timeouts === 20) { clearInterval(interval); }
                        const pages = elem.querySelectorAll('.pdf-page');
                        if (pages.length < deck.getTotalSlides()) {
                            timeouts += 1;
                            return;
                        }
                        clearInterval(interval);
                        // eslint-disable-next-line no-undef
                        MathJax.typesetPromise(elem.querySelectorAll('.mathjax-3'));
                    // eslint-disable-next-line no-console
                    } catch (e) { clearInterval(interval); console.error(e); }
                }, 250);
            }
        }
    };
}

export default MathJax3;
