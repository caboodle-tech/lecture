/**
 * Reveal module declaration: KaTeX
 *
 * Handles KaTeX macros and math formulas in the presentation.
 *
 * @returns Reveal style plugin function.
 */
function KaTeX() {
    return {
        id: 'katex',
        init: (deck) => {
            // Get the presentation root.
            const elem = deck.getRevealElement();

            // If the user is printing we need delay rendering.
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
                        katex.autoRender(elem);
                    // eslint-disable-next-line no-console
                    } catch (e) { clearInterval(interval); console.error(e); }
                }, 250);
                return;
            }

            // Skip auto rendering if we cant find anything to render.
            if (!elem.querySelector('.katex') && !elem.querySelector('.katex-macro')) {
                return;
            }

            // eslint-disable-next-line no-undef
            katex.autoRender(elem);
        }
    };
}

export default KaTeX;
