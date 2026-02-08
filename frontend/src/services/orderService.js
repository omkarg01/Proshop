/**
 * Get user orders for AI analysis by Tambo LLM
 * Returns structured order data that Tambo can analyze to answer questions about past orders
 */

/**
 * Get user's order history with optional date filtering
 * Returns comprehensive order data for AI analysis
 */
export const getOrderHistory = async ({ days, startDate, endDate, status }) => {
    try {
        // Fetch user's orders
        const response = await fetch('/api/orders/mine');

        if (!response.ok) {
            throw new Error(`Failed to fetch orders with status ${response.status}`);
        }

        const orders = await response.json();

        // Apply date filtering if specified
        let filteredOrders = orders;

        if (days || startDate || endDate) {
            const now = new Date();
            const filterDate = days ? new Date(now.getTime() - (days * 24 * 60 * 60 * 1000)) : null;
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            filteredOrders = orders.filter(order => {
                const orderDate = new Date(order.createdAt);

                if (filterDate && orderDate < filterDate) return false;
                if (start && orderDate < start) return false;
                if (end && orderDate > end) return false;

                return true;
            });
        }

        // Apply status filtering if specified
        if (status) {
            filteredOrders = filteredOrders.filter(order => {
                const orderStatus = order.isDelivered ? 'delivered' :
                    order.isPaid ? 'paid' : 'pending';
                return orderStatus.toLowerCase() === status.toLowerCase();
            });
        }

        // Calculate summary statistics
        const totalOrders = filteredOrders.length;
        const totalSpent = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        const deliveredOrders = filteredOrders.filter(order => order.isDelivered).length;
        const paidOrders = filteredOrders.filter(order => order.isPaid).length;
        const pendingOrders = totalOrders - paidOrders;

        // Structure order data for AI analysis
        const structuredOrders = filteredOrders.map(order => ({
            id: order._id,
            createdAt: order.createdAt,
            totalPrice: order.totalPrice,
            status: order.isDelivered ? 'delivered' :
                order.isPaid ? 'paid' : 'pending',
            isPaid: order.isPaid,
            isDelivered: order.isDelivered,
            paidAt: order.paidAt,
            deliveredAt: order.deliveredAt,
            paymentMethod: order.paymentMethod,
            itemsCount: order.orderItems ? order.orderItems.length : 0,
            items: order.orderItems ? order.orderItems.map(item => ({
                name: item.name,
                quantity: item.qty,
                price: item.price,
                total: item.qty * item.price
            })) : [],
            shippingAddress: order.shippingAddress ? {
                address: order.shippingAddress.address,
                city: order.shippingAddress.city,
                postalCode: order.shippingAddress.postalCode,
                country: order.shippingAddress.country
            } : null
        }));

        // Build descriptive message
        let message = `Found ${totalOrders} order${totalOrders !== 1 ? 's' : ''}`;

        if (days) {
            message += ` from the last ${days} day${days !== 1 ? 's' : ''}`;
        } else if (startDate || endDate) {
            const startStr = startDate ? new Date(startDate).toLocaleDateString() : 'beginning';
            const endStr = endDate ? new Date(endDate).toLocaleDateString() : 'now';
            message += ` from ${startStr} to ${endStr}`;
        }

        if (status) {
            message += ` with status "${status}"`;
        }

        message += `. Total spent: $${totalSpent.toFixed(2)}. Delivered: ${deliveredOrders}, Pending: ${pendingOrders}`;

        return {
            success: true,
            orders: structuredOrders,
            totalOrders,
            totalSpent,
            deliveredOrders,
            paidOrders,
            pendingOrders,
            averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
            filters: {
                days,
                startDate,
                endDate,
                status
            },
            message,
            rawData: {
                orders: structuredOrders,
                summary: {
                    totalOrders,
                    totalSpent,
                    deliveredOrders,
                    paidOrders,
                    pendingOrders,
                    averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0
                }
            }
        };

    } catch (error) {
        console.error('Error in getOrderHistory tool:', error);
        return {
            success: false,
            orders: [],
            totalOrders: 0,
            totalSpent: 0,
            deliveredOrders: 0,
            paidOrders: 0,
            pendingOrders: 0,
            averageOrderValue: 0,
            filters: { days, startDate, endDate, status },
            message: `Error retrieving order history: ${error.message}`,
            rawData: null
        };
    }
};

/**
 * Get specific order details by order ID
 * Returns detailed information about a single order
 */
