/* ==========================================================================
   AETHER ELECTRONICS // INTERACTIVE SYSTEM & LOGIC (app.js)
   Web Audio API, 3D Tilt, Customizer, AI Concierge, Cart & Pre-Order
   ========================================================================== */

(function () {
  'use strict';

  // State Management
  const state = {
    soundMuted: false,
    audioPlaying: false,
    currentProfile: 'spatial',
    cart: [
      {
        id: 'apex-pro',
        name: 'AETHER APEX PRO',
        variant: 'Obsidian Stealth Edition',
        price: 499,
        quantity: 1,
        image: 'assets/images/headphone.jpg'
      }
    ],
    discount: 0,
    appliedCoupon: null
  };

  // Product Database
  const products = {
    'apex-pro': {
      id: 'apex-pro',
      name: 'AETHER APEX PRO',
      category: 'Spatial Acoustic Headphone',
      price: 499,
      rating: '4.95 / 5.0',
      tagline: 'Spatial Electro-Acoustic Headphones with Bio-Feedback ANC & Graphene Drivers',
      specs: {
        driver: '50mm Diamond-Like Carbon (DLC)',
        frequency: '4Hz - 52,000Hz (Hi-Res Audio Wireless)',
        battery: '48 Hours (ANC On) / Fast Charge (10m = 8h)',
        anc: 'Neural Hybrid 8-Mic Adaptive Cancellation',
        connectivity: 'Bluetooth 5.4 LE Audio & Ultra-Wideband USB-C'
      },
      image: 'assets/images/headphone.jpg'
    },
    'iris-x': {
      id: 'iris-x',
      name: 'AETHER IRIS X',
      category: 'Neural Micro-OLED AR Eyewear',
      price: 799,
      rating: '4.92 / 5.0',
      tagline: 'Transparent Micro-OLED AR Smart Glasses with Neural Gesture Engine',
      specs: {
        display: 'Dual 4K Micro-OLED 120Hz (3500 nits)',
        weight: 'Ultra-light 58g Titanium Aerospace Frame',
        battery: '16 Hours Continuous Augmented Overlay',
        compute: 'AETHER Neural Co-Processor N2 (4nm)',
        sensors: 'LiDAR Spatial Depth + Eye-Tracking Quad Array'
      },
      image: 'assets/images/glasses.jpg'
    },
    'pulse-sphere': {
      id: 'pulse-sphere',
      name: 'AETHER PULSE SPHERE',
      category: 'Magnetic Levitation Acoustic Resonator',
      price: 649,
      rating: '4.98 / 5.0',
      tagline: 'Zero-Gravity Magnetic Levitation Acoustic Resonator with 360° Studio Soundfield',
      specs: {
        acoustic: 'Omnidirectional Dual-Driver Ring Array with Sub-Bass Port',
        levitation: 'Active Neodymium Magnetic Suspension with Wireless Induction',
        power: '120W Peak Output / 24-bit 192kHz DAC',
        lighting: 'Dynamic Ambient Reactive RGB Spectral Ring',
        sync: 'Room-Scale Multi-Device Mesh Acoustics'
      },
      image: 'assets/images/speaker.jpg'
    },
    'chrono-titanium': {
      id: 'chrono-titanium',
      name: 'AETHER CHRONOS TITANIUM',
      category: 'Bio-Telemetry Pulse Watch',
      price: 549,
      rating: '4.91 / 5.0',
      tagline: 'Curved Sapphire Bio-Telemetry Pulse Watch with Sub-Atomic Frequency Sensor',
      specs: {
        display: '1.96" Curved Flexible Sapphire LTPO OLED Always-On',
        chassis: 'Grade 5 Aerospace Titanium with Ceramic Caseback',
        sensors: 'Continuous Blood Pressure, ECG, VO2 Max, Stress Wave',
        waterproof: '100m Submersible (10 ATM + Dive Certified)',
        battery: '7 Days Active Telemetry / 18 Days Low-Power'
      },
      image: 'assets/images/smartwatch.jpg'
    }
  };

  /* ==========================================================================
     WEB AUDIO API SYNTHESIZER ENGINE (UI FX & SOUND LAB)
     ========================================================================== */
  let audioCtx = null;
  let activeNodes = [];
  let animFrameId = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // UI Sound Effect generator
  function playUiBeep(freq = 800, type = 'sine', duration = 0.08) {
    if (state.soundMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // Play rich audio demo for Sound Lab
  function startSoundDemo(profile) {
    stopSoundDemo();
    const ctx = getAudioContext();
    if (!ctx) return;

    state.audioPlaying = true;
    updateAudioBtnState(true);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.15, ctx.currentTime);
    masterGain.connect(ctx.destination);
    activeNodes.push(masterGain);

    if (profile === 'spatial') {
      // Harmonious spatial pad chord (C Minor 9th chord: C3, G3, Bb3, Eb4, D5)
      const freqs = [130.81, 196.00, 233.08, 311.13, 587.33];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const voiceGain = ctx.createGain();

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime);

        // Subtle slow chorus detune
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.2 + i * 0.1, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(2.5, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
        activeNodes.push(lfo);

        if (panner) {
          panner.pan.setValueAtTime((i - 2) * 0.45, ctx.currentTime);
          osc.connect(voiceGain);
          voiceGain.connect(panner);
          panner.connect(masterGain);
        } else {
          osc.connect(voiceGain);
          voiceGain.connect(masterGain);
        }

        voiceGain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.start();
        activeNodes.push(osc);
      });
    } else if (profile === 'bass') {
      // Warm Sub-808 Sine with Saturation
      const sub = ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(55, ctx.currentTime); // 55Hz A1

      const punch = ctx.createOscillator();
      punch.type = 'triangle';
      punch.frequency.setValueAtTime(110, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, ctx.currentTime);

      sub.connect(filter);
      punch.connect(filter);
      filter.connect(masterGain);

      sub.start();
      punch.start();
      activeNodes.push(sub, punch);
    } else if (profile === 'studio') {
      // Pure Crystal Clarity High-Frequency Acoustic Resonance
      const freqs = [440, 659.25, 880, 1318.5];
      freqs.forEach(f => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        osc.connect(masterGain);
        osc.start();
        activeNodes.push(osc);
      });
    } else if (profile === 'asmr') {
      // Gentle Binaural Ocean Sound Pulse
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      const panL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const panR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(200, ctx.currentTime);
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(207, ctx.currentTime); // 7Hz Theta Wave Binaural Beat

      if (panL && panR) {
        panL.pan.setValueAtTime(-0.8, ctx.currentTime);
        panR.pan.setValueAtTime(0.8, ctx.currentTime);
        oscL.connect(panL);
        panL.connect(masterGain);
        oscR.connect(panR);
        panR.connect(masterGain);
      } else {
        oscL.connect(masterGain);
        oscR.connect(masterGain);
      }
      oscL.start();
      oscR.start();
      activeNodes.push(oscL, oscR);
    }

    startCanvasVisualizer();
  }

  function stopSoundDemo() {
    activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    activeNodes = [];
    state.audioPlaying = false;
    updateAudioBtnState(false);
  }

  function updateAudioBtnState(isPlaying) {
    const playBtn = document.getElementById('playToneBtn');
    if (playBtn) {
      if (isPlaying) {
        playBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
          Pause Studio Sound
        `;
        playBtn.style.background = 'var(--coral-energy)';
        playBtn.style.color = '#fff';
      } else {
        playBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Audition Profile Demo
        `;
        playBtn.style.background = 'var(--grad-cyan-purple)';
        playBtn.style.color = 'var(--bg-dark)';
      }
    }
  }

  /* ==========================================================================
     CANVAS EQUALIZER & WAVEFORM VISUALIZER
     ========================================================================== */
  function startCanvasVisualizer() {
    const canvas = document.getElementById('mainVisualizerCanvas');
    const heroCanvas = document.getElementById('heroEqualizerCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const heroCtx = heroCanvas ? heroCanvas.getContext('2d') : null;

    let tick = 0;
    const barCount = 42;

    function render() {
      // Resize dynamically
      if (canvas.width !== canvas.offsetWidth) canvas.width = canvas.offsetWidth;
      if (canvas.height !== canvas.offsetHeight) canvas.height = canvas.offsetHeight;
      if (heroCanvas && heroCanvas.width !== heroCanvas.offsetWidth) {
        heroCanvas.width = heroCanvas.offsetWidth;
        heroCanvas.height = heroCanvas.offsetHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (heroCtx) heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);

      tick += 0.05;

      const barWidth = canvas.width / barCount - 3;
      const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
      grad.addColorStop(0, '#00f0ff');
      grad.addColorStop(0.6, '#9d4edd');
      grad.addColorStop(1, '#ff5e36');

      for (let i = 0; i < barCount; i++) {
        let heightMultiplier = state.audioPlaying ? 1 : 0.2;
        let wave = Math.sin(tick * 2 + i * 0.3) * 0.4 + 0.6;
        let wave2 = Math.cos(tick * 3 + i * 0.15) * 0.3 + 0.5;
        let barHeight = (wave * wave2 * (canvas.height * 0.75) + 10) * heightMultiplier;

        ctx.fillStyle = grad;
        ctx.fillRect(i * (barWidth + 3), canvas.height - barHeight, barWidth, barHeight);

        // Render subtle top reflection cap
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(i * (barWidth + 3), canvas.height - barHeight - 2, barWidth, 2);

        // Hero mini visualizer
        if (heroCtx) {
          const heroBarW = heroCanvas.width / 16 - 2;
          if (i < 16) {
            const hHeight = ((wave * 0.5 + 0.5) * heroCanvas.height * 0.8 + 4) * heightMultiplier;
            heroCtx.fillStyle = '#00f0ff';
            heroCtx.fillRect(i * (heroBarW + 2), heroCanvas.height - hHeight, heroBarW, hHeight);
          }
        }
      }

      animFrameId = requestAnimationFrame(render);
    }

    if (animFrameId) cancelAnimationFrame(animFrameId);
    render();
  }

  /* ==========================================================================
     INTERACTIVE 3D PERSPECTIVE TILT
     ========================================================================== */
  function init3DTilt() {
    const card = document.getElementById('heroShowcaseCard');
    if (!card) return;

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -14;
      const rotateY = ((x - centerX) / centerX) * 14;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  }

  /* ==========================================================================
     FINISH & COLOR CUSTOMIZER STUDIO
     ========================================================================== */
  function initCustomizer() {
    const swatches = document.querySelectorAll('.color-swatch');
    const customizerImg = document.getElementById('customizerImg');
    const finishLabel = document.getElementById('selectedFinishLabel');
    const priceLabel = document.getElementById('customizerPrice');
    const ambientGlow = document.getElementById('customizerGlow');

    const finishes = {
      obsidian: {
        title: 'Obsidian Stealth (Carbon Fiber & Matte Black)',
        price: '$499',
        glow: 'rgba(0, 240, 255, 0.4)',
        scale: '1'
      },
      titanium: {
        title: 'Arctic Titanium (Aerospace Brushed Metal)',
        price: '$549',
        glow: 'rgba(142, 155, 176, 0.5)',
        scale: '1.02'
      },
      cyan: {
        title: 'Cyber Cyan Limited Edition',
        price: '$499',
        glow: 'rgba(0, 240, 255, 0.7)',
        scale: '1'
      },
      gold: {
        title: 'Solar Flare Gold (24K Gold Acoustic Mesh)',
        price: '$599',
        glow: 'rgba(245, 158, 11, 0.6)',
        scale: '1.03'
      }
    };

    swatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        playUiBeep(1100, 'sine', 0.05);
        swatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');

        const finishKey = swatch.dataset.finish;
        const config = finishes[finishKey];
        if (!config) return;

        if (finishLabel) finishLabel.textContent = config.title;
        if (priceLabel) priceLabel.textContent = config.price;
        if (ambientGlow) {
          ambientGlow.style.background = config.glow;
          ambientGlow.style.boxShadow = `0 0 100px ${config.glow}`;
        }

        if (customizerImg) {
          customizerImg.style.transform = `scale(0.96)`;
          setTimeout(() => {
            customizerImg.style.transform = `scale(${config.scale})`;
          }, 150);
        }

        showToast(`Selected Finish: ${config.title}`, '🎨');
      });
    });
  }

  /* ==========================================================================
     INTERACTIVE SOUND PROFILE TABS
     ========================================================================== */
  function initSoundProfiles() {
    const profileBtns = document.querySelectorAll('.profile-btn');
    const playBtn = document.getElementById('playToneBtn');
    const activeFreqDisplay = document.getElementById('activeFrequencyDisplay');

    profileBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        playUiBeep(950, 'sine', 0.05);
        profileBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const profile = btn.dataset.profile;
        state.currentProfile = profile;

        const freqMap = {
          spatial: '130Hz - 22kHz Binaural Array',
          bass: '20Hz - 250Hz Sub-808 Harmonic',
          studio: '440Hz - 48kHz Flat Linear',
          asmr: '7Hz Binaural Wave Pulse'
        };

        if (activeFreqDisplay) {
          activeFreqDisplay.textContent = freqMap[profile] || 'Active Frequency';
        }

        if (state.audioPlaying) {
          startSoundDemo(profile);
        }

        showToast(`Acoustic Profile Activated: ${btn.querySelector('.profile-title').textContent}`, '🎧');
      });
    });

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (state.audioPlaying) {
          stopSoundDemo();
          showToast('Audio demo paused', '⏸');
        } else {
          startSoundDemo(state.currentProfile);
          showToast('Auditioning live sound profile', '▶');
        }
      });
    }
  }

  /* ==========================================================================
     CART & PRE-ORDER DRAWER LOGIC
     ========================================================================== */
  function initCartSystem() {
    const cartTrigger = document.getElementById('cartTriggerBtn');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartBackdrop = document.getElementById('cartBackdrop');
    const cartCloseBtn = document.getElementById('cartCloseBtn');
    const cartContainer = document.getElementById('cartItemsContainer');
    const cartCountBadges = document.querySelectorAll('.cart-count-badge');
    const subtotalEl = document.getElementById('cartSubtotal');
    const discountEl = document.getElementById('cartDiscount');
    const totalEl = document.getElementById('cartTotal');
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    const couponInput = document.getElementById('couponInput');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const orderModal = document.getElementById('orderModal');
    const closeOrderModalBtn = document.getElementById('closeOrderModalBtn');

    function openCart() {
      playUiBeep(1200, 'sine', 0.06);
      if (cartDrawer) cartDrawer.classList.add('open');
      if (cartBackdrop) cartBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      renderCart();
    }

    function closeCart() {
      playUiBeep(700, 'sine', 0.05);
      if (cartDrawer) cartDrawer.classList.remove('open');
      if (cartBackdrop) cartBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (cartTrigger) cartTrigger.addEventListener('click', openCart);
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
    if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);

    // Render cart items
    function renderCart() {
      if (!cartContainer) return;

      const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCountBadges.forEach(b => (b.textContent = totalItems));

      if (state.cart.length === 0) {
        cartContainer.innerHTML = `
          <div class="cart-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 16px; opacity: 0.5;">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <p>Your pre-order reservation bag is empty.</p>
            <button class="btn btn-secondary" style="margin-top: 16px;" onclick="document.getElementById('cartCloseBtn').click(); window.location.hash='#products';">
              Explore Hardware
            </button>
          </div>
        `;
        if (subtotalEl) subtotalEl.textContent = '$0';
        if (discountEl) discountEl.textContent = '$0';
        if (totalEl) totalEl.textContent = '$0';
        return;
      }

      let subtotal = 0;
      cartContainer.innerHTML = '';

      state.cart.forEach((item, index) => {
        subtotal += item.price * item.quantity;
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-variant">${item.variant} &times; ${item.quantity}</div>
            <div class="cart-item-price">$${item.price * item.quantity}</div>
          </div>
          <button class="cart-item-remove" data-index="${index}" title="Remove item" aria-label="Remove item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        `;
        cartContainer.appendChild(itemEl);
      });

      // Item removal
      cartContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', e => {
          const idx = parseInt(btn.dataset.index, 10);
          const removed = state.cart.splice(idx, 1)[0];
          playUiBeep(500, 'sine', 0.08);
          renderCart();
          showToast(`Removed ${removed.name} from bag`, '🗑');
        });
      });

      // Calc discounts
      let discountAmount = 0;
      if (state.discount > 0) {
        discountAmount = Math.round(subtotal * (state.discount / 100));
      }
      const finalTotal = subtotal - discountAmount;

      if (subtotalEl) subtotalEl.textContent = `$${subtotal}`;
      if (discountEl) discountEl.textContent = state.discount > 0 ? `-$${discountAmount} (${state.discount}% OFF)` : '$0';
      if (totalEl) totalEl.textContent = `$${finalTotal}`;
    }

    // Coupon Code Application
    if (applyCouponBtn && couponInput) {
      applyCouponBtn.addEventListener('click', () => {
        const code = couponInput.value.trim().toUpperCase();
        if (code === 'FUTURE20') {
          state.discount = 20;
          state.appliedCoupon = 'FUTURE20';
          playUiBeep(1400, 'triangle', 0.1);
          showToast('Coupon Applied: 20% Futuristic Launch Discount!', '✨');
          renderCart();
        } else if (code === 'LAUNCHVIP') {
          state.discount = 25;
          state.appliedCoupon = 'LAUNCHVIP';
          playUiBeep(1600, 'triangle', 0.12);
          showToast('VIP Privilege Activated: 25% Off + Priority Drone Dispatch!', '🛸');
          renderCart();
        } else {
          playUiBeep(350, 'sawtooth', 0.15);
          showToast('Invalid Access Code. Try "FUTURE20" or "LAUNCHVIP"', '⚠️');
        }
      });
    }

    // Checkout Modal
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (state.cart.length === 0) {
          showToast('Your reservation bag is currently empty.', '⚠️');
          return;
        }
        closeCart();
        const randId = 'AETH-' + Math.floor(1000 + Math.random() * 9000) + '-PRO';
        const orderIdEl = document.getElementById('orderConfirmationId');
        if (orderIdEl) orderIdEl.textContent = randId;

        const orderTotalEl = document.getElementById('orderModalTotal');
        if (orderTotalEl && totalEl) orderTotalEl.textContent = totalEl.textContent;

        if (orderModal) orderModal.classList.add('open');
        playUiBeep(1500, 'sine', 0.15);
        showToast('Reservation Authenticated & Priority Slot Reserved!', '🎉');
      });
    }

    if (closeOrderModalBtn && orderModal) {
      closeOrderModalBtn.addEventListener('click', () => {
        orderModal.classList.remove('open');
        state.cart = [];
        renderCart();
      });
    }

    // Add to cart buttons throughout page
    document.querySelectorAll('[data-add-cart]').forEach(btn => {
      btn.addEventListener('click', () => {
        const prodId = btn.dataset.addCart;
        const prod = products[prodId];
        if (!prod) return;

        const existing = state.cart.find(i => i.id === prod.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          state.cart.push({
            id: prod.id,
            name: prod.name,
            variant: 'Standard Launch Edition',
            price: prod.price,
            quantity: 1,
            image: prod.image
          });
        }

        playUiBeep(1300, 'sine', 0.08);
        renderCart();
        showToast(`Added ${prod.name} to Pre-Order Bag!`, '🛍');
        openCart();
      });
    });

    renderCart();
  }

  /* ==========================================================================
     AI TECH CONCIERGE CHATBOT ("AURA")
     ========================================================================== */
  function initAiChat() {
    const triggerBtn = document.getElementById('aiConciergeTrigger');
    const chatWindow = document.getElementById('aiChatWindow');
    const closeBtn = document.getElementById('chatCloseBtn');
    const chatBody = document.getElementById('chatBody');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');

    function toggleChat() {
      playUiBeep(1000, 'sine', 0.05);
      chatWindow.classList.toggle('open');
      if (chatWindow.classList.contains('open')) {
        chatInput.focus();
      }
    }

    if (triggerBtn) triggerBtn.addEventListener('click', toggleChat);
    if (closeBtn) closeBtn.addEventListener('click', toggleChat);

    function addMessage(text, sender = 'bot', customHtml = null) {
      const msg = document.createElement('div');
      msg.className = `chat-msg ${sender}`;
      if (customHtml) {
        msg.innerHTML = customHtml;
      } else {
        msg.textContent = text;
      }
      chatBody.appendChild(msg);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function processAiQuery(query) {
      const q = query.toLowerCase();
      let response = '';

      if (q.includes('flight') || q.includes('travel') || q.includes('plane') || q.includes('noise')) {
        response = `For flights and travel, **AETHER APEX PRO** is unrivaled. Its Neural Hybrid 8-Mic ANC actively isolates low-frequency jet drone at 48dB attenuation, and the 48-hour battery easily covers round-the-world trips on a single charge.`;
      } else if (q.includes('iris') || q.includes('glasses') || q.includes('laptop') || q.includes('work')) {
        response = `**AETHER IRIS X** projects up to three virtual 4K spatial micro-OLED workspaces directly into your field of view with 120Hz refresh rate. It connects natively to Mac, Windows, iOS, and Android via ultra-low latency Wi-Fi 7.`;
      } else if (q.includes('compare') || q.includes('sony') || q.includes('airpods') || q.includes('apple')) {
        response = `Compared to traditional consumer flagships, **APEX PRO** features real 50mm Diamond-Like Carbon drivers (yielding 4Hz-52kHz bandwidth vs standard 20Hz-20kHz), an aerospace CNC titanium frame, and zero-latency binaural spatial tracking.`;
      } else if (q.includes('battery') || q.includes('charge') || q.includes('power')) {
        response = `Battery life across our flagship line:
• **Apex Pro**: 48 hrs ANC On (10m quick-charge = 8 hrs)
• **Iris X**: 16 hrs continuous spatial projection
• **Pulse Sphere**: Magnetic induction 24/7 continuous + 18 hrs detached
• **Chronos**: 7 days high-telemetry / 18 days low power`;
      } else if (q.includes('speaker') || q.includes('room') || q.includes('pulse')) {
        response = `The **PULSE SPHERE** uses active magnetic levitation to completely eliminate acoustic chassis vibrations, delivering 120W of pure, uncolored 360° studio dispersion.`;
      } else if (q.includes('price') || q.includes('cost') || q.includes('buy')) {
        response = `Hardware Pricing:
• APEX PRO: $499
• IRIS X AR: $799
• PULSE SPHERE: $649
• CHRONOS: $549
Use launch coupon **FUTURE20** for 20% off during checkout!`;
      } else {
        response = `I'm AURA, your personal AETHER hardware specialist. I can assist you with acoustic benchmarks, AR optical specs, battery performance, or order questions. What can I calculate for you?`;
      }

      setTimeout(() => {
        playUiBeep(1200, 'triangle', 0.06);
        addMessage(response, 'bot');
      }, 450);
    }

    if (sendBtn && chatInput) {
      const handleSend = () => {
        const text = chatInput.value.trim();
        if (!text) return;
        addMessage(text, 'user');
        chatInput.value = '';
        processAiQuery(text);
      };

      sendBtn.addEventListener('click', handleSend);
      chatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') handleSend();
      });
    }

    // Quick prompt chips
    document.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.textContent;
        addMessage(text, 'user');
        processAiQuery(text);
      });
    });
  }

  /* ==========================================================================
     EXPLODED VIEW HOTSPOTS
     ========================================================================== */
  function initHotspots() {
    const pins = document.querySelectorAll('.hotspot-pin');
    pins.forEach(pin => {
      pin.addEventListener('click', e => {
        e.stopPropagation();
        playUiBeep(1100, 'sine', 0.05);
        pins.forEach(p => {
          if (p !== pin) p.classList.remove('active');
        });
        pin.classList.toggle('active');
      });
    });

    document.addEventListener('click', () => {
      pins.forEach(p => p.classList.remove('active'));
    });
  }

  /* ==========================================================================
     VIP DROP COUNTDOWN TIMER
     ========================================================================== */
  function initCountdown() {
    const daysEl = document.getElementById('countDays');
    const hoursEl = document.getElementById('countHours');
    const minsEl = document.getElementById('countMins');
    const secsEl = document.getElementById('countSecs');

    // Launch target date: 4 days, 18 hours, 32 mins from now
    const targetDate = new Date().getTime() + (4 * 24 * 60 * 60 + 18 * 60 * 60 + 32 * 60) * 1000;

    function updateTimer() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) return;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((distance % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
      if (secsEl) secsEl.textContent = String(secs).padStart(2, '0');
    }

    setInterval(updateTimer, 1000);
    updateTimer();

    // Newsletter subscription toast
    const newsletterForm = document.getElementById('dropNewsletterForm');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', e => {
        e.preventDefault();
        const input = newsletterForm.querySelector('input');
        if (input && input.value) {
          playUiBeep(1400, 'sine', 0.08);
          showToast(`VIP Priority Pass reserved for ${input.value}!`, '🚀');
          input.value = '';
        }
      });
    }
  }

  /* ==========================================================================
     NAVBAR SCROLL & SOUND TOGGLE
     ========================================================================== */
  function initNav() {
    const navbar = document.getElementById('mainNavbar');
    const soundToggle = document.getElementById('soundToggleBtn');
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        state.soundMuted = !state.soundMuted;
        soundToggle.classList.toggle('active', !state.soundMuted);
        if (!state.soundMuted) {
          playUiBeep(1200, 'sine', 0.08);
          showToast('Interactive Audio FX Enabled', '🔊');
        } else {
          showToast('Audio FX Muted', '🔇');
        }
      });
    }

    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
      });
      navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => navLinks.classList.remove('open'));
      });
    }
  }

  /* ==========================================================================
     TOAST NOTIFICATION ENGINE
     ========================================================================== */
  function showToast(message, icon = '✦') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span style="font-size: 1.2rem; color: var(--cyan-primary);">${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Window export for toast
  window.showToast = showToast;

  /* ==========================================================================
     INITIALIZATION LIFECYCLE
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    init3DTilt();
    initSoundProfiles();
    initCustomizer();
    initHotspots();
    initCartSystem();
    initAiChat();
    initCountdown();
    startCanvasVisualizer();
  });

})();
