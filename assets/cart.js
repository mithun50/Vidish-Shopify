// Cart specific JavaScript

(function() {
  'use strict';

  // Cart Page Quantity Updates
  const initCartPageQuantity = () => {
    const cartItems = document.querySelectorAll('.cart-page__item');
    if (!cartItems.length) return;

    cartItems.forEach(item => {
      const line = parseInt(item.dataset.lineItem);
      const input = item.querySelector('.cart-page__qty-input');
      const decreaseBtn = item.querySelector('[data-qty-decrease]');
      const increaseBtn = item.querySelector('[data-qty-increase]');
      const removeBtn = item.querySelector('[data-remove-item]');

      const updateQuantity = async (quantity) => {
        item.classList.add('is-loading');

        try {
          const response = await fetch('/cart/change.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ line, quantity })
          });

          const cart = await response.json();

          if (quantity === 0) {
            item.remove();
          }

          // Update totals
          document.querySelectorAll('[data-cart-count]').forEach(el => {
            el.textContent = cart.item_count;
          });

          // Update subtotal
          const subtotalEl = document.querySelector('[data-cart-subtotal]');
          if (subtotalEl) {
            subtotalEl.textContent = Shopify.formatMoney ?
              Shopify.formatMoney(cart.total_price) :
              '₹' + (cart.total_price / 100).toFixed(2);
          }

          // Reload if cart is empty
          if (cart.item_count === 0) {
            location.reload();
          }

        } catch (error) {
          console.error('Error updating cart:', error);
        } finally {
          item.classList.remove('is-loading');
        }
      };

      if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
          const newQty = Math.max(0, parseInt(input.value) - 1);
          input.value = newQty;
          updateQuantity(newQty);
        });
      }

      if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
          const newQty = parseInt(input.value) + 1;
          input.value = newQty;
          updateQuantity(newQty);
        });
      }

      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          updateQuantity(0);
        });
      }

      if (input) {
        input.addEventListener('change', () => {
          const newQty = Math.max(0, parseInt(input.value) || 0);
          input.value = newQty;
          updateQuantity(newQty);
        });
      }
    });
  };

  // Initialize
  document.addEventListener('DOMContentLoaded', initCartPageQuantity);

})();
