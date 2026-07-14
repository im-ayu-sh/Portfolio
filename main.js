document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const mainMenu = document.getElementById('main-menu');
    const portfolioScreen = document.getElementById('main-portfolio');
    const videoBgContainer = document.getElementById('video-bg-container');
    const bgVideo = document.getElementById('animus-bg-video');

    const syncProgress = document.getElementById('sync-progress');
    const progressText = document.getElementById('progress-text');
    const pressAnyKey = document.getElementById('press-any-key');
    const startBtn = document.getElementById('btn-start');
    const footerSelectBtn = document.getElementById('btn-footer-select');
    const exitBtn = document.getElementById('btn-exit');
    const returnButtons = document.querySelectorAll('.btn-return');

    // --- DYNAMIC FOOTER YEAR ---
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.innerText = new Date().getFullYear();
    }

    let isUiReady = false;
    let isVideoReady = false;
    let isWaitingForKey = false;
    let progress = 0;

    // --- AUDIO SYSTEM ---
    const introMusic = new Audio('sounds/intro.m4a');
    // Removed the loop so it acts as an intro, and increased volume slightly
    introMusic.volume = 0.6;    

    const hoverSfx = new Audio('sounds/hover.m4a');
    hoverSfx.volume = 0.5;

    const clickSfx = new Audio('sounds/click.m4a');
    clickSfx.volume = 0.6;

    // 1. Monitor Video Load Status
    bgVideo.addEventListener('canplaythrough', () => {
        isVideoReady = true;
        checkCombinedReadyState();
    });

    if (bgVideo.readyState > 3) {
        isVideoReady = true;
    }

    // 2. Boot Sequence
    function startBootSequence() {
        progress = 0;
        isUiReady = false;
        syncProgress.classList.remove('hidden');
        pressAnyKey.classList.add('hidden');
        
        const simulateLoading = setInterval(() => {
            progress += Math.floor(Math.random() * 20) + 5;

            if (progress >= 100) {
                progress = 100;
                clearInterval(simulateLoading);
                progressText.innerText = 'Sync Complete';
                isUiReady = true;
                checkCombinedReadyState();
            } else {
                progressText.innerText = `Synchronizing Memory Assets... ${progress}%`;
            }
        }, 150);
    }

    // Start boot sequence on initial load
    startBootSequence();

    // 3. Wait for BOTH UI animation and Video to finish loading
    function checkCombinedReadyState() {
        if (isUiReady && isVideoReady) {
            setTimeout(() => {
                syncProgress.classList.add('hidden');
                pressAnyKey.classList.remove('hidden');
                isWaitingForKey = true;
            }, 600);
        } else if (isUiReady && !isVideoReady) {
            progressText.innerText = 'Buffering Memory Video...';
        }
    }

    // 4. Screen Transition Handler
    function swapScreens(hideScreen, showScreen, action = 'forward') {
        // 1. Start Fade Out
        hideScreen.classList.remove('active');
        
        // 2. Logic for background/state changes
        if (action === 'showMenu') {
            videoBgContainer.classList.remove('hidden');
        } else if (action === 'exitToBoot') {
            videoBgContainer.classList.add('hidden');
        }

        // 3. Wait for fade-out to finish, then show the new screen
        setTimeout(() => {
            // Hide the old screen completely only after fade
            hideScreen.style.visibility = 'hidden'; 
            
            // Prepare the new screen
            showScreen.style.visibility = 'visible';
            
            // Trigger Fade In
            requestAnimationFrame(() => {
                showScreen.classList.add('active');
            });
        }, 600); // Match this with your CSS transition time (0.8s)
    } 

    // 5. Global "Press Any Key" & INTRO MUSIC TRIGGER
    document.addEventListener('keydown', handleGlobalKeypress);
    document.addEventListener('click', handleGlobalKeypress);

    function handleGlobalKeypress(e) {
        if (e.target.closest('button') || e.target.closest('#btn-footer-select')) return;

        // This ensures it ONLY triggers when you are on the loading screen and it is ready
        if (isWaitingForKey && loadingScreen.classList.contains('active')) {
            isWaitingForKey = false;
            
            // Rewind the intro music to 0 and play it every time this is clicked
            introMusic.currentTime = 0;
            introMusic.play().catch(error => console.log("Audio play prevented:", error));
            
            swapScreens(loadingScreen, mainMenu, 'showMenu');
        }
    }

    // 6. Navigation Logic
    startBtn.addEventListener('click', () => {
        swapScreens(mainMenu, portfolioScreen, 'forward');
    });

    // --- NEW: MAIN MENU KEYBOARD NAVIGATION ---
    
    // 1. Gather all menu buttons that are NOT disabled
    const menuButtons = Array.from(document.querySelectorAll('#main-menu .menu-btn:not(.disabled)'));
    let currentMenuIndex = 0;

    // 2. Set the initial focus when the page loads
    if (menuButtons.length > 0) {
        menuButtons[0].classList.add('focused');
    }

    // 3. Function to handle moving the focus highlight
    function updateMenuFocus(newIndex) {
        // Remove focus from old item
        menuButtons[currentMenuIndex].classList.remove('focused');
        
        // Update index with wrapping logic (top to bottom, bottom to top)
        currentMenuIndex = newIndex;
        if (currentMenuIndex < 0) currentMenuIndex = menuButtons.length - 1;
        if (currentMenuIndex >= menuButtons.length) currentMenuIndex = 0;
        
        // Add focus to new item
        menuButtons[currentMenuIndex].classList.add('focused');
    }

    // 4. Sync mouse hovers with the keyboard focus index
    menuButtons.forEach((btn, index) => {
        btn.addEventListener('mouseenter', () => {
            updateMenuFocus(index);
        });
    });

    // 5. Arrow Key and Enter Logic
    document.addEventListener('keydown', (e) => {
        // Only run this if the main menu is currently visible on screen
        if (!mainMenu.classList.contains('active')) return;

        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
            e.preventDefault(); // Prevent page scrolling
            updateMenuFocus(currentMenuIndex - 1);
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
            e.preventDefault();
            updateMenuFocus(currentMenuIndex + 1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            // Trigger the click event of whatever button is currently focused
            menuButtons[currentMenuIndex].click();
        }
    });

    // 6. Make the "SELECT" footer text trigger the focused item
    footerSelectBtn.addEventListener('click', () => {
        if (mainMenu.classList.contains('active')) {
            menuButtons[currentMenuIndex].click();
        }
    });



    // --- OPTIONS MENU & PREFERENCES (LOCALSTORAGE) ---
    const optionsBtn = document.getElementById('btn-options');
    const optionsMenu = document.getElementById('options-menu');
    const optionsBackBtn = document.getElementById('btn-options-back');
    const portfolioBackBtn = document.getElementById('btn-portfolio-back'); // New Portfolio Back Button
    
    const toggleThemeBtn = document.getElementById('toggle-theme');
    const toggleGlitchBtn = document.getElementById('toggle-glitch');
    const toggleScanlinesBtn = document.getElementById('toggle-scanlines');
    
    // New Easter Egg Variables
    const toggleDifficultyBtn = document.getElementById('toggle-difficulty');
    const difficultyDesc = document.getElementById('difficulty-desc');
    const toggleSubtitlesBtn = document.getElementById('toggle-subtitles');
    
    const scanlinesDiv = document.getElementById('scanlines');

    // 7. Navigation
    optionsBtn.addEventListener('click', () => swapScreens(mainMenu, optionsMenu, 'forward'));
    optionsBackBtn.addEventListener('click', () => swapScreens(optionsMenu, mainMenu, 'forward'));
    
    // NEW: Portfolio Back Button Logic
    portfolioBackBtn.addEventListener('click', () => {
        swapScreens(portfolioScreen, mainMenu, 'forward');
    });

    // 8. State Management & LocalStorage
    // Added difficulty and subtitles to default preferences
    const defaultPrefs = { 
        theme: 'animus', 
        glitch: true, 
        scanlines: false, 
        difficulty: 'Normal', 
        subtitles: false 
    };
    
    let userPrefs = JSON.parse(localStorage.getItem('animusSystemPrefs')) || defaultPrefs;

    function applyPreferences() {
        // Apply Theme
        if (userPrefs.theme === 'abstergo') {
            document.body.classList.add('abstergo-dark');
            toggleThemeBtn.innerText = 'Abstergo Dark';
        } else {
            document.body.classList.remove('abstergo-dark');
            toggleThemeBtn.innerText = 'Animus Light';
        }

        // Apply Glitch
        if (userPrefs.glitch) {
            document.body.classList.add('glitch-active');
            toggleGlitchBtn.innerText = 'ON';
        } else {
            document.body.classList.remove('glitch-active');
            toggleGlitchBtn.innerText = 'OFF';
        }

        // Apply Scanlines
        if (userPrefs.scanlines) {
            scanlinesDiv.classList.remove('hidden');
            setTimeout(() => scanlinesDiv.classList.add('active'), 50);
            toggleScanlinesBtn.innerText = 'ON';
        } else {
            scanlinesDiv.classList.remove('active');
            setTimeout(() => scanlinesDiv.classList.add('hidden'), 500); 
            toggleScanlinesBtn.innerText = 'OFF';
        }

        // Apply Difficulty Level
        if (userPrefs.difficulty === 'Easy') {
            toggleDifficultyBtn.innerText = 'Easy';
            difficultyDesc.innerText = 'Target: "Hire me on the spot."';
        } else if (userPrefs.difficulty === 'Hard') {
            toggleDifficultyBtn.innerText = 'Hard';
            difficultyDesc.innerText = 'Target: "Live Whiteboard Coding without Google."';
        } else {
            toggleDifficultyBtn.innerText = 'Normal';
            difficultyDesc.innerText = 'Target: "Standard Technical Interview."';
        }

        // Apply Developer Subtitles
        if (userPrefs.subtitles) {
            document.body.classList.add('subtitles-active');
            toggleSubtitlesBtn.innerText = 'ON';
        } else {
            document.body.classList.remove('subtitles-active');
            toggleSubtitlesBtn.innerText = 'OFF';
        }

        localStorage.setItem('animusSystemPrefs', JSON.stringify(userPrefs));
    }

    applyPreferences();

    // 9. Toggle Button Listeners
    toggleThemeBtn.addEventListener('click', () => {
        userPrefs.theme = userPrefs.theme === 'animus' ? 'abstergo' : 'animus';
        applyPreferences();
    });

    toggleGlitchBtn.addEventListener('click', () => {
        userPrefs.glitch = !userPrefs.glitch;
        applyPreferences();
    });

    toggleScanlinesBtn.addEventListener('click', () => {
        userPrefs.scanlines = !userPrefs.scanlines;
        applyPreferences();
    });

    // NEW: Cycle through Difficulty levels (Easy -> Normal -> Hard -> Easy)
    toggleDifficultyBtn.addEventListener('click', () => {
        if (userPrefs.difficulty === 'Easy') userPrefs.difficulty = 'Normal';
        else if (userPrefs.difficulty === 'Normal') userPrefs.difficulty = 'Hard';
        else userPrefs.difficulty = 'Easy';
        applyPreferences();
    });

    // NEW: Toggle Developer Subtitles
    toggleSubtitlesBtn.addEventListener('click', () => {
        userPrefs.subtitles = !userPrefs.subtitles;
        applyPreferences();
    });

    // --- EXIT BUTTON LOGIC ---
    exitBtn.addEventListener('click', () => {
        // Stop the intro music when returning to the boot screen
        introMusic.pause();
        introMusic.currentTime = 0;

        swapScreens(mainMenu, loadingScreen, 'exitToBoot');
        setTimeout(() => {
            startBootSequence();
        }, 1000);
    });

    // Universal Return Logic
    returnButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentActiveScreen = document.querySelector('.screen.active');
            const mainMenuScreen = document.getElementById('main-menu');
            
            if (currentActiveScreen && currentActiveScreen !== mainMenuScreen) {
                swapScreens(currentActiveScreen, mainMenuScreen);
            }
        });
    });

    // 10. Text Animation (Reusable Class-Based)
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
    const decryptElements = document.querySelectorAll('.decrypt-text');

    // NEW: We moved the scramble logic into a function so the arrow keys can call it
    window.triggerScramble = function(element) {
        let iteration = 0;
        const originalText = element.dataset.value;

        clearInterval(element.interval);

        element.interval = setInterval(() => {
            element.innerText = originalText
                .split("")
                .map((letter, index) => {
                    if (index < iteration) {
                        return originalText[index];
                    }
                    return letters[Math.floor(Math.random() * letters.length)];
                })
                .join("");

            if (iteration >= originalText.length) {
                clearInterval(element.interval);
                element.innerText = originalText;
            }

            iteration += 1 / 2;
        }, 30);
    };

    // Keep it working for mouse hovers
    decryptElements.forEach(element => {
        const triggerArea = element.closest('button') || element.closest('a') || element;

        triggerArea.addEventListener('mouseenter', () => {
            window.triggerScramble(element);
        });
    });

    // --- UI SOUND EFFECTS (HOVER & CLICK) ---
    const interactiveElements = document.querySelectorAll('button:not(.no-sfx), .menu-btn:not(.no-sfx), #btn-footer-select, .animus-link-light');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (el.classList.contains('disabled')) return; 
            
            hoverSfx.currentTime = 0; 
            hoverSfx.play().catch(() => {});
        });

        el.addEventListener('click', () => {
            if (el.classList.contains('disabled')) return;
            
            clickSfx.currentTime = 0;
            clickSfx.play().catch(() => {});
        });
    });


    // --- PORTFOLIO MUSIC PLAYER & MODAL INTEGRATION ---
    const playlist = ['sounds/song1.m4a', 'sounds/song2.m4a', 'sounds/song3.m4a'];
    let currentTrackIndex = parseInt(localStorage.getItem('animusTrackIndex')) || 0;
    let savedVolume = parseFloat(localStorage.getItem('animusMusicVolume')) || 0.6;

    const portfolioMusic = new Audio(playlist[currentTrackIndex]);
    portfolioMusic.volume = savedVolume;

    // Original Menu Elements (if they exist)
    const btnMusicToggle = document.getElementById('btn-music-toggle');
    const volumeSlider = document.getElementById('music-volume');
    const trackNameDisplay = document.getElementById('track-name');
    
    // New Modal Elements
    const btnMusicToggleFloat = document.getElementById('btn-music-toggle-float'); // Trigger button on dock
    const musicModal = document.getElementById('music-modal');
    const musicBackdrop = document.getElementById('music-backdrop');
    const btnCloseMusic = document.getElementById('close-music-btn');

    const modalPlayPauseBtn = document.getElementById('modal-play-pause-btn');
    const modalPlayIcon = document.getElementById('modal-play-icon');
    const modalPauseIcon = document.getElementById('modal-pause-icon');
    const modalPrevBtn = document.getElementById('modal-prev-btn');
    const modalNextBtn = document.getElementById('modal-next-btn');
    const modalVolumeSlider = document.getElementById('modal-volume-slider');
    const modalTrackName = document.getElementById('modal-track-name');

    // 1. Sync Text Displays
    function updateTrackDisplay() {
        const trackTitle = `[ SEQUENCE_TRACK_0${currentTrackIndex + 1} ]`;
        if (trackNameDisplay) trackNameDisplay.innerText = trackTitle;
        if (modalTrackName) modalTrackName.innerText = trackTitle;
    }
    updateTrackDisplay();

    // 2. Sync Play/Pause Icons State
    function syncPlayState() {
        if (portfolioMusic.paused) {
            modalPauseIcon.classList.add('hidden');
            modalPlayIcon.classList.remove('hidden');
            if(btnMusicToggle) btnMusicToggle.innerText = '▶ PLAY';
        } else {
            modalPlayIcon.classList.add('hidden');
            modalPauseIcon.classList.remove('hidden');
            if(btnMusicToggle) btnMusicToggle.innerText = '⏸ PAUSE';
        }
    }

    // 3. Play New Track Logic
    function playNewTrack() {
        localStorage.setItem('animusTrackIndex', currentTrackIndex);
        portfolioMusic.src = playlist[currentTrackIndex];
        updateTrackDisplay();
        portfolioMusic.play();
        syncPlayState();
    }

    // 4. Modal Open / Close Logic
    btnMusicToggleFloat.addEventListener('click', () => {
        musicModal.classList.remove('hidden');
        setTimeout(() => musicModal.classList.add('active'), 10);
    });

    const closeMusicModal = () => {
        musicModal.classList.remove('active');
        setTimeout(() => musicModal.classList.add('hidden'), 300); // Wait for CSS transition
    };

    btnCloseMusic.addEventListener('click', closeMusicModal);
    musicBackdrop.addEventListener('click', closeMusicModal);

    // 5. Playback Controls
    const togglePlayback = () => {
        if (portfolioMusic.paused) {
            if(introMusic) introMusic.pause(); // Mute intro if playing
            portfolioMusic.play();
        } else {
            portfolioMusic.pause();
        }
        syncPlayState();
    };

    modalPlayPauseBtn.addEventListener('click', togglePlayback);
    if(btnMusicToggle) btnMusicToggle.addEventListener('click', togglePlayback); // Sync old menu button

    modalNextBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        playNewTrack();
    });

    modalPrevBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        playNewTrack();
    });

    portfolioMusic.addEventListener('ended', () => {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        playNewTrack();
    });

    // 6. Dynamic Volume Slider UI (Matches temp3)
    const updateSliderBackground = (slider) => {
        if (!slider) return;
        const percentage = (slider.value - slider.min) / (slider.max - slider.min) * 100;
        slider.style.background = `linear-gradient(to right, var(--track-fill) ${percentage}%, var(--track-bg) ${percentage}%)`;
    };

    // Initialize Volumes
    if (volumeSlider) volumeSlider.value = savedVolume;
    modalVolumeSlider.value = savedVolume;
    updateSliderBackground(modalVolumeSlider);

    // Handle Modal Slider Change
    modalVolumeSlider.addEventListener('input', function(e) {
        updateSliderBackground(this);
        portfolioMusic.volume = e.target.value;
        localStorage.setItem('animusMusicVolume', e.target.value);
        if(volumeSlider) volumeSlider.value = e.target.value; // Keep preferences menu synced
    });

    // Handle Preferences Menu Slider Change
    if(volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            portfolioMusic.volume = e.target.value;
            localStorage.setItem('animusMusicVolume', e.target.value);
            modalVolumeSlider.value = e.target.value;
            updateSliderBackground(modalVolumeSlider); // Keep modal synced
        });
    }







    // --- ANIMUS GLOW TRACKER LOGIC ---
    function initBorderGlow() {
        const glowCards = document.querySelectorAll('.animus-glow-card');
        const edgeSensitivity = 30; 
        const colorSensitivity = edgeSensitivity + 20;

        glowCards.forEach(card => {
            // Function to calculate center of the card
            const getCenter = () => {
                const rect = card.getBoundingClientRect();
                return { cx: rect.width / 2, cy: rect.height / 2, rect };
            };

            card.addEventListener('pointermove', (e) => {
                const { cx, cy, rect } = getCenter();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const dx = x - cx;
                const dy = y - cy;

                // 1. Calculate Cursor Angle
                let radians = Math.atan2(dy, dx);
                let degrees = radians * (180 / Math.PI) + 90;
                if (degrees < 0) degrees += 360;

                // 2. Calculate Edge Proximity
                let kx = Infinity, ky = Infinity;
                if (dx !== 0) kx = cx / Math.abs(dx);
                if (dy !== 0) ky = cy / Math.abs(dy);
                let proximity = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1) * 100;

                // 3. Calculate Opacities based on proximity
                let borderOpacity = Math.max(0, (proximity - colorSensitivity) / (100 - colorSensitivity));
                let glowOpacity = Math.max(0, (proximity - edgeSensitivity) / (100 - edgeSensitivity));

                // 4. Inject variables to CSS
                card.style.setProperty('--cursor-angle', `${degrees.toFixed(2)}deg`);
                card.style.setProperty('--border-opacity', borderOpacity);
                card.style.setProperty('--glow-opacity', glowOpacity);
            });

            // Handle Reset on Leave
            card.addEventListener('pointerleave', () => {
                card.style.setProperty('--border-opacity', '0');
                card.style.setProperty('--glow-opacity', '0');
            });
        });
    }

    // Initialize the glow effect
    initBorderGlow();
    
    // --- TYPEWRITER EFFECT LOGIC ---
    const typeWriterElement = document.getElementById('typewriter-text');
    
    if (typeWriterElement) {
        // Words to cycle through
        const words = [
            "Web Developer", 
            "MCA '26 Student", 
            "Front-End Architect", 
            "Creative Coder"
        ];
        
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        function type() {
            const currentWord = words[wordIndex];
            
            if (isDeleting) {
                // Remove a character
                typeWriterElement.innerText = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                // Add a character
                typeWriterElement.innerText = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }
            
            // Set typing speeds
            let typeSpeed = isDeleting ? 50 : 100;
            
            // If word is completely typed
            if (!isDeleting && charIndex === currentWord.length) {
                typeSpeed = 2000; // Pause at end of word
                isDeleting = true;
            } 
            // If word is completely deleted
            else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex++;
                if (wordIndex === words.length) {
                    wordIndex = 0; // Loop back to the first word
                }
                typeSpeed = 500; // Pause before typing new word
            }
            
            setTimeout(type, typeSpeed);
        }
        
        // Start the effect
        setTimeout(type, 1000);
    }

    // --- SEAMLESS INFINITE MARQUEE ---
    const marqueeContent = document.querySelector('.marquee-content');
    
    if (marqueeContent) {
        // 1. Clone the original content dynamically
        const originalHTML = marqueeContent.innerHTML;
        marqueeContent.innerHTML += originalHTML; // Duplicates it perfectly

        // 2. Smooth Scrolling Logic using requestAnimationFrame
        let scrollPos = 0;
        const speed = 0.4; // Adjust this value to change speed (higher = faster)

        function animateMarquee() {
            scrollPos -= speed;
            
            // Reset position when exactly half of the content has scrolled out of view
            if (scrollPos <= -(marqueeContent.scrollWidth / 2)) {
                scrollPos = 0;
            }
            
            // translate3d forces GPU hardware acceleration for zero stuttering
            marqueeContent.style.transform = `translate3d(${scrollPos}px, 0, 0)`; 
            requestAnimationFrame(animateMarquee);
        }

        // Start the engine
        animateMarquee();
    }


    // --- 3D TILT EFFECT FOR HERO CARD ---
    const tiltCard = document.querySelector('.hero-glass-card');

    if (tiltCard) {
        tiltCard.addEventListener('mousemove', (e) => {
            // Remove the smooth reset transition so it tracks instantly
            tiltCard.classList.remove('reset-tilt');

            const rect = tiltCard.getBoundingClientRect();
            
            // Get cursor position relative to the card
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Find the center of the card
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate the rotation limits (change the '15' to make it tilt more or less)
            const rotateX = ((y - centerY) / centerY) * -15; // Tilts up/down
            const rotateY = ((x - centerX) / centerX) * 15;  // Tilts left/right

            // Apply the 3D transform
            tiltCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        // When the mouse leaves, snap it back to flat
        tiltCard.addEventListener('mouseleave', () => {
            tiltCard.classList.add('reset-tilt');
            // The CSS class handles resetting it to 0deg
        });
    }




    // --- PROJECT DETAIL MODAL LOGIC ---
    
    // 1. Project Database
    const projectDetails = {
        '1': {
            category: 'AUTOMATION / SCRIPTING',
            title: 'Nova Stellar System',
            tech: ['Google Apps Script', 'JavaScript', 'HTML/CSS', 'PDF Generator'],
            desc: 'A complete end-to-end automated registration and entry card system. Utilizing Google Apps Script to bypass standard backend server costs, this system successfully generated and emailed over 500 PDF passes automatically. It features dynamic QR code generation, real-time Google Sheets database syncing, and a responsive frontend for users to register seamlessly with zero downtime.',
            liveLink: '#' // Add your real link here
        },
        '2': {
            category: 'AI / SUSTAINABILITY',
            title: 'EcoScan AI',
            tech: ['React', 'Tailwind CSS', 'AI Image Recognition', 'Node.js'],
            desc: 'An intelligent waste identification platform engineered to drive the circular economy. Features include machine-learning image recognition for sorting, real-time market value calculators for recyclable materials, and dynamic carbon footprint tracking to optimize responsible waste management workflows. Designed with a highly interactive, glass-morphism UI.',
            liveLink: 'https://ecoscan-5ox.pages.dev/'
        },
        '3': {
            category: 'SAAS / WEB APP',
            title: 'Invoice Generator',
            tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Local Storage API'],
            desc: 'A dynamic web app featuring customizable templates for freelancers and businesses. Select a template, fill the required fields to generate professional PDF invoices, and seamlessly reuse saved template fields for future generation. Built with a focus on fast state management, reusable components, and clean, printable CSS layouts.',
            liveLink: '#' // Add your real link here
        }
    };

    // 2. DOM Elements
    const projectModal = document.getElementById('project-modal');
    const projectBackdrop = document.getElementById('project-backdrop');
    const closeProjectBtn = document.getElementById('close-project-btn');
    const openProjectBtns = document.querySelectorAll('.open-project-btn');

    const modalCategory = document.getElementById('modal-project-category');
    const modalTitle = document.getElementById('modal-project-title');
    const modalDesc = document.getElementById('modal-project-desc');
    const modalTech = document.getElementById('modal-project-tech');
    const modalLiveLink = document.getElementById('modal-project-live');

    // 3. Open Modal Event
    openProjectBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const projectId = btn.getAttribute('data-project-id');
            const data = projectDetails[projectId];

            if(data) {
                // Populate Data
                modalCategory.innerText = data.category;
                modalTitle.innerText = data.title;
                modalTitle.setAttribute('data-text', data.title); // For glitch effect
                modalDesc.innerText = data.desc;
                modalLiveLink.href = data.liveLink;
                
                // Populate Tech Stack Tags
                modalTech.innerHTML = data.tech.map(tech => `<span>${tech}</span>`).join('');

                // Show Modal (Reusing your CSS transition classes)
                projectModal.classList.remove('hidden');
                setTimeout(() => projectModal.classList.add('active'), 10);
                
                // Optional: Play your click SFX
                if(clickSfx) {
                    clickSfx.currentTime = 0;
                    clickSfx.play().catch(() => {});
                }
            }
        });
    });

    // 4. Close Modal Event
    const closeProjectModal = () => {
        projectModal.classList.remove('active');
        setTimeout(() => projectModal.classList.add('hidden'), 300); // Matches CSS transition time
    };

    if(closeProjectBtn) closeProjectBtn.addEventListener('click', closeProjectModal);
    if(projectBackdrop) projectBackdrop.addEventListener('click', closeProjectModal);





// --- BACK TO TOP BUTTON LOGIC ---
    const portfolioContainer = document.getElementById('main-portfolio');
    const aboutSection = document.getElementById('about');
    const backToTopBtn = document.getElementById('btn-back-to-top');

    if (portfolioContainer && aboutSection && backToTopBtn) {
        
        // Listen for scrolling inside the portfolio screen
        portfolioContainer.addEventListener('scroll', () => {
            const aboutOffset = aboutSection.offsetTop;
            
            // If scrolled down further than the top of the About section (-100px buffer)
            if (portfolioContainer.scrollTop > (aboutOffset - 100)) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        // When clicked, scroll smoothly back to the top
        backToTopBtn.addEventListener('click', () => {
            portfolioContainer.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Optional: click sound
            if (typeof clickSfx !== 'undefined') {
                clickSfx.currentTime = 0;
                clickSfx.play().catch(()=>{});
            }
            
            // NOTE: You don't need to manually hide the button here! 
            // As the page scrolls up, the 'scroll' event listener above 
            // will automatically remove the 'show' class once it passes the About section.
        });
    }













































});