# Markdown Plugin for Reveal

Lecture uses a custom build of the markdown plugin available for Reveal. We build on top of the [marked parser](https://github.com/markedjs/marked) with several modifications to support GitHub flavored markdown as well as non-standard markdown syntax.

## How to Update

1. To update the marked parser replace the contents of `marked.js` with the code from the latest [source](https://github.com/markedjs/marked/blob/master/lib/marked.esm.js).
2. To update the mangle extension for marked replace the contents of `marked-mangle.js` with the code from the latest [source](https://github.com/markedjs/marked-mangle/blob/main/src/index.js).
3. To update the heading ids extension (GitHUb style headings with ids) you will need to first build the extension from source. In a location outside of Lecture's files run the following:

```bash
git clone https://github.com/markedjs/marked-gfm-heading-id.git # Clone via https
# git clone git@github.com:markedjs/marked-gfm-heading-id.git   # Clone via ssh
npm install
npm install rollup
npx rollup .\index.js -o marked-headings.js -f esm
```

4. To finish updating the heading ids extension replace the contents of the `marked-heading-id.js` file located here, with the contents of the `marked-headings.js` that was just created. Next copy and paste the original [plugin source](https://github.com/markedjs/marked-gfm-heading-id/blob/main/src/index.js) to the bottom of the `marked-heading-id.js` file, making the following changes:

    - Do not include any imports like `import GithubSlugger from 'github-slugger';`
    - Replace any instances of `GithubSlugger` with `BananaSlug`;
    - Remove `export` from `export function gfmHeadingId(...)`
    - Add a default export at the very bottom of the file: `export default gfmHeadingId;`

5. To update the markdown plugin itself replace the contents of `markdown.js` with the code from the latest [source](https://github.com/hakimel/reveal.js/blob/master/plugin/markdown/plugin.js). You must then replace the `import { marked } from 'marked';` line at the top of the file with the following code:

```javascript
import headingId from './marked-heading-id.js';
import mangled from './marked-mangle.js';
import shims from './lecture-shim.js';
import { marked } from './marked.js';

marked.use({ gfm: true }); // Enable github flavor markdown support.
marked.use(headingId());
marked.use(mangled());
shims.registerWalkers(marked);
shims.registerExtensions(marked);
```

6. Run `npm run build` to compile the entire application.