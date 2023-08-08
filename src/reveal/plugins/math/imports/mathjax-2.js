/**
 * Reveal module declaration: MathJax2
 *
 * Lecture does not support MathJax version 2 because the maintenance nightmare
 * it would be to get it to play nice with our setup. This module allows us to
 * fail gracefully for uses who attempt to use it.
 */
function MathJax2() {
    return {
        id: 'mathjax2',
        init(deck) {
            // Get the presentation root.
            const elem = deck.getRevealElement();

            // Skip auto rendering if we cant find anything to render.
            if (!elem.querySelector('.mathjax-2')) {
                return;
            }

            // Warn the user if they are trying to use MathJax2.
            console.warn('MathJax2 is not supported by Lecture, use KaTeX or MathJax3 instead.');
        }
    };
}

export default MathJax2;
