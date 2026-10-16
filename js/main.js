window.handleImageError = (image) => {
    if (!image) return;

    image.hidden = true;
    const frame = image.closest('.universe-photo, .universe-card-photo, .memory-photo, .letter-photo');
    if (frame) {
        frame.classList.add('image-unavailable');
        frame.dataset.fallback = 'Foto belum tersedia';
    }
};

(() => {
    'use strict';

    const hasGsap = typeof window.gsap !== 'undefined';
    const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';
    const hasLenis = typeof window.Lenis !== 'undefined';

    if (hasGsap && hasScrollTrigger) {
        window.gsap.registerPlugin(window.ScrollTrigger);
    }

    const gsapApi = hasGsap ? window.gsap : null;
    const scrollTriggerApi = hasScrollTrigger ? window.ScrollTrigger : null;
    let lenis = null;

    if (hasLenis) {
        try {
            lenis = new window.Lenis({
                lerp: 0.1,
                wheelMultiplier: 1,
                smoothWheel: true,
            });
        } catch (error) {
            lenis = null;
        }
    }

    const runtimeNotice = document.getElementById('runtime-notice');
    const missingServices = [];
    if (!hasGsap) missingServices.push('animasi');
    if (!hasScrollTrigger) missingServices.push('reveal saat scroll');
    if (!lenis) missingServices.push('smooth scroll');

    if (runtimeNotice && missingServices.length > 0) {
        runtimeNotice.hidden = false;
        runtimeNotice.textContent = `Beberapa layanan ${missingServices.join(', ')} tidak tersedia. Cerita dan musik tetap bisa dibuka secara manual.`;
    }

    // Mobile navigation
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('is-open');
            mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
            mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Tutup navigasi' : 'Buka navigasi');
            mobileMenu.setAttribute('aria-label', isOpen ? 'Navigasi terbuka' : 'Navigasi utama');
            mobileMenu.setAttribute('aria-hidden', String(!isOpen));
        });

        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('is-open');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                mobileMenuToggle.setAttribute('aria-label', 'Buka navigasi');
                mobileMenu.setAttribute('aria-hidden', 'true');
            });
        });
    }

    function scrollToTarget(target) {
        if (!target) return;

        if (lenis && typeof lenis.scrollTo === 'function') {
            lenis.scrollTo(target, { offset: -window.innerHeight * 0.08, duration: 1.1 });
            return;
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Start audio directly inside the user gesture. This works with mobile autoplay policies.
    const continueReadingLink = document.getElementById('continue-reading');
    const backgroundMusic = document.getElementById('background-music');
    const audioStatus = document.getElementById('audio-status');
    const audioStatusText = audioStatus ? audioStatus.querySelector('span:last-child') : null;

    if (continueReadingLink && backgroundMusic) {
        continueReadingLink.addEventListener('click', (event) => {
            event.preventDefault();

            backgroundMusic.volume = 0.35;
            backgroundMusic.muted = false;

            let playRequest;
            try {
                playRequest = backgroundMusic.play();
            } catch (error) {
                playRequest = Promise.reject(error);
            }

            const target = document.querySelector(continueReadingLink.getAttribute('href'));
            scrollToTarget(target);

            if (playRequest && typeof playRequest.then === 'function') {
                playRequest.then(() => {
                    continueReadingLink.classList.add('is-playing');
                    continueReadingLink.setAttribute('aria-label', 'Buka cerita, musik sedang diputar');
                    if (audioStatus && audioStatusText) {
                        audioStatus.dataset.state = 'playing';
                        audioStatusText.textContent = 'Musik sedang diputar.';
                    }
                }).catch(() => {
                    if (audioStatus && audioStatusText) {
                        audioStatus.dataset.state = 'error';
                        audioStatusText.textContent = 'Musik belum dapat diputar di perangkat ini. Coba tekan tombol sekali lagi.';
                    }
                });
            }
        });
    }

    // Scroll engine with native fallback
    if (lenis && scrollTriggerApi) {
        lenis.on('scroll', scrollTriggerApi.update);
    }

    if (lenis && gsapApi) {
        gsapApi.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsapApi.ticker.lagSmoothing(0);
    } else if (lenis) {
        const raf = (time) => {
            lenis.raf(time);
            window.requestAnimationFrame(raf);
        };
        window.requestAnimationFrame(raf);
    }

    const progressBar = document.getElementById('scroll-progress');
    const nav = document.querySelector('nav');

    function updateScrollState(progress, scrollPosition) {
        if (progressBar) {
            if (gsapApi) {
                gsapApi.set(progressBar, { scaleX: progress });
            } else {
                progressBar.style.transform = `scaleX(${progress})`;
            }
        }

        if (nav) {
            nav.classList.toggle('scrolled', scrollPosition > 40);
        }
    }

    if (lenis) {
        lenis.on('scroll', (event) => {
            updateScrollState(event.progress, event.animatedScroll);
        });
    } else {
        const updateNativeScroll = () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
            updateScrollState(progress, window.scrollY);
        };

        window.addEventListener('scroll', updateNativeScroll, { passive: true });
        updateNativeScroll();
    }

    // Hero star field
    const starsContainer = document.getElementById('stars-container');
    if (starsContainer) {
        for (let i = 0; i < 30; i += 1) {
            const star = document.createElement('div');
            star.className = 'star-particle';
            const size = Math.random() * 3 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 4}s`;
            starsContainer.appendChild(star);
        }
    }

    // Split the hero title without blocking the page when animation services fail.
    const title = document.getElementById('hero-title');
    if (title) {
        const titleText = title.textContent.trim();
        title.replaceChildren();

        titleText.split('').forEach((character) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = character === ' ' ? '\u00A0' : character;
            title.appendChild(span);
        });
    }

    const prefersReducedMotion = window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    if (gsapApi) {
        gsapApi.to('.char', {
            y: 0,
            opacity: 1,
            stagger: prefersReducedMotion ? 0 : 0.04,
            duration: prefersReducedMotion ? 0 : 1.2,
            ease: 'power4.out',
            delay: prefersReducedMotion ? 0 : 0.2,
        });
    } else {
        document.querySelectorAll('.char').forEach((character) => {
            character.style.opacity = '1';
            character.style.transform = 'none';
        });
    }

    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    if (prefersReducedMotion || !gsapApi || !scrollTriggerApi) {
        revealElements.forEach((element) => {
            element.style.opacity = '1';
            element.style.visibility = 'visible';
            element.style.transform = 'none';
        });
    } else {
        revealElements.forEach((element, index) => {
            gsapApi.fromTo(
                element,
                { autoAlpha: 0, y: 24 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.75,
                    delay: Math.min(index % 4, 3) * 0.06,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 88%',
                        once: true,
                    },
                },
            );
        });
    }

    // Story orbit
    const storySection = document.getElementById('timeline');
    const flywheel = document.getElementById('flywheel');
    const nodes = storySection ? storySection.querySelectorAll('.flywheel-node') : [];
    const cards = storySection ? storySection.querySelectorAll('.day-card') : [];
    const mobilePhaseLabel = document.getElementById('mobile-phase-label');
    const mobilePhaseTrack = document.getElementById('mobile-phase-track');

    if (mobilePhaseTrack) {
        cards.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = 'mobile-phase-dot';
            dot.setAttribute('aria-hidden', 'true');
            dot.dataset.index = String(index);
            mobilePhaseTrack.appendChild(dot);
        });
    }

    function updateFlywheel(activeIndex) {
        const targetRotation = activeIndex * -72;

        if (flywheel) {
            if (gsapApi) {
                gsapApi.to(flywheel, {
                    '--wheel-rot': `${targetRotation}deg`,
                    duration: prefersReducedMotion ? 0 : 1,
                    ease: 'power3.out',
                    overwrite: 'auto',
                });
            } else {
                flywheel.style.setProperty('--wheel-rot', `${targetRotation}deg`);
            }
        }

        nodes.forEach((node) => node.classList.remove('active'));
        if (nodes[activeIndex]) {
            nodes[activeIndex].classList.add('active');
        }

        if (mobilePhaseLabel && cards[activeIndex]) {
            const phase = cards[activeIndex].querySelector('.text-accent')?.textContent.trim() || `Bab ${activeIndex + 1}`;
            const heading = cards[activeIndex].querySelector('h3')?.textContent.trim() || '';
            mobilePhaseLabel.textContent = `${phase} - ${heading}`;
        }

        if (mobilePhaseTrack) {
            mobilePhaseTrack.setAttribute('aria-valuenow', String(activeIndex + 1));
            mobilePhaseTrack.querySelectorAll('.mobile-phase-dot').forEach((dot, index) => {
                dot.classList.toggle('is-active', index === activeIndex);
            });
        }
    }

    nodes.forEach((node, index) => {
        node.style.setProperty('--deg', `${index * 72}deg`);
        node.addEventListener('click', () => {
            const targetCard = cards[Number(node.dataset.index)];
            if (targetCard) scrollToTarget(targetCard);
        });
    });

    if (scrollTriggerApi && gsapApi) {
        cards.forEach((card, index) => {
            scrollTriggerApi.create({
                trigger: card,
                start: 'top 55%',
                end: 'bottom 55%',
                onEnter: () => updateFlywheel(index),
                onEnterBack: () => updateFlywheel(index),
            });
        });
    }

    if (cards.length > 0) {
        updateFlywheel(0);
    }

    // Chapter interactions
    const signalLabel = document.getElementById('signal-label');
    const signalMessage = document.getElementById('signal-message');
    const signalPoints = document.querySelectorAll('.signal-point');

    signalPoints.forEach((point) => {
        point.addEventListener('click', () => {
            signalPoints.forEach((item) => {
                item.classList.remove('is-active');
                item.setAttribute('aria-pressed', 'false');
            });

            point.classList.add('is-active');
            point.setAttribute('aria-pressed', 'true');

            if (signalLabel) signalLabel.textContent = point.dataset.title || 'Kenangan kecil';
            if (signalMessage) signalMessage.textContent = point.dataset.message || '';
        });
    });

    function setupDisclosure(toggleId, contentId, openLabel, closeLabel) {
        const toggle = document.getElementById(toggleId);
        const content = document.getElementById(contentId);
        if (!toggle || !content) return;

        toggle.addEventListener('click', () => {
            const willOpen = content.hidden;
            content.hidden = !willOpen;
            content.classList.toggle('is-open', willOpen);
            toggle.setAttribute('aria-expanded', String(willOpen));

            const label = toggle.querySelector('span:first-child');
            if (label) label.textContent = willOpen ? closeLabel : openLabel;
        });
    }

    setupDisclosure('photo-story-toggle', 'photo-story', 'lihat cerita foto', 'sembunyikan cerita');
    setupDisclosure('poem-toggle', 'poem-body', 'buka puisi untukmu', 'tutup puisi');
    setupDisclosure('letter-toggle', 'letter-body', 'Buka surat ini', 'Tutup surat ini');
    setupDisclosure('universe-note-toggle', 'universe-note', 'lihat cerita foto', 'sembunyikan cerita');

    const futureLabel = document.getElementById('future-label');
    const futureCopy = document.getElementById('future-copy');
    const futureChoices = document.querySelectorAll('.future-choice');

    futureChoices.forEach((choice) => {
        choice.addEventListener('click', () => {
            futureChoices.forEach((item) => {
                item.classList.remove('is-active');
                item.setAttribute('aria-pressed', 'false');
            });

            choice.classList.add('is-active');
            choice.setAttribute('aria-pressed', 'true');
            if (futureLabel) futureLabel.textContent = choice.dataset.title || 'Bab berikutnya';
            if (futureCopy) futureCopy.textContent = choice.dataset.message || '';
        });
    });
})();
