/**
 * Context helpers provide additional information to Tambo AI on every message.
 * These functions are called automatically before each user message is sent.
 */

/**
 * Get the current page/route information
 */
export const getCurrentPage = () => {
    const path = window.location.pathname;
    const search = window.location.search;

    let pageType = 'home';
    let context = {};

    if (path === '/') {
        pageType = 'home';
        context.description = 'User is on the home page viewing product listings';
    } else if (path.startsWith('/product/')) {
        pageType = 'product-detail';
        const productId = path.split('/product/')[1];
        context.productId = productId;
        context.description = `User is viewing product details for product ID: ${productId}`;
    } else if (path === '/cart') {
        pageType = 'cart';
        context.description = 'User is viewing their shopping cart';
    } else if (path === '/login') {
        pageType = 'login';
        context.description = 'User is on the login page';
    } else if (path === '/register') {
        pageType = 'register';
        context.description = 'User is on the registration page';
    } else if (path === '/shipping') {
        pageType = 'shipping';
        context.description = 'User is entering shipping information';
    } else if (path === '/payment') {
        pageType = 'payment';
        context.description = 'User is selecting payment method';
    } else if (path === '/placeorder') {
        pageType = 'place-order';
        context.description = 'User is reviewing their order before placing it';
    } else if (path.startsWith('/order/')) {
        pageType = 'order-detail';
        const orderId = path.split('/order/')[1];
        context.orderId = orderId;
        context.description = `User is viewing order details for order ID: ${orderId}`;
    }

    // Parse search params
    const params = new URLSearchParams(search);
    if (params.has('keyword')) {
        context.searchKeyword = params.get('keyword');
    }
    if (params.has('pageNumber')) {
        context.pageNumber = params.get('pageNumber');
    }

    return {
        pageType,
        path,
        ...context,
    };
};

/**
 * Get the current cart state from localStorage
 */
export const getCartState = () => {
    try {
        const cartData = localStorage.getItem('cart');
        if (!cartData) {
            return {
                isEmpty: true,
                itemCount: 0,
                items: [],
                subtotal: 0,
                message: 'Cart is empty',
            };
        }

        const cart = JSON.parse(cartData);
        const items = cart.cartItems || [];

        const itemCount = items.reduce((acc, item) => acc + item.qty, 0);
        const subtotal = items.reduce((acc, item) => acc + item.qty * item.price, 0);

        return {
            isEmpty: items.length === 0,
            itemCount,
            items: items.map(item => ({
                id: item._id,
                name: item.name,
                quantity: item.qty,
                price: item.price,
                image: item.image,
                total: item.qty * item.price,
            })),
            subtotal: subtotal.toFixed(2),
            shippingAddress: cart.shippingAddress,
            paymentMethod: cart.paymentMethod,
            message: `Cart contains ${itemCount} item${itemCount !== 1 ? 's' : ''} with subtotal $${subtotal.toFixed(2)}`,
        };
    } catch (error) {
        console.error('Error reading cart state:', error);
        return {
            isEmpty: true,
            itemCount: 0,
            items: [],
            subtotal: 0,
            message: 'Error reading cart',
        };
    }
};

/**
 * Get user authentication state
 */
export const getUserInfo = () => {
    try {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            return {
                isLoggedIn: false,
                message: 'User is not logged in',
            };
        }

        const user = JSON.parse(userInfo);
        return {
            isLoggedIn: true,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin || false,
            message: `User is logged in as ${user.name}`,
        };
    } catch (error) {
        console.error('Error reading user info:', error);
        return {
            isLoggedIn: false,
            message: 'Error reading user info',
        };
    }
};

/**
 * Export all context helpers as an object for TamboProvider
 */
export const contextHelpers = {
    currentPage: getCurrentPage,
    cartState: getCartState,
    userInfo: getUserInfo,
};
