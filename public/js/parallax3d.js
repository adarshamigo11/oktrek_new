/*
 * Lightweight 3D parallax effect for the hero section.
 * - Cross-fades between multiple hero images (admin-uploadable).
 * - On mouse move, layers translate/rotate at different depths (data-depth)
 *   to create a layered 3D feel.
 * - On scroll, the hero translates for a subtle depth-scroll effect.
 * - Reduced motion / touch devices get a static, still-beautiful version.
 */
(function () {
  var hero = document.querySelector('.hero-parallax');
  if (!hero) return;

  var layers = Array.prototype.slice.call(hero.querySelectorAll('.p3d-layer'));
  var fg = hero.querySelector('.p3d-fg');
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = 'ontouchstart' in window;

  // Slideshow cross-fade between hero images
  if (layers.length > 1) {
    var current = 0;
    layers[0].classList.add('p3d-active');
    setInterval(function () {
      layers[current].classList.remove('p3d-active');
      current = (current + 1) % layers.length;
      layers[current].classList.add('p3d-active');
    }, 5000);
  } else if (layers.length === 1) {
    layers[0].classList.add('p3d-active');
  }

  if (prefersReducedMotion || isTouch) return;

  var rafId = null;
  var targetX = 0, targetY = 0, curX = 0, curY = 0;

  hero.addEventListener('mousemove', function (e) {
    var rect = hero.getBoundingClientRect();
    var relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
    var relY = (e.clientY - rect.top) / rect.height - 0.5;
    targetX = relX;
    targetY = relY;
    if (!rafId) rafId = requestAnimationFrame(render);
  });

  hero.addEventListener('mouseleave', function () {
    targetX = 0;
    targetY = 0;
    if (!rafId) rafId = requestAnimationFrame(render);
  });

  function render() {
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;

    layers.forEach(function (layer) {
      var depth = parseFloat(layer.getAttribute('data-depth')) || 10;
      var moveX = curX * depth;
      var moveY = curY * depth;
      var rotX = curY * (depth * 0.15);
      var rotY = -curX * (depth * 0.15);
      layer.style.transform =
        'translate3d(' + moveX + 'px,' + moveY + 'px,0) ' +
        'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(1.06)';
    });

    if (fg) {
      fg.style.transform = 'translate3d(' + (curX * -30) + 'px,' + (curY * -14) + 'px,0)';
    }

    if (Math.abs(targetX - curX) > 0.001 || Math.abs(targetY - curY) > 0.001) {
      rafId = requestAnimationFrame(render);
    } else {
      rafId = null;
    }
  }

  // Subtle scroll-based depth effect
  window.addEventListener('scroll', function () {
    var scrolled = window.scrollY || window.pageYOffset;
    if (scrolled < window.innerHeight) {
      layers.forEach(function (layer) {
        var depth = parseFloat(layer.getAttribute('data-depth')) || 10;
        layer.style.opacity = layer.classList.contains('p3d-active') ? Math.max(0.35, 1 - scrolled / 900) : 0;
      });
    }
  }, { passive: true });
})();
