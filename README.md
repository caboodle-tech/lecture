# Lecture

Lecture is a standalone application that wraps, adds features, and simplifies the [Reveal JS](https://revealjs.com/) presentation framework. Out-of-the-box Lecture is preconfigured to support:

- Multiple Lecture (Reveal) presentations on the same page including presenter notes.
- Master template support so you can easily apply templates (themes) to select slides.
- Automatic code highlighting including line numbers with [Highlight JS Lite](https://github.com/caboodle-tech/highlight-js-lite).
- Automatic math macros, equations, and formulas with [KaTeX](https://katex.org/) and/or [MathJax3](https://www.mathjax.org/).
- Automatic diagrams with [Mermaid](https://mermaid.js.org/).
- Markdown slides with advanced non-standard attribute support.

## Installation

The latest production release is prepackaged as a zip downland in the `dist` directory. You can also grab an entire copy of the latest or past versions of this project from the [release page](https://github.com/caboodle-tech/lecture/releases).

Unzip the lecture archive to a location in your project, ensuring that all the directories and files remain together. You will need to add code similar to the following in the head of your page:

```html
<script src="highlight/hljsl.min.js"></script>
<script src="katex/katex.min.js"></script>
<script src="mathjax/mathjax3.min.js"></script>
<script src="mermaid/mermaid.min.js"></script>
<script src="reveal/reveal.min.js"></script>
<script src="lecture/lecture.min.js"></script>
<link rel="stylesheet" href="lecture/lecture.min.css">
```

**NOTE:** Future versions of Lecture aim to reduce the amount of scripts needed with additional bundling.

## Configuration

There are currently limited manual configuration options. You may review the source file `src/lecture/lecture.js` for possible options. Future versions of Lecture aim to add more configurable options.

## Usage

How to use Lecture and create your own presentations is covered in the [live demo](https://caboodle-tech.github.io/lecture/) which doubles as Lectures documentation.

## Contributions

Lecture is an open source (Commons Clause: MIT) community supported project, if you would like to help please consider <a href="https://github.com/caboodle-tech/lecture/issues" target="_blank">tackling an issue</a> or <a href="https://ko-fi.com/caboodletech" target="_blank">making a donation</a> to keep the project alive.