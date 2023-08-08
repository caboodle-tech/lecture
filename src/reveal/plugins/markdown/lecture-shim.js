/* eslint-disable no-param-reassign */
/* eslint-disable no-useless-escape */

/**
 * Lecture specific shims for the marked parser that allows the non-standard markdown syntax for
 * adding attributes to images and links. Also supports images wrapped by links where the image,
 * link, or both can have attributes.
 *
 *  IMAGE EXAMPLES
 * ----------------
 * ![Alt Text](https://image-url-here.png "Mini Image"){width=100}
 * ![Alt Text](https://image-url-here.png){width=100 title="Mini Image"}
 *
 *  LINK EXAMPLES
 * ---------------
 * [Link Text](https://example.com "This is a link"){target="_blank" rel="noreferrer"}
 * [Link Text](https://example.com){target="_blank" rel="noreferrer" title="This is a link"}
 */

const attrsRegex = /\{.*?\}/;
const bracketRegex = /^\{|\}$/g;
const keyValueRegex = /\w+(?:-\w+)*=(?:"[^"]*"|'[^']*'|\S+(?=\s|$))/g;
const quotesRegex = /^['"]|['"]$/g;
const mdImageRegex = /\!\[(.*?)\]\((.*?)\s*("(?:\\"|[^"])*")?\)(\{.*?\})?/;

/**
 * Checks is an attribute token was encountered and processes it.
 *
 * @param {object} token Marked token object.
 */
function checkForAttributes(token) {
    const textToken = token.nextToken; // The next token (sibling) of the current token.
    // Only text type tokens can contain our custom attribute syntax.
    if (!textToken || textToken.type !== 'text') { return; }
    const match = attrsRegex.exec(textToken.raw);
    // Build an object of any attributes found in the next (sibling) token.
    const attrs = {};
    const keyValuePairs = match[0].match(keyValueRegex);
    if (keyValuePairs) {
        keyValuePairs.forEach((keyValue) => {
            const [key, val] = keyValue.split('=');
            attrs[key] = val.replace(quotesRegex, '').replace(bracketRegex, '');
        });
    }
    // Add any attributes found to the current token.
    token.attrs = attrs;
    // Change the type so our renderers can build the HTML when its time.
    if (token.type === 'image') { token.type = 'imageEnhanced'; }
    if (token.type === 'link') { token.type = 'linkEnhanced'; }
    // Remove the attribute from the output; sometimes text follows it so don't lose that.
    textToken.raw = textToken.raw.replace(match[0], '');
    textToken.text = textToken.text.substring(textToken.text.indexOf('}') + 1);
    if (textToken.raw.length === 0 && textToken.text.length === 0) {
        textToken.type = 'doNotDisplay'; // Do not render this text token.
    }
}

/**
 * Checks the innerHTML of already processed links to see if they contain an unprocessed image. This
 * is necessary because our custom attribute syntax breaks nested image processing when the link
 * contains attributes.
 *
 * @param {object} token Marked token object.
 * @returns {string} The HTML representing a nested image if it was found or an empty string.
 */
function checkForNestedEnhancedImage(token) {
    // Our regex will return these groups.
    const ALT = 1;
    const URL = 2;
    const TITLE = 3;
    const ATTRS = 4;
    const match = mdImageRegex.exec(token.raw);
    // Was there a match?
    if (match) {
        // Yes, manually process the image now.
        const fakeImgToken = {
            attrs: {}, href: '', text: '', title: undefined, type: 'enhancedImage'
        };
        // Build a token to represent this image.
        if (match[ALT]) { fakeImgToken.text = match[ALT]; }
        if (match[URL]) { fakeImgToken.href = match[URL]; }
        if (match[TITLE]) { fakeImgToken.title = match[TITLE].replace(quotesRegex, ''); }
        if (match[ATTRS]) {
            // Add any attributes.
            const attrs = {};
            const keyValuePairs = match[ATTRS].match(keyValueRegex);
            if (keyValuePairs) {
                keyValuePairs.forEach((keyValue) => {
                    const [key, val] = keyValue.split('=');
                    attrs[key] = val.replace(quotesRegex, '').replace(bracketRegex, '');
                });
            }
            fakeImgToken.attrs = attrs;
        }
        // Use our existing image render to build the HTML from our fake (imitation) token.
        return imageRenderer(fakeImgToken);
    }
    // No match.
    return '';
}

/**
 * Processes a marked token representing an image (enhanced image) into its HTML with attributes.
 *
 * @param {object} token Marked object token that represents an image.
 *
 * @returns {string} The HTML for this image.
 */
function imageRenderer(token) {
    let attrs = '';
    Object.keys(token.attrs).forEach((key) => {
        attrs += ` ${key}="${token.attrs[key]}"`;
    });
    let alt = '';
    if (token.text) {
        alt = ` alt="${token.text}"`;
    }
    let title = '';
    if (token.title) {
        title = ` title="${token.title}"`;
    }
    return `<img src="${token.href}"${alt}${title}${attrs}>`;
}

/**
 * Processes a marked token representing a link (enhanced link) into its HTML with attributes.
 *
 * @param {object} token Marked object token that represents an link.
 *
 * @returns {string} The HTML for this link.
 */
function linkRenderer(token) {
    let attrs = '';
    Object.keys(token.attrs).forEach((key) => {
        attrs += ` ${key}="${token.attrs[key]}"`;
    });
    let text = '';
    if (token.text) {
        const image = checkForNestedEnhancedImage(token);
        if (image.length > 0) {
            text = image;
        } else {
            text = `${token.text}`;
        }
    }
    let title = '';
    if (token.title) {
        title = ` title="${token.title}"`;
    }
    return `<a href="${token.href}"${title}${attrs}>${text}</a>`;
}

let previousParentToken = null;

/**
 * Walks all root tokens and their children to add relationship references (pointers). Adds parentToken
 * pointer, previousToken pointer, and nextToken pointers to drastically simplify the processes of
 * applying our custom attributes. This allows us to simply check the previousToken to see if we need
 * to apply attributes we found on the current token. Pointers like parent are overkill but hopefully
 * this inspires others to build better trees that have these relationships already.
 *
 * @param {object} currentToken The current token we are processing from the tree of tokens.
 */
function linkTokens(currentToken) {
    const parent = currentToken;
    parent.parentToken = null;
    parent.previousToken = previousParentToken;
    if (previousParentToken) {
        previousParentToken.nextToken = parent;
    }
    previousParentToken = parent;
    if (parent.tokens) {
        let previousToken = null;
        parent.tokens.forEach((token) => {
            token.parentToken = parent;
            token.previousToken = previousToken;
            if (previousToken) {
                previousToken.nextToken = token;
            }
            previousToken = token;
        });
    }
}

/**
 * Walks the tree of tokens looking for our attribute token; this will just be a text token with
 * out attribute syntax in it. When attribute tokens are found their previous token (sibling) will
 * be modified into an `linkEnhanced` or `imageEnhanced` token based on it a link or image precedes
 * the attribute token.
 *
 * @param {object} token Marked token object.
 */
function shimEnhancedTokens(token) {
    if (token.type === 'image' || token.type === 'link') {
        if (token.nextToken) {
            checkForAttributes(token);
        }
    }
    //
    if (token.tokens) {
        token.tokens.forEach((childToken) => {
            shimEnhancedTokens(childToken);
        });
    }
}

/**
 * Not exactly the standard way marked is meant to be extended but we add 3 extensions that register
 * our custom HTML renderers and 2 walkers that modify the tree of tokens to account for our new syntax.
 */
const LectureShimMarked = {
    registerExtensions: (marked) => {
        const extensions = [
            {
                name: 'doNotDisplay',
                level: 'inline',
                tokenizer: () => false,
                renderer: () => ''
            },
            {
                name: 'linkEnhanced',
                level: 'block',
                tokenizer: () => false,
                renderer: linkRenderer
            },
            {
                name: 'imageEnhanced',
                level: 'block',
                tokenizer: () => false,
                renderer: imageRenderer
            }
        ];
        marked.use({ extensions });
    },
    registerWalkers: (marked) => {
        marked.use({ walkTokens: shimEnhancedTokens });
        marked.use({ walkTokens: linkTokens });
    }
};

export default LectureShimMarked;
