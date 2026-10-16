// --- 1. Image Fallback Logic ---
        function handleImgFallback(img) {
            if (!img.dataset.retried) {
                img.dataset.retried = true;
                // Keep the fallback local as well, so the page does not unexpectedly
                // request another remote image when an asset is missing.
                img.src = 'assets/images/placeholder-space.svg';
            }
        }

        // --- Mobile Navigation ---
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                const isOpen = mobileMenu.classList.toggle('is-open');
                mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
                mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
                mobileMenu.setAttribute('aria-hidden', String(!isOpen));
            });

            mobileMenu.querySelectorAll('a').forEach((link) => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove('is-open');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    mobileMenuToggle.setAttribute('aria-label', 'Open navigation');
                    mobileMenu.setAttribute('aria-hidden', 'true');
                });
            });
        }

        // Start the background music from the user's click so browsers allow playback.
        const continueReadingLink = document.getElementById('continue-reading');
        const backgroundMusic = document.getElementById('background-music');

        if (continueReadingLink && backgroundMusic) {
            continueReadingLink.addEventListener('click', () => {
                backgroundMusic.volume = 0.35;

                const playRequest = backgroundMusic.play();
                if (playRequest) {
                    playRequest.catch(() => {
                        // The page still navigates normally if the audio file is unavailable.
                    });
                }
            });
        }

        // --- 2. Lenis Smooth Scroll Setup (Constraint: lerp 0.1) ---
        const lenis = new Lenis({
            lerp: 0.1,
            wheelMultiplier: 1,
            smoothWheel: true,
        });

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);

        // --- 3. Scroll Progress & Nav Scrolled State ---
        const progressBar = document.getElementById('scroll-progress');
        const nav = document.querySelector('nav');

        lenis.on('scroll', (e) => {
            // Update progress bar
            gsap.set(progressBar, { scaleX: e.progress });
            
            // Nav `.scrolled` state at 40px depth
            if (e.animatedScroll > 40) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });

        // --- 4. Hero Animations ---
        // Generate Star Particles
        const starsContainer = document.getElementById('stars-container');
        for(let i=0; i<30; i++) {
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

        // Split Text Logic for "Artemis II"
        const title = document.getElementById('hero-title');
        const text = title.innerText;
        title.innerHTML = '';
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.className = 'char';
            span.innerText = char === ' ' ? '\u00A0' : char;
            title.appendChild(span);
        });

        // GSAP Hero Entry
        gsap.to('.char', {
            y: 0,
            opacity: 1,
            stagger: 0.04,
            duration: 1.2,
            ease: "power4.out",
            delay: 0.2
        });

        // --- 5. Our Story Orbit Logic ---
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
                dot.dataset.index = index;
                mobilePhaseTrack.appendChild(dot);
            });
        }

        // Initial setup for CSS variables on five story nodes.
        nodes.forEach((node, i) => {
            node.style.setProperty('--deg', `${i * 72}deg`);
            node.addEventListener('click', () => {
                const targetCard = cards[Number(node.dataset.index)];
                if (!targetCard) return;

                if (lenis && typeof lenis.scrollTo === 'function') {
                    lenis.scrollTo(targetCard, {
                        offset: -window.innerHeight * 0.22,
                        duration: 1.1,
                    });
                } else {
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });

        // ScrollTrigger for each Day Card to drive the wheel
        cards.forEach((card, index) => {
            ScrollTrigger.create({
                trigger: card,
                start: "top 55%", // Trigger when card reaches 55% from top
                end: "bottom 55%",
                onEnter: () => updateFlywheel(index),
                onEnterBack: () => updateFlywheel(index),
            });
        });

        function updateFlywheel(activeIndex) {
            // Five nodes share the orbit evenly, so each chapter moves 72 degrees.
            const targetRotation = activeIndex * -72;

            // Animate wrapper rotation
            if (flywheel) {
                gsap.to(flywheel, {
                    '--wheel-rot': `${targetRotation}deg`,
                    duration: 1,
                    ease: "power3.out",
                    overwrite: "auto"
                });
            }

            // Update active classes
            nodes.forEach(n => n.classList.remove('active'));
            if(nodes[activeIndex]) {
                nodes[activeIndex].classList.add('active');
            }

            // Keep the compact mobile indicator in sync without creating an overlay.
            if (mobilePhaseLabel && cards[activeIndex]) {
                const phase = cards[activeIndex].querySelector('.text-accent')?.textContent.trim() || `Phase ${activeIndex + 1}`;
                const title = cards[activeIndex].querySelector('h3')?.textContent.trim() || '';
                mobilePhaseLabel.textContent = `${phase} - ${title}`;
            }

            if (mobilePhaseTrack) {
                mobilePhaseTrack.setAttribute('aria-valuenow', String(activeIndex + 1));
                mobilePhaseTrack.querySelectorAll('.mobile-phase-dot').forEach((dot, index) => {
                    dot.classList.toggle('is-active', index === activeIndex);
                });
            }
        }

        // Initialize first node active
        updateFlywheel(0);

        // --- 6. Chapter Interactions ---
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

                if (signalLabel) signalLabel.textContent = point.dataset.title || 'A little memory';
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
        setupDisclosure('letter-toggle', 'letter-body', 'Open this letter', 'Close this letter');
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
                if (futureLabel) futureLabel.textContent = choice.dataset.title || 'Your next chapter';
                if (futureCopy) futureCopy.textContent = choice.dataset.message || '';
            });
        });
