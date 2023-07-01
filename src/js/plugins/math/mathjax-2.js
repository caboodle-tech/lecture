module.exports = function MathJax2() {
    return {
        id: 'mathjax2',
        init(deck) {
            console.warn('MathJax2 is not supported by Lectures, use KaTeX or MathJax3 instead.');
        }
    };
};
