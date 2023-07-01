(function (t, e) {
    if (typeof exports == "object" && typeof module != "undefined") {
      module.exports = e();
    } else if (typeof define == "function" && define.amd) {
      define(e);
    } else {
      (t = typeof globalThis != "undefined" ? globalThis : t || self).RevealMath = e();
    }
  }(this, function () {
    "use strict";
    const t = () => {
      let t;
      let e = {messageStyle: "none", tex2jax: {inlineMath: [["$", "$"], ["\\(", "\\)"]], skipTags: ["script", "noscript", "style", "textarea", "pre"]}, skipStartupTypeset: true};
      return {id: "mathjax2", init: function (n) {
        t = n;
        let a = t.getConfig().mathjax2 || t.getConfig().math || {};
        let i = {...e, ...a};
        let s = (i.mathjax || "https://cdn.jsdelivr.net/npm/mathjax@2/MathJax.js") + "?config=" + (i.config || "TeX-AMS_HTML-full");
        i.tex2jax = {...e.tex2jax, ...a.tex2jax};
        i.mathjax = i.config = null;
        (function (t, e) {
          let n = document.querySelector("head");
          let a = document.createElement("script");
          a.type = "text/javascript";
          a.src = t;
          let i = () => {
            if (typeof e == "function") {
              e.call();
              e = null;
            }
          };
          a.onload = i;
          a.onreadystatechange = () => {
            if (this.readyState === "loaded") {
              i();
            }
          };
          n.appendChild(a);
        }(s, function () {
          MathJax.Hub.Config(i);
          MathJax.Hub.Queue(["Typeset", MathJax.Hub, t.getRevealElement()]);
          MathJax.Hub.Queue(t.layout);
          t.on("slidechanged", function (t) {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, t.currentSlide]);
          });
        }));
      }};
    };
    const e = t;
    return Plugin = Object.assign(e(), {KaTeX: () => {
      let t;
      let e = {version: "latest", delimiters: [{left: "$$", right: "$$", display: true}, {left: "$", right: "$", display: false}, {left: "\\(", right: "\\)", display: false}, {left: "\\[", right: "\\]", display: true}], ignoredTags: ["script", "noscript", "style", "textarea", "pre"]};
      const n = t => new Promise((e, n) => {
        const a = document.createElement("script");
        a.type = "text/javascript";
        a.onload = e;
        a.onerror = n;
        a.src = t;
        document.head.append(a);
      });
      return {id: "katex", init: function (deck) {
        let i = deck.getConfig().katex || {};
        let s = {...e, ...i};
        const {local: o, version: l, extensions: r, ...c} = s;
       
        const f = () => {
          renderMathInElement(deck.getSlidesElement(), c);
          deck.layout();
        };

        (function () {
          var t = m;
          for (const e of t) {
            await n(e);
          }
        }().then(() => {
          if (deck.isReady()) {
            f();
          } else {
            deck.on("ready", f.bind(this));
          }
        }));

      }};
    }, MathJax2: t, MathJax3: () => {
      let t;
      let e = {tex: {inlineMath: [["$", "$"], ["\\(", "\\)"]]}, options: {skipHtmlTags: ["script", "noscript", "style", "textarea", "pre"]}, startup: {ready: () => {
        MathJax.startup.defaultReady();
        MathJax.startup.promise.then(() => {
          Reveal.layout();
        });
      }}};
      return {id: "mathjax3", init: function (n) {
        t = n;
        let a = t.getConfig().mathjax3 || {};
        let i = {...e, ...a};
        i.tex = {...e.tex, ...a.tex};
        i.options = {...e.options, ...a.options};
        i.startup = {...e.startup, ...a.startup};
        let s = i.mathjax || "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
        i.mathjax = null;
        window.MathJax = i;
        (function () {
          var t = s;
          var e = function () {
            Reveal.addEventListener("slidechanged", function (t) {
              MathJax.typeset();
            });
          };
          let n = document.createElement("script");
          n.type = "text/javascript";
          n.id = "MathJax-script";
          n.src = t;
          n.async = true;
          n.onload = () => {
            if (typeof e == "function") {
              e.call();
              e = null;
            }
          };
          document.head.appendChild(n);
        }());
      }};
    }});
  }));
  