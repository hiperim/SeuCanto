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
        
        // Start animation after delay
        setTimeout(() => {
            console.log('Starting 6-step zipper animation...');
            this.startAnimation();
        }, 1000);
    }
    
    // Enhanced height calculation that accounts for zoom and mobile browsers
    getActualViewportHeight() {
        // Multiple height detection methods for maximum coverage
        const screenHeight = window.screen.height;
        const availHeight = window.screen.availHeight;
        const innerHeight = window.innerHeight;
        const documentHeight = Math.max(
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.body.clientHeight,
            document.body.scrollHeight
        );
        
        // Detect zoom level for proper scaling
        const zoomLevel = Math.max(0.1, Math.min(10, window.screen.width / window.innerWidth));
        
        // Use the maximum available height
        const maxHeight = Math.max(screenHeight, availHeight, innerHeight, documentHeight);
        
        // Apply zoom compensation and generous safety margin
        const safetyMargin = 500; // Increased margin for complete bottom coverage
        const zoomCompensation = Math.max(1.0, 1.5 / zoomLevel);
        
        return Math.floor((maxHeight * zoomCompensation) + safetyMargin);
    }

    generateTeeth() {
        const container = this.elements.zipperTeeth;
        
        // Use comprehensive height calculation
        const totalHeight = this.getActualViewportHeight();
        
        // FIXED: Calculate zoom level for teeth count adjustment
        const zoomLevel = Math.max(0.1, Math.min(10, window.screen.width / window.innerWidth));
        
        // Base configuration
        const baseSpacing = 15; // Keep spacing consistent
        const baseTeethCount = Math.floor(totalHeight / baseSpacing);
        
        // ZOOM-AWARE TEETH COUNT CALCULATION
        // Zoom in (zoomLevel > 1): Reduce teeth count
        // Zoom out (zoomLevel < 1): Increase teeth count
        let zoomMultiplier;
        if (zoomLevel > 1) {
            // Zoomed in: reduce teeth count (inverse relationship)
            zoomMultiplier = 1 / Math.pow(zoomLevel, 0.5); // Square root for smoother scaling
        } else {
            // Zoomed out: increase teeth count
            zoomMultiplier = Math.pow(1 / zoomLevel, 0.3); // Gentler scaling for zoom out
        }
        
        // Apply zoom-based adjustment to teeth count
        const adjustedTeethCount = Math.floor(baseTeethCount * zoomMultiplier);
        const finalTeethCount = adjustedTeethCount + 30; // Safety buffer
        
        container.innerHTML = '';
        this.teeth = [];

        for (let i = 0; i < finalTeethCount; i++) {
            const leftTooth = document.createElement('div');
            const rightTooth = document.createElement('div');
            leftTooth.className = 'tooth tooth-left';
            rightTooth.className = 'tooth tooth-right';
            leftTooth.style.top = `${i * baseSpacing}px`; // Keep consistent spacing
            rightTooth.style.top = `${i * baseSpacing}px`;

            this.teeth.push({
                left: leftTooth,
                right: rightTooth,
                position: i * baseSpacing,
                opened: false
            });

            container.appendChild(leftTooth);
            container.appendChild(rightTooth);
        }
        
        console.log(`Generated ${finalTeethCount * 2} teeth for zoom level: ${zoomLevel.toFixed(2)}x (base: ${baseTeethCount}, adjusted: ${adjustedTeethCount})`);
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
                const Progress = (elapsed - this.zipperDuration) / this.zoomFadeDuration;
                this.updateAnimation(Progress);
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
    
    updateAnimation(Progress) {
        const clampedProgress = Math.min(Progress, 1);
        
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

        // Add scroll restoration after animation
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
    }
}

