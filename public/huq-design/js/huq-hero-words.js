/* HuQ hero heading: the words arrive one after another (optional; needs huq-design.css).
   Add this file at the end of <body>:  <script src="js/huq-hero-words.js" defer></script>
   It wraps each word of  .huq-hero-title  in <span class="w" style="--i:n"> and changes nothing else.
   It does nothing for visitors who prefer reduced motion, and it never runs twice on the same heading. */
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.huq-hero-title').forEach(function (h1) {
    if (h1.dataset.split) return;
    h1.dataset.split = '1';
    var n = 0;
    Array.prototype.slice.call(h1.childNodes).forEach(function (nd) {
      if (nd.nodeType !== 3 || !nd.textContent.trim()) return;             // only plain text, not <small> or <br>
      var frag = document.createDocumentFragment();
      var words = nd.textContent.trim().split(/\s+/);
      words.forEach(function (w, k) {
        var sp = document.createElement('span');
        sp.className = 'w';
        sp.style.setProperty('--i', n++);
        sp.textContent = w + (k < words.length - 1 ? ' ' : '');
        frag.appendChild(sp);
      });
      nd.parentNode.replaceChild(frag, nd);
    });
  });
})();
