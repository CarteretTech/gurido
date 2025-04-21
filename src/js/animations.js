/**
 * animations.js
 * Handles all animations and scroll-based effects for CravenSEO
 * Includes Intersection Observer setup, AOS initialization, 
 * parallax effects, number counting animations, and typewriter effects
 */

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initParallaxEffects();
  initCounterAnimations();
  initTypewriterEffects();
});

/**
 * Initialize scroll-based animations using Intersection Observer
 * Applies the .animated class to elements with .animate-on-scroll when they enter the viewport
 */
function initScrollAnimations() {
  // Create options for the observer
  const observerOptions = {
    root: null, // viewport is the root
    rootMargin: '0px',
    threshold: 0.15 // 15% of the element must be visible
  };

  // Create the observer instance
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      // If the element is in view
      if (entry.isIntersecting) {
        // Add the animation class
        entry.target.classList.add('animated');
        
        // Stop observing the element after it's animated
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Get all elements to animate
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  
  // Start observing each element
  animateElements.forEach(element => {
    observer.observe(element);
  });
  
  // Initialize AOS library if it's being used
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      once: true,
      disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    });
  }
}

/**
 * Initialize parallax effects for elements with data-parallax attribute
 * Creates subtle movement on scroll for enhanced visual interest
 */
function initParallaxEffects() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  
  if (parallaxElements.length === 0) return;
  
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    parallaxElements.forEach(element => {
      const speed = element.getAttribute('data-parallax') || 0.1;
      const yOffset = scrollY * speed;
      
      // Use transform instead of top for better performance
      element.style.transform = `translateY(${yOffset}px)`;
    });
  }, { passive: true });
}

/**
 * Initialize counter animations for elements with data-count-to attribute
 * Animates numbers counting up when they enter the viewport
 */
function initCounterAnimations() {
  const counterElements = document.querySelectorAll('[data-count-to]');
  
  if (counterElements.length === 0) return;
  
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const countTo = parseInt(target.getAttribute('data-count-to'), 10);
        const duration = parseInt(target.getAttribute('data-count-duration') || 2000, 10);
        const countFrom = parseInt(target.getAttribute('data-count-from') || 0, 10);
        
        animateCounter(target, countFrom, countTo, duration);
        observer.unobserve(target);
      }
    });
  }, {
    threshold: 0.25
  });
  
  counterElements.forEach(element => {
    counterObserver.observe(element);
  });
}

/**
 * Animate a counter from start to end value over a specified duration
 * @param {HTMLElement} element - The element to update with count values
 * @param {number} start - Starting count value
 * @param {number} end - Ending count value
 * @param {number} duration - Animation duration in milliseconds
 */
function animateCounter(element, start, end, duration) {
  let startTime = null;
  const format = element.getAttribute('data-count-format');
  
  // Animation step function
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    
    // Format the number if a format is specified
    if (format === 'comma') {
      element.textContent = value.toLocaleString();
    } else {
      element.textContent = value;
    }
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      // Ensure the final value is exactly the end value
      if (format === 'comma') {
        element.textContent = end.toLocaleString();
      } else {
        element.textContent = end;
      }
    }
  }
  
  // Start the animation
  window.requestAnimationFrame(step);
}

/**
 * Initialize typewriter effect for elements with data-typewriter attribute
 */
function initTypewriterEffects() {
  const typewriterElements = document.querySelectorAll('[data-typewriter]');
  
  if (typewriterElements.length === 0) return;
  
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Just show the text without animation
    typewriterElements.forEach(element => {
      const phrases = JSON.parse(element.getAttribute('data-typewriter'));
      element.textContent = phrases[0];
    });
    return;
  }
  
  const typewriterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const phrases = JSON.parse(element.getAttribute('data-typewriter'));
        const typeSpeed = parseInt(element.getAttribute('data-type-speed') || 100, 10);
        const backSpeed = parseInt(element.getAttribute('data-back-speed') || 50, 10);
        const backDelay = parseInt(element.getAttribute('data-back-delay') || 1000, 10);
        const startDelay = parseInt(element.getAttribute('data-start-delay') || 0, 10);
        const loop = element.hasAttribute('data-loop');
        
        setTimeout(() => {
          typewriterEffect(element, phrases, typeSpeed, backSpeed, backDelay, loop);
        }, startDelay);
        
        observer.unobserve(element);
      }
    });
  }, {
    threshold: 0.2
  });
  
  typewriterElements.forEach(element => {
    typewriterObserver.observe(element);
  });
}

/**
 * Create a typewriter animation effect
 * @param {HTMLElement} element - Element to apply typewriter effect to
 * @param {string[]} phrases - Array of phrases to type
 * @param {number} typeSpeed - Typing speed in milliseconds
 * @param {number} backSpeed - Speed of text deletion in milliseconds
 * @param {number} backDelay - Delay before starting to delete text
 * @param {boolean} loop - Whether to loop through phrases continuously
 */
function typewriterEffect(element, phrases, typeSpeed, backSpeed, backDelay, loop) {
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let isPaused = false;
  
  function type() {
    const currentPhrase = phrases[phraseIndex];
    
    if (isDeleting) {
      // Deleting text
      element.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
    } else {
      // Typing text
      element.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
    }
    
    // Speed calculations
    let typeInterval = typeSpeed;
    
    if (isDeleting) {
      typeInterval = backSpeed;
    }
    
    // If complete with phrase
    if (!isDeleting && charIndex === currentPhrase.length) {
      typeInterval = backDelay;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex++;
      
      // Move to next phrase or restart if at end
      if (phraseIndex === phrases.length) {
        if (loop) {
          phraseIndex = 0;
        } else {
          return; // Stop if not looping
        }
      }
    }
    
    setTimeout(type, typeInterval);
  }
  
  // Start typing
  type();
}

// Export functions for potential use in other modules
export {
  initScrollAnimations,
  initParallaxEffects,
  initCounterAnimations,
  initTypewriterEffects
};