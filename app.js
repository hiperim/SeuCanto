// Enhanced Zipper Animation Implementation - 6-Step Progression
class ZipperAnimation {
    constructor() {
        this.isAnimating = false;
        this.animationDuration = 4000; // Total 4 seconds as specified
        this.zipperDuration = 2000; // 2 seconds for zipper opening
        this.zoomFadeDuration = 2000; // 2 seconds for zoom and fade
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
    
    generateTeeth() {
        const isLandscape = window.matchMedia("(orientation: landscape)").matches;
        const container = this.elements.zipperTeeth;
        // DOcument height
        const actualHeight = Math.max(
            document.documentElement.clientHeight,
            window.innerHeight,
            document.body.scrollHeight
        );
         // Use window.screen for better mobile accuracy (innerHeight before)
        const viewportHeight = isLandscape ? window.screen.width : window.screen.height;
        const teethSpacing = isLandscape ? 18 : 15;
        
        const teethCount = Math.floor(viewportHeight / teethSpacing) + 5; // Buffer-teeth lol - Add extra teeth
        container.innerHTML = '';
        this.teeth = [];

        for (let i = 0; i < teethCount; i++) {
            const leftTooth = document.createElement('div');
            const rightTooth = document.createElement('div');
            leftTooth.className = 'tooth tooth-left';
            rightTooth.className = 'tooth tooth-right';
            leftTooth.style.top = `${i * 15}px`;
            rightTooth.style.top = `${i * 15}px`;

            this.teeth.push({
                left: leftTooth,
                right: rightTooth,
                position: i * 15,
                opened: false
            });

            container.appendChild(leftTooth);
            container.appendChild(rightTooth);
        }
        
        console.log(`Generated ${teethCount * 2} teeth for height: ${actualHeight}px`);
    }
    
    setupInitialState() {
        // Closed zipper, white background covering viewport
        this.elements.fabricLeft.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
        this.elements.fabricRight.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';                       
        
        // Position slider at top
        this.elements.zipperSlider.style.top = '-30px';
        this.elements.zipperSlider.style.bottom = 'auto';
        this.elements.zipperSlider.style.left = '50%';
        this.elements.zipperSlider.style.transform = 'translateX(-50%)';
        
        // Hide homepage content initially
        this.elements.homepageContent.style.opacity = '0';
        this.elements.homepageContent.style.transform = 'scale(0.8) rotateX(180deg)';
        
        // Reset all teeth to closed position
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
                // Zipper opening
                const zipperProgress = elapsed / this.zipperDuration;
                
                // Update slider position (moving from top to bottom)
                this.updateSliderPosition(zipperProgress);
                
                // Update fabric opening with progressive V pattern
                this.updateFabricOpening(zipperProgress);
                
                // Update individual teeth opening as slider passes
                this.updateTeethOpening(zipperProgress);
                
                // Update content visibility progressively
                this.updateContentVisibility(zipperProgress);
                
            } else {
                // Zoom and fade
                const zoomProgress = (elapsed - this.zipperDuration) / this.zoomFadeDuration;
                this.updateZoomAndFade(zoomProgress);
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
        // Steps 2-3: Slider descends from top to bottom
        const windowHeight = window.innerHeight;
        const sliderHeight = 60;
        const maxY = windowHeight - sliderHeight + 30; // Account for initial offset
        const currentY = -30 + (progress * maxY);
        
        // Move from top
        this.elements.zipperSlider.style.top = `${currentY}px`;
        
        console.log(`Step ${progress < 0.5 ? '2' : '3'}: Slider at ${Math.round(progress * 100)}% descent`);
    }
    
    updateFabricOpening(progress) {
        const windowHeight = window.innerHeight;
        const sliderHeight = 60;
        const currentSliderY = -30 + (progress * (windowHeight - sliderHeight + 30));
        
        // Get slider's exact center position
        const sliderCenterX = 50; // Slider is centered at 50%
        const sliderTopY = ((currentSliderY) / windowHeight) * 100; // Convert to percentage
        
        const currentVWidth = (progress * 44);
        
        // Make V-point converge at slider's top-center
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
                
                // Calculate displacement based on position in V-pattern
                const localGapWidth = centerGapWidth * positionRatio;
                
                // Convert to pixels 
                const pixelDisplacement = (localGapWidth / 100) * window.innerWidth * 0.20;
                
                tooth.left.style.transform = `translateX(-${pixelDisplacement}px)`;
                tooth.right.style.transform = `translateX(${pixelDisplacement}px)`;
                
                tooth.left.classList.add('opened-teeth-left');
                tooth.right.classList.add('opened-teeth-right');
            }
        });
    }


    updateContentVisibility(progress) {
        // Start showing content earlier and more gradually
        if (progress > 0.05) {
            const contentProgress = Math.min((progress - 0.05) / 0.95, 1);
            this.elements.homepageContent.style.opacity = contentProgress.toString();
            this.elements.homepageContent.style.transform = `scale(${0.8 + (contentProgress * 0.2)})`;
        }
    }
    
    updateZoomAndFade(zoomProgress) {
        const clampedProgress = Math.min(zoomProgress, 1);
        
        // Ensure content is fully visible during zoom phase
        this.elements.homepageContent.style.opacity = '1';
        
        // Zoom effect on homepage content (scale from 1.0 to 1.3)
        const scaleValue = 1.0 + (clampedProgress * 0.3);
        this.elements.homepageContent.style.transform = `scale(${scaleValue})`;
        
        // Fade out zipper elements
        const zipperOpacity = 1 - clampedProgress * 5.0;
        this.elements.fabricLeft.style.opacity = zipperOpacity.toString();
        this.elements.fabricRight.style.opacity = zipperOpacity.toString();
        this.elements.zipperSlider.style.opacity = zipperOpacity.toString();
        this.elements.zipperTeeth.style.opacity = zipperOpacity.toString();
    }

    
    onAnimationComplete() {
        console.log('Animation complete - ensuring homepage content is visible');
        
        // Ensure final state: homepage fully visible
        this.elements.homepageContent.style.opacity = '1';
        this.elements.homepageContent.style.transform = 'scale(1.3)';
        this.elements.homepageContent.style.zIndex = '100'; // Bring to front
        
        // Hide zipper elements completely
        this.elements.fabricLeft.style.display = 'none';
        this.elements.fabricRight.style.display = 'none';
        this.elements.zipperSlider.style.display = 'none';
        this.elements.zipperTeeth.style.display = 'none';
        
        // Final scaling transition
        setTimeout(() => {
            this.elements.homepageContent.style.transform = 'scale(1)';
            this.elements.homepageContent.style.transition = 'transform 1s ease-out';
        }, 100);
        
        this.isAnimating = false;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting zipper animation');
    
    // Small delay to ensure everything is ready
    setTimeout(() => {
        try {
            window.zipperAnimation = new ZipperAnimation();
        } catch (error) {
            console.error('Error initializing animation:', error);
        }
    }, 100);
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.zipperAnimation && !window.zipperAnimation.isAnimating) {
        window.zipperAnimation.generateTeeth();
    }
});

document.addEventListener('DOMContentLoaded', function() {
  const refreshButton = document.getElementById('page-refresh');
  
  if (refreshButton) {
    refreshButton.addEventListener('click', function(event) {
      event.preventDefault();
      
      refreshButton.textContent = 'Recarregando...';
      refreshButton.disabled = true;
      
      // Small delay to allow UI update
      setTimeout(() => {
        location.reload();
      }, 200);
    });
  }
});

// resize/orientation handler
let landscapeWarningShown = false;
window.addEventListener('resize', () => {
    const isLandscape = window.matchMedia("(orientation: landscape)").matches;
    
    if (isLandscape && !landscapeWarningShown) {
        console.log('Landscape mode activated - applying compact layout');
        landscapeWarningShown = true;
    }
    
    if (window.zipperAnimation && !window.zipperAnimation.isAnimating) {
        window.zipperAnimation.generateTeeth();
    }
}, true);