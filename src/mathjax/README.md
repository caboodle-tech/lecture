v3.2.2 

Fonts pulled from: https://github.com/mathjax/MathJax/tree/master/es5/output/chtml/fonts/woff-v2

# MathJax 3

We are currently using MathJax v3.2.2 [pre-built here](https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js) and then slightly modified. We modify the code to disable auto processing and to use SVG output over HTML.

## How to Update

1. Replace the contents of `mathjax3.min.js` with the new content from the [pre-built source](https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js)
2. Delete supporting directories (`a11y`, `adaptors`, `input`, `output`, `sre`, and `ui`) for the older version.
3. Download a zipped copy of [this repository](https://github.com/mathjax/MathJax) and copy all the directories in the `es5` directory here.
4. Edit `mathjax3.min.js.js` and place the following directly at the top of the file:

```javascript
window.MathJax = { 
    startup: { typeset: false },
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
```

5. Edit `a11y/explorer.js` by deleting this code: `t.style.backgroundColor="white",`
6. Run `npm run build` to compile the entire application.