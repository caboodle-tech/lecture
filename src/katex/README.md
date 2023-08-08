# Katex

We are currently using Katex v0.16.8 manually built from the [katex repository](https://github.com/KaTeX/KaTeX) and then slightly modified. We modify the code to expose `defineMacro` publicly and add a method called `autoRender` that allows the user (or Lectures in this case) to automatically trigger Katex processing with macro support.

## How to Update

1. Delete the old katex files in this directory being careful not to delete files needed by Lectures.
2. In a location outside of Lectures clone the [katex repository](https://github.com/KaTeX/KaTeX) repository and build a local copy:

```bash
git clone https://github.com/KaTeX/KaTeX   # Clone via https
# git clone git@github.com:KaTeX/KaTeX.git # Clone via ssh
npm install
npm run build
```

3. Copy the files `dist/katex.js` and `dist/katex.min.css` into this directory.
4. Edit `katex.js` by searching for the `__defineMacro` property and completely replacing it, including the comment, with the following code:

```javascript
/**
 * adds a new macro to builtin macro list (modified to be publicly exposed)
 */
defineMacro: defineMacro,
/**
 * adds a auto render feature that looks for .katex-macro and .katex elements
 */
autoRender: (parent) => {
    if (!parent) { parent = document; }
    parent.querySelectorAll('.katex-macro').forEach((elem) => {
        if (elem.classList.contains('processed')) { return; }
        elem.classList.add('processed');
        elem.style.display = 'none';
        const macros = elem.textContent.split('---');
        macros.forEach((macro) => {
            const parts = macro.split('=');
            if (parts.length !== 2) { return; }
            parts[0] = parts[0].replace(/\\\\/g, '\\').trim();
            parts[1] = parts[1].replace(/\\\\/g, '\\').trim();
            defineMacro(parts[0], parts[1]);
        });
    });
    parent.querySelectorAll('.katex').forEach(async (elem) => {
        if (elem.classList.contains('processed')) { return; }
        elem.classList.add('processed');
        render(elem.textContent, elem, { throwOnError: false });
    });
},
```

5. Rename the `katex.min.css` to `katex.min.scss` so it can be auto built into Lectures theme.
6. Run `npm run build` to compile the entire application.