// SeuCantto E-commerce Application
class AppState {
    constructor() {
        this.products = [];
        this.cart = [];
        this.user = null;
        this.isLoggedIn = false;
        this.currentPage = 'home';
        this.shippingInfo = null;
        this.otpCode = null;
        this.otpTimer = null;
        this.isAdmin = false;
        this.zipperAnimation = null;
        this.domReady = false;
        // Image gallery state management
        this.currentProductImages = null;
        this.currentMainImageIndex = 0;
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
        this.loadProducts();
        this.loadCartFromStorage();
        this.loadUserFromStorage();
        this.setupEventListeners();
        this.updateCartCount();
            
        // Initialize zipper animation with proper error handling
        this.initializeZipperAnimation();

    }
    
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
            // Fallback: show content immediately without animation
            this.showContentWithoutAnimation();
            return;
        }

        setTimeout(() => {
            try {
                this.zipperAnimation = new ZipperAnimation();
                console.log('Zipper animation initialized successfully');
            } catch (error) {
                console.error('Error initializing zipper animation:', error);
                this.showContentWithoutAnimation();
            }
        }, 30);
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
                    "https://m.media-amazon.com/images/I/51b6Vv0gFXL._AC_SY1000_.jpg",
                    "https://cdn-icons-png.flaticon.com/512/1042/1042536.png",
                    "https://cdn-icons-png.flaticon.com/512/8322/8322731.png",
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
                    "https://images.tcdn.com.br/img/img_prod/965739/bolsa_de_croche_flor_189_variacao_55_1_265d48d1e7521b4e032531686bd96dcc.jpg", 
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
                    "https://dzg5mdpaq0k37.cloudfront.net/Custom/Content/Products/17/21/17211_bolsa-feminina-transversal-estilosa-pit-bull-jeans-88805_l15_638826648777502355.webp", 
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
                    "https://www.manuel-dreesmann.com/cdn/shop/files/The-Rivet-Bag-Big-Leather-Dark-Brown-Color-Vegetable-Tanned-Full-Grain-Handcrafted-Spain-Full-Brass-Rivets-Design-Minimalistic-Modern-Handbag-Clutch-Atelier-Madre-Manuel-Dreesmann-Bar.jpg?v=1733758550&width=3000", 
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
                    "https://cdn-icons-png.flaticon.com/512/9011/9011529.png", 
                    "https://img.freepik.com/vetores-premium/moedas-do-saco-de-dinheiro_78370-217.jpg",
                    ""                
                ],
                "description": "A bag preferida do Henrique. Para todas as ocasiões. Material principal: din-din",
                "dimensions": {"width": 25, "height": 28, "depth": 15}, 
                "weight": 10
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
        
        const otpForm = document.getElementById('otpForm');
        if (otpForm) {
            otpForm.addEventListener('submit', this.handleOTPVerification.bind(this));
        }
        
        const shippingCpf = document.getElementById('shippingCpf');
        if (shippingCpf) {
            shippingCpf.addEventListener('input', this.formatCPF);
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
        const stored = storage.getItem('seucantto_cart');
        this.cart = stored ? JSON.parse(stored) : [];
        } catch (e) {
        console.error('Error loading cart:', e);
        this.cart = [];
        }
    }

    saveCartToStorage() {
        try {
        const storage = this.isLoggedIn ? localStorage : sessionStorage;
        storage.setItem('seucantto_cart', JSON.stringify(this.cart));
        } catch (e) {
        console.error('Error saving cart:', e);
        }
    }

    loadUserFromStorage() {
        try {
            const stored = localStorage.getItem('seucantto_user');
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
            localStorage.setItem('seucantto_user', JSON.stringify(this.user));
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
            this.showLogin();
            return;
        }
        this.addToCart(productId);
        this.showPage('shipping');
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
            cartItems.innerHTML = '<p class="empty-cart">Seu carrinho está vazio.</p>';
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
                    <p>Subtotal: R$${subtotal.toFixed(2).replace('.', ',')}</span></p>
                </div>
                ${shipping > 0 ? `
                    <div class="summary-row">
                        <p>Frete: R$${shipping.toFixed(2).replace('.', ',')}</p>
                    </div>
                ` : ''}
                <div class="summary-row total">
                    <p>Total: R$${total.toFixed(2).replace('.', ',')}</p>
                </div>
            </div>
        `;
        
        console.log('Cart rendered successfully');
    }

    showPage(pageId) {
        window.scrollTo(0, 0);

        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        
        const targetPage = document.getElementById(pageId + 'Page');
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
        }

        if (pageId === 'cart') {
            this.renderCart();
        } else if (pageId === 'profile' && !this.isLoggedIn) {
            this.showLogin();
            return;
        } else if (pageId === 'admin') {
            this.renderAdminProducts();
        }
    }

    showLogin() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('active');
        }
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

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('emailInput').value;
        
        if (!this.validateEmail(email)) {
            this.showMessage('Por favor, insira um e-mail válido.', 'error');
            return;
        }

        if (!this.isLoggedIn) {
            const sessionCart = sessionStorage.getItem('seucantto_cart');
            if (sessionCart) {
            localStorage.setItem('seucantto_cart', sessionCart);
            sessionStorage.removeItem('seucantto_cart');
            }
        }

        this.generateOTP();
        this.user = { email };
        
        this.closeModal('loginModal');
        const otpModal = document.getElementById('otpModal');
        if (otpModal) {
            otpModal.classList.add('active');
        }
        
        this.startOTPTimer();
        this.showMessage(`Código enviado para ${email}`, 'success');
    }

    handleOTPVerification(e) {
        e.preventDefault();
        const enteredCode = document.getElementById('otpInput').value;
        
        if (enteredCode === this.otpCode) {
            this.isLoggedIn = true;
            this.saveUserToStorage();
            this.closeModal('otpModal');
            this.showMessage('Login realizado com sucesso!', 'success');
            
            this.otpCode = null;
            if (this.otpTimer) {
                clearInterval(this.otpTimer);
            }
        } else {
            this.showMessage('Código inválido. Tente novamente.', 'error');
        }
    }

    handleAdminLogin(e) {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        if (username === 'admin' && password === 'mozao') {
            this.isAdmin = true;
            this.closeModal('adminLoginModal');
            this.showPage('admin');
            this.showMessage('Acesso administrativo autorizado', 'success');
        } else {
            this.showMessage('Credenciais inválidas', 'error');
        }
    }

    generateOTP() {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.otpCode = '';
        for (let i = 0; i < 4; i++) {
            this.otpCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        console.log('OTP Code:', this.otpCode);
        alert(`Código OTP para demonstração: ${this.otpCode}`);
    }

    startOTPTimer() {
        let timeLeft = 900;
        const timerElement = document.getElementById('otpTimer');
        
        if (!timerElement) return;
        
        this.otpTimer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(this.otpTimer);
                this.otpCode = null;
                this.showMessage('Código expirado. Solicite um novo.', 'error');
                this.closeModal('otpModal');
            }
            timeLeft--;
        }, 1000);
    }

    calculateShipping() {
        const cepInput = document.getElementById('cepInput');
        if (!cepInput) return;
        
        const cep = cepInput.value.replace(/\D/g, '');
        
        if (cep.length !== 8) {
            this.showMessage('CEP inválido', 'error');
            return;
        }

        // Determine the zone based of CEP prefix //
        function getZoneByCEP(cep) {
            const prefix = parseInt(cep.substring(0, 2), 10);
            if (prefix >= 10 && prefix == 0 && prefix <= 19) {
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

        this.renderCart();
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

        // Get recipient name and CPF values
        const recipientName = document.getElementById('shippingRecipient')?.value || '';
        const cpf = document.getElementById('shippingCpf')?.value || '';
        
        // Validate required fields
        if (!recipientName.trim()) {
            this.showMessage('Por favor, informe o nome do destinatário.', 'error');
            return;
        }
        
        if (!cpf.trim()) {
            this.showMessage('Por favor, informe o CPF do destinatário.', 'error');
            return;
        }
        
        // Validate CPF format (basic validation)
        if (!this.validateCPF(cpf)) {
            this.showMessage('CPF inválido. Verifique o formato.', 'error');
            return;
        }

        this.shippingInfo = {
            ...this.shippingInfo,
            recipient: recipientName.trim(),
            cpf: cpf.replace(/\D/g, ''), // Store only numbers
            cep: document.getElementById('shippingCep')?.value || '',
            street: document.getElementById('shippingStreet')?.value || '',
            neighborhood: document.getElementById('shippingNeighborhood')?.value || '',
            city: document.getElementById('shippingCity')?.value || '',
            state: document.getElementById('shippingState')?.value || '',
            number: document.getElementById('shippingNumber')?.value || '',
            complement: document.getElementById('shippingComplement')?.value || '',
            phone: document.getElementById('shippingPhone')?.value || ''
        };

        this.showPage('payment');
        this.renderOrderSummary();
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

    formatCPF(e) {
        let value = e.target.value.replace(/\D/g, '');
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
        e.target.value = value;
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
            this.showMessage('Pedido realizado com sucesso! Você receberá um e-mail de confirmação.', 'success');
            
            this.cart = [];
            this.saveCartToStorage();
            this.updateCartCount();
            
            this.showPage('home');
        }, 2000);
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
}

// Global app instance
window.app = new AppState();

// Global Functions for HTML onclick events
function goToHome() {
    window.app.showPage('home');
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
        window.app.showLogin();
        return;
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

// Handle browser navigation
window.addEventListener('hashchange', () => {
    const page = window.location.hash.substring(1) || 'home';
    if (page === 'admin') {
        window.app.showAdminLogin();
    } else {
        window.app.showPage(page);
    }
});

// Handle initial load with hash
window.addEventListener('load', () => {
    const page = window.location.hash.substring(1) || 'home';
    if (page === 'admin') {
        window.app.showAdminLogin();
    } else {
        window.app.showPage(page);
    }
});

// Handles session termination
window.addEventListener('beforeunload', () => {
    if (!this.isLoggedIn) {
      sessionStorage.removeItem('seucantto_cart');
    }
});

// Handle window resize for zipper animation
window.addEventListener('resize', () => {
    if (window.app && window.app.zipperAnimation && !window.app.zipperAnimation.isAnimating) {
        window.app.zipperAnimation.generateTeeth();
    }
});

// Prevent form submission on Enter key in some inputs
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'submit') {
        const form = e.target.closest('form');
        if (form && !e.target.classList.contains('allow-enter')) {
            e.preventDefault();
        }
    }
});