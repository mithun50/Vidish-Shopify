// Vidish Theme - Global JavaScript

(function() {
  'use strict';

  // Utility Functions
  const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  const formatMoney = (cents) => {
    const format = window.theme?.moneyFormat || '₹{{amount}}';
    const value = (cents / 100).toFixed(2);
    return format.replace('{{amount}}', value).replace('{{amount_no_decimals}}', Math.round(cents / 100));
  };

  // Cart Functions
  const Cart = {
    async add(variantId, quantity = 1) {
      try {
        const response = await fetch(window.theme.routes.cartAdd, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            items: [{ id: variantId, quantity }]
          })
        });

        const data = await response.json();

        if (response.ok) {
          this.updateCartUI();
          this.openDrawer();
          return data;
        } else {
          throw new Error(data.description || 'Error adding to cart');
        }
      } catch (error) {
        console.error('Cart add error:', error);
        throw error;
      }
    },

    async update(line, quantity) {
      try {
        const response = await fetch(window.theme.routes.cartChange, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ line, quantity })
        });

        const data = await response.json();

        if (response.ok) {
          this.updateCartUI(data);
          return data;
        } else {
          throw new Error(data.description || 'Error updating cart');
        }
      } catch (error) {
        console.error('Cart update error:', error);
        throw error;
      }
    },

    async getCart() {
      const response = await fetch('/cart.js');
      return response.json();
    },

    updateCartUI(cartData) {
      if (cartData) {
        document.querySelectorAll('[data-cart-count]').forEach(el => {
          el.textContent = cartData.item_count;
          el.classList.add('cart-pop');
          setTimeout(() => el.classList.remove('cart-pop'), 300);
        });

        document.querySelectorAll('[data-cart-subtotal]').forEach(el => {
          el.textContent = formatMoney(cartData.total_price);
        });
      } else {
        this.getCart().then(data => this.updateCartUI(data));
      }
    },

    openDrawer() {
      const drawer = document.querySelector('[data-cart-drawer]');
      if (drawer) {
        drawer.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    },

    closeDrawer() {
      const drawer = document.querySelector('[data-cart-drawer]');
      if (drawer) {
        drawer.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  };

  // Quick Add Functionality
  const initQuickAdd = () => {
    document.addEventListener('click', async (e) => {
      const quickAddBtn = e.target.closest('[data-product-id]');
      if (!quickAddBtn || !quickAddBtn.hasAttribute('data-variant-id')) return;

      e.preventDefault();

      const variantId = quickAddBtn.dataset.variantId;
      const originalText = quickAddBtn.innerHTML;

      quickAddBtn.disabled = true;
      quickAddBtn.innerHTML = '<span class="loading-spinner"></span>';

      try {
        await Cart.add(variantId);
        quickAddBtn.innerHTML = '✓ Added';
        setTimeout(() => {
          quickAddBtn.innerHTML = originalText;
          quickAddBtn.disabled = false;
        }, 1500);
      } catch (error) {
        quickAddBtn.innerHTML = 'Error';
        setTimeout(() => {
          quickAddBtn.innerHTML = originalText;
          quickAddBtn.disabled = false;
        }, 1500);
      }
    });
  };

  // Cart Drawer
  const initCartDrawer = () => {
    // Toggle cart drawer
    document.querySelectorAll('[data-cart-toggle]').forEach(btn => {
      btn.addEventListener('click', () => Cart.openDrawer());
    });

    // Close cart drawer
    document.querySelectorAll('[data-cart-close]').forEach(btn => {
      btn.addEventListener('click', () => Cart.closeDrawer());
    });

    // Quantity controls in cart
    document.addEventListener('click', async (e) => {
      const cartItem = e.target.closest('[data-cart-item]');
      if (!cartItem) return;

      const line = parseInt(cartItem.dataset.lineItem);
      const input = cartItem.querySelector('[data-qty-input]');
      let quantity = parseInt(input?.value || 1);

      if (e.target.closest('[data-qty-decrease]')) {
        quantity = Math.max(0, quantity - 1);
      } else if (e.target.closest('[data-qty-increase]')) {
        quantity++;
      } else if (e.target.closest('[data-remove-item]')) {
        quantity = 0;
      } else {
        return;
      }

      if (input) input.value = quantity;

      try {
        const cartData = await Cart.update(line, quantity);
        if (quantity === 0) {
          cartItem.remove();
        }
        // Reload if cart becomes empty
        if (cartData.item_count === 0) {
          location.reload();
        }
      } catch (error) {
        if (input) input.value = quantity + (e.target.closest('[data-qty-decrease]') ? 1 : -1);
      }
    });

    // Checkout button
    document.querySelector('[data-checkout-btn]')?.addEventListener('click', () => {
      window.location.href = '/checkout';
    });
  };

  // Product Quantity
  const initQuantitySelectors = () => {
    document.addEventListener('click', (e) => {
      const wrapper = e.target.closest('.product__quantity-selector, .cart-page__item-quantity');
      if (!wrapper) return;

      const input = wrapper.querySelector('[data-qty-input]');
      if (!input) return;

      let value = parseInt(input.value) || 1;

      if (e.target.closest('[data-qty-decrease]')) {
        value = Math.max(1, value - 1);
      } else if (e.target.closest('[data-qty-increase]')) {
        value++;
      }

      input.value = value;
    });
  };

  // Product Media Gallery
  const initProductGallery = () => {
    const thumbnails = document.querySelectorAll('[data-media-thumbnail]');
    const mainMedia = document.querySelector('[data-product-media-main]');

    if (!thumbnails.length || !mainMedia) return;

    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', () => {
        // Update active state
        thumbnails.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');

        // Update main image
        const img = thumb.querySelector('img');
        if (img) {
          const mainImg = mainMedia.querySelector('img');
          if (mainImg) {
            mainImg.src = img.src.replace(/width=\d+/, 'width=800');
            mainImg.srcset = '';
          }
        }
      });
    });
  };

  // Scroll Reveal
  const initScrollReveal = () => {
    if (!window.IntersectionObserver) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  };

  // Cart Note
  const initCartNote = () => {
    const noteInput = document.querySelector('[data-cart-note]');
    if (!noteInput) return;

    const updateNote = debounce(async (note) => {
      await fetch('/cart/update.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      });
    }, 500);

    noteInput.addEventListener('input', (e) => updateNote(e.target.value));
  };

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    initQuickAdd();
    initCartDrawer();
    initQuantitySelectors();
    initProductGallery();
    initScrollReveal();
    initCartNote();
  });

  // Expose Cart to window for external use
  window.VidishCart = Cart;

})();
