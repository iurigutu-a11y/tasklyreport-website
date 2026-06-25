/**
 * Taskly Report PRO - Landing Page Script
 * Modern, responsive landing page with smooth interactions
 */

// ============================================
// Mobile Menu Toggle
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // Animate menu toggle button
            const spans = menuToggle.querySelectorAll('span');
            if (navLinks.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(8px, 8px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(8px, -8px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Close menu when clicking on a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                const spans = menuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }
});

// ============================================
// Smooth Scroll for Anchor Links
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            const target = document.querySelector(href);
            const offsetTop = target.offsetTop - 80; // Account for sticky navbar
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// Intersection Observer for Animations
// ============================================
function observeElements() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Observe profession cards
    document.querySelectorAll('.profession-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Observe roadmap items
    document.querySelectorAll('.roadmap-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });

    // Observe footer sections
    document.querySelectorAll('.footer-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// Run observer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeElements);
} else {
    observeElements();
}

// ============================================
// Navbar Background on Scroll
// ============================================
function updateNavbar() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 10) {
        navbar.style.boxShadow = '0 2px 8px rgba(0, 82, 204, 0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
}

window.addEventListener('scroll', updateNavbar);

// ============================================
// Phone Mockup Animation
// ============================================
function animatePhoneMockup() {
    const phoneScreen = document.querySelector('.screen-content');
    if (!phoneScreen) return;

    // Animate content on scroll
    const observerOptions = {
        threshold: 0.3
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const children = entry.target.querySelectorAll('div');
                children.forEach((child, index) => {
                    child.style.animation = `fadeInUp 0.6s ease ${index * 0.2}s forwards`;
                    child.style.opacity = '0';
                });
            }
        });
    }, observerOptions);

    observer.observe(phoneScreen);
}

animatePhoneMockup();


// ============================================
// Form Handling Example (for future contact form)
// ============================================
function setupFormHandling() {
    // Placeholder for future contact form functionality
    // This can be extended when a contact form is added
    const contactLink = document.querySelector('a[href="#contact"]');
    if (contactLink) {
        contactLink.addEventListener('click', function(e) {
            // Smooth scroll is already handled by anchor link handler
        });
    }
}

setupFormHandling();

// ============================================
// Performance Monitoring (no external dependencies)
// ============================================
function logPerformanceMetrics() {
    if (window.performance && window.performance.timing) {
        window.addEventListener('load', function() {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            // Page load time is available but not logged anywhere to maintain no-tracking policy
        });
    }
}

logPerformanceMetrics();

// ============================================
// Keyboard Navigation
// ============================================
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Escape key closes mobile menu
        if (e.key === 'Escape') {
            const navLinks = document.querySelector('.nav-links');
            const menuToggle = document.querySelector('.menu-toggle');
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (menuToggle) {
                    const spans = menuToggle.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            }
        }
    });
}

setupKeyboardNavigation();

// ============================================
// Add subtle parallax to hero section
// ============================================
function setupParallax() {
    const heroImage = document.querySelector('.hero-image');
    if (!heroImage) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY < window.innerHeight) {
            const scrolled = window.scrollY * 0.5;
            heroImage.style.transform = `translateY(${scrolled}px)`;
        }
    });
}

setupParallax();


// ============================================
// CSS Custom Properties (Theme Support)
// ============================================
function initializeTheme() {
    // Set CSS custom properties for easy theming
    const root = document.documentElement;
    
    // Check for prefers-color-scheme (prepare for future dark mode)
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Currently keeping light theme, but structure is in place
    }
}

initializeTheme();

// ============================================
// Page Visibility API for optimizations
// ============================================
function setupVisibilityTracking() {
    if (typeof document.hidden !== 'undefined') {
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                // Page is hidden - could pause animations here
            } else {
                // Page is visible again - resume if needed
            }
        });
    }
}

setupVisibilityTracking();
// ===== LANGUAGE AUTO DETECTION =====

function applyTranslations(language) {
  if (typeof translations === "undefined") {
    console.error("translations.js is not loaded");
    return;
  }

  if (!translations[language]) {
    language = "en";
  }

  document.documentElement.lang = language;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");

    if (translations[language][key]) {
      element.textContent = translations[language][key];
    }
  });

  localStorage.setItem("taskly_language", language);
}

document.addEventListener("DOMContentLoaded", () => {
  const supportedLanguages = [
    "en", "it", "ru", "de", "fr", "es", "pl", "ro", "hu", "sl", "zh", "pt", "nl"
  ];

  const savedLanguage = localStorage.getItem("taskly_language");

  const browserLanguage = (navigator.language || "en")
    .toLowerCase()
    .split("-")[0];

  const language =
    savedLanguage ||
    (supportedLanguages.includes(browserLanguage) ? browserLanguage : "en");

  applyTranslations(language);
}
);
console.log('Taskly Report PRO - Landing page loaded successfully');
