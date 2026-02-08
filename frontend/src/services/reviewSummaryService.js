import store from '../store';

/**
 * Get product reviews data for AI analysis by Tambo LLM
 * Returns structured review data that Tambo can analyze directly
 */
export const generateReviewSummary = async ({ productId, question }) => {
    try {
        // Validate required parameters
        if (!productId) {
            throw new Error('Product ID is required');
        }

        // Fetch product details to get reviews
        const productResponse = await fetch(`/api/products/${productId}`);
        
        if (!productResponse.ok) {
            throw new Error(`Product not found with status ${productResponse.status}`);
        }

        const product = await productResponse.json();

        // Check if product has reviews
        if (!product.reviews || product.reviews.length === 0) {
            return {
                success: true,
                productId,
                productName: product.name,
                reviews: [],
                reviewCount: 0,
                averageRating: product.rating || 0,
                question: question || null,
                message: "This product has no reviews to analyze.",
                rawData: {
                    product: {
                        id: product._id,
                        name: product.name,
                        rating: product.rating,
                        numReviews: product.numReviews
                    },
                    reviews: []
                }
            };
        }

        // Prepare structured review data for Tambo LLM analysis
        const structuredReviews = product.reviews.map(review => ({
            rating: review.rating,
            comment: review.comment,
            userName: review.name || 'Anonymous',
            createdAt: review.createdAt || new Date().toISOString()
        }));

        // Build success message
        const action = question ? 'Retrieved reviews for question about' : 'Retrieved reviews for analysis of';
        const message = `${action} "${product.name}" - ${product.reviews.length} review${product.reviews.length !== 1 ? 's' : ''} available`;

        return {
            success: true,
            productId,
            productName: product.name,
            reviews: structuredReviews,
            reviewCount: product.reviews.length,
            averageRating: product.rating || 0,
            question: question || null,
            message,
            rawData: {
                product: {
                    id: product._id,
                    name: product.name,
                    rating: product.rating,
                    numReviews: product.numReviews,
                    price: product.price,
                    category: product.category
                },
                reviews: structuredReviews
            }
        };

    } catch (error) {
        console.error('Error in generateReviewSummary tool:', error);
        return {
            success: false,
            productId: productId || null,
            productName: null,
            reviews: [],
            reviewCount: 0,
            averageRating: 0,
            question: question || null,
            message: `Error retrieving reviews: ${error.message}`,
            rawData: null
        };
    }
};

/**
 * Get product reviews data for pros/cons analysis by Tambo LLM
 * Returns structured review data that Tambo can analyze to extract pros and cons
 */
export const getProsAndCons = async ({ productId }) => {
    try {
        if (!productId) {
            throw new Error('Product ID is required');
        }

        // Fetch product details to get reviews
        const productResponse = await fetch(`/api/products/${productId}`);
        
        if (!productResponse.ok) {
            throw new Error(`Product not found with status ${productResponse.status}`);
        }

        const product = await productResponse.json();

        // Check if product has reviews
        if (!product.reviews || product.reviews.length === 0) {
            return {
                success: true,
                productId,
                productName: product.name,
                reviews: [],
                reviewCount: 0,
                averageRating: product.rating || 0,
                message: `No reviews available for "${product.name}" to extract pros and cons.`,
                rawData: {
                    product: {
                        id: product._id,
                        name: product.name,
                        rating: product.rating,
                        numReviews: product.numReviews
                    },
                    reviews: []
                }
            };
        }

        // Prepare structured review data for Tambo LLM analysis
        const structuredReviews = product.reviews.map(review => ({
            rating: review.rating,
            comment: review.comment,
            userName: review.name || 'Anonymous',
            createdAt: review.createdAt || new Date().toISOString()
        }));

        return {
            success: true,
            productId,
            productName: product.name,
            reviews: structuredReviews,
            reviewCount: product.reviews.length,
            averageRating: product.rating || 0,
            message: `Retrieved ${product.reviews.length} review${product.reviews.length !== 1 ? 's' : ''} for pros/cons analysis of "${product.name}"`,
            rawData: {
                product: {
                    id: product._id,
                    name: product.name,
                    rating: product.rating,
                    numReviews: product.numReviews,
                    price: product.price,
                    category: product.category
                },
                reviews: structuredReviews
            }
        };

    } catch (error) {
        console.error('Error in getProsAndCons tool:', error);
        return {
            success: false,
            productId: productId || null,
            productName: null,
            reviews: [],
            reviewCount: 0,
            averageRating: 0,
            message: `Error retrieving reviews for pros/cons analysis: ${error.message}`,
            rawData: null
        };
    }
};

/**
 * Get product reviews data for question answering by Tambo LLM
 * Returns structured review data that Tambo can analyze to answer specific questions
 */
export const askAboutReviews = async ({ productId, question }) => {
    try {
        if (!productId) {
            throw new Error('Product ID is required');
        }

        if (!question) {
            throw new Error('Question is required');
        }

        // Fetch product details to get reviews
        const productResponse = await fetch(`/api/products/${productId}`);
        
        if (!productResponse.ok) {
            throw new Error(`Product not found with status ${productResponse.status}`);
        }

        const product = await productResponse.json();

        // Check if product has reviews
        if (!product.reviews || product.reviews.length === 0) {
            return {
                success: true,
                productId,
                productName: product.name,
                question,
                reviews: [],
                reviewCount: 0,
                averageRating: product.rating || 0,
                message: `No reviews available for "${product.name}" to answer the question.`,
                rawData: {
                    product: {
                        id: product._id,
                        name: product.name,
                        rating: product.rating,
                        numReviews: product.numReviews
                    },
                    reviews: []
                }
            };
        }

        // Prepare structured review data for Tambo LLM analysis
        const structuredReviews = product.reviews.map(review => ({
            rating: review.rating,
            comment: review.comment,
            userName: review.name || 'Anonymous',
            createdAt: review.createdAt || new Date().toISOString()
        }));

        return {
            success: true,
            productId,
            productName: product.name,
            question,
            reviews: structuredReviews,
            reviewCount: product.reviews.length,
            averageRating: product.rating || 0,
            message: `Retrieved ${product.reviews.length} review${product.reviews.length !== 1 ? 's' : ''} to answer question about "${product.name}"`,
            rawData: {
                product: {
                    id: product._id,
                    name: product.name,
                    rating: product.rating,
                    numReviews: product.numReviews,
                    price: product.price,
                    category: product.category
                },
                reviews: structuredReviews
            }
        };

    } catch (error) {
        console.error('Error in askAboutReviews tool:', error);
        return {
            success: false,
            productId: productId || null,
            productName: null,
            question: question || null,
            reviews: [],
            reviewCount: 0,
            averageRating: 0,
            message: `Error retrieving reviews to answer question: ${error.message}`,
            rawData: null
        };
    }
};
