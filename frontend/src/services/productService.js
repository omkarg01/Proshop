/**
 * Search for products in the catalog using natural language queries with optional filters.
 * Returns matching products with full details.
 */
export const searchProducts = async ({ query = '', priceMin, priceMax, category, minRating }) => {
    try {
        // Fetch products from the API
        const apiUrl = `/api/products${query ? `?keyword=${encodeURIComponent(query)}` : ''}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        let products = data.products || [];

        // Apply client-side filters
        if (priceMin !== undefined) {
            products = products.filter(p => p.price >= priceMin);
        }

        if (priceMax !== undefined) {
            products = products.filter(p => p.price <= priceMax);
        }

        if (category) {
            products = products.filter(
                p => p.category && p.category.toLowerCase() === category.toLowerCase()
            );
        }

        if (minRating !== undefined) {
            products = products.filter(p => p.rating >= minRating);
        }

        // Build a helpful message describing the search results
        let message = `Found ${products.length} product${products.length !== 1 ? 's' : ''}`;

        const filters = [];
        if (query) filters.push(`matching "${query}"`);
        if (priceMin !== undefined || priceMax !== undefined) {
            const min = priceMin !== undefined ? `$${priceMin}` : '$0';
            const max = priceMax !== undefined ? `$${priceMax}` : 'any price';
            filters.push(`priced between ${min} and ${max}`);
        }
        if (category) filters.push(`in category "${category}"`);
        if (minRating !== undefined) filters.push(`with ${minRating}+ star rating`);

        if (filters.length > 0) {
            message += ' ' + filters.join(', ');
        }

        return {
            products,
            totalResults: products.length,
            message,
        };

    } catch (error) {
        console.error('Error in searchProducts tool:', error);
        return {
            products: [],
            totalResults: 0,
            message: `Error searching products: ${error.message}`,
        };
    }
};

/**
 * Find top-rated products with low stock levels
 * Uses existing searchProducts to find products that are highly rated but need restocking
 */
export const findTopRatedLowStock = async ({ minRating = 4.0, maxStockLevel = 10, category }) => {
    try {
        // Use existing searchProducts to get all products with minimum rating
        const searchResult = await searchProducts({ 
            query: '', 
            minRating, 
            category 
        });

        if (!searchResult.success && searchResult.products.length === 0) {
            return {
                success: true,
                products: [],
                totalResults: 0,
                criteria: { minRating, maxStockLevel, category },
                message: `No products found with rating ≥ ${minRating} and stock ≤ ${maxStockLevel}${category ? ` in ${category} category` : ''}`,
                rawData: {
                    criteria: { minRating, maxStockLevel, category },
                    products: []
                }
            };
        }

        // Filter for low stock and sort by rating (highest first)
        const lowStockProducts = searchResult.products
            .filter(product => product.countInStock <= maxStockLevel)
            .sort((a, b) => b.rating - a.rating);

        // Build descriptive message
        const categoryText = category ? ` in ${category} category` : '';
        const message = `Found ${lowStockProducts.length} top-rated product${lowStockProducts.length !== 1 ? 's' : ''} with low stock (≤ ${maxStockLevel} units)${categoryText}. Rating threshold: ≥ ${minRating} stars`;

        return {
            success: true,
            products: lowStockProducts,
            totalResults: lowStockProducts.length,
            criteria: { minRating, maxStockLevel, category },
            message,
            rawData: {
                criteria: { minRating, maxStockLevel, category },
                products: lowStockProducts,
                allSearchResults: searchResult.products
            }
        };

    } catch (error) {
        console.error('Error in findTopRatedLowStock tool:', error);
        return {
            success: false,
            products: [],
            totalResults: 0,
            criteria: { minRating, maxStockLevel, category },
            message: `Error finding top-rated low stock products: ${error.message}`,
            rawData: null
        };
    }
};
