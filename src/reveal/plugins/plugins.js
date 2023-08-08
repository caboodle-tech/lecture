/**
 * Wraps all plugins into a single object for easier importing.
 */
import Diagrams from './diagrams/lectures-diagrams.js';
import Highlight from './highlight/lectures-highlight.js';
import Markdown from './markdown/markdown.js';
import MasterSlide from './master/master-slide.js';
import Math from './math/lecture-math.js';
import Notes from './notes/notes.esm.js';
import ShimReveal from './lecture/shim-reveal.js';
import Zoom from './zoom/zoom.js';

const plugins = {
    LectureMasterSlide: MasterSlide,
    LectureShimReveal: ShimReveal,
    LectureDiagrams: Diagrams,
    LectureHighlight: Highlight,
    LectureMathKatex: Math.KaTeX,
    LectureMathMathJax2: Math.MathJax2,
    LectureMathMathJax3: Math.MathJax3,
    LectureMarkdown: Markdown,
    RevealNotes: Notes,
    RevealZoom: Zoom
};

export default plugins;
