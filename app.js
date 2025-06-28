class ZipperAnimation {
    constructor() {
        this.isAnimating = false;
        this.animationDuration = 2350; // Total 4 sec
        this.zipperDuration = 2000; // 2 sec for zipper opening
        this.zoomFadeDuration = 2000; // 2 sec for zoom and fade
        this.elements = {};
        this.teeth = [];
        this.archPoints = [];
        this.lastSliderY = 0;
        this.reviews = [];
        this.featuredReviews = [];
        
        this.init();
    }
    
    init() {
        console.log('Initializing enhanced zipper animation...');
        // Get DOM elements
        this.elements = {
            fabricLeft: document.getElementById('fabric-left'),
            fabricRight: document.getElementById('fabric-right'),
            zipperSlider: document.getElementById('zipper-slider'),
            zipperTeeth: document.getElementById('zipper-teeth'),
            homepageContent: document.getElementById('homepage-content'),
            zipperContainer: document.getElementById('zipper-container')
        };
        // Check if elements exist
        for (const [key, element] of Object.entries(this.elements)) {
            if (!element) {
                console.error(`Element ${key} not found`);
                return;
            }
        }
        console.log('All elements found successfully');
        // Generate teeth
        this.generateTeeth();
        // Setup initial state
        this.setupInitialState();
        this.setupZoomPrevention();
        // Start animation after delay
        setTimeout(() => {
            console.log('Starting 6-step zipper animation...');
            this.startAnimation();
        }, 1000);
    }

    setupZoomPrevention() {
        // Prevent keyboard zoom shortcuts
        document.addEventListener('keydown', (e) => {
            // Detect Ctrl+Plus, Ctrl+Minus, Ctrl+0
            if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '0')) {
                const currentZoom = window.screen.width / window.innerWidth;
                // Allow zoom in beyond current level, but prevent zoom out below 66.66%
                if (e.key === '-' && currentZoom <= 0.67) {
                    e.preventDefault();
                    console.log('Zoom out prevented - minimum 66.66% reached');
                    return false;
                }
            }
        }, { passive: false });
        // Prevent wheel zoom when below threshold
        document.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                const currentZoom = window.screen.width / window.innerWidth;
                // Prevent zoom out if already at or below 66.66%
                if (e.deltaY > 0 && currentZoom <= 0.67) {
                    e.preventDefault();
                    console.log('Wheel zoom out prevented - minimum 66.66% reached');
                    return false;
                }
            }
        }, { passive: false });
    }

    generateTeeth() {
        const isLandscape = window.matchMedia("(orientation: landscape)").matches;
        const container = this.elements.zipperTeeth;
        const actualHeight = Math.max(
            document.documentElement.clientHeight,
            window.innerHeight,
            document.body.scrollHeight
        );
        const viewportHeight = isLandscape ? window.screen.width : window.screen.height;
        const teethSpacing = isLandscape ? 18 : 15;
        const teethCount = Math.floor(viewportHeight / teethSpacing) + 5;
        container.innerHTML = '';
        this.teeth = [];
        for (let i = 0; i < teethCount; i++) {
            const leftTooth = document.createElement('div');
            const rightTooth = document.createElement('div');
            leftTooth.className = 'tooth tooth-left';
            rightTooth.className = 'tooth tooth-right';
            leftTooth.style.top = `${i * teethSpacing}px`;
            rightTooth.style.top = `${i * teethSpacing}px`;
            this.teeth.push({
                left: leftTooth,
                right: rightTooth,
                position: i * teethSpacing,
                opened: false
            });
            container.appendChild(leftTooth);
            container.appendChild(rightTooth);
        }
        console.log(`Generated ${teethCount * 2} teeth for height: ${actualHeight}px`);
    }
    setupInitialState() {
        this.elements.fabricLeft.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
        this.elements.fabricRight.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';                       
        this.elements.zipperSlider.style.top = '-30px';
        this.elements.zipperSlider.style.bottom = 'auto';
        this.elements.zipperSlider.style.left = '50%';
        this.elements.zipperSlider.style.transform = 'translateX(-50%)';
        this.elements.homepageContent.style.opacity = '0';
        this.elements.homepageContent.style.transform = 'scale(0.8) rotateX(180deg)';
        this.teeth.forEach(tooth => {
            tooth.left.classList.remove('opened-teeth-left');
            tooth.right.classList.remove('opened-teeth-right');
            tooth.opened = false;
        });
        console.log('Step 1: Initial state setup complete - zipper body at top, fully closed');
    }
    startAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const totalProgress = Math.min(elapsed / this.animationDuration, 1);
            if (elapsed < this.zipperDuration) {
                const zipperProgress = elapsed / this.zipperDuration;
                this.updateSliderPosition(zipperProgress);
                this.updateFabricOpening(zipperProgress);
                this.updateTeethOpening(zipperProgress);
                this.updateContentVisibility(zipperProgress);
            } else {
                const progress = (elapsed - this.zipperDuration) / this.zoomFadeDuration;
                this.updateAnimation(progress);
            }
            if (totalProgress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.onAnimationComplete();
            }
        };
        animate();
    }
    updateSliderPosition(progress) {
        const windowHeight = window.innerHeight;
        const sliderHeight = 60;
        const maxY = windowHeight - sliderHeight + 30;
        const currentY = -30 + (progress * maxY);
        this.elements.zipperSlider.style.top = `${currentY}px`;
        console.log(`Step ${progress < 0.5 ? '2' : '3'}: Slider at ${Math.round(progress * 100)}% descent`);
    }
    updateFabricOpening(progress) {
        const windowHeight = window.innerHeight;
        const sliderHeight = 60;
        const currentSliderY = -30 + (progress * (windowHeight - sliderHeight + 30));
        const sliderCenterX = 50;
        const sliderTopY = ((currentSliderY) / windowHeight) * 100;
        const currentVWidth = (progress * 44);
        const leftClipPath = `polygon(
            0% 100%,
            100% 100%,
            100% ${sliderTopY}%,
            100% ${sliderTopY}%,
            ${100 - currentVWidth}% 0%,
            0% 0%
        )`;
        const rightClipPath = `polygon(
            100% 100%,
            0% 100%,
            0% ${sliderTopY}%,
            0% ${sliderTopY}%,
            ${currentVWidth}% 0%,
            100% 0%
        )`;
        this.elements.fabricLeft.style.clipPath = leftClipPath;
        this.elements.fabricRight.style.clipPath = rightClipPath;
    }
    updateTeethOpening(progress) {
        const windowHeight = window.innerHeight;
        const currentSliderPosition = progress * windowHeight;
        const centerGapWidth = progress * 270; 
        this.teeth.forEach((tooth, index) => {
            if (currentSliderPosition >= tooth.position) {
                const positionRatio = 1 - (tooth.position / windowHeight);
                const localGapWidth = centerGapWidth * positionRatio;
                const pixelDisplacement = (localGapWidth / 100) * window.innerWidth * 0.20;
                tooth.left.style.transform = `translateX(-${pixelDisplacement}px)`;
                tooth.right.style.transform = `translateX(${pixelDisplacement}px)`;
                tooth.left.classList.add('opened-teeth-left');
                tooth.right.classList.add('opened-teeth-right');
            }
        });
    }
    updateContentVisibility(progress) {
        if (progress > 0.05) {
            const contentProgress = Math.min((progress - 0.05) / 0.95, 1);
            this.elements.homepageContent.style.opacity = contentProgress.toString();
            this.elements.homepageContent.style.transform = `scale(${0.9 + (contentProgress * 0.1)})`;
        }
    }
    updateAnimation(progress) {
        const clampedProgress = Math.min(progress, 1);
        this.elements.homepageContent.style.opacity = '1';
        const scaleValue = 1.0 + (clampedProgress * 0.3);
        this.elements.homepageContent.style.transform = `scale(${scaleValue})`;
        const zipperOpacity = 1 - clampedProgress * 5.0;
        this.elements.fabricLeft.style.opacity = zipperOpacity.toString();
        this.elements.fabricRight.style.opacity = zipperOpacity.toString();
        this.elements.zipperSlider.style.opacity = zipperOpacity.toString();
        this.elements.zipperTeeth.style.opacity = zipperOpacity.toString();
    }
    onAnimationComplete() {
        // Add scroll restore to 0 after animation
        window.requestAnimationFrame(() => {
            window.scrollTo(0, this.savedScrollPosition);
        });
        console.log('Animation complete - ensuring homepage content is visible');
        this.elements.homepageContent.style.opacity = '1';
        this.elements.homepageContent.style.transform = 'scale(1)';
        this.elements.homepageContent.style.zIndex = '100';
        this.elements.homepageContent.style.transform = 'none';
        this.elements.fabricLeft.style.display = 'none';
        this.elements.fabricRight.style.display = 'none';
        this.elements.zipperSlider.style.display = 'none';
        this.elements.zipperTeeth.style.display = 'none';
        // Hide the entire zipper container
        this.elements.zipperContainer.style.display = 'none';
        this.elements.zipperContainer.style.zIndex = '-1';
        // Restore body scrolling
        document.body.style.overflow = 'auto';        
        setTimeout(() => {
            this.elements.homepageContent.style.transition = 'none';
        }, 1200);
        this.isAnimating = false;
        // Verifiy reviewSuccess msg first; show msg to user
        if (sessionStorage.getItem('reviewSuccess') === 'true') {
            sessionStorage.removeItem('reviewSuccess');
        }
    }
}


// SeuCantto e-commerce
class AppState {
    constructor() {
        this.products = [];
        this.cart = [];
        this.user = null;
        this.isLoggedIn = false;
        this.currentPage = 'home';
        this.previousPage = 'home';
        this.shippingInfo = null;
        this.pendingPurchaseProductId = null;
        this.pendingReviewModal = false;
        this.otpCode = null;
        this.otpTimer = null;
        this.isAdmin = false;
        this.zipperAnimation = null;
        this.domReady = false;
        this.currentProductImages = null; // Image gallery state management
        this.currentMainImageIndex = 0;
        this.inactivityTimer = null;
        this.sessionDuration = 259200000; // 72 hrs in ms
        this.otpAttempts = new Map(); // Track attempts per email
        this.otpGenerationAttempts = new Map(); // Track generation attempts
        this.maxOtpAttempts = 3; // Max verification attempts
        this.maxGenerationAttempts = 5; // Max generation attempts per hour
        this.attemptWindowMs = 3600000; // 1 hr in ms
        this.lockoutDurationMs = 1800000; // 30 min lockout
        this.reviewAttempts = new Map(); // Track attempts per user
        this.maxReviewsPerDay = 2; // Allow only 2 reviews
        this.reviewWindowMs = 86400000; // 24 hrs in ms
        this.githubAuth = null;
        this.useProxy = false;
        this.proxyUrl = null;
        this.cacheBuster = Date.now();      
        this.baseUrl     = window.location.origin || '';
        this.authRetries = 0;
        this.maxAuthRetries = 3;
        this.config = {
            maxReviews: 100,
            reviewsPerPage: 10,
            autoRefreshInterval: 30000, // 30 sec
        };
    }