export const getOrderDetails = async ({ orderId }) => {
    try {
        if (!orderId) {
            throw new Error('Order ID is required');
        }

        // Fetch specific order details
        const response = await fetch(`/api/orders/${orderId}`);

        if (!response.ok) {
            throw new Error(`Order not found with status ${response.status}`);
        }

        const order = await response.json();

        // Structure order data for AI analysis
        const structuredOrder = {
            id: order._id,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            totalPrice: order.totalPrice,
            itemsPrice: order.itemsPrice,
            taxPrice: order.taxPrice,
            shippingPrice: order.shippingPrice,
            status: order.isDelivered ? 'delivered' :
                order.isPaid ? 'paid' : 'pending',
            isPaid: order.isPaid,
            isDelivered: order.isDelivered,
            paidAt: order.paidAt,
            deliveredAt: order.deliveredAt,
            paymentMethod: order.paymentMethod,
            paymentResult: order.paymentResult,
            itemsCount: order.orderItems ? order.orderItems.length : 0,
            items: order.orderItems ? order.orderItems.map(item => ({
                id: item._id,
                name: item.name,
                quantity: item.qty,
                price: item.price,
                total: item.qty * item.price,
                product: item.product
            })) : [],
            shippingAddress: order.shippingAddress ? {
                address: order.shippingAddress.address,
                city: order.shippingAddress.city,
                postalCode: order.shippingAddress.postalCode,
                country: order.shippingAddress.country
            } : null,
            user: order.user ? {
                name: order.user.name,
                email: order.user.email
            } : null,
            report: order.report
        };

        return {
            success: true,
            order: structuredOrder,
            message: `Retrieved details for order ${orderId} - Status: ${structuredOrder.status}, Total: $${structuredOrder.totalPrice.toFixed(2)}`,
            rawData: structuredOrder
        };

    } catch (error) {
        console.error('Error in getOrderDetails tool:', error);
        return {
            success: false,
            order: null,
            message: `Error retrieving order details: ${error.message}`,
            rawData: null
        };
    }
};

/**
 * Get order statistics and insights
 * Returns analytical data about user's ordering patterns
 */
export const getOrderStatistics = async ({ period = 'all' }) => {
    try {
        // Fetch all orders (Admin route) to get global sales stats
        const response = await fetch('/api/orders');

        if (!response.ok) {
            throw new Error(`Failed to fetch orders with status ${response.status}`);
        }

        const orders = await response.json();

        // Filter by period if specified
        let filteredOrders = orders;
        const now = new Date();

        if (period === '30days') {
            const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            filteredOrders = orders.filter(order => new Date(order.createdAt) >= thirtyDaysAgo);
        } else if (period === '90days') {
            const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
            filteredOrders = orders.filter(order => new Date(order.createdAt) >= ninetyDaysAgo);
        } else if (period === 'year') {
            const oneYearAgo = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
            filteredOrders = orders.filter(order => new Date(order.createdAt) >= oneYearAgo);
        }

        // Calculate statistics
        const totalOrders = filteredOrders.length;
        const totalSpent = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
        const deliveredOrders = filteredOrders.filter(order => order.isDelivered).length;
        const paidOrders = filteredOrders.filter(order => order.isPaid).length;

        // Find most ordered products
        const productCounts = {};
        filteredOrders.forEach(order => {
            if (order.orderItems) {
                order.orderItems.forEach(item => {
                    const productName = item.name;
                    productCounts[productName] = (productCounts[productName] || 0) + item.qty;
                });
            }
        });

        const topProducts = Object.entries(productCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, quantity]) => ({ name, quantity }));

        // Calculate spending by month (last 6 months)
        const monthlySpending = [];
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

            const monthOrders = filteredOrders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= monthDate && orderDate < nextMonthDate;
            });

            const monthSpent = monthOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

            monthlySpending.push({
                month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                spent: monthSpent,
                orders: monthOrders.length
            });
        }

        const periodText = period === 'all' ? 'all time' :
            period === '30days' ? 'last 30 days' :
                period === '90days' ? 'last 90 days' : 'last year';

        return {
            success: true,
            period,
            statistics: {
                totalOrders,
                totalSpent,
                averageOrderValue,
                deliveredOrders,
                paidOrders,
                pendingOrders: totalOrders - paidOrders,
                deliveryRate: totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0
            },
            topProducts,
            monthlySpending,
            message: `Order statistics for ${periodText}: ${totalOrders} orders, $${totalSpent.toFixed(2)} total spent`,
            rawData: {
                orders: filteredOrders,
                statistics: {
                    totalOrders,
                    totalSpent,
                    averageOrderValue,
                    deliveredOrders,
                    paidOrders,
                    pendingOrders: totalOrders - paidOrders,
                    deliveryRate: totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0
                },
                topProducts,
                monthlySpending
            }
        };

    } catch (error) {
        console.error('Error in getOrderStatistics tool:', error);
        return {
            success: false,
            period,
            statistics: null,
            topProducts: [],
            monthlySpending: [],
            message: `Error retrieving order statistics: ${error.message}`,
            rawData: null
        };
    }
};
