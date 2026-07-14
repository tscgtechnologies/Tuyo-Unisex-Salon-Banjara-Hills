/**
 * Tuyo Unisex Salon - Main JavaScript File
 * Logic: Header scroll, hamburger toggle, active link observers, scroll reveal,
 *        milestone count-ups, image lightbox, testimonial carousel, form validator
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       1. Sticky Header & Active Link Highlighting
       ========================================== */
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    // Scroll listener for sticky header background transition
    const handleHeaderScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleHeaderScroll);
    handleHeaderScroll(); // Initial check

    // Intersection Observer to highlight active nav link on scroll
    const activeLinkOptions = {
        root: null,
        rootMargin: '-30% 0px -60% 0px', // Trigger when section occupies the middle portion
        threshold: 0
    };

    const activeLinkObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${activeId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, activeLinkOptions);

    sections.forEach(section => activeLinkObserver.observe(section));


    /* ==========================================
       2. Hamburger Menu & Mobile Drawer Drawer
       ========================================== */
    const hamburger = document.getElementById('hamburger');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const toggleMenu = () => {
        hamburger.classList.toggle('open');
        mobileDrawer.classList.toggle('open');
        // Prevent body scroll when menu is open
        document.body.style.overflow = mobileDrawer.classList.contains('open') ? 'hidden' : 'auto';
    };

    hamburger.addEventListener('click', toggleMenu);

    // Close menu when a link is clicked
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileDrawer.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    // Close menu when clicking outside the drawer
    document.addEventListener('click', (e) => {
        if (mobileDrawer.classList.contains('open') && 
            !mobileDrawer.contains(e.target) && 
            !hamburger.contains(e.target)) {
            toggleMenu();
        }
    });


    /* ==========================================
       3. Scroll Reveal Animations
       ========================================== */
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealObserverOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px', // Trigger slightly before element enters viewport
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Reveal only once
            }
        });
    }, revealObserverOptions);

    revealElements.forEach(el => revealObserver.observe(el));


    /* ==========================================
       4. Milestone Stats Animated Counters
       ========================================== */
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const animateCounter = (element) => {
        const target = parseFloat(element.getAttribute('data-target'));
        const isDecimal = target % 1 !== 0;
        const duration = 1800; // Total animation time in ms
        const startTime = performance.now();

        const updateCount = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Easing function (easeOutQuad)
            const easeProgress = progress * (2 - progress);
            const currentValue = easeProgress * target;

            if (isDecimal) {
                element.textContent = currentValue.toFixed(1);
            } else {
                element.textContent = Math.floor(currentValue) + (target >= 1000 ? '+' : '');
            }

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                element.textContent = target + (target >= 1000 ? '+' : '');
            }
        };

        requestAnimationFrame(updateCount);
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target); // Animate once
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(num => statsObserver.observe(num));


    /* ==========================================
       5. Image Lightbox Modal for Gallery
       ========================================== */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const highResUrl = item.getAttribute('data-src');
            const imgAlt = item.querySelector('img').getAttribute('alt');
            const captionText = item.querySelector('.gallery-caption').textContent;

            lightboxImg.setAttribute('src', highResUrl);
            lightboxImg.setAttribute('alt', imgAlt);
            lightboxCaption.textContent = captionText;
            
            lightbox.style.display = 'flex';
            setTimeout(() => {
                lightbox.classList.add('open');
            }, 10);
        });
    });

    const closeLightbox = () => {
        lightbox.classList.remove('open');
        setTimeout(() => {
            lightbox.style.display = 'none';
            lightboxImg.setAttribute('src', '');
        }, 300);
    };

    lightboxClose.addEventListener('click', closeLightbox);
    
    // Close lightbox on clicking dark backdrop
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close lightbox on hitting 'Esc' key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('open')) {
            closeLightbox();
        }
    });


    /* ==========================================
       6. Testimonial Reviews Carousel
       ========================================== */
    const carouselTrack = document.getElementById('carouselTrack');
    const reviews = document.querySelectorAll('.review-card');
    const dotsContainer = document.getElementById('carouselDots');
    
    let currentIndex = 0;
    let cardPerSlide = window.innerWidth >= 768 ? 2 : 1;
    let totalSlides = Math.ceil(reviews.length / cardPerSlide);
    let autoPlayTimer = null;

    // Generate indicators dynamically
    const createCarouselDots = () => {
        dotsContainer.innerHTML = '';
        totalSlides = Math.ceil(reviews.length / cardPerSlide);
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    };

    const updateDots = () => {
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    };

    const goToSlide = (index) => {
        currentIndex = index;
        const offsetPercent = -index * 100;
        carouselTrack.style.transform = `translateX(${offsetPercent}%)`;
        updateDots();
        resetAutoPlay();
    };

    const nextSlide = () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        goToSlide(currentIndex);
    };

    const startAutoPlay = () => {
        if (!autoPlayTimer) {
            autoPlayTimer = setInterval(nextSlide, 5000);
        }
    };

    const stopAutoPlay = () => {
        if (autoPlayTimer) {
            clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        }
    };

    const resetAutoPlay = () => {
        stopAutoPlay();
        startAutoPlay();
    };

    // Initialize carousel layout and listeners
    createCarouselDots();
    startAutoPlay();

    // Re-calculate slider sizes on resize
    window.addEventListener('resize', () => {
        const newCardPerSlide = window.innerWidth >= 768 ? 2 : 1;
        if (newCardPerSlide !== cardPerSlide) {
            cardPerSlide = newCardPerSlide;
            createCarouselDots();
            goToSlide(0);
        }
    });

    // Pause autoplay on mouse/touch hover
    carouselTrack.addEventListener('mouseenter', stopAutoPlay);
    carouselTrack.addEventListener('mouseleave', startAutoPlay);


    /* ==========================================
       7. Appointment Form & WhatsApp Conversion
       ========================================== */
    const appointmentForm = document.getElementById('appointmentForm');
    const toast = document.getElementById('toast');
    const toastClose = document.getElementById('toastClose');
    
    // Set minimum date selector to today
    const dateInput = document.getElementById('appointmentDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    // Form inputs and errors mapping
    const validators = {
        name: {
            input: document.getElementById('clientName'),
            error: document.getElementById('nameError'),
            validate: val => val.trim().length > 1
        },
        phone: {
            input: document.getElementById('clientPhone'),
            error: document.getElementById('phoneError'),
            validate: val => {
                // Accepts clean 10-digit mobile numbers starting with 6, 7, 8, 9
                const cleanPhone = val.replace(/\D/g, '');
                return /^[6-9]\d{9}$/.test(cleanPhone);
            }
        },
        service: {
            input: document.getElementById('serviceType'),
            error: document.getElementById('serviceError'),
            validate: val => val !== "" && val !== null
        },
        date: {
            input: dateInput,
            error: document.getElementById('dateError'),
            validate: val => val !== "" && new Date(val) >= new Date(today)
        },
        time: {
            input: document.getElementById('appointmentTime'),
            error: document.getElementById('timeError'),
            validate: val => val !== "" && val !== null
        }
    };

    // Helper: Mark field as valid or invalid
    const setValidationUI = (fieldKey, isValid) => {
        const field = validators[fieldKey];
        const formGroup = field.input.closest('.form-group');
        if (isValid) {
            formGroup.classList.remove('invalid');
        } else {
            formGroup.classList.add('invalid');
        }
    };

    // Live validation feedback on blur and change
    Object.keys(validators).forEach(key => {
        const field = validators[key];
        const eventType = field.input.tagName === 'SELECT' || field.input.type === 'date' ? 'change' : 'blur';
        
        field.input.addEventListener(eventType, () => {
            const isValid = field.validate(field.input.value);
            setValidationUI(key, isValid);
        });

        // Clear error styling on active typing
        field.input.addEventListener('input', () => {
            field.input.closest('.form-group').classList.remove('invalid');
        });
    });

    // Handle Form Submission
    appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isFormValid = true;

        // Perform full validation check
        Object.keys(validators).forEach(key => {
            const field = validators[key];
            const isValid = field.validate(field.input.value);
            setValidationUI(key, isValid);
            if (!isValid) {
                isFormValid = false;
            }
        });

        if (isFormValid) {
            // Extracted values
            const name = validators.name.input.value.trim();
            const phone = validators.phone.input.value.replace(/\D/g, '');
            const service = validators.service.input.value;
            const date = validators.date.input.value;
            const time = validators.time.input.value;
            const notes = document.getElementById('clientNotes').value.trim();

            // Format WhatsApp Message
            const whatsappText = `Hi Tuyo Unisex Salon!\nI'd like to book an appointment.\n\n*Details:*\n- *Name:* ${name}\n- *Phone:* ${phone}\n- *Service:* ${service}\n- *Date:* ${date}\n- *Preferred Slot:* ${time}${notes ? `\n- *Special Notes:* ${notes}` : ''}`;
            const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(whatsappText)}`;

            // Success Toast Trigger
            toast.classList.add('show');

            // Reset form
            appointmentForm.reset();

            // Clear any invalid style borders
            Object.keys(validators).forEach(key => {
                validators[key].input.closest('.form-group').classList.remove('invalid');
            });

            // Redirect to WhatsApp after 2 seconds
            setTimeout(() => {
                toast.classList.remove('show');
                window.open(whatsappUrl, '_blank');
            }, 2500);
        }
    });

    // Close toast manual handler
    toastClose.addEventListener('click', () => {
        toast.classList.remove('show');
    });

    /* ==========================================
       8. Smart Image Error Fallback Handler
       ========================================== */
    const handleImageErrors = () => {
        const fallbackSvg = (altText) => {
            const label = (altText || 'Tuyo Unisex Salon').toUpperCase();
            
            // Choose icon depending on service label
            let iconPath = '';
            if (label.includes('HAIRCUT') || label.includes('HAIR') || label.includes('STYLE')) {
                iconPath = `<path d="M6 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm12 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM6 18c2 0 4-2 6-5l2 3h4M12 11l-3 5" stroke="%23D4AF37" stroke-width="1.5" stroke-linecap="round" fill="none"/>`;
            } else if (label.includes('BEARD') || label.includes('GROOMING') || label.includes('SCULPT')) {
                iconPath = `<path d="M4 4h16v3c0 3-2 5-6 6v7c0 1-1 2-2 2s-2-1-2-2v-7c-4-1-6-3-6-6V4zm4 0v3m4-4v3m4-4v3" stroke="%23D4AF37" stroke-width="1.5" stroke-linecap="round" fill="none"/>`;
            } else if (label.includes('SKIN') || label.includes('FACIAL') || label.includes('DETOX') || label.includes('CARE')) {
                iconPath = `<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.2 2.2M16.2 16.2l2.2 2.2M5.6 18.4l2.2-2.2M16.2 7.8l2.2-2.2M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" stroke="%23D4AF37" stroke-width="1.5" stroke-linecap="round" fill="none"/>`;
            } else {
                iconPath = `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="%23D4AF37" stroke-width="1.5" fill="none"/>`;
            }

            const svg = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%">
                    <rect width="100%" height="100%" fill="%23161616"/>
                    <rect width="90%" height="90%" x="5%" y="5%" fill="none" stroke="%23D4AF37" stroke-width="0.5" stroke-dasharray="2 2" rx="6"/>
                    <g transform="translate(0, -2)">
                        ${iconPath}
                    </g>
                    <text x="50%" y="78%" fill="%23F5EBE6" font-family="'Playfair Display', serif" font-size="1.8" font-weight="600" letter-spacing="0.05" text-anchor="middle">${label}</text>
                    <text x="50%" y="88%" fill="%23D4AF37" font-family="'Montserrat', sans-serif" font-size="1" letter-spacing="0.2" font-weight="500" text-anchor="middle">TUYO SALON</text>
                </svg>
            `.trim();
            
            // Standard data URI format (URL-encoded)
            return `data:image/svg+xml;utf8,${svg.replace(/#/g, '%23')}`;
        };

        const checkAndApplyFallback = (img) => {
            if (!img.src || img.naturalWidth === 0 || (img.complete && img.naturalWidth === 0)) {
                const alt = img.getAttribute('alt') || 'Tuyo Salon';
                img.src = fallbackSvg(alt);
                img.style.objectFit = 'contain';
                img.style.padding = '15px';
            }
        };

        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('error', () => {
                img.src = fallbackSvg(img.getAttribute('alt') || 'Tuyo Salon');
                img.style.objectFit = 'contain';
                img.style.padding = '15px';
            });
            
            if (img.complete) {
                checkAndApplyFallback(img);
            } else {
                img.addEventListener('load', () => {
                    checkAndApplyFallback(img);
                });
            }
        });
    };

    handleImageErrors();

});