    init() {
            // Ensure DOM is fully ready before initializing zipper
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.initializeApp();
                });
            } else {
                this.initializeApp();
            }
        }
    handleNavigation() {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
    } 
    initializeApp() {
        this.initializeZipperAnimation();
        this.loadProducts();
        this.loadCartFromStorage();
        this.loadUserFromStorage();
        this.loadUserProfileFromStorage();
        this.setupEventListeners();
        this.updateCartCount();
        if (window.reviewManager) {
            window.reviewManager.loadReviews();
        }
        this.initializeGitHubAuth();
        // Session management for all logged-in users
        if (this.isLoggedIn) {
            const lastActivity = localStorage.getItem('seucanto_last_activity');
            if (lastActivity) {
                const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
                console.log(`Time since last activity: ${Math.round(timeSinceLastActivity / 3600000)} hours`);
                
                if (timeSinceLastActivity > this.sessionDuration) {
                    console.log('Session expired on initialization - logging out');
                    this.logout();
                    return;
                }
            }
            
            // Start activity tracking for logged-in users
            console.log('Starting activity tracking for existing session');
            this.startActivityTracking();
        }
    }

    initializeGitHubAuth() {
        // Load the authentication script
        if (!window.GitHubAuth) {
            const script = document.createElement('script');
            script.src = '/auth/github-app-auth.js';
            script.onload = () => {
            this.githubAuth = new GitHubAuth();
            console.log('GitHub Auth inicializado');
            };
            document.head.appendChild(script);
        } else {
            this.githubAuth = new GitHubAuth();
        }
    }
    
    initUserProfile() {
        if (!this.userProfile) {
            this.userProfile = {
                name: '',
                phone: '',
                cpf: '',
                cep: '',
                street: '',
                neighborhood: '',
                city: '',
                state: '',
                number: '',
                complement: ''
            };
        }
    }
    loadUserProfileFromStorage() {
        try {
            // Use consistent key naming
            const profileKey = this.user?.email ? 
                `seucanto_user_profile_${this.user.email}` : 
                'seucanto_user_profile';
            const stored = localStorage.getItem(profileKey);
            if (stored) {
                this.userProfile = JSON.parse(stored);
                console.log('User profile loaded:', this.userProfile);
            } else {
                console.log('No stored profile found, initializing...');
                this.initUserProfile();
            }
        } catch (e) {
            console.error('Error loading user profile:', e);
            this.initUserProfile();
        }
    }
    saveUserProfileToStorage() {
        try {
            // Use consistent key naming
            const profileKey = this.user?.email ? 
                `seucanto_user_profile_${this.user.email}` : 
                'seucanto_user_profile';
            
            localStorage.setItem(profileKey, JSON.stringify(this.userProfile));
            console.log('User profile saved with key:', profileKey);
        } catch (e) {
            console.error('Error saving user profile:', e);
        }
    }
    
    startActivityTracking() {
        if (!this.isLoggedIn) {
            console.log('Cannot start activity tracking - user not logged in');
            return;
        }
        console.log('Starting comprehensive activity tracking for session management');
        // Set initial activity time
        localStorage.setItem('seucanto_last_activity', Date.now().toString());
        // Start the inactivity timer
        this.resetInactivityTimer();
        // Setup activity event listeners
        this.setupActivityListeners();
        console.log(`Session tracking active - auto-logout in ${this.sessionDuration / 3600000} minutes of inactivity`);
    }

    // Activity tracker 
    setupActivityListeners() {
        // Always remove existing listeners first to prevent duplicates
        this.removeActivityListeners();
        // Create bound functions to ensure proper cleanup
        this.boundResetTimer = this.resetInactivityTimer.bind(this);
        // Activity events that should reset the timer
        const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'mousedown'];
        activityEvents.forEach(event => {
            document.addEventListener(event, this.boundResetTimer, { passive: true });
        });
        console.log('Activity listeners attached for session management');
    }
    // Cleanup method for activity listeners
    removeActivityListeners() {
        if (this.boundResetTimer) {
            const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'mousedown'];
            activityEvents.forEach(event => {
                document.removeEventListener(event, this.boundResetTimer);
            });
            this.boundResetTimer = null;
            console.log('Activity listeners removed');
        }
    }

    // Send OTP e-mail to user
    async sendOTPEmail(email, otpCode) {
        const templateParams = {
            to_email: email,
            otp_code: otpCode,
            user_name: email.split('@')[0], // Use email prefix as name
            timestamp: new Date().toLocaleString('pt-BR')
        };
        try {
            const response = await emailjs.send(
                'service_6fhviva',    // Replace with your Service ID
                'template_3gqjhzo',   // Replace with your Template ID
                templateParams
            );
            console.log('Email sent successfully:', response.status, response.text);
            return response;
        } catch (error) {
            console.error('EmailJS error:', error);
            throw error;
        }
    }

    // Initialize zipper animation
    initializeZipperAnimation() {
        if (this.animationInitialized) return;
        this.animationInitialized = true;
        // Verify all required elements exist before initialization
        const requiredElements = [
            'fabric-left',
            'fabric-right', 
            'zipper-slider',
            'zipper-teeth',
            'homepage-content',
            'zipper-container'
        ];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        if (missingElements.length > 0) {
            console.error('Missing required elements for zipper animation:', missingElements);
            // Fallback
            this.showContentWithoutAnimation();
            return;
        }
        try {
            this.zipperAnimation = new ZipperAnimation();
            console.log('Zipper animation initialized successfully');
        } catch (error) {
            console.error('Error initializing zipper animation: ', error);
            this.showContentWithoutAnimation();
        }
    }
    showContentWithoutAnimation() {
        const homepageContent = document.getElementById('homepage-content');
        const zipperContainer = document.getElementById('zipper-container');
        if (homepageContent) {
            homepageContent.style.opacity = '1';
            homepageContent.style.transform = 'scale(1)';
            homepageContent.style.zIndex = '100';
        }
        if (zipperContainer) {
            zipperContainer.style.display = 'none';
        }
        this.showPage('home');
    }

    loadProducts() {
        this.products = [
            {
                "id": 1, 
                "name": "Bolsa nº 01", 
                "originalPrice": 249.90, 
                "salePrice": 189.90, 
                "images": [
                    "https://images.tcdn.com.br/img/img_prod/965739/bolsa_de_croche_flor_189_variacao_55_1_265d48d1e7521b4e032531686bd96dcc.jpg", 
                    "https://m.media-amazon.com/images/I/51b6Vv0gFXL._AC_SY1000_.jpg",
                    "https://cdn-icons-png.flaticon.com/512/1042/1042536.png",
                    ""
                ],
                "description": "Elegante bolsa de alta qualidade, perfeita para o dia a dia. Feita com materiais duráveis e design moderno que combina com qualquer ocasião. Material principal: couro ecológico",
                "dimensions": {"width": 30, "height": 15, "depth": 6}, 
                "weight": 0.29
            },
            {
                "id": 2, 
                "name": "Bolsa nº 02", 
                "originalPrice": 309.90, 
                "salePrice": 289.90, 
                "images": [
                    "https://grupooscar.vtexassets.com/arquivos/ids/1384813/kit_bolsa_feminina_necessaire_chenson_original_tresse_elegance_mao_3485004_7217_variacao_22169_1_6bc7c995697d99bcd6fa2cc920cfc990.webp.webp?v=638809296401070000",
                    "https://cdn-icons-png.flaticon.com/512/8322/8322731.png",
                    "https://cdn-icons-png.flaticon.com/512/2345/2345130.png",
                    ""
                ],
                "description": "Bolsa artesanal. Pequena por fora, mas espaçosa por dentro. Ideal para momentos especiais! Material principal: algodão",
                "dimensions": {"width": 35, "height": 24, "depth": 5}, 
                "weight": 0.27
            },
            {
                "id": 3, 
                "name": "Bolsa nº 03", 
                "originalPrice": 199.90, 
                "salePrice": 169.90, 
                "images": [
                    "https://d87n9o45kphpy.cloudfront.net/Custom/Content/Products/28/07/2807853_bolsa-de-praia-grande-gabriela-trama-rafia-bege-5197342_l1_638663983727213652.webp", 
                    "https://cdn-icons-png.flaticon.com/512/2345/2345130.png",
                    ""
                ],
                "description": "Bolsa compacta e versátil, perfeita para quem busca praticidade sem abrir mão do estilo. Material principal: couro ecológico",
                "dimensions": {"width": 123.6, "height": 71.4, "depth": 8.9}, 
                "weight": 0.3
            },
            {
                "id": 4, 
                "name": "Bolsa nº 04", 
                "originalPrice": 189.90, 
                "salePrice": 159.90, 
                "images": [
                    "https://grupooscar.vtexassets.com/arquivos/ids/1462020/kit_bolsa_feminina_necessaire_chenson_original_tresse_elegance_hobo_3485002_7213_variacao_22157_3_04b7417ca5dcce02c69f75a2d6f69620.webp.webp?v=638814471189870000", 
                    "https://img.lojasrenner.com.br/item/928666563/original/8.jpg",
                    ""
                ],
                "description": "Bolsa artesanal em couro com design minimalista e acabamento em rebites de latão. Material principal: couro legítimo",
                "dimensions": {"width": 18.5, "height": 20.2, "depth": 8.5}, 
                "weight": 0.25
            },
            {
                "id": 5, 
                "name": "Bolsa nº 05", 
                "originalPrice": 289.90, 
                "salePrice": 269.90, 
                "images": [
                    "https://carmin.vteximg.com.br/arquivos/ids/183659-1000-1500/B018589-COR-8650-1%20-1-.webp.webp?v=638780059407400000",
                    "https://cdn-icons-png.flaticon.com/512/9011/9011529.png", 
                    "https://img.freepik.com/vetores-premium/moedas-do-saco-de-dinheiro_78370-217.jpg",
                    ""                
                ],
                "description": "A bag preferida do Henrique. Para todas as ocasiões. Material principal: din-din",
                "dimensions": {"width": 25, "height": 28, "depth": 15}, 
                "weight": 0.3
            },
            {
                "id": 6, 
                "name": "NOVIDADE EM BREVE", 
                "originalPrice": 0, 
                "salePrice": 0, 
                "images": [
                    "https://www.uel.br/eventos/sipim/pages/arquivos/Imagens%202020/breve.png", 
                    ""
                ],
                "description": "Novidade em breve, aguarde!",
                "dimensions": {"width": 0, "height": 0, "depth": 0}, 
                "weight": 0
            }
        ];
        this.renderProducts();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            // Verify if app.user.email was defined by login
            const emailInput = document.getElementById('reviewEmail');
            if (app.user && app.user.email && emailInput) {
                // Fix value on field as readonly
                emailInput.value = app.user.email;
                emailInput.readOnly = true;
            }
            app.setupEventListeners();
        });

        const editInfoForm = document.getElementById('editInfoForm');
        if (editInfoForm) {
            editInfoForm.addEventListener('submit', this.handleEditInfoForm.bind(this));
        }
        
        // Formatters for edit form
        const editCpf = document.getElementById('editCpf');
        if (editCpf) {
            editCpf.addEventListener('input', this.formatCPF);
        }
        
        const editCep = document.getElementById('editCep');
        if (editCep) {
            editCep.addEventListener('input', this.formatCEP);
            editCep.addEventListener('blur', this.lookupAddressEditP.bind(this));
        }
        
        const editPhone = document.getElementById('editPhone');
        if (editPhone) {
            editPhone.addEventListener('input', this.formatPhone);
        }

        const otpForm = document.getElementById('otpForm');
        if (otpForm) {
            otpForm.addEventListener('submit', this.handleOTPVerification.bind(this));
        }
        
        const shippingCpf = document.getElementById('shippingCpf');
        if (shippingCpf) {
            shippingCpf.addEventListener('input', this.formatCPFDisplay);
        }

        const adminLoginForm = document.getElementById('adminLoginForm');
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', this.handleAdminLogin.bind(this));
        }
        
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', this.handleProductForm.bind(this));
        }
        
        const shippingForm = document.getElementById('shippingForm');
        if (shippingForm) {
            shippingForm.addEventListener('submit', this.handleShippingForm.bind(this));
        }

        const cepInput = document.getElementById('cepInput');
        if (cepInput) {
            cepInput.addEventListener('input', this.formatCEP);
        }
        
        const shippingCep = document.getElementById('shippingCep');
        if (shippingCep) {
            shippingCep.addEventListener('input', this.formatCEP);
            shippingCep.addEventListener('blur', this.lookupAddress.bind(this));
        }

        const shippingPhone = document.getElementById('shippingPhone');
        if (shippingPhone) {
            shippingPhone.addEventListener('input', this.formatPhone);
        }

        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', this.toggleMobileMenu);
        }

        document.addEventListener('click', this.handleModalClose);

        if (window.location.pathname.includes('/admin') || window.location.hash === '#admin') {
            this.showAdminLogin();
        }
    }

    loadCartFromStorage() {
        try {
        const storage = this.isLoggedIn ? localStorage : sessionStorage;
        const stored = storage.getItem('seucanto_cart');
        this.cart = stored ? JSON.parse(stored) : [];
        } catch (e) {
        console.error('Error loading cart:', e);
        this.cart = [];
        }
    }
    saveCartToStorage() {
        try {
        const storage = this.isLoggedIn ? localStorage : sessionStorage;
        storage.setItem('seucanto_cart', JSON.stringify(this.cart));
        } catch (e) {
        console.error('Error saving cart:', e);
        }
    }
    loadUserFromStorage() {
        try {
            const stored = localStorage.getItem('seucanto_user');
            if (stored) {
                this.user = JSON.parse(stored);
                this.isLoggedIn = true;
            }
        } catch (e) {
            console.error('Error loading user from storage:', e);
        }
    }
    saveUserToStorage() {
        try {
            localStorage.setItem('seucanto_user', JSON.stringify(this.user));
        } catch (e) {
            console.error('Error saving user to storage:', e);
        }
    }

    renderProducts() {
        const grid = document.getElementById('productsGrid');
        if (!grid) {
            console.error("The element with ID 'productsGrid' was not found.");
            return;
        }
        grid.innerHTML = this.products.map(product => `
            <div class="product-card">
                <img src="${product.images[0]}" alt="${product.name}" class="product-image" onclick="window.app.showProductDetail(${product.id})" style="cursor: pointer;">
                <div class="product-info">
                    <h3 class="product-name" onclick="window.app.showProductDetail(${product.id})" style="cursor: pointer;">${product.name}</h3>
                    <div class="product-prices">
                        <span class="original-price">R$ ${product.originalPrice.toFixed(2).replace('.', ',')}</span>
                        <span class="sale-price">R$ ${product.salePrice.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn--buy-now" onclick="window.app.buyNow(${product.id})">Comprar</button>
                        <button class="btn btn--add-cart" onclick="window.app.addToCart(${product.id})">Adicionar ao carrinho</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    showProductDetail(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        // Store the original product images for reference
        this.currentProductImages = [...product.images];
        this.currentMainImageIndex = 0; // Track which image is currently displayed
        // Update product detail page elements
        const mainImage = document.getElementById('productMainImage');
        const productName = document.getElementById('productDetailName');
        const originalPrice = document.getElementById('productDetailOriginalPrice');
        const salePrice = document.getElementById('productDetailSalePrice');
        const description = document.getElementById('productDetailDescription');
        const dimensions = document.getElementById('productDetailDimensions');
        const weight = document.getElementById('productDetailWeight');
        const additionalImages = document.getElementById('additionalImages');
        const buyBtn = document.getElementById('buyNowDetailBtn');
        const addCartBtn = document.getElementById('addCartDetailBtn');
        if (mainImage) mainImage.src = product.images[0];
        if (productName) productName.textContent = product.name;
        if (originalPrice) originalPrice.textContent = `R$ ${product.originalPrice.toFixed(2).replace('.', ',')}`;
        if (salePrice) salePrice.textContent = `R$ ${product.salePrice.toFixed(2).replace('.', ',')}`;
        if (description) description.textContent = product.description || 'Descrição não disponível.';
        if (dimensions) dimensions.textContent = `${product.dimensions.width} x ${product.dimensions.height} x ${product.dimensions.depth} cm`;
        if (weight) weight.textContent = `${product.weight} kg`;
        // Handle additional images
        if (additionalImages) {
            const validImages = product.images.slice(1).filter(img => img.trim() !== '');
            
            if (validImages.length > 0) {
                additionalImages.innerHTML = validImages.map((imgSrc, index) => `
                    <div class="additional-image ${index === 0 ? 'active' : ''}" 
                        onclick="window.app.changeMainImage('${imgSrc}', this)">
                        <img src="${imgSrc}" 
                            alt="${product.name} - Imagem ${index + 2}">
                    </div>
                `).join('');
            } else {
                additionalImages.innerHTML = '<p style="color: #999; font-size: 14px;">Nenhuma imagem adicional disponível.</p>';
            }
        }
        // Enhanced thumbnail generation - initially show images 1-3 as thumbnails
        this.renderProductThumbnails();
        // Set up action buttons
        if (buyBtn) {
            buyBtn.onclick = () => this.buyNow(productId);
        }
        if (addCartBtn) {
            addCartBtn.onclick = () => this.addToCart(productId);
        }
        this.showPage('productDetail');
    }
    renderProductThumbnails() {
        const additionalImages = document.getElementById('additionalImages');
        if (!additionalImages || !this.currentProductImages) return;
        
        // Get all images except the currently displayed one
        const availableImages = this.currentProductImages
            .map((imgSrc, index) => ({ src: imgSrc, originalIndex: index }))
            .filter((img, index) => index !== this.currentMainImageIndex && img.src.trim() !== '');
        
        if (availableImages.length > 0) {
            additionalImages.innerHTML = availableImages.map((image, index) => `
                <div class="additional-image" 
                    onclick="window.app.switchToImage(${image.originalIndex})"
                    data-image-index="${image.originalIndex}">
                    <img src="${image.src}" 
                        alt="Imagem alternativa ${image.originalIndex + 1}"
                        onerror="this.parentElement.style.display='none';">
                </div>
            `).join('');
        } else {
            additionalImages.innerHTML = '<p style="color: #999; font-size: 14px;">Nenhuma imagem adicional disponível.</p>';
        }
    }
    switchToImage(imageIndex) {
        if (!this.currentProductImages || imageIndex < 0 || imageIndex >= this.currentProductImages.length) {
            return;
        }
        const newImageSrc = this.currentProductImages[imageIndex];
        if (!newImageSrc || newImageSrc.trim() === '') {
            return;
        }
        // Update the main image display
        const mainImage = document.getElementById('productMainImage');
        if (mainImage) {
            mainImage.src = newImageSrc;
            mainImage.alt = `Imagem principal ${imageIndex + 1}`;
        }
        // Update the current main image index
        this.currentMainImageIndex = imageIndex;
        // Re-render thumbnails to reflect the new state
        this.renderProductThumbnails();
        console.log(`Switched to image ${imageIndex + 1}`);
    }
    // Keep the old method for backward compatibility, but redirect to new logic
    changeMainImage(newSrc, clickedElement) {
        // Find the index of the new image source
        const imageIndex = this.currentProductImages?.findIndex(src => src === newSrc);
        if (imageIndex !== -1) {
            this.switchToImage(imageIndex);
        }
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        this.saveCartToStorage();
        this.updateCartCount();
        this.showMessage('Produto adicionado ao carrinho!', 'success');
    }
    buyNow(productId) {
        if (!this.isLoggedIn) {
            // Store the product ID and set context for post-login action
            this.pendingPurchaseProductId = productId;
            this.previousPage = 'cart';
            
            // Add item to cart first
            this.addToCart(productId);
            
            // Show login modal instead of cart page
            this.showLogin();
            return;
        }
        
        // User is already logged in
        this.addToCart(productId);
        this.showPage('cart');
    }
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCartToStorage();
        this.updateCartCount();
        this.renderCart();
    }
    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(productId);
            return;
        }
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCartToStorage();
            this.renderCart();
            this.updateCartCount();
        }
    }
    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        const cartCountEl = document.getElementById('cartCount');
        if (cartCountEl) {
            cartCountEl.textContent = count;
            cartCountEl.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');
        if (!cartItems || !cartSummary) return;
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<h5 class="empty-cart">Seu carrinho está vazio.</h5>';
            cartSummary.innerHTML = '';
            return;
        }
        cartItems.innerHTML = this.cart.map(item => {
            if (!item || !item.id) {
                console.error('Invalid cart item:', item);
                return '';
            }
            return `
                <div class="cart-item" data-id="${item.id}">

                    <div class="cart-item-image">
                        <img src="${item.images && item.images[0] ? item.images[0] : 'placeholder.jpg'}" 
                            alt="${item.name}" 
                            onclick="window.app.showProductDetail(${item.id})" 
                            style="cursor: pointer">
                    </div>
                    
                    <div class="cart-item-info">
                        <div class="cart-item-name" onclick="window.app.showProductDetail(${item.id})" style="cursor: pointer;">${item.name}</div>
                        <div class="cart-item-price">R$ ${item.salePrice.toFixed(2).replace('.', ',')}</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="window.app.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="window.app.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        <button class="btn btn--outline btn--sm" onclick="window.app.removeFromCart(${item.id})">Remover</button>
                    </div>
                </div>
            `;
        }).filter(item => item !== '').join('');
        const subtotal = this.cart.reduce((total, item) => total + (item.salePrice * item.quantity), 0);
        const shipping = this.shippingInfo?.cost || 0;
        const total = subtotal + shipping;
        cartSummary.innerHTML = `
            <div class="cart-summary-content">
                <div class="summary-row">
                    <h5>Subtotal: R$${subtotal.toFixed(2).replace('.', ',')}</span></h5>
                </div>
                ${shipping > 0 ? `
                    <div class="summary-row">
                        <h5>Frete: R$${shipping.toFixed(2).replace('.', ',')}</h5>
                    </div>
                ` : ''}
                <div class="summary-row total">
                    <h5>Total: R$${total.toFixed(2).replace('.', ',')}</h5>
                </div>
            </div>
        `;
        console.log('Cart rendered successfully');
    }

    showPage(pageId) {
        window.scrollTo(0, 0);
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        // Store current page before changing
        if (pageId !== 'login' && pageId !== 'otp') {
            this.previousPage = pageId;
        }
        const targetPage = document.getElementById(pageId + 'Page');
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
        }
        // Hide all sections
        document.querySelectorAll("section[data-page]").forEach(sec => {
            sec.style.display = "none";
        });

        // Show current
        const current = document.getElementById(pageId);
        if (current) current.style.display = "block";

        if (pageId === 'cart') {
            this.renderCart();
        } else if (pageId === 'profile') {
            if (!this.isLoggedIn) {
                this.showMessage('Por favor, faça login para acessar seu perfil.', 'info');
                this.showLogin();
                return;
            }
            this.renderUserProfile();
        } else if (pageId === 'edit-info') {
            if (!this.isLoggedIn) {
                this.showLogin();
                return;
            }
            this.populateEditInfoForm();
        } else if (pageId === 'shipping') {
            // Load user profile and auto-populate form
            this.loadUserProfileFromStorage();
            setTimeout(() => {
                this.populateShippingFormFromProfile();
            }, 100);
        } else if (pageId === 'admin') {
            this.renderAdminProducts();
            this.renderAdminReviews();
        // ALL REVIEWS PAGE
        } else if (pageId === 'allReviews') {
            this.renderAllReviews();
        }
    }

    renderUserProfile() {
        // Ensure user profile is loaded
        this.loadUserProfileFromStorage();
        
        // Call the user info renderer
        this.renderUserInfo();
        
        // Setup contact form if it exists
        this.setupProfileContactForm();
        
        console.log('User profile rendered successfully');
    }

    showLogin() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
    renderUserInfo() {
        const userInfoContent = document.getElementById('userInfoContent');
        if (!userInfoContent) {
            console.error('userInfoContent element not found');
            return;
        }
        
        // Ensure profile is loaded
        this.loadUserProfileFromStorage();
        
        // Debug logging
        console.log('User profile data:', this.userProfile);
        console.log('Shipping info data:', this.shippingInfo);
        console.log('User data:', this.user);
        
        // Helper function to safely format address
        const formatAddress = () => {
            // First try userProfile.address if it exists and is valid
            if (this.userProfile?.address && this.userProfile.address !== 'Não informado') {
                return this.userProfile.address;
            }
            
            // Then try to build from shipping info if all required fields exist
            if (this.shippingInfo) {
                const street = this.shippingInfo.street?.trim();
                const number = this.shippingInfo.number?.trim();
                const city = this.shippingInfo.city?.trim();
                const state = this.shippingInfo.state?.trim();
                
                // Only build address if all essential components exist
                if (street && number && city && state) {
                    return `${street}, ${number} - ${city}/${state}`;
                }
            }
            
            // Finally try to build from userProfile components
            if (this.userProfile) {
                const street = this.userProfile.street?.trim();
                const number = this.userProfile.number?.trim();
                const city = this.userProfile.city?.trim();
                const state = this.userProfile.state?.trim();
                
                // Only build address if all essential components exist
                if (street && number && city && state) {
                    return `${street}, ${number} - ${city}/${state}`;
                }
            }
            
            return 'Não informado';
        };
        
        // Helper function to safely format phone
        const formatSafePhone = () => {
            const phone = this.userProfile?.phone || this.shippingInfo?.phone || '';
            if (!phone || phone.trim() === '') return 'Não informado';
            
            // Ensure formatPhoneDisplay exists and works
            try {
                const formatted = this.formatPhoneDisplay(phone);
                return formatted || 'Não informado';
            } catch (error) {
                console.error('Error formatting phone:', error);
                return phone || 'Não informado';
            }
        };
        
        // Helper function to safely format CPF
        const formatSafeCPF = () => {
            const cpf = this.userProfile?.cpf || this.shippingInfo?.cpf || '';
            if (!cpf || cpf.trim() === '') return 'Não informado';
            
            // Ensure formatCPFDisplay exists and works
            try {
                const formatted = this.formatCPFDisplay(cpf);
                return formatted || 'Não informado';
            } catch (error) {
                console.error('Error formatting CPF:', error);
                return cpf || 'Não informado';
            }
        };
        
        // Get user info with safe fallbacks
        const userInfo = {
            email: this.user?.email || 'Não informado',
            name: this.userProfile?.name || this.shippingInfo?.recipient || 'Não informado',
            phone: formatSafePhone(),
            cpf: formatSafeCPF(),
            address: formatAddress()
        };
        
        // Debug logging
        console.log('Final user info object:', userInfo);
        
        // Render the user info
        userInfoContent.innerHTML = `
            <div class="user-info-item">
                <span class="user-info-label">E-mail:</span>
                <span class="user-info-value">${userInfo.email}</span>
            </div>
            <div class="user-info-item">
                <span class="user-info-label">Nome:</span>
                <span class="user-info-value">${userInfo.name}</span>
            </div>
            <div class="user-info-item">
                <span class="user-info-label">Telefone:</span>
                <span class="user-info-value">${userInfo.phone}</span>
            </div>
            <div class="user-info-item">
                <span class="user-info-label">CPF:</span>
                <span class="user-info-value">${userInfo.cpf}</span>
            </div>
            <div class="user-info-item">
                <span class="user-info-label">Endereço:</span>
                <span class="user-info-value">${userInfo.address}</span>
            </div>
        `;
        
        console.log('User info HTML updated');
    }

    // Edit info form
    populateEditInfoForm() {
        this.loadUserProfileFromStorage();
        const nameEl = document.getElementById('editName');
        const emailEl = document.getElementById('editEmail');
        const phoneEl = document.getElementById('editPhone');
        const cpfEl = document.getElementById('editCpf');
        const cepEl = document.getElementById('editCep');
        const streetEl = document.getElementById('editStreet');
        const neighborhoodEl = document.getElementById('editNeighborhood');
        const cityEl = document.getElementById('editCity');
        const stateEl = document.getElementById('editState');
        const numberEl = document.getElementById('editNumber');
        const complementEl = document.getElementById('editComplement');
        // Populate with formatted data
        if (nameEl) nameEl.value = this.userProfile?.name || this.shippingInfo?.recipient || '';
        if (emailEl) emailEl.value = this.user?.email || '';
        if (phoneEl) phoneEl.value = this.formatPhoneDisplay(this.userProfile?.phone || this.shippingInfo?.phone || '');
        if (cpfEl) cpfEl.value = this.formatCPFDisplay(this.userProfile?.cpf || this.shippingInfo?.cpf || '');
        // Address fields
        if (cepEl) cepEl.value = this.formatCEPDisplay(this.userProfile?.cep || this.shippingInfo?.cep || '');
        if (streetEl) streetEl.value = this.userProfile?.street || this.shippingInfo?.street || '';
        if (neighborhoodEl) neighborhoodEl.value = this.userProfile?.neighborhood || this.shippingInfo?.neighborhood || '';
        if (cityEl) cityEl.value = this.userProfile?.city || this.shippingInfo?.city || '';
        if (stateEl) stateEl.value = this.userProfile?.state || this.shippingInfo?.state || '';
        if (numberEl) numberEl.value = this.userProfile?.number || this.shippingInfo?.number || '';
        if (complementEl) complementEl.value = this.userProfile?.complement || this.shippingInfo?.complement || '';
    }

    // Method below allow sync back to shipping data
    handleEditInfoForm(e) {
        e.preventDefault();
        if (!this.isLoggedIn) {
            this.showMessage('Você precisa estar logado para salvar informações.', 'error');
            return;
        }
        // Get all form data
        const name = document.getElementById('editName')?.value || '';
        const phone = document.getElementById('editPhone')?.value || '';
        const cpf = document.getElementById('editCpf')?.value || '';
        const cep = document.getElementById('editCep')?.value || '';
        const street = document.getElementById('editStreet')?.value || '';
        const neighborhood = document.getElementById('editNeighborhood')?.value || '';
        const city = document.getElementById('editCity')?.value || '';
        const state = document.getElementById('editState')?.value || '';
        const number = document.getElementById('editNumber')?.value || '';
        const complement = document.getElementById('editComplement')?.value || '';
        // Validate required fields
        if (!name.trim()) {
            this.showMessage('Por favor, informe seu nome completo.', 'error');
            return;
        }
        if (!number.trim()) {
            this.showMessage('Por favor, informe o número do endereço.', 'error');
            return;
        }
        // Create formatted address string for display
        const formattedAddress = `${street}, ${number} - ${city}/${state}`;
        // Update user profile with all data
        this.userProfile = {
            ...this.userProfile,
            name: name.trim(),
            phone: phone.replace(/\D/g, ''), // Store clean phone
            cpf: cpf.replace(/\D/g, ''), // Store clean CPF
            cep: cep.replace(/\D/g, ''), // Store clean CEP
            street: street.trim(),
            neighborhood: neighborhood.trim(),
            city: city.trim(),
            state: state.trim(),
            number: number.trim(),
            complement: complement.trim(),
            address: formattedAddress // For display purposes
        };
        // Update shipping info with the same data
        this.shippingInfo = {
            ...this.shippingInfo,
            recipient: name.trim(),
            phone: phone.replace(/\D/g, ''),
            cpf: cpf.replace(/\D/g, ''),
            cep: cep.replace(/\D/g, ''),
            street: street.trim(),
            neighborhood: neighborhood.trim(),
            city: city.trim(),
            state: state.trim(),
            number: number.trim(),
            complement: complement.trim()
        };
        // Save both profile and shipping data
        this.saveUserProfileToStorage();
        this.showMessage('Informações salvas com sucesso!', 'success');
        // Redirect back to profile and refresh user info
        setTimeout(() => {
            this.showPage('profile');
            this.renderUserInfo();
        }, 1000);
    }
    
    // Parse address from the Edit Form
    parseAddress(addressString) {
        // Default values
        const defaultParts = {
            street: '',
            number: '',
            city: '',
            state: ''
        };
        if (!addressString || !addressString.trim()) {
            return defaultParts;
        }
        try {
            // Try to parse format: "Rua, número - Cidade/Estado"
            const parts = addressString.split(' - ');
            if (parts.length >= 2) {
                const streetPart = parts[0].trim();
                const cityStatePart = parts[1].trim();
                // Extract street and number
                const streetMatch = streetPart.match(/^(.+),\s*(.+)$/);
                const street = streetMatch ? streetMatch[1].trim() : streetPart;
                const number = streetMatch ? streetMatch[2].trim() : '';
                // Extract city and state
                const cityStateMatch = cityStatePart.match(/^(.+)\/(.+)$/);
                const city = cityStateMatch ? cityStateMatch[1].trim() : cityStatePart;
                const state = cityStateMatch ? cityStateMatch[2].trim() : '';
                return { street, number, city, state };
            }
        } catch (e) {
            console.warn('Error parsing address:', e);
        }
        return defaultParts;
    }
        
    setupProfileContactForm() {
        const contactForm = document.getElementById('profileContactForm');
        const contactEmail = document.getElementById('contactEmail');
        if (contactEmail && this.user?.email) {
            contactEmail.value = this.user.email;
        }
        if (contactForm) {
            contactForm.removeEventListener('submit', this.handleProfileContactForm.bind(this));
            contactForm.addEventListener('submit', this.handleProfileContactForm.bind(this));
        }
    }
    async handleProfileContactForm(e) {
        e.preventDefault();
        const formData = {
            email: document.getElementById('contactEmail')?.value,
            subject: document.getElementById('contactSubject')?.value,
            reason: document.getElementById('contactReason')?.value,
            message: document.getElementById('contactMessage')?.value
        };
        // Enhanced validation
        if (!formData.subject?.trim() || !formData.reason?.trim() || !formData.message?.trim()) {
            this.showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        try {
            await this.sendContactEmail(formData);
            this.showMessage('Mensagem enviada com sucesso! Retornaremos em breve.', 'success');
            // Clear only mutable fields
            document.getElementById('contactSubject').value = '';
            document.getElementById('contactMessage').value = '';
            document.getElementById('contactReason').selectedIndex = 0;
        } catch (error) {
            console.error('Contact form error:', error);
            this.showMessage(`Erro ao enviar: ${error.message}`, 'error');
        }
    }

    async sendContactEmail(formData) {
        const templateParams = {
            subject: formData.subject,
            reason: formData.reason,
            message: formData.message,
            user_email: formData.email,
            timestamp: new Date().toLocaleString('pt-BR')
        };
        return await emailjs.send(
            'service_6fhviva', 
            'template_7jjmeei',
            templateParams,
            {
                publicKey: 'NGwJHe0io6sPytVMD',
                // Enable reply-to functionality
                headers: {
                    'Reply-To': formData.email
                }
            }
        );
    }

    showAdminLogin() {
        const modal = document.getElementById('adminLoginModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    // Login handler with rate limiting
    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('emailInput').value;
        
        if (!this.validateEmail(email)) {
            this.showMessage('Por favor, insira um e-mail válido.', 'error');
            return;
        }
        
        // Check if generation is rate limited
        if (!this.canGenerateOTP(email, Date.now())) {
            const lockoutEnd = this.getGenerationLockoutEnd(email);
            const remainingTime = Math.ceil((lockoutEnd - Date.now()) / 60000);
            this.showMessage(`Muitas tentativas de login. Tente novamente em ${remainingTime} minutos.`, 'error');
            return;
        }
        // Register the retry OTP attempt
        this.recordGenerationAttempt(email, Date.now());
        this.showMessage('Enviando código...', 'info');
        // Handle cart transfer for logged-in users
        if (!this.isLoggedIn) {
            const sessionCart = sessionStorage.getItem('seucanto_cart_session');
            if (sessionCart) {
                localStorage.setItem('seucanto_cart', sessionCart);
                sessionStorage.removeItem('seucanto_cart_session');
            }
        }
        
        this.user = { email };
        
        try {
            await this.generateOTP();
            this.closeModal('loginModal');
            
            const otpModal = document.getElementById('otpModal');
            if (otpModal) {
                otpModal.classList.add('active');
            }
            
            this.startOTPTimer();
            this.showMessage(`Código enviado para ${email}`, 'success');
            
        } catch (error) {
            this.showMessage(error.message || 'Erro inesperado. Tente novamente.', 'error');
            console.error('Login OTP generation failed:', error);
        }
    }
    logout() {
        console.log('Logging out user and cleaning up session');
        this.isLoggedIn = false;
        // Clear session-related data but keep profile
        localStorage.removeItem('seucanto_user');
        localStorage.removeItem('seucanto_last_activity');
        // Move cart to session storage if needed
        if (this.cart.length > 0) {
            sessionStorage.setItem('seucanto_cart', JSON.stringify(this.cart));
            localStorage.removeItem('seucanto_cart');
        }
        // Clear timers and event listeners
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
            console.log('Inactivity timer cleared');
        }
        // Remove activity listeners
        this.removeActivityListeners();
        this.showMessage('Logout realizado', 'info');
        this.resetZipperAnimation();
        this.showPage('home');
    }

    // Method to reset zipper animation
    resetZipperAnimation() {
        if (this.zipperAnimation) {
            // Reset animation state
            this.zipperAnimation.isAnimating = false;
            
            // Reset DOM elements
            const elements = this.zipperAnimation.elements;
            if (elements.zipperContainer) {
                elements.zipperContainer.style.display = 'block';
                elements.zipperContainer.style.zIndex = '9999';
            }
            
            if (elements.fabricLeft) elements.fabricLeft.style.display = 'block';
            if (elements.fabricRight) elements.fabricRight.style.display = 'block';
            if (elements.zipperSlider) elements.zipperSlider.style.display = 'block';
            if (elements.zipperTeeth) elements.zipperTeeth.style.display = 'block';
            
            // Reset opacity
            if (elements.fabricLeft) elements.fabricLeft.style.opacity = '1';
            if (elements.fabricRight) elements.fabricRight.style.opacity = '1';
            if (elements.zipperSlider) elements.zipperSlider.style.opacity = '1';
            if (elements.zipperTeeth) elements.zipperTeeth.style.opacity = '1';
            
            // Reset homepage content
            if (elements.homepageContent) {
                elements.homepageContent.style.opacity = '0';
                elements.homepageContent.style.transform = 'scale(0.8) rotateX(180deg)';
            }
            
            // Force DOM reflow
            void elements.zipperContainer.offsetWidth;
            
            // Regenerate teeth for current viewport
            this.zipperAnimation.generateTeeth();
            
            // Setup initial state
            this.zipperAnimation.setupInitialState();
            
            // Start animation with delay
            setTimeout(() => {
                this.zipperAnimation.startAnimation();
            }, 500);
        } else {
            // Fallback: reinitialize entire zipper animation
            this.initializeZipperAnimation();
        }
    }

    // Method to reset inactivity timer
    resetInactivityTimer() {
        if (!this.isLoggedIn) {
            console.log('Not logged in - skipping timer reset');
            return;
        }
        // Clear existing timer
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
        // Set new timer
        this.inactivityTimer = setTimeout(() => {
            console.log('Inactivity timeout reached - logging out user');
            this.showMessage('Sessão expirada por inatividade', 'info');
            this.logout();
        }, this.sessionDuration);
        // Update last activity time
        const now = Date.now();
        localStorage.setItem('seucanto_last_activity', now.toString());
        // Debug logging (remove in production)
        console.log(`Activity detected - timer reset. Next timeout in ${this.sessionDuration / 3600000} minutes`);
    }

    handleOTPVerification(e) {
        e.preventDefault();
        const otpInput = document.getElementById('otpInput');
        const enteredCode = otpInput.value.trim();
        const email = this.user.email;
        const now = Date.now();
        // Verifiy if user is blocked
        if (this.isOTPVerificationLocked(email, now)) {
            const lockoutEnd = this.getVerificationLockoutEnd(email);
            const remainingTime = Math.ceil((lockoutEnd - now) / 60000);
            this.showMessage(
                `Muitas tentativas incorretas. Tente novamente em ${remainingTime} minutos.`,
                'error'
            );
            return;
        }
        // Verifiy OTP code
        if (enteredCode.toLowerCase() === this.otpCode?.toLowerCase()) {
            // Success - clear retry history
            this.otpAttempts.delete(email);
            this.isLoggedIn = true;
            this.saveUserToStorage();
            // Clean OTP data
            otpInput.value = '';
            if (this.otpTimer) {
                clearInterval(this.otpTimer);
                this.otpTimer = null;
            }
            this.startActivityTracking();
            this.closeModal('otpModal');
            this.showMessage('Login realizado com sucesso!', 'success');
            this.otpCode = null;
            // Post-login redirect
            setTimeout(() => {
                if (this.pendingReviewModal) {
                    this.pendingReviewModal = false;
                    this.showReviewModal();
                } else if (this.pendingPurchaseProductId) {
                    this.showPage('cart');
                    this.pendingPurchaseProductId = null;
                } else {
                    this.showPage('profile');
                }
            }, 1000);
        } else {
            // 4) Fail - retry registry and avaliate blockage
            this.recordVerificationAttempt(email, now);
            const attempts = this.otpAttempts.get(email) || [];
            const remainingAttempts = this.maxOtpAttempts - attempts.length;
            otpInput.value = '';
            if (remainingAttempts > 0) {
                this.showMessage(
                    `Código inválido. ${remainingAttempts} tentativas restantes.`,
                    'error'
                );
            } else {
                this.showMessage(
                    'Muitas tentativas incorretas. Conta temporariamente bloqueada.',
                    'error'
                );
                this.closeModal('otpModal');
                this.otpCode = null;
            }
        }
    }

    async generateOTP() {
        // Generate 4-character OTP
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.otpCode = '';
        for (let i = 0; i < 4; i++) {
            this.otpCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        // Delay and retry logic for EmailJS
        let attempts = 0;
        const maxAttempts = 3;
        while (attempts < maxAttempts) {
            try {
                // Add small delay on first attempt to ensure EmailJS is ready
                if (attempts === 0) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                await this.sendOTPEmail(this.user.email, this.otpCode);
                console.log('OTP sent successfully on attempt:', attempts + 1);
                break; // Success, exit retry loop
            } catch (error) {
                attempts++;
                console.warn(`OTP send attempt ${attempts} failed:`, error);
                if (attempts >= maxAttempts) {
                    console.error('Failed to send OTP after', maxAttempts, 'attempts');
                    this.showMessage('Erro ao enviar código. Tente novamente.', 'error');
                    throw error;
                }
                // Wait between retries
                await new Promise(resolve => setTimeout(resolve, 500 * attempts));
            }
        }
    }

        // Check if user can generate OTP
    canGenerateOTP(email, currentTime) {
        const attempts = this.otpGenerationAttempts.get(email) || [];
        // Remove old attempts outside the window
        const recentAttempts = attempts.filter(time => 
            currentTime - time < this.attemptWindowMs
        );
        // Update stored attempts
        this.otpGenerationAttempts.set(email, recentAttempts);
        // Check if under the limit
        return recentAttempts.length < this.maxGenerationAttempts;
    }
    // Record OTP generation attempt
    recordGenerationAttempt(email, currentTime) {
        const attempts = this.otpGenerationAttempts.get(email) || [];
        attempts.push(currentTime);
        this.otpGenerationAttempts.set(email, attempts);
    }
    // Get when generation lockout ends
    getGenerationLockoutEnd(email) {
        const attempts = this.otpGenerationAttempts.get(email) || [];
        if (attempts.length >= this.maxGenerationAttempts) {
            return attempts[0] + this.attemptWindowMs;
        }
        return 0;
    }

    // Check if verification is locked
    isOTPVerificationLocked(email, currentTime) {
        const attempts = this.otpAttempts.get(email) || [];
        if (attempts.length >= this.maxOtpAttempts) {
            const lockoutEnd = attempts[attempts.length - 1] + this.lockoutDurationMs;
            return currentTime < lockoutEnd;
        }
        return false;
    }
    // Record verification attempt
    recordVerificationAttempt(email, currentTime) {
        const attempts = this.otpAttempts.get(email) || [];
        attempts.push(currentTime);
        this.otpAttempts.set(email, attempts);
    }
    // Get when verification lockout ends
    getVerificationLockoutEnd(email) {
        const attempts = this.otpAttempts.get(email) || [];
        if (attempts.length >= this.maxOtpAttempts) {
            return attempts[attempts.length - 1] + this.lockoutDurationMs;
        }
        return 0;
    }

    startOTPTimer() {
        let timeLeft = 900; // 15 minutes
        const timerElement = document.getElementById('otpTimer');
        let hasExpired = false; // Flag to prevent spam
        
        if (!timerElement) return;
        
        // Clear any existing timer first
        if (this.otpTimer) {
            clearInterval(this.otpTimer);
            this.otpTimer = null;
        }
        
        this.otpTimer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0 && !hasExpired) {
                hasExpired = true; // Prevent multiple executions
                clearInterval(this.otpTimer);
                this.otpTimer = null;
                this.otpCode = null;
                
                // Only show message if modal is still open
                const otpModal = document.getElementById('otpModal');
                if (otpModal && otpModal.classList.contains('active')) {
                    this.showMessage('Código expirado. Solicite um novo.', 'error');
                    this.closeModal('otpModal');
                }
            }
            timeLeft--;
        }, 1000);
    }

    // CHECK IF USER CAN POST REVIEW
    canPostReview(email, now) {
        const attempts = this.reviewAttempts.get(email) || [];
        // Keep only attempts within last 24h
        const recent = attempts.filter(ts => now - ts < this.reviewWindowMs);
        this.reviewAttempts.set(email, recent);
        // Persist pruned Map
        const obj = Object.fromEntries(this.reviewAttempts);
        localStorage.setItem('seucanto_review_attempts', JSON.stringify(obj));
        return recent.length < this.maxReviewsPerDay;
    }
    // Record review attempt
    recordReviewAttempt(email, now) {
        const attempts = this.reviewAttempts.get(email) || [];
        attempts.push(now);
        this.reviewAttempts.set(email, attempts);
        // Persist entire Map to localStorage
        const obj = Object.fromEntries(this.reviewAttempts);
        localStorage.setItem('seucanto_review_attempts', JSON.stringify(obj));
    }

    // Calculate shipping from informed CEP
    calculateShipping() {
        const cepInput = document.getElementById('cepInput');
        if (!cepInput) return;
        const cep = cepInput.value.replace(/\D/g, '');
        if (cep.length !== 8) {
            this.showMessage('CEP inválido', 'error');
            return;
        }
        // Determine the zone based of CEP prefix
        function getZoneByCEP(cep) {
            const prefix = parseInt(cep.substring(0, 2), 10);
            if (prefix >= 10 && prefix <= 19) {
                return { name: 'São Paulo', cost: 28.00 };
            } else if (prefix >= 20 && prefix <= 29) {
                return { name: 'Região Sudeste', cost: 32.00 };
            } else if (prefix >= 50 && prefix <= 67) {
                return { name: 'Região Nordeste', cost: 30.00 };
            } else if (prefix >= 30 && prefix <= 39) {
                return { name: 'Minas Gerais', cost: 30.00 };
            } else if (prefix >= 40 && prefix <= 49) {
                return { name: 'Bahia / Sergipe', cost: 35.00 };
            } else if (prefix >= 70 && prefix <= 79) {
                return { name: 'Região Centro-Oeste', cost: 34.00 };
            } else if (prefix >= 68 && prefix <= 69) {
                return { name: 'Região Norte', cost: 40.00 };
            } else if (prefix >= 80 && prefix <= 99) {
                return { name: 'Região Sul', cost: 30.00 };
            } else {
                return { name: 'Outras localidades', cost: 44.00 };
            }
        }
        const zone = getZoneByCEP(cep);
        const totalWeight = this.cart.reduce((total, item) => total + (item.weight * item.quantity), 0);
        const finalShippingCost = zone.cost + (totalWeight * 2.50);
        this.shippingInfo = {
            cep,
            location: zone.name,
            cost: finalShippingCost
        };
        const shippingResult = document.getElementById('shippingResult');
        if (shippingResult) {
            shippingResult.innerHTML = this.shippingInfo && this.shippingInfo.cost > 0 ? `
                <div class="shipping-info-section">
                    <div class="summary-row shipping-calculated">
                        <span><strong>Frete calculado</strong></span>
                        <span></span>
                    </div>
                    <div class="summary-row shipping-destination">
                        <span>Destino: ${this.shippingInfo.location}</span>
                        <span></span>
                    </div>
                    <div class="summary-row shipping-cost">
                        <span>Valor: R$${this.shippingInfo.cost.toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>
            ` : '';
        }
        // Store CEP in user profile for migration to shipping page
        if (!this.userProfile) {
            this.initUserProfile();
        }
        this.userProfile = {
            ...this.userProfile,
            cep: cep // Store the CEP for later use
        };
        // Save to storage immediately
        this.saveUserProfileToStorage();

        this.shippingInfo = {
            cep,
            location: zone.name,
            cost: finalShippingCost
        };
        this.renderCart();
    }

    // Calculate shipping from Address page aswell
    calculateShippingFromAddress(cep) {
        const cleanCep = cep.replace(/\D/g, '');
        
        if (cleanCep.length !== 8) {
            console.warn('Invalid CEP provided from shipping address');
            return;
        }

        function getZoneByCEP(cep) {
            const prefix = parseInt(cep.substring(0, 2), 10);
            if (prefix >= 10 && prefix <= 19) {
                return { name: 'São Paulo', cost: 28.00 };
            } else if (prefix >= 20 && prefix <= 29) {
                return { name: 'Região Sudeste', cost: 32.00 };
            } else if (prefix >= 50 && prefix <= 67) {
                return { name: 'Região Nordeste', cost: 30.00 };
            } else if (prefix >= 30 && prefix <= 39) {
                return { name: 'Minas Gerais', cost: 30.00 };
            } else if (prefix >= 40 && prefix <= 49) {
                return { name: 'Bahia / Sergipe', cost: 35.00 };
            } else if (prefix >= 70 && prefix <= 79) {
                return { name: 'Região Centro-Oeste', cost: 34.00 };
            } else if (prefix >= 68 && prefix <= 69) {
                return { name: 'Região Norte', cost: 40.00 };
            } else if (prefix >= 80 && prefix <= 99) {
                return { name: 'Região Sul', cost: 30.00 };
            } else {
                return { name: 'Outras localidades', cost: 44.00 };
            }
        }

        const zone = getZoneByCEP(cleanCep);
        const totalWeight = this.cart.reduce((total, item) => total + (item.weight * item.quantity), 0);
        const finalShippingCost = zone.cost + (Math.max(totalWeight, 1) * 2.50);

        // Update shipping info with calculated values
        this.shippingInfo = {
            ...this.shippingInfo,
            cep: cleanCep,
            location: zone.name,
            cost: finalShippingCost
        };

        console.log(`Shipping auto-calculated from address: ${zone.name} - R$${finalShippingCost.toFixed(2)}`);
        this.showMessage(`Frete calculado automaticamente: R$${finalShippingCost.toFixed(2).replace('.', ',')}`, 'success');
    }

    async lookupAddress() {
        const shippingCep = document.getElementById('shippingCep');
        if (!shippingCep) return;
        
        const cep = shippingCep.value.replace(/\D/g, '');
        
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const address = await response.json();
                
                if (!address.erro) {
                    // Use the real address data
                    this.populateAddressFields({
                        street: address.logradouro,
                        neighborhood: address.bairro,
                        city: address.localidade,
                        state: address.uf
                    });
                } else {
                    // Fallback to default values
                    this.populateAddressFields({
                        street: 'Rua Principal',
                        neighborhood: 'Centro',
                        city: 'Cidade',
                        state: 'UF'
                    });
                }
            } catch (error) {
                console.error('Error fetching address:', error);
            }
        }
    }

    async lookupAddressEditP() {
        const editCep = document.getElementById('editCep');
        if (!editCep) return;
        
        const cep = editCep.value.replace(/\D/g, '');
        
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const address = await response.json();
                
                if (!address.erro) {
                    this.populateAddressFieldsEditP({
                        street: address.logradouro,
                        neighborhood: address.bairro,
                        city: address.localidade,
                        state: address.uf
                    });
                } else {
                    this.populateAddressFieldsEditP({
                        street: 'Rua Principal',
                        neighborhood: 'Centro',
                        city: 'Cidade',
                        state: 'UF'
                    });
                }
            } catch (error) {
                console.error('Error fetching address:', error);
            }
        }
    }

    populateAddressFieldsEditP(address) {
        const streetEl = document.getElementById('editStreet');
        const neighborhoodEl = document.getElementById('editNeighborhood');
        const cityEl = document.getElementById('editCity');
        const stateEl = document.getElementById('editState');
        
        if (streetEl) streetEl.value = address.street || '';
        if (neighborhoodEl) neighborhoodEl.value = address.neighborhood || '';
        if (cityEl) cityEl.value = address.city || '';
        if (stateEl) stateEl.value = address.state || '';
    }

    populateAddressFields(address) {
        const streetEl = document.getElementById('shippingStreet');
        const neighborhoodEl = document.getElementById('shippingNeighborhood');
        const cityEl = document.getElementById('shippingCity');
        const stateEl = document.getElementById('shippingState');
        if (streetEl) streetEl.value = address.street || '';
        if (neighborhoodEl) neighborhoodEl.value = address.neighborhood || '';
        if (cityEl) cityEl.value = address.city || '';
        if (stateEl) stateEl.value = address.state || '';
    }
    
    handleShippingForm(e) {
        e.preventDefault();
        if (!this.isLoggedIn) {
            this.showLogin();
            return;
        }
        // Get all form data
        const recipientName = document.getElementById('shippingRecipient')?.value || '';
        const cpf = document.getElementById('shippingCpf')?.value || '';
        const cep = document.getElementById('shippingCep')?.value || '';
        const street = document.getElementById('shippingStreet')?.value || '';
        const neighborhood = document.getElementById('shippingNeighborhood')?.value || '';
        const city = document.getElementById('shippingCity')?.value || '';
        const state = document.getElementById('shippingState')?.value || '';
        const number = document.getElementById('shippingNumber')?.value || '';
        const complement = document.getElementById('shippingComplement')?.value || '';
        const phone = document.getElementById('shippingPhone')?.value || '';
        // Validate required fields
        if (!recipientName.trim()) {
            this.showMessage('Por favor, informe o nome do destinatário.', 'error');
            return;
        }
        if (!cpf.trim()) {
            this.showMessage('Por favor, informe o CPF do destinatário.', 'error');
            return;
        }
        if (!this.validateCPF(cpf)) {
            this.showMessage('CPF inválido. Verifique o formato.', 'error');
            return;
        }
        // Auto-calculate shipping if not already calculated
        if ((!this.shippingInfo || !this.shippingInfo.cost) && cep) {
            this.calculateShippingFromAddress(cep);
        }
        // Update user profile with shipping data
        this.userProfile = {
            ...this.userProfile,
            name: recipientName.trim(),
            phone: phone.trim(),
            cpf: cpf.replace(/\D/g, ''),
            cep: cep.replace(/\D/g, ''),
            street: street.trim(),
            neighborhood: neighborhood.trim(),
            city: city.trim(),
            state: state.trim(),
            number: number.trim(),
            complement: complement.trim(),
            // Create formatted address for profile display
            address: `${street.trim()}, ${number.trim()} - ${city.trim()}/${state.trim()}`
        };
        // Save updated profile
        this.saveUserProfileToStorage();
        // Update shipping info
        this.shippingInfo = {
            ...this.shippingInfo,
            recipient: recipientName.trim(),
            cpf: cpf.replace(/\D/g, ''),
            cep: cep,
            street: street,
            neighborhood: neighborhood,
            city: city,
            state: state,
            number: number,
            complement: complement,
            phone: phone
        };
        this.showPage('payment');
        this.renderOrderSummary();
    }

    populateShippingFormFromProfile() {
        if (!this.userProfile) return;
        
        const recipientEl = document.getElementById('shippingRecipient');
        const cpfEl = document.getElementById('shippingCpf');
        const phoneEl = document.getElementById('shippingPhone');
        const cepEl = document.getElementById('shippingCep');
        const streetEl = document.getElementById('shippingStreet');
        const neighborhoodEl = document.getElementById('shippingNeighborhood');
        const cityEl = document.getElementById('shippingCity');
        const stateEl = document.getElementById('shippingState');
        const numberEl = document.getElementById('shippingNumber');
        const complementEl = document.getElementById('shippingComplement');
        
        // Use formatted display for user-facing fields
        if (recipientEl && this.userProfile.name) recipientEl.value = this.userProfile.name;
        if (cpfEl && this.userProfile.cpf) cpfEl.value = this.formatCPFDisplay(this.userProfile.cpf);
        if (phoneEl && this.userProfile.phone) phoneEl.value = this.formatPhoneDisplay(this.userProfile.phone);
        if (cepEl && this.userProfile.cep) {
            cepEl.value = this.formatCEPDisplay(this.userProfile.cep);
            console.log('CEP populated from cart:', this.userProfile.cep);
            // Automatically trigger address lookup if CEP is 8 digits
            const cleanCep = this.userProfile.cep.replace(/\D/g, '');
            if (cleanCep.length === 8) {
                setTimeout(() => {
                    this.lookupAddress();
                }, 500); // Small delay to ensure DOM is ready
            }
        }
        
        // Address components
        if (streetEl && this.userProfile.street) streetEl.value = this.userProfile.street;
        if (neighborhoodEl && this.userProfile.neighborhood) neighborhoodEl.value = this.userProfile.neighborhood;
        if (cityEl && this.userProfile.city) cityEl.value = this.userProfile.city;
        if (stateEl && this.userProfile.state) stateEl.value = this.userProfile.state;
        if (numberEl && this.userProfile.number) numberEl.value = this.userProfile.number;
        if (complementEl && this.userProfile.complement) complementEl.value = this.userProfile.complement;
    }

    validateCPF(cpf) {
        // Remove all non-digit characters
        cpf = cpf.replace(/\D/g, '');
        
        // Check if CPF has 11 digits
        if (cpf.length !== 11) return false;
        
        // Check for known invalid CPFs (all same digits)
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        // Calculate first verification digit
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(9))) return false;
        
        // Calculate second verification digit
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(10))) return false;
        
        return true;
    }

    formatCPFDisplay(cpf) {
        // Handle both event objects and direct string values
        let value;
        if (cpf && cpf.target) {
            // Event handler case (for input formatting)
            value = cpf.target.value.replace(/\D/g, '');
        } else {
            // Direct string case (for display formatting)
            value = (cpf || '').replace(/\D/g, '');
        }
        
        if (value.length > 11) {
            value = value.substring(0, 11);
        }
        
        // Format as XXX.XXX.XXX-XX
        if (value.length > 9) {
            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else if (value.length > 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
        } else if (value.length > 3) {
            value = value.replace(/(\d{3})(\d{3})/, '$1.$2');
        }
        
        // If it's an event, update the input; if it's a string, return the formatted value
        if (cpf && cpf.target) {
            cpf.target.value = value;
        } else {
            return value;
        }
    }

    formatCEPDisplay(cep) {
        if (!cep) return '';
        const cleaned = cep.replace(/\D/g, '');
        if (cleaned.length === 8) {
            return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
        }
        return cep;
    }

    formatPhoneDisplay(phone) {
        // Handle both event objects and direct string values
        let value;
        if (phone && phone.target) {
            // Event handler case
            value = phone.target.value.replace(/\D/g, '');
        } else {
            // Direct string case
            if (!phone) return '';
            value = phone.replace(/\D/g, '');
        }
        
        // Handle 11-digit phone numbers (mobile: 9XXXX-XXXX)
        if (value.length === 11) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        // Handle 10-digit phone numbers (landline: XXXX-XXXX)
        else if (value.length === 10) {
            value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        
        // Return formatted value or update input
        if (phone && phone.target) {
            phone.target.value = value;
        } else {
            return value || phone;
        }
    }

    selectPaymentMethod(method) {
    }

    renderOrderSummary() {
        const orderSummary = document.getElementById('orderSummary');
        if (!orderSummary) return;
        
        const total = this.cart.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0);
        const shipping = this.shippingInfo?.cost || 0;
        const finalTotal = total + shipping;

        orderSummary.innerHTML = `
            <h3>Resumo do Pedido</h3>
            <div class="summary-row">
                <span>Produtos (${this.cart.length} itens):</span>
                <span>R$ ${total.toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="summary-row">
                <span>Frete:</span>
                <span>R$ ${shipping.toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="summary-row total">
                <span>Total:</span>
                <span>R$ ${finalTotal.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    }

    processPayment() {
        this.showMessage('Processando pagamento...', 'info');
        
        setTimeout(() => {
            this.showMessage('Pedido realizado com sucesso!', 'success');
            
            this.cart = [];
            this.saveCartToStorage();
            this.updateCartCount();
            
            this.showPage('home');
        }, 1000);
    }

    handleAdminLogin(e) {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;
        if (password === 'mozao') {
            this.isAdmin = true;
            this.closeModal('adminLoginModal');
            this.showPage('admin');
            this.showMessage('Login de administrador realizado com sucesso!', 'success');
        } else {
            this.showMessage('Senha incorreta.', 'error');
        }
    }

    renderAdminProducts() {
        const list = document.getElementById('adminProductsList');
        if (!list) return;
        
        list.innerHTML = this.products.map(product => `
            <div class="admin-product-item">
                <div>
                    <strong>${product.name}</strong><br>
                    R$ ${product.salePrice.toFixed(2).replace('.', ',')}
                </div>
                <div class="admin-product-actions">
                    <button class="btn btn--sm btn--outline" onclick="window.app.editProduct(${product.id})">Editar</button>
                    <button class="btn btn--sm btn--outline" onclick="window.app.deleteProduct(${product.id})">Excluir</button>
                </div>
            </div>
        `).join('');
    }

    showAddProduct() {
        const modal = document.getElementById('productModal');
        const form = document.getElementById('productForm');
        const title = document.getElementById('productModalTitle');
        
        if (title) title.textContent = 'Adicionar Produto';
        if (form) form.reset();
        if (modal) modal.classList.add('active');
    }

    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        const modal = document.getElementById('productModal');
        const form = document.getElementById('productForm');
        const title = document.getElementById('productModalTitle');

        if (title) title.textContent = 'Editar Produto';
        
        const nameEl = document.getElementById('productName');
        const originalPriceEl = document.getElementById('productOriginalPrice');
        const salePriceEl = document.getElementById('productSalePrice');
        const widthEl = document.getElementById('productWidth');
        const heightEl = document.getElementById('productHeight');
        const depthEl = document.getElementById('productDepth');
        const weightEl = document.getElementById('productWeight');
        const descriptionEl = document.getElementById('productDescription');
        const imageEl1 = document.getElementById('productImage1');
        const imageEl2 = document.getElementById('productImage2');
        const imageEl3 = document.getElementById('productImage3');
        const imageEl4 = document.getElementById('productImage4');

        if (nameEl) nameEl.value = product.name;
        if (originalPriceEl) originalPriceEl.value = product.originalPrice;
        if (salePriceEl) salePriceEl.value = product.salePrice;
        if (widthEl) widthEl.value = product.dimensions.width;
        if (heightEl) heightEl.value = product.dimensions.height;
        if (depthEl) depthEl.value = product.dimensions.depth;
        if (weightEl) weightEl.value = product.weight;
        if (descriptionEl) descriptionEl.value = product.description || '';

        const images = [...product.images, '', '', '', ''].slice(0, 4);
        if (imageEl1) imageEl1.value = product.images[0] || '';
        if (imageEl2) imageEl2.value = product.images[1] || '';
        if (imageEl3) imageEl3.value = product.images[2] || '';
        if (imageEl4) imageEl4.value = product.images[3] || '';

        if (form) form.dataset.editingId = id;
        if (modal) modal.classList.add('active');
    }

    handleProductForm(e) {
        e.preventDefault();
        
        // Collect all 4 image URLs
        const images = Array(4).fill('');
        for (let i = 0; i < 4; i++) {
            const input = document.getElementById(`productImage${i+1}`);
            if (input && input.value.trim()) {
                images[i] = input.value.trim();
            }
        }

        const formData = {
            name: document.getElementById('productName')?.value || '',
            originalPrice: parseFloat(document.getElementById('productOriginalPrice')?.value || 0),
            salePrice: parseFloat(document.getElementById('productSalePrice')?.value || 0),
            dimensions: {
                width: parseFloat(document.getElementById('productWidth')?.value || 0),
                height: parseFloat(document.getElementById('productHeight')?.value || 0),
                depth: parseFloat(document.getElementById('productDepth')?.value || 0)
            },
            weight: parseFloat(document.getElementById('productWeight')?.value || 0),
            description: document.getElementById('productDescription')?.value || '',
            images: images.filter(img => img !== '') // Remove empty strings
        };

        const editingId = e.target.dataset.editingId;
        
        if (editingId) {
            const index = this.products.findIndex(p => p.id === parseInt(editingId));
            if (index !== -1) {
                this.products[index] = { ...this.products[index], ...formData };
            }
            delete e.target.dataset.editingId;
        } else {
            const newId = Math.max(...this.products.map(p => p.id)) + 1;
            this.products.push({ id: newId, ...formData });
        }

        this.renderProducts();
        this.renderAdminProducts();
        this.closeModal('productModal');
        this.showMessage('Produto salvo com sucesso!', 'success');
    }

    deleteProduct(id) {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            this.products = this.products.filter(p => p.id !== id);
            this.renderProducts();
            this.renderAdminProducts();
            this.showMessage('Produto excluído com sucesso!', 'success');
        }
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    formatCEP(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        e.target.value = value;
    }

    formatPhone(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) {
            value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`;
        } else if (value.length > 6) {
            value = `(${value.substring(0, 2)}) ${value.substring(2, 6)}-${value.substring(6, 10)}`;
        } else if (value.length > 2) {
            value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
        }
        e.target.value = value;
    }

    toggleMobileMenu() {
        const menu = document.querySelector('.nav-menu');
        if (menu) {
            menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
        }
    }

    handleModalClose(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    }

    showMessage(message, type = 'info') {
        // Create or get toast container
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Remove any existing messages of the same type to prevent stacking
        const existingMessages = toastContainer.querySelectorAll(`.message.${type}`);
        existingMessages.forEach(msg => {
            this.removeMessage(msg);
        });
        
        // Create new message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.innerHTML = `
            ${message}
            <button class="message-close" onclick="this.parentElement.remove()" aria-label="Close message">×</button>
        `;
        
        // Add to container
        toastContainer.appendChild(messageEl);
        
        // Trigger animation
        setTimeout(() => {
            messageEl.classList.add('show');
        }, 10);
        
        // Auto-remove after delay
        setTimeout(() => {
            this.removeMessage(messageEl);
        }, 4000);
    }

    // Helper function to smoothly remove messages
    removeMessage(messageEl) {
        if (messageEl && messageEl.parentNode) {
            messageEl.classList.remove('show');
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.remove();
                }
            }, 300);
        }
    }

    //REVIEWS
    // Show review modal
    showReviewModal() {
        if (!this.isLoggedIn) {
            this.showMessage('Você precisa estar logado para deixar um depoimento.', 'error');
            this.pendingReviewModal = true; // Set the flag to indicate pending review modal
            this.showLogin();
            return;
        }
        const modal = document.getElementById('reviewModal');
        if (modal) {
            modal.classList.add('active');
            this.setupStarRating();
            this.setupCharacterCounter();
        }
    }
    // Setup star rating functionality
    setupStarRating() {
        const stars = document.querySelectorAll('.star');
        const ratingInput = document.getElementById('reviewRating');
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                const rating = index + 1;
                ratingInput.value = rating;
                // Update visual state
                stars.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
            star.addEventListener('mouseover', () => {
                const rating = index + 1;
                stars.forEach((s, i) => {
                    if (i < rating) {
                        s.style.color = 'var(--color-orange)';
                    } else {
                        s.style.color = '#ddd';
                    }
                });
            });
        });
        // Reset on mouse leave
        const starContainer = document.querySelector('.star-rating');
        if (starContainer) {
            starContainer.addEventListener('mouseleave', () => {
                const currentRating = parseInt(ratingInput.value) || 0;
                stars.forEach((s, i) => {
                    if (i < currentRating) {
                        s.style.color = 'var(--color-orange)';
                    } else {
                        s.style.color = '#ddd';
                    }
                });
            });
        }
    };
    // Setup character counter
    setupCharacterCounter() {
        const textarea = document.getElementById('reviewComment');
        const counter = document.querySelector('.character-count');
        if (textarea && counter) {
            textarea.addEventListener('input', () => {
                const count = textarea.value.length;
                counter.textContent = `${count}/720 caracteres`;
                
                if (count > 600) {
                    counter.style.color = 'var(--color-warning)';
                } else {
                    counter.style.color = 'var(--color-text-secondary)';
                }
            });
        }
    };
    // Handle review form submission
    async handleReviewSubmission(event) {
    event.preventDefault();
    // Collect forms data
    const reviewData = {
        email: document.getElementById('reviewEmail')?.value.trim() || '',
        rating: parseInt(document.getElementById('reviewRating')?.value || 0),
        comment: document.getElementById('reviewComment')?.value.trim(),
        productId: 'geral',
        location: 'Brasil',
        tags: ['review']
    }
    // Validação
    const validation = this.validateReviewData(reviewData);
    if (!validation.isValid) {
        this.showMessage(validation.message, 'error');
        return;
    }
    if (reviewData.rating < 1 || reviewData.rating > 5) {
        this.showMessage('Avaliação deve ser entre 1 e 5 estrelas.', 'error');
        return;
    }
    try {
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        // Usar GitHub App authentication diretamente (SEM PROXY)
        await this.submitReviewViaGitHubApp(reviewData);
        this.showMessage('Review enviado com sucesso! Aguarde alguns minutos para aparecer na página.', 'success');
        this.resetReviewForm();
        this.closeModal('reviewModal');
        // Auto-refresh após envio bem-sucedido
        setTimeout(() => {
        if (window.reviewManager && typeof window.reviewManager.loadReviews === 'function') {
            window.reviewManager.loadReviews();
        } else {
            console.warn('ReviewManager não encontrado para recarregar reviews');
        }
        }, 5000);
    } catch (error) {
        console.error('Erro ao enviar review:', error);
        this.showMessage(`Erro ao enviar review: ${error.message}`, 'error');
    } finally {
        const submitBtn = event.target.querySelector('button[type="submit"]');
        if (submitBtn) {
        submitBtn.textContent = 'Enviar Depoimento';
        submitBtn.disabled = false;
        }
    }
    }

    //Github authentication
    async submitReviewViaGitHubApp(reviewData) {
        if (!this.githubAuth) {
            throw new Error('Sistema de autenticação não inicializado');
        }
        try {
            const result = await this.githubAuth.createReviewFile(reviewData);
            console.log('Review criado no GitHub:', result);
            return result;
        } catch (error) {
            if (error.message.includes('Token expirado')) {
            this.githubAuth.clearToken();
            throw error;
            }
            throw error;
        }
        }

    // Resetar formulário após envio
    resetReviewForm() {
    const form = document.getElementById('reviewForm');
    if (form) {
        form.reset();
        // Reset star rating if exists
        const stars = document.querySelectorAll('.star-rating .star');
        stars.forEach(star => star.classList.remove('active'));
    }
    }
    // Render reviews on homepage
    renderHomepageReviews() {
        const container = document.getElementById('reviewsContainer');
        if (!container) return;
        // Get top 3 featured reviews or latest reviews
        const reviewsToShow = this.featuredReviews.slice(0, 10);
        if (reviewsToShow.length === 0) {
            container.innerHTML = '<p style="text-align: center;">Ainda não há depoimentos. Seja o primeiro!</p>';
            return;
        }
        container.innerHTML = reviewsToShow.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <span class="review-author">${review.userName}</span>
                    <span class="review-date">${review.date}</span>
                </div>
                <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                <div class="review-comment">${review.comment}</div>
            </div>
        `).join('');
    }
    // Render all reviews page
    renderAllReviews() {
        const container = document.getElementById('allReviewsContainer');
        if (!container) return;
        // All reviews page structure 
        let pageHTML = `
            <div class="review_container">
                <button class="btn btn--outline mb-16" onclick="window.app.showPage('home')">← Voltar</button>
                <h1>Todos os Depoimentos</h1>
                <div class="reviews-content">
        `;
        if (this.reviews.length === 0) {
            pageHTML += '<p style="text-align: center; color: var(--color-text-secondary);">Ainda não há depoimentos.</p>';
        } else {
            // Sort reviews by newest first
            const sortedReviews = [...this.reviews].sort((a, b) => b.timestamp - a.timestamp);
            pageHTML += sortedReviews.map(review => `
                <div class="review-card">
                    <div class="review-header">
                        <span class="review-author">${review.userName}</span>
                        <span class="review-date">${review.date}</span>
                    </div>
                    <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                    <div class="review-comment">${review.comment}</div>
                </div>
            `).join('');
        }
        pageHTML += `
                </div>
            </div>
        `;
        container.innerHTML = pageHTML;
    }
    // Render admin reviews
    renderAdminReviews() {
        const container = document.getElementById('adminReviewsContainer');
        if (!container) return;
        
        if (this.reviews.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">Nenhum depoimento encontrado.</p>';
            return;
        }
        
        const sortedReviews = [...this.reviews].sort((a, b) => b.timestamp - a.timestamp);
        
        container.innerHTML = sortedReviews.map(review => {
            const isFeatured = this.featuredReviews.some(fr => fr.id === review.id);
            
            return `
                <div class="admin-review-item">
                    <div class="admin-review-content">
                        <div class="review-header">
                            <span class="review-author">${review.userName}</span>
                            <span class="review-date">${review.date}</span>
                            ${isFeatured ? '<span class="featured-badge">Destaque</span>' : ''}
                        </div>
                        <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                        <div class="review-comment">${review.comment}</div>
                    </div>
                    <div class="admin-review-actions">
                        <button class="btn btn--sm ${isFeatured ? 'btn--secondary' : 'btn--primary'}" 
                                onclick="app.toggleFeaturedReview(${review.id})">
                            ${isFeatured ? 'Remover destaque' : 'Destacar'}
                        </button>
                        <button class="btn btn--sm" style="background: var(--color-error); color: white;" 
                                onclick="app.deleteReview(${review.id})">
                            Deletar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    // Toggle featured review
    toggleFeaturedReview(reviewId) {
        const review = this.reviews.find(r => r.id === reviewId);
        if (!review) return;
        const isFeatured = this.featuredReviews.some(fr => fr.id === reviewId);
        if (isFeatured) {
            // Remove from featured
            this.featuredReviews = this.featuredReviews.filter(fr => fr.id !== reviewId);
            this.showMessage('Depoimento removido dos destaques.', 'info');
        } else {
            // Add to featured (max 10)
            if (this.featuredReviews.length >= 10) {
                this.showMessage('Máximo de 10 depoimentos em destaque. Remova um primeiro.', 'error');
                return;
            }
            this.featuredReviews.push(review);
            this.showMessage('Depoimento adicionado aos destaques.', 'success');
        }
        this.saveReviewsToStorage();
        this.renderAdminReviews();
        this.renderHomepageReviews();
    }
    // Delete review
    deleteReview(reviewId) {
        if (!confirm('Tem certeza que deseja deletar este depoimento?')) {
            return;
        }
        this.reviews = this.reviews.filter(r => r.id !== reviewId);
        this.featuredReviews = this.featuredReviews.filter(fr => fr.id !== reviewId);
        this.saveReviewsToStorage();
        this.renderAdminReviews();
        this.renderHomepageReviews();
        this.showMessage('Depoimento deletado com sucesso.', 'success');
    }
}

// REVIEWS
class ReviewManager {
    constructor() {
        this.reviews = [];
        this.cache = new Map();
        this.reviewsUrl = './reviews.json';
        this.retryAttempts = 3;
        this.baseUrl = (window.location.origin && window.location.origin !== "null")
            ? window.location.origin
            : "";
    }

    async loadReviews() {
        const cacheKey = 'reviews_data';
        const cacheTimeout = 5 * 60 * 1000; // 5min in-mem cache
        // Verify cache 1st
        const cached = this.getCachedData(cacheKey, cacheTimeout);
        if (cached) {
            this.reviews = cached;
            this.renderReviews();
            this.renderFeaturedReviews();
            console.log(`${this.reviews.length} depoimentos carregados do cache.`);
            return;
        }
        // Fetch file - 3 retries
        try {
            const url = new URL('/reviews.json', this.baseUrl);
            url.searchParams.set('v', this.cacheBuster);
            const data = await this.fetchWithRetry(url.toString());
            // Suporta array puro ou { metadata, reviews }
            const reviews = Array.isArray(data)
                ? data
                : Array.isArray(data.reviews)
                    ? data.reviews
                    : [];
            this.reviews = reviews;
            this.setCachedData(cacheKey, reviews);
            this.renderReviews(); // all reviews
            this.renderFeaturedReviews(); // if any featyred
            console.log(`${reviews.length} depoimentos carregados do servidor.`);
        } catch (err) {
            console.error('Erro ao carregar reviews:', err);
            this.renderEmptyState();
        }
    }
    // Tries the request up to N times with exponential back-off
    async fetchWithRetry(url, attempts = this.retryAttempts) {
        for (let i = 0; i < attempts; i++) {
            try {
                const response = await fetch(url, { cache: 'no-cache' });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } catch (err) {
                if (i === attempts - 1) throw err;
                await new Promise(r => setTimeout(r, 300 * (i + 1)));
            }
        }
    }
    // In-memory cache
    getCachedData(key, ttl) {
        const entry = this.cache.get(key);
        if (!entry) return null;
        if (Date.now() - entry.timestamp > ttl) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
    setCachedData(key, data) {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    setCachedData(key, data) {
        try {
        const cacheEntry = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(cacheEntry));
        } catch (e) {
        console.warn('Cache storage failed:', e);
        }
    }

    handleLoadError(error) {
        console.error('Falha ao carregar depoimentos:', error);
        const container = document.getElementById('reviewsContainer');
        if (container) {
            // Simple error msg
            container.innerHTML = `
                <div class="review-error">
                    <p>Não foi possível carregar os depoimentos.</p>
                    <button id="retryReviews" class="btn btn--primary">Tentar novamente</button>
                </div>
            `;
            // Retry button
            const btn = document.getElementById('retryReviews');
            if (btn) btn.addEventListener('click', () => this.loadReviews());
        }
        // Error toast
        this.showMessage('Erro ao carregar depoimentos. Clique em "Tentar novamente".', 'error');
    }

    renderReviews() {
        const container = document.getElementById('reviewsContainer');
        if (!container) {
            console.error('Container de reviews não encontrado');
            return;
        }
        // Clears old content
        container.innerHTML = '';

        if (this.reviews.length === 0) {
            container.innerHTML = '<p class="no-reviews">Ainda não há depoimentos.</p>';
            return;
        }
        // Dynamicly creates each review card
        this.reviews.forEach(review => {
            const card = document.createElement('div');
            card.className = 'review-card';
            const header = document.createElement('div');
            header.className = 'review-header';
            const author = document.createElement('h3');
            author.textContent = review.userName || review.author;
            const date = document.createElement('time');
            date.textContent = new Date(review.timestamp).toLocaleString();
            header.appendChild(author);
            header.appendChild(date);
            const stars = document.createElement('div');
            stars.className = 'review-stars';
            const fullStars = review.rating;
            stars.textContent = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
            const comment = document.createElement('p');
            comment.className = 'review-comment';
            comment.textContent = review.comment;
            card.appendChild(header);
            card.appendChild(stars);
            card.appendChild(comment);
            container.appendChild(card);
        });
    }

    showMessage(text, type = 'info') {
        // Simple toast/message
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = text;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    renderEmptyState() {
        const container = document.getElementById('reviewsContainer');
        if (container) {
        container.innerHTML = `
            <div class="empty-state">
            <p>Não há depoimentos disponíveis no momento.</p>
            <button onclick="app.loadReviews()" class="btn btn--primary">
                Tentar novamente
            </button>
            </div>
        `;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global app instance
window.app = new AppState(); // Main e-commerce logic
window.reviewManager = new ReviewManager(); // Review subsystem
// Wait for DOM before touching the page
document.addEventListener('DOMContentLoaded', () => {
    window.app.init();
    window.reviewManager = new ReviewManager();
    window.reviewManager.loadReviews();
});

// Global Functions for HTML onclick events
function goToHome() {
    window.app.showPage('home');
}

// User's icon click handler function
function handleUserIconClick() {
    if (window.app.isLoggedIn) {
        // User is already logged in, go directly to profile
        window.app.showPage('profile');
    } else {
        // User is not logged in, show login modal
        window.app.showLogin();
    }
}

// Refresh animation with data save
function refreshToAnimation() {
    // Ensure cart data is saved before refresh
    if (window.app) {
        window.app.saveCartToStorage();
        
        // Check if zipper animation exists
        if (window.app.zipperAnimation) {
            // Reset animation state
            window.app.zipperAnimation.isAnimating = false;
            
            // Show zipper container if hidden
            const zipperContainer = window.app.zipperAnimation.elements.zipperContainer;
            if (zipperContainer) {
                zipperContainer.style.display = 'block';
                zipperContainer.style.zIndex = '9999';
            }
            
            // Show all zipper elements
            const elements = window.app.zipperAnimation.elements;
            if (elements.fabricLeft) elements.fabricLeft.style.display = 'block';
            if (elements.fabricRight) elements.fabricRight.style.display = 'block';
            if (elements.zipperSlider) elements.zipperSlider.style.display = 'block';
            if (elements.zipperTeeth) elements.zipperTeeth.style.display = 'block';
            
            // Reset opacity for all elements
            if (elements.fabricLeft) elements.fabricLeft.style.opacity = '1';
            if (elements.fabricRight) elements.fabricRight.style.opacity = '1';
            if (elements.zipperSlider) elements.zipperSlider.style.opacity = '1';
            if (elements.zipperTeeth) elements.zipperTeeth.style.opacity = '1';
            
            // Hide homepage content initially
            if (elements.homepageContent) {
                elements.homepageContent.style.opacity = '0';
                elements.homepageContent.style.transform = 'scale(0.8) rotateX(180deg)';
            }
            
            // Regenerate teeth for current viewport
            window.app.zipperAnimation.generateTeeth();
            
            // Setup initial state
            window.app.zipperAnimation.setupInitialState();
            
            // Start animation with delay
            setTimeout(() => {
                window.app.zipperAnimation.startAnimation();
            }, 500);
            
        } else {
            // Fallback: reinitialize entire zipper animation
            window.app.initializeZipperAnimation();
        }
        
        // Navigate to home page
        window.app.showPage('home');
    } else {
        // Fallback to page reload if app is not available
        window.location.reload();
    }
}

function showPage(page) {
    window.app.showPage(page);
}

function showCart() {
    window.app.showPage('cart');
}

function showLogin() {
    window.app.showLogin();
}

function closeModal(modalId) {
    window.app.closeModal(modalId);
}

function calculateShipping() {
    window.app.calculateShipping();
}

function proceedToShipping() {
    if (!window.app.isLoggedIn) {
        window.app.previousPage = 'cart';
        window.app.showLogin();
        return;
    }
    // Store cart page CEP before navigation
    const cartCepInput = document.getElementById('cepInput');
    if (cartCepInput && cartCepInput.value.trim()) {
        const cartCep = cartCepInput.value.replace(/\D/g, '');
        if (cartCep.length === 8) {
            // Ensure user profile exists
            if (!window.app.userProfile) {
                window.app.initUserProfile();
            }
            // Store CEP in user profile
            window.app.userProfile.cep = cartCep;
            window.app.saveUserProfileToStorage();
            console.log('Cart CEP migrated to profile:', cartCep);
        }
    }
    window.app.showPage('shipping');
}

function selectPaymentMethod(method) {
    window.app.selectPaymentMethod(method);
}

function processPayment() {
    window.app.processPayment();
}

function showAddProduct() {
    window.app.showAddProduct();
}

// Initialize Application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.app.init();
});

// Handle browser navigation - setup de navegação
function setupBrowserNavigation() {
  window.addEventListener('popstate', (e) => {
    const page = window.location.hash.substring(1) || 'home';
    if (page === 'admin') {
      window.app.showAdminLogin();
    } else {
      window.app.showPage(page);
    };
  });
}

// Após inicializar AppState
this.setupBrowserNavigation();

// Handles session termination
window.addEventListener('beforeunload', () => {
    if (!this.isLoggedIn) {
      sessionStorage.removeItem('seucanto_cart');
    }
});