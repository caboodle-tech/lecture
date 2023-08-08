# Reveal JS

We are currently using a slightly modified version (v4.5.0) of [Reveal JS](https://github.com/hakimel/reveal.js). Reveal does not support registering modified keybindings so we have modified their keyboard logic to hack in a solution.

## How to Update

1. First download the latest version of Reveal to another location on your computer and install its packages:

```bash
git clone https://github.com/hakimel/reveal.js.git # Clone via https
# git clone git@github.com:hakimel/reveal.js.git   # Clone via ssh
cd reveal.js
npm install
```

2. Modify the `keyboard.js` file located in `js/controllers` by making the following changes to the `onDocumentKeyDown` method. This modification allows user registered and custom registered keybinding functions return false indicating to Reveal that the callback did not process the key press and Reveal should keep looking for another callback:

```javascript
/**
 * REMOVE CODE [1] (lines ~230 - 239)
 */
if( typeof value === 'function' ) {
    value.apply( null, [ event ] );
}
// String shortcuts to reveal.js API
else if( typeof value === 'string' && typeof this.Reveal[ value ] === 'function' ) {
    this.Reveal[ value ].call();
}

triggered = true; // <--- Very important that you remove this too!
/**
 * REPLACE WITH [1]
 */
if( typeof value === 'function' ) {
    if(value.apply( null, [ event ] ) !== false) {
        triggered = true;
    }
}
// String shortcuts to reveal.js API
else if( typeof value === 'string' && typeof this.Reveal[ value ] === 'function' ) {
    this.Reveal[ value ].call();
    triggered = true;
}

/**
 * REMOVE CODE [2] (lines ~258 - 266)
 */
if( typeof action === 'function' ) {
    action.apply( null, [ event ] );
}
// String shortcuts to reveal.js API
else if( typeof action === 'string' && typeof this.Reveal[ action ] === 'function' ) {
    this.Reveal[ action ].call();
}

triggered = true; // <--- Very important that you remove this too!
/**
 * REPLACE WITH [2]
 */
if( typeof action === 'function' ) {
    if(action.apply( null, [ event ] ) !== false) {
        triggered = true;
    }
}
// String shortcuts to reveal.js API
else if( typeof action === 'string' && typeof this.Reveal[ action ] === 'function' ) {
    this.Reveal[ action ].call();
    triggered = true;
}
```

3. Now build the customized Reveal: `npm run build`.
4. Copy the contents of the newly updated `dist/reveal.js` and `dist/reveal.js.map` files into their respective files located here. You will need to manually update the source map url at the bottom of `reveal.min.js` to include the word `min` in the path.
5. Create a file `reveal.scss` in the `scss` directory and use the following template by copying in all the css below the `@import` statement from [this file](https://github.com/hakimel/reveal.js/blob/master/css/reveal.scss). Note that many custom changes have been made to this css, including removing some of the navigation styles so we can always show the controls in a faded state when in bottom-right mode:

```scss
/**
 * reveal.js
 * http://revealjs.com
 * MIT licensed
 *
 * Copyright (C) Hakim El Hattab, https://hakim.se
 */
 
@use "sass:math";
@use "layout";
@use "print/pdf" as pdf;
@use "print/paper" as paper;

@include layout.styles();

/* Paste copied code here. */
```

6. Create a file called `layout.scss` in the `scss` directory and use the following template by copying in all the css from [this file](https://github.com/hakimel/reveal.js/blob/master/css/layout.scss):

```scss
/**
 * Layout helpers.
 */
@mixin styles() {
    /* Paste copied code here. */
}
```

7. Create a print directory in the `scss` directory if it does not exist already and create the `paper.scss` and `pdf.scss` files inside it. You will need to get the code for these files [from here](https://github.com/hakimel/reveal.js/tree/master/css/print). You must wrap the code from those files like so:

```scss
@mixin styles() {
    /* Original code here. */
}
```

8. Follow a similar process to create/update various other `scss` files including the light and dark theme.
9. Run `npm run build` to compile the entire application.