const KaTeX = require('./math/katex');
const MathJax2 = require('./math/mathjax-2');
const MathJax3 = require('./math/mathjax-3');

function CtlMath() {
    return {
        KaTeX,
        MathJax2,
        MathJax3
    };
}

module.exports = CtlMath();
