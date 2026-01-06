/**
 * Scroll Animations
 * Products and sections appear with smooth animations when scrolling
 */

document.addEventListener('DOMContentLoaded', function() {
  // Elements to animate on scroll
  const animatedElements = document.querySelectorAll('[data-animate]');

  // Intersection Observer options
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  // Animation handler
  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add staggered delay for grid items
        const delay = entry.target.dataset.animateDelay || 0;
        const stagger = entry.target.dataset.animateStagger;

        if (stagger) {
          const siblings = entry.target.parentElement.querySelectorAll('[data-animate]');
          siblings.forEach((sibling, i) => {
            sibling.style.transitionDelay = `${i * 100}ms`;
          });
        }

        setTimeout(() => {
          entry.target.classList.add('animated');
        }, delay);

        // Stop observing after animation
        animationObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all animated elements
  animatedElements.forEach(el => {
    animationObserver.observe(el);
  });

  // Product cards staggered animation
  const productGrids = document.querySelectorAll('.featured-products__grid, .shop-products__grid, .collection__grid');

  productGrids.forEach(grid => {
    const cards = grid.querySelectorAll('.product-card');

    const gridObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('animate-in');
            }, index * 100);
          });
          gridObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    gridObserver.observe(grid);
  });

  // Parallax effect for hero section
  const hero = document.querySelector('.hero');
  if (hero) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const heroMedia = hero.querySelector('.hero__media');
      if (heroMedia && scrolled < 800) {
        heroMedia.style.transform = `translateY(${scrolled * 0.1}px)`;
      }
    });
  }

  // Counter animation for stats
  const stats = document.querySelectorAll('.hero__stat-number');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const text = target.textContent;
        const hasNumber = text.match(/\d+/);

        if (hasNumber) {
          const number = parseInt(hasNumber[0]);
          const suffix = text.replace(/[\d,]/g, '');
          animateCounter(target, number, suffix);
        }
        counterObserver.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(stat => counterObserver.observe(stat));

  function animateCounter(element, target, suffix) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current) + suffix;
    }, 30);
  }

  // Smooth reveal for sections
  const sections = document.querySelectorAll('.featured-products, .collection-list, .trust-badges, .shop-products');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-visible');
        sectionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(section => sectionObserver.observe(section));
});
