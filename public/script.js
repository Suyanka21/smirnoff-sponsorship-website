/* ============================================
   SANDILE x SMIRNOFF - AVENGERS ASSEMBLE
   Cinematic Scroll-Driven Experience
   ============================================ */

(function () {
  'use strict';

  /* ---------- SCROLL PROGRESS BAR ---------- */
  function initScrollProgress() {
    var bar = document.querySelector('.scroll-progress');
    if (!bar) return;

    function updateProgress() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ---------- SCROLL FADE-IN (IntersectionObserver) ---------- */
  function initFadeIn() {
    var elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- COCKTAIL FLIPBOOK (Scroll-Triggered) ---------- */
  function initCocktailFlipper() {
    var flipper = document.getElementById('cocktailFlipper');
    if (!flipper) return;

    // Support both video (.cocktail-vid) and image (.cocktail-img) elements
    var items = flipper.querySelectorAll('.cocktail-vid, .cocktail-img');
    var indicators = flipper.querySelectorAll('.indicator');
    var currentIndex = 0;
    var totalImages = items.length;

    function showImage(index) {
      if (index === currentIndex) return;
      items[currentIndex].classList.remove('active');
      indicators[currentIndex].classList.remove('active');
      currentIndex = index;
      items[currentIndex].classList.add('active');
      indicators[currentIndex].classList.add('active');
    }

    // Scroll-triggered rotation
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            startAutoRotation();
          } else {
            stopAutoRotation();
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(flipper);

    var autoInterval = null;

    function startAutoRotation() {
      if (autoInterval) return;
      autoInterval = setInterval(function () {
        var next = (currentIndex + 1) % totalImages;
        showImage(next);
      }, 1800);
    }

    function stopAutoRotation() {
      if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
      }
    }

    // Click indicators
    indicators.forEach(function (ind) {
      ind.addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-index'), 10);
        showImage(idx);
        stopAutoRotation();
        startAutoRotation();
      });
    });

    // Scroll-based rotation as fallback when auto-rotation is stopped
    var lastScrollIndex = -1;
    window.addEventListener('scroll', function () {
      if (autoInterval) return;
      var viewportH = window.innerHeight;
      var sectionRect = flipper.getBoundingClientRect();

      if (sectionRect.top < viewportH && sectionRect.bottom > 0) {
        var progress = 1 - sectionRect.top / viewportH;
        progress = Math.max(0, Math.min(1, progress));
        var idx = Math.floor(progress * totalImages);
        idx = Math.min(idx, totalImages - 1);
        if (idx !== lastScrollIndex) {
          lastScrollIndex = idx;
          showImage(idx);
        }
      }
    }, { passive: true });
  }

  /* ---------- SLIDE DECK MODAL ---------- */
  function initDeck() {
    var modal = document.getElementById('deckModal');
    if (!modal) return;

    var openBtn = document.getElementById('openDeck');
    var closeBtn = document.getElementById('closeDeck');
    var prevBtn = document.getElementById('prevSlide');
    var nextBtn = document.getElementById('nextSlide');
    var currentDisplay = document.getElementById('currentSlide');
    var totalDisplay = document.getElementById('totalSlides');
    var slides = modal.querySelectorAll('.slide');
    var dots = modal.querySelectorAll('.deck-dot');

    if (!slides.length) return;

    var current = 0;
    var total = slides.length;
    if (totalDisplay) totalDisplay.textContent = total;

    function updateDots() {
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function playSlideVideos(slideEl) {
      var videos = slideEl.querySelectorAll('video');
      videos.forEach(function (v) {
        v.muted = true;
        v.play().catch(function () {});
      });
    }

    function pauseSlideVideos(slideEl) {
      var videos = slideEl.querySelectorAll('video');
      videos.forEach(function (v) {
        v.pause();
      });
    }

    function goToSlide(index) {
      if (index < 0 || index >= total || index === current) return;

      pauseSlideVideos(slides[current]);
      slides[current].classList.remove('active');
      current = index;
      slides[current].classList.add('active');
      playSlideVideos(slides[current]);
      if (currentDisplay) currentDisplay.textContent = current + 1;

      // Update nav button states
      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current === total - 1;

      updateDots();
    }

    function nextSlide() {
      if (current < total - 1) goToSlide(current + 1);
    }

    function prevSlide() {
      if (current > 0) goToSlide(current - 1);
    }

    function openModal() {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      // Reset to first slide
      slides.forEach(function (s) {
        s.classList.remove('active');
        // Pause all slide videos first
        var vids = s.querySelectorAll('video');
        vids.forEach(function (v) { v.pause(); });
      });
      current = 0;
      slides[0].classList.add('active');
      // Force play videos in the active slide
      playSlideVideos(slides[0]);
      if (currentDisplay) currentDisplay.textContent = 1;
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = total <= 1;
      updateDots();
    }

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      // Pause all deck videos when closing
      slides.forEach(function (s) {
        var vids = s.querySelectorAll('video');
        vids.forEach(function (v) { v.pause(); });
      });
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Dot navigation
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        goToSlide(i);
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextSlide();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevSlide();
    });

    // Click outside to close
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });

    // Touch swipe support
    var touchStartX = 0;
    var touchEndX = 0;

    modal.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    modal.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
    }, { passive: true });
  }

  /* ---------- VIDEO AUTOPLAY (iOS/Safari robust) ---------- */
  function initVideoAutoplay() {
    var allVideos = document.querySelectorAll('video');

    // Ensure all videos have correct attributes for iOS autoplay
    allVideos.forEach(function (video) {
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('muted', '');
      video.muted = true;
      video.setAttribute('autoplay', '');
      video.setAttribute('loop', '');
    });

    // Attempt to play a single video with retry
    function tryPlay(video) {
      if (!video || !video.paused) return;
      video.muted = true;
      var playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(function () {
          // If play fails, wait for canplay event then retry once
          video.addEventListener('canplay', function onCanPlay() {
            video.removeEventListener('canplay', onCanPlay);
            video.muted = true;
            video.play().catch(function () {});
          }, { once: true });
          // Force load to trigger canplay
          video.load();
        });
      }
    }

    // Play all visible videos via IntersectionObserver
    var videoObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            tryPlay(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '300px 0px' }
    );

    allVideos.forEach(function (video) {
      videoObserver.observe(video);
    });

    // On first user interaction (touch/click), force-play all videos
    // This is the KEY fix for iOS Safari which gates autoplay behind user gesture
    var hasInteracted = false;
    function onFirstInteraction() {
      if (hasInteracted) return;
      hasInteracted = true;
      allVideos.forEach(function (video) {
        video.muted = true;
        video.play().catch(function () {});
      });
      document.removeEventListener('touchstart', onFirstInteraction);
      document.removeEventListener('touchend', onFirstInteraction);
      document.removeEventListener('click', onFirstInteraction);
      document.removeEventListener('scroll', onFirstInteraction);
    }
    document.addEventListener('touchstart', onFirstInteraction, { passive: true });
    document.addEventListener('touchend', onFirstInteraction, { passive: true });
    document.addEventListener('click', onFirstInteraction, { passive: true });
    document.addEventListener('scroll', onFirstInteraction, { passive: true });

    // Periodically check for paused videos and restart them (covers edge cases)
    setInterval(function () {
      allVideos.forEach(function (video) {
        if (video.paused && isElementInViewport(video)) {
          video.muted = true;
          video.play().catch(function () {});
        }
      });
    }, 3000);
  }

  function isElementInViewport(el) {
    var rect = el.getBoundingClientRect();
    return (
      rect.bottom > 0 &&
      rect.top < (window.innerHeight || document.documentElement.clientHeight)
    );
  }

  /* ---------- PARALLAX EFFECT ON SCENES ---------- */
  function initParallax() {
    var scenes = document.querySelectorAll('.story-scene');

    function handleParallax() {
      scenes.forEach(function (scene) {
        var rect = scene.getBoundingClientRect();
        var viewH = window.innerHeight;
        if (rect.top < viewH && rect.bottom > 0) {
          var progress = (viewH - rect.top) / (viewH + rect.height);
          var offset = (progress - 0.5) * 30;
          var video = scene.querySelector('.scene-video');
          if (video) {
            video.style.transform = 'translate(-50%, calc(-50% + ' + offset + 'px))';
          }
        }
      });
    }

    window.addEventListener('scroll', handleParallax, { passive: true });
  }

  /* ---------- SCROLL INDICATOR HIDE ---------- */
  function initScrollIndicator() {
    var indicator = document.querySelector('.scroll-indicator');
    if (!indicator) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 100) {
        indicator.style.opacity = '0';
        indicator.style.transition = 'opacity 0.5s';
      } else {
        indicator.style.opacity = '1';
      }
    }, { passive: true });
  }

  /* ---------- GSAP SCROLLTRIGGER REVEAL ANIMATIONS ---------- */
  function initGSAPReveal() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Reveal all .gsap-reveal elements with fade + slide from bottom
    var revealElements = document.querySelectorAll('.gsap-reveal');
    revealElements.forEach(function (el) {
      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          once: true
        },
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out'
      });
    });

    // Stagger DJ cards
    var djCards = document.querySelectorAll('.lineup-grid .dj-card');
    if (djCards.length) {
      gsap.to(djCards, {
        scrollTrigger: {
          trigger: '.lineup-grid',
          start: 'top 80%',
          once: true
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out'
      });
    }

    // Stagger brand cards
    var brandCards = document.querySelectorAll('.brand-grid .brand-card');
    if (brandCards.length) {
      gsap.to(brandCards, {
        scrollTrigger: {
          trigger: '.brand-grid',
          start: 'top 80%',
          once: true
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      });
    }

    // Stagger sponsor tiers
    var tierCards = document.querySelectorAll('.sponsor-tiers .sponsor-tier');
    if (tierCards.length) {
      gsap.to(tierCards, {
        scrollTrigger: {
          trigger: '.sponsor-tiers',
          start: 'top 80%',
          once: true
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      });
    }

    // Stagger deliverable cards
    var deliverableCards = document.querySelectorAll('.deliverables-grid .deliverable-card');
    if (deliverableCards.length) {
      gsap.to(deliverableCards, {
        scrollTrigger: {
          trigger: '.deliverables-grid',
          start: 'top 80%',
          once: true
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      });
    }

    // Stagger reach stats
    var reachStats = document.querySelectorAll('.reach-stats .reach-stat');
    if (reachStats.length) {
      gsap.to(reachStats, {
        scrollTrigger: {
          trigger: '.reach-stats',
          start: 'top 80%',
          once: true
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      });
    }

    // Journey images stagger
    var journeyEvents = document.querySelectorAll('.journey-event');
    journeyEvents.forEach(function (event) {
      var imgs = event.querySelectorAll('.journey-img');
      if (imgs.length) {
        gsap.to(imgs, {
          scrollTrigger: {
            trigger: event,
            start: 'top 80%',
            once: true
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out'
        });
      }
    });
  }

  /* ---------- VIEW TRANSITIONS API (smooth navigation) ---------- */
  function initViewTransitions() {
    // Only if the browser supports View Transitions API
    if (!document.startViewTransition) return;

    // Intercept internal anchor clicks for smooth transitions
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      // Only handle internal same-page anchors
      if (!href || href.charAt(0) !== '#') return;

      e.preventDefault();
      var target = document.querySelector(href);
      if (!target) return;

      document.startViewTransition(function () {
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ---------- INIT ALL ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initScrollProgress();
    initFadeIn();
    initCocktailFlipper();
    initDeck();
    initVideoAutoplay();
    initParallax();
    initScrollIndicator();
    initGSAPReveal();
    initViewTransitions();
  });
})();
