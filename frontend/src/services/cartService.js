import store from '../store';
import { addToCart as reduxAddToCart, removeFromCart, clearCartItems } from '../slices/cartSlice';

/**
 * Add a product to the shopping cart using Redux store.
 * Leverages existing Redux cart actions for consistency.
 */
export const addToCart = async ({ productId, quantity = 1, userId }) => {
    try {
        // Validate required parameters
        if (!productId) {
            throw new Error('Product ID is required');
        }

        if (quantity < 1 || !Number.isInteger(quantity)) {
            throw new Error('Quantity must be a positive integer');
        }

        // Fetch product details to validate it exists
        const productResponse = await fetch(`/api/products/${productId}`);
        
        if (!productResponse.ok) {
            throw new Error(`Product not found with status ${productResponse.status}`);
        }

        const product = await productResponse.json();

        // Check if product is in stock
        if (product.countInStock < quantity) {
            throw new Error(`Insufficient stock. Only ${product.countInStock} items available`);
        }

        // Get current cart state before adding
        const currentState = store.getState();
        const currentCart = currentState.cart;
        const existItem = currentCart.cartItems.find((x) => x._id === product._id);

        // Create cart item payload for Redux action
        const cartItem = {
            ...product,
            _id: product._id || product.id,
            qty: existItem ? existItem.qty + quantity : quantity,
            userId: userId || null
        };

        // Dispatch Redux action to add to cart
        store.dispatch(reduxAddToCart(cartItem));

        // Get updated cart state
        const updatedState = store.getState();
        const updatedCart = updatedState.cart;

        // Build success message
        const action = existItem ? 'updated' : 'added';
        const message = `Successfully ${action} "${product.name}" to cart. Quantity: ${cartItem.qty}. Total items in cart: ${updatedCart.cartItems.length}`;

        return {
            success: true,
            cart: updatedCart,
            product: cartItem,
            message,
            cartItemsCount: updatedCart.cartItems.length,
            cartTotal: updatedCart.totalPrice,
        };

    } catch (error) {
        console.error('Error in addToCart tool:', error);
        return {
            success: false,
            cart: null,
            product: null,
            message: `Error adding to cart: ${error.message}`,
            cartItemsCount: 0,
            cartTotal: '0.00',
        };
    }
};

/**
 * Remove a product from the shopping cart using Redux store.
 */
export const removeFromCartTool = async ({ productId }) => {
    try {
        if (!productId) {
            throw new Error('Product ID is required');
        }

        // Get current cart to find item being removed
        const currentState = store.getState();
        const itemToRemove = currentState.cart.cartItems.find((x) => x._id === productId);
        
        if (!itemToRemove) {
            throw new Error('Item not found in cart');
        }

        // Dispatch Redux action to remove from cart
        store.dispatch(removeFromCart(productId));

        // Get updated cart state
        const updatedState = store.getState();
        const updatedCart = updatedState.cart;

        return {
            success: true,
            cart: updatedCart,
            message: `Successfully removed "${itemToRemove.name}" from cart`,
            cartItemsCount: updatedCart.cartItems.length,
            cartTotal: updatedCart.totalPrice,
        };

    } catch (error) {
        console.error('Error in removeFromCart tool:', error);
        return {
            success: false,
            cart: null,
            message: `Error removing from cart: ${error.message}`,
            cartItemsCount: 0,
            cartTotal: '0.00',
        };
    }
};

/**
 * Clear all items from the shopping cart using Redux store.
 */
export const clearCartTool = async () => {
    try {
        // Get current cart state before clearing
        const currentState = store.getState();
        const itemsCount = currentState.cart.cartItems.length;

        if (itemsCount === 0) {
            return {
                success: true,
                cart: currentState.cart,
                message: 'Cart is already empty',
                cartItemsCount: 0,
                cartTotal: '0.00',
            };
        }

        // Dispatch Redux action to clear cart
        store.dispatch(clearCartItems());

        // Get updated cart state
        const updatedState = store.getState();
        const updatedCart = updatedState.cart;

        return {
            success: true,
            cart: updatedCart,
            message: `Successfully cleared ${itemsCount} item${itemsCount !== 1 ? 's' : ''} from cart`,
            cartItemsCount: 0,
            cartTotal: '0.00',
        };

    } catch (error) {
        console.error('Error in clearCart tool:', error);
        return {
            success: false,
            cart: null,
            message: `Error clearing cart: ${error.message}`,
            cartItemsCount: 0,
            cartTotal: '0.00',
        };
    }
};
