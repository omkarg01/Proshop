/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 */

import { z } from "zod";
import { searchProducts, findTopRatedLowStock } from "../services/productService";
import { addToCart, removeFromCartTool, clearCartTool } from "../services/cartService";
import { generateReviewSummary, getProsAndCons, askAboutReviews } from "../services/reviewSummaryService";
import { getOrderHistory, getOrderDetails, getOrderStatistics } from "../services/orderService";
import { updateProductDetails, getProductForAdmin, bulkUpdateProducts, updateProductStock } from "../services/adminProductService";
import SmartProductCard, { SmartProductCardPropsSchema } from "../components/SmartProductCard";
import AdminDashboard, { AdminDashboardPropsSchema } from "../components/AdminDashboard";
import OrderHistoryCard, { OrderHistoryCardPropsSchema } from "../components/OrderHistoryCard";
import SalesDashboard, { SalesDashboardPropsSchema } from "../components/SalesDashboard";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 */
export const tools = [
    {
        name: "searchProducts",
        description: "Search for products in catalog using natural language queries with optional filters for price, category, and rating. Returns matching products with full details.",
        tool: searchProducts,
        inputSchema: z.object({
            query: z.string().optional().default('').describe('Natural language search query (e.g., "budget keyboards", "gaming mouse")'),
            priceMin: z.number().optional().describe('Minimum price filter in dollars'),
            priceMax: z.number().optional().describe('Maximum price filter in dollars'),
            category: z.string().optional().describe('Product category filter (e.g., "Electronics")'),
            minRating: z.number().optional().describe('Minimum rating filter (0–5 stars)'),
        }),
        outputSchema: z.object({
            products: z.array(z.object({
                id: z.string(),
                name: z.string(),
                price: z.number(),
                category: z.string(),
                rating: z.number(),
                image: z.string().optional(),
                description: z.string().optional(),
            })).describe('Array of matching products'),
            totalResults: z.number().describe('Total number of products found'),
            message: z.string().describe('Search result message with filters applied'),
        }),
    },
    {
        name: "addToCart",
        description: "Add a product to the shopping cart using Redux store. Validates product existence, stock availability, and updates cart through existing Redux actions.",
        tool: addToCart,
        inputSchema: z.object({
            productId: z.string().describe('Product ID to add to cart'),
            quantity: z.number().optional().default(1).describe('Quantity to add (default: 1)'),
            userId: z.string().optional().describe('Optional user ID for user-specific cart'),
        }),
        outputSchema: z.object({
            success: z.boolean().describe('Whether the operation was successful'),
            cart: z.object({
                cartItems: z.array(z.any()).optional(),
                itemsPrice: z.string().optional(),
                shippingPrice: z.string().optional(),
                taxPrice: z.string().optional(),
                totalPrice: z.string().optional(),
            }).optional().describe('Updated cart object from Redux store'),
            product: z.object({
                _id: z.string(),
                name: z.string(),
                price: z.number(),
                qty: z.number(),
            }).optional().describe('Product that was added to cart'),
            message: z.string().describe('Success or error message'),
            cartItemsCount: z.number().describe('Total number of items in cart'),
            cartTotal: z.string().describe('Formatted total price of cart'),
        }),
    },
    {
        name: "removeFromCart",
        description: "Remove a product from the shopping cart using Redux store.",
        tool: removeFromCartTool,
        inputSchema: z.object({
            productId: z.string().describe('Product ID to remove from cart'),
        }),
        outputSchema: z.object({
            success: z.boolean().describe('Whether the operation was successful'),
            cart: z.object({
                cartItems: z.array(z.any()).optional(),
                itemsPrice: z.string().optional(),
                shippingPrice: z.string().optional(),
                taxPrice: z.string().optional(),
                totalPrice: z.string().optional(),
            }).optional().describe('Updated cart object from Redux store'),
            message: z.string().describe('Success or error message'),
            cartItemsCount: z.number().describe('Total number of items in cart'),
            cartTotal: z.string().describe('Formatted total price of cart'),
        }),
    },
    {
        name: "clearCart",
        description: "Clear all items from the shopping cart using Redux store.",
        tool: clearCartTool,
        inputSchema: z.object({}),
        outputSchema: z.object({
            success: z.boolean().describe('Whether the operation was successful'),
            cart: z.object({
                cartItems: z.array(z.any()).optional(),
                itemsPrice: z.string().optional(),
                shippingPrice: z.string().optional(),
                taxPrice: z.string().optional(),
                totalPrice: z.string().optional(),
            }).optional().describe('Updated cart object from Redux store'),
            message: z.string().describe('Success or error message'),
            cartItemsCount: z.number().describe('Total number of items in cart'),
            cartTotal: z.string().describe('Formatted total price of cart'),
        }),
    },
    {
        name: "generateReviewSummary",
        description: "Generate AI-powered summaries of product reviews including sentiment analysis, pros/cons extraction, and answers to specific questions about what people like or dislike about a product.",
        tool: generateReviewSummary,
        inputSchema: z.object({
            productId: z.string().describe('Product ID to analyze reviews for'),
            question: z.string().optional().describe('Optional specific question to answer about the reviews (e.g., "What do people like about this product?")'),
        }),
        outputSchema: z.object({
            success: z.boolean().describe('Whether the operation was successful'),
            productId: z.string().describe('Product ID that was analyzed'),
            productName: z.string().optional().describe('Name of the product'),
            reviews: z.array(z.object({
                rating: z.number(),
                comment: z.string(),
                userName: z.string(),
                createdAt: z.string()
            })).optional().describe('Structured review data for AI analysis'),
            reviewCount: z.number().optional().describe('Total number of reviews retrieved'),
            averageRating: z.number().optional().describe('Average rating from product'),
            question: z.string().optional().describe('Original question if one was asked'),
            message: z.string().describe('Success or error message'),
            rawData: z.object({
                product: z.object({
                    id: z.string(),
                    name: z.string(),
                    rating: z.number(),
                    numReviews: z.number(),
                    price: z.number().optional(),
                    category: z.string().optional()
                }),
                reviews: z.array(z.any())
            }).optional().describe('Complete product and review data for AI processing'),
        }),
    },
    {
        name: "getProsAndCons",
        description: "Extract quick pros and cons from product reviews. Returns a concise list of what customers like and dislike about a product.",
        tool: getProsAndCons,
        inputSchema: z.object({
            productId: z.string().describe('Product ID to extract pros and cons for'),
        }),
        outputSchema: z.object({
            success: z.boolean().describe('Whether the operation was successful'),
            productId: z.string().describe('Product ID that was analyzed'),
            productName: z.string().optional().describe('Name of the product'),
            reviews: z.array(z.object({
                rating: z.number(),
                comment: z.string(),
                userName: z.string(),
                createdAt: z.string()
            })).optional().describe('Structured review data for AI analysis'),
            reviewCount: z.number().optional().describe('Total number of reviews retrieved'),
            averageRating: z.number().optional().describe('Average rating from product'),
            message: z.string().describe('Success or error message'),
            rawData: z.object({
                product: z.object({
                    id: z.string(),
                    name: z.string(),
                    rating: z.number(),
                    numReviews: z.number(),
                    price: z.number().optional(),
                    category: z.string().optional()
                }),
                reviews: z.array(z.any())
            }).optional().describe('Complete product and review data for AI processing'),
        }),
    },
    {
        name: "askAboutReviews",
        description: "Answer specific questions about product reviews. Useful for queries like 'What do people like about this product?' or 'What are the common complaints?'",
        tool: askAboutReviews,
        inputSchema: z.object({
            productId: z.string().describe('Product ID to analyze reviews for'),
            question: z.string().describe('Specific question to answer about the reviews'),
        }),
        outputSchema: z.object({
            success: z.boolean().describe('Whether the operation was successful'),
            productId: z.string().describe('Product ID that was analyzed'),
            productName: z.string().optional().describe('Name of the product'),
            question: z.string().optional().describe('Original question that was asked'),
            reviews: z.array(z.object({
                rating: z.number(),
                comment: z.string(),
                userName: z.string(),
                createdAt: z.string()
            })).optional().describe('Structured review data for AI analysis'),
            reviewCount: z.number().optional().describe('Total number of reviews retrieved'),
            averageRating: z.number().optional().describe('Average rating from product'),
            message: z.string().describe('Success or error message'),
            rawData: z.object({
                product: z.object({
                    id: z.string(),
                    name: z.string(),
                    rating: z.number(),
                    numReviews: z.number(),
                    price: z.number().optional(),
                    category: z.string().optional()
                }),
                reviews: z.array(z.any())
            }).optional().describe('Complete product and review data for AI processing'),
        }),
    },
    {
        name: "getOrderHistory",
        description: "Get user's order history with optional date filtering. Returns comprehensive order data for analysis including order details, status, spending patterns, and timeline information.",
        tool: getOrderHistory,
        inputSchema: z.object({
            days: z.number().optional().describe('Filter orders from last N days (e.g., 10 for last 10 days)'),
            startDate: z.string().optional().describe('Filter orders from specific start date (YYYY-MM-DD format)'),
            endDate: z.string().optional().describe('Filter orders until specific end date (YYYY-MM-DD format)'),
            status: z.string().optional().describe('Filter by order status: "delivered", "paid", or "pending"'),
        }),
        outputSchema: z.object({
            success: z.boolean().describe('Whether the operation was successful'),
            orders: z.array(z.object({
                id: z.string(),
                createdAt: z.string(),
                totalPrice: z.number(),
                status: z.string(),
                isPaid: z.boolean(),
                isDelivered: z.boolean(),
                paidAt: z.string().optional(),
                deliveredAt: z.string().optional(),
                paymentMethod: z.string(),
                itemsCount: z.number(),
                items: z.array(z.object({
                    name: z.string(),
                    quantity: z.number(),
                    price: z.number(),
                    total: z.number()
                })),
                shippingAddress: z.object({
                    address: z.string(),
                    city: z.string(),
                    postalCode: z.string(),
                    country: z.string()
                }).optional()
            })).optional().describe('Structured order data for AI analysis'),
            totalOrders: z.number().optional().describe('Total number of orders found'),
            totalSpent: z.number().optional().describe('Total amount spent across all orders'),
            deliveredOrders: z.number().optional().describe('Number of delivered orders'),
            paidOrders: z.number().optional().describe('Number of paid orders'),
            pendingOrders: z.number().optional().describe('Number of pending orders'),
            averageOrderValue: z.number().optional().describe('Average order value'),
            filters: z.object({
                days: z.number().optional(),
                startDate: z.string().optional(),
                endDate: z.string().optional(),
                status: z.string().optional()
            }).optional().describe('Applied filters'),
            message: z.string().describe('Success or error message'),
            rawData: z.object({
                orders: z.array(z.any()),
                summary: z.object({
                    totalOrders: z.number(),
                    totalSpent: z.number(),
                    deliveredOrders: z.number(),
                    paidOrders: z.number(),
                    pendingOrders: z.number(),
                    averageOrderValue: z.number()
                })
            }).optional().describe('Complete order data for AI processing'),
        }),
    },
    {
        name: "getOrderDetails",
        description: "Get detailed information about a specific order by order ID. Returns complete order details including items, shipping, payment, and delivery status.",
        tool: getOrderDetails,
        inputSchema: z.object({
            orderId: z.string().describe('Order ID to retrieve details for'),
        }),
        outputSchema: z.object({
            success: z.boolean().describe('Whether the operation was successful'),
            order: z.object({
                id: z.string(),
                createdAt: z.string(),
                updatedAt: z.string(),
                totalPrice: z.number(),
                itemsPrice: z.number(),
                taxPrice: z.number(),
                shippingPrice: z.number(),
                status: z.string(),
                isPaid: z.boolean(),
                isDelivered: z.boolean(),
                paidAt: z.string().optional(),
                deliveredAt: z.string().optional(),
                paymentMethod: z.string(),
                paymentResult: z.any().optional(),
                itemsCount: z.number(),
                items: z.array(z.object({
                    id: z.string(),
                    name: z.string(),
                    quantity: z.number(),
                    price: z.number(),
                    total: z.number(),
                    product: z.string()
                })),
                shippingAddress: z.object({
                    address: z.string(),
                    city: z.string(),
                    postalCode: z.string(),
                    country: z.string()
                }).optional(),
                user: z.object({
                    name: z.string(),
                    email: z.string()
                }).optional(),
                report: z.any().optional()
            }).optional().describe('Detailed order information'),
            message: z.string().describe('Success or error message'),
            rawData: z.any().optional().describe('Complete order data for AI processing'),
        }),
    },
    {
        name: "getOrderStatistics",
        description: "Get analytical statistics and insights about user's ordering patterns. Returns spending trends, top products, delivery rates, and monthly breakdowns.",
        tool: getOrderStatistics,
        inputSchema: z.object({
            period: z.string().optional().default('all').describe('Time period for statistics: "all", "30days", "90days", or "year"'),
        }),
        outputSchema: z.object({
            success: z.boolean().describe('Whether the operation was successful'),
            period: z.string().optional().describe('Time period analyzed'),
            statistics: z.object({
                totalOrders: z.number(),
                totalSpent: z.number(),
                averageOrderValue: z.number(),
                deliveredOrders: z.number(),
                paidOrders: z.number(),
                pendingOrders: z.number(),
                deliveryRate: z.number()
            }).optional().describe('Order statistics summary'),
            topProducts: z.array(z.object({
                name: z.string(),
                quantity: z.number()
            })).optional().describe('Most ordered products'),
            monthlySpending: z.array(z.object({
                month: z.string(),
                spent: z.number(),
                orders: z.number()
            })).optional().describe('Monthly spending breakdown'),
            message: z.string().describe('Success or error message'),
            rawData: z.object({
                orders: z.array(z.any()),
                statistics: z.object({
                    totalOrders: z.number(),
                    totalSpent: z.number(),
                    averageOrderValue: z.number(),
                    deliveredOrders: z.number(),
                    paidOrders: z.number(),
                    pendingOrders: z.number(),
                    deliveryRate: z.number()
                }),
                topProducts: z.array(z.any()),
                monthlySpending: z.array(z.any())
            }).optional().describe('Complete statistics data for AI processing'),
        }),
    },
    {
        name: "updateProductDetails",
        description: "Update product details as an administrator. Allows updating product information like name, price, description, brand, category, and stock levels. Provides change tracking and validation.",
        tool: updateProductDetails,
        inputSchema: z.object({
            productId: z.string().describe('Product ID to update'),
            updates: z.object({
                name: z.string().optional().describe('Product name'),
                price: z.number().optional().describe('Product price'),
                description: z.string().optional().describe('Product description'),
                image: z.string().optional().describe('Product image URL'),
                brand: z.string().optional().describe('Product brand'),
                category: z.string().optional().describe('Product category'),
                countInStock: z.number().optional().describe('Number of items in stock'),
            }).describe('Fields to update with new values'),
        }),
        outputSchema: z.object({
            success: z.boolean().describe('Whether the operation was successful'),
            productId: z.string().describe('Product ID that was updated'),
            productName: z.string().optional().describe('Name of the product'),
            updatedProduct: z.any().optional().describe('Updated product object'),
            previousProduct: z.any().optional().describe('Previous product object before update'),
            changes: z.array(z.object({
                field: z.string(),
                oldValue: z.any(),
                newValue: z.any(),
                changed: z.boolean()
            })).optional().describe('List of changes made'),
            fieldsUpdated: z.array(z.string()).optional().describe('Names of fields that were updated'),
            message: z.string().describe('Success or error message'),
            rawData: z.object({
                productId: z.string(),
                updates: z.any(),
                previousProduct: z.any(),
                updatedProduct: z.any(),
                changes: z.array(z.any())
            }).optional().describe('Complete update data for AI processing'),
        }),
    },
    {
        name: "getProductForAdmin",
        description: "Get comprehensive product details for admin review. Returns complete product information including reviews, sales data, and inventory status for administrative analysis.",
        tool: getProductForAdmin,
        inputSchema: z.object({
            productId: z.string().describe('Product ID to retrieve admin details for'),
        }),
        outputSchema: z.object({
            success: z.boolean().describe('Whether the operation was successful'),
            product: z.object({
                id: z.string(),
                name: z.string(),
                price: z.number(),
                description: z.string(),
                image: z.string(),
                brand: z.string(),
                category: z.string(),
                countInStock: z.number(),
                rating: z.number(),
                numReviews: z.number(),
                createdAt: z.string(),
                updatedAt: z.string(),
                reviews: z.array(z.object({
                    rating: z.number(),
                    comment: z.string(),
                    userName: z.string(),
                    createdAt: z.string()
                })),
                salesData: z.object({
                    averageRating: z.number(),
                    totalReviews: z.number(),
                    stockStatus: z.string(),
                    stockLevel: z.number()
                })
            }).optional().describe('Comprehensive product data for admin'),
            message: z.string().describe('Success or error message'),
            rawData: z.any().optional().describe('Complete product data for AI processing'),
        }),
    },
    {
        name: "bulkUpdateProducts",
        description: "Update multiple products with the same changes. Allows bulk operations like updating prices or categories across multiple products at once.",
        tool: bulkUpdateProducts,
        inputSchema: z.object({
            productIds: z.array(z.string()).describe('Array of product IDs to update'),
            updates: z.object({
                name: z.string().optional().describe('Product name'),
                price: z.number().optional().describe('Product price'),
                description: z.string().optional().describe('Product description'),
                image: z.string().optional().describe('Product image URL'),
                brand: z.string().optional().describe('Product brand'),
                category: z.string().optional().describe('Product category'),
                countInStock: z.number().optional().describe('Number of items in stock'),
            }).describe('Fields to update with new values (applied to all products)'),
        }),
        outputSchema: z.object({
            success: z.boolean().describe('Whether the operation was successful'),
            productIds: z.array(z.string()).optional().describe('Product IDs that were processed'),
            updates: z.any().optional().describe('Updates that were applied'),
            results: z.array(z.object({
                productId: z.string(),
                success: z.boolean(),
                productName: z.string().optional(),
                message: z.string()
            })).optional().describe('Individual results for each product'),
            successCount: z.number().optional().describe('Number of successful updates'),
            failureCount: z.number().optional().describe('Number of failed updates'),
            totalProcessed: z.number().optional().describe('Total number of products processed'),
            fieldsUpdated: z.array(z.string()).optional().describe('Names of fields that were updated'),
            message: z.string().describe('Success or error message'),
            rawData: z.object({
                productIds: z.array(z.string()),
                updates: z.any(),
                results: z.array(z.any()),
                summary: z.object({
                    successCount: z.number(),
                    failureCount: z.number(),
                    totalProcessed: z.number()
                })
            }).optional().describe('Complete bulk update data for AI processing'),
        }),
    },
    {
        name: "updateProductStock",
        description: "Specialized function for updating product inventory levels. Supports adding, subtracting, or setting exact stock quantities with change tracking.",
        tool: updateProductStock,
        inputSchema: z.object({
            productId: z.string().describe('Product ID to update stock for'),
            newStockLevel: z.number().describe('New stock level or amount to add/subtract'),
            operation: z.enum(['add', 'subtract', 'set']).optional().default('set').describe('Operation type: "add" to increase, "subtract" to decrease, "set" to exact value'),
        }),
        outputSchema: z.object({
            success: z.boolean().describe('Whether the operation was successful'),
            productId: z.string().describe('Product ID that was updated'),
            productName: z.string().optional().describe('Name of the product'),
            oldStockLevel: z.number().optional().describe('Previous stock level'),
            newStockLevel: z.number().optional().describe('New stock level after update'),
            operation: z.string().optional().describe('Operation that was performed'),
            stockChange: z.number().optional().describe('Net change in stock level'),
            updatedProduct: z.any().optional().describe('Updated product object'),
            message: z.string().describe('Success or error message'),
            rawData: z.object({
                productId: z.string(),
                oldStockLevel: z.number(),
                newStockLevel: z.number(),
                operation: z.string(),
                updatedProduct: z.any()
            }).optional().describe('Complete stock update data for AI processing'),
        }),
    },
    {
        name: "findTopRatedLowStock",
        description: "Find top-rated products with low stock levels. Uses existing product search to identify highly-rated items that need restocking. Perfect for inventory management and reordering decisions.",
        tool: findTopRatedLowStock,
        inputSchema: z.object({
            minRating: z.number().optional().default(4.0).describe('Minimum rating threshold (e.g., 4.0 for 4+ stars)'),
            maxStockLevel: z.number().optional().default(10).describe('Maximum stock level to consider "low stock" (e.g., 10 for ≤10 units)'),
            category: z.string().optional().describe('Optional category filter (e.g., "Electronics", "Clothing")'),
        }),
        outputSchema: z.object({
            success: z.boolean().describe('Whether the operation was successful'),
            products: z.array(z.object({
                id: z.string(),
                name: z.string(),
                price: z.number(),
                category: z.string(),
                rating: z.number(),
                image: z.string().optional(),
                description: z.string().optional(),
                countInStock: z.number(),
                numReviews: z.number()
            })).optional().describe('Top-rated products with low stock levels'),
            totalResults: z.number().optional().describe('Total number of products found'),
            criteria: z.object({
                minRating: z.number(),
                maxStockLevel: z.number(),
                category: z.string().optional()
            }).optional().describe('Search criteria used'),
            message: z.string().describe('Success or error message'),
            rawData: z.object({
                criteria: z.object({
                    minRating: z.number(),
                    maxStockLevel: z.number(),
                    category: z.string().optional()
                }),
                products: z.array(z.any()),
                allSearchResults: z.array(z.any())
            }).optional().describe('Complete search data for AI processing'),
        }),
    },
];



/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 */
export const components = [
    {
        name: "SmartProductCard",
        description: "A card component for displaying a SINGLE product with AI insights. Use this when you need to show details for specific individual products. Features review summaries, stock alerts, and cart actions.",
        component: SmartProductCard,
        propsSchema: SmartProductCardPropsSchema,
    },
    {
        name: "AdminDashboard",
        description: "A comprehensive dashboard for INVENTORY MANAGEMENT. Use this for ANY queries about 'restocking', 'low stock', 'inventory levels', or 'product stock status'. Displays a full table of products with stock alerts.",
        component: AdminDashboard,
        propsSchema: AdminDashboardPropsSchema,
    },
    {
        name: "OrderHistoryCard",
        description: "A list of the user's recent orders. Use this when the user asks 'Where is my order?', 'Show my past purchases', or 'What did I buy recently?'. Shows status and tracking info.",
        component: OrderHistoryCard,
        propsSchema: OrderHistoryCardPropsSchema,
    },
    {
        name: "SalesDashboard",
        description: "An analytics dashboard for SALES and REVENUE. Use this for queries about 'sales stats', 'how much money we made', 'top selling products', or 'revenue trends'.",
        component: SalesDashboard,
        propsSchema: SalesDashboardPropsSchema,
    },
];
