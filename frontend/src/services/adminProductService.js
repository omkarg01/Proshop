import store from '../store';

/**
 * Admin product management service for AI-powered product updates
 * Provides tools for administrators to update product details via natural language
 */

/**
 * Update product details as an administrator
 * Allows updating product information like name, price, description, etc.
 */
export const updateProductDetails = async ({ productId, updates }) => {
    try {
        // Validate required parameters
        if (!productId) {
            throw new Error('Product ID is required');
        }

        if (!updates || Object.keys(updates).length === 0) {
            throw new Error('At least one field to update is required');
        }

        // First, fetch current product details to show what's being changed
        const currentProductResponse = await fetch(`/api/products/${productId}`);
        
        if (!currentProductResponse.ok) {
            throw new Error(`Product not found with status ${currentProductResponse.status}`);
        }

        const currentProduct = await currentProductResponse.json();

        // Prepare update data with productId
        // Merge current product data with updates to ensure all required fields are present
        const updateData = {
            productId,
            name: updates.name !== undefined ? updates.name : currentProduct.name,
            price: updates.price !== undefined ? updates.price : currentProduct.price,
            description: updates.description !== undefined ? updates.description : currentProduct.description,
            image: updates.image !== undefined ? updates.image : currentProduct.image,
            brand: updates.brand !== undefined ? updates.brand : currentProduct.brand,
            category: updates.category !== undefined ? updates.category : currentProduct.category,
            countInStock: updates.countInStock !== undefined ? updates.countInStock : currentProduct.countInStock,
        };

        // Validate update fields
        const allowedFields = ['name', 'price', 'description', 'image', 'brand', 'category', 'countInStock'];
        const invalidFields = Object.keys(updates).filter(field => !allowedFields.includes(field));
        
        if (invalidFields.length > 0) {
            throw new Error(`Invalid fields: ${invalidFields.join(', ')}. Allowed fields: ${allowedFields.join(', ')}`);
        }

        // Make the API call to update the product
        const updateResponse = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });

        if (!updateResponse.ok) {
            throw new Error(`Failed to update product with status ${updateResponse.status}`);
        }

        const updatedProduct = await updateResponse.json();

        // Invalidate RTK Query cache to refresh UI
        try {
            store.dispatch({ 
                type: 'api/invalidateTags', 
                payload: ['Products', 'Product'] 
            });
        } catch (cacheError) {
            console.warn('Failed to invalidate cache:', cacheError);
        }

        // Create a summary of changes
        const changes = [];
        for (const [field, newValue] of Object.entries(updates)) {
            const oldValue = currentProduct[field];
            if (oldValue !== newValue) {
                changes.push({
                    field,
                    oldValue,
                    newValue,
                    changed: true
                });
            }
        }

        return {
            success: true,
            productId,
            productName: updatedProduct.name,
            updatedProduct,
            previousProduct: currentProduct,
            changes,
            fieldsUpdated: Object.keys(updates),
            message: `Successfully updated "${updatedProduct.name}" - Changed ${changes.length} field${changes.length !== 1 ? 's' : ''}: ${changes.map(c => c.field).join(', ')}`,
            rawData: {
                productId,
                updates,
                previousProduct: currentProduct,
                updatedProduct,
                changes
            }
        };

    } catch (error) {
        console.error('Error in updateProductDetails tool:', error);
        return {
            success: false,
            productId: productId || null,
            productName: null,
            updatedProduct: null,
            previousProduct: null,
            changes: [],
            fieldsUpdated: [],
            message: `Error updating product: ${error.message}`,
            rawData: null
        };
    }
};

/**
 * Get product details for admin review
 * Returns comprehensive product information for admin analysis
 */
export const getProductForAdmin = async ({ productId }) => {
    try {
        if (!productId) {
            throw new Error('Product ID is required');
        }

        // Fetch product details
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
            throw new Error(`Product not found with status ${response.status}`);
        }

        const product = await response.json();

        // Structure product data for admin analysis
        const adminProductData = {
            id: product._id,
            name: product.name,
            price: product.price,
            description: product.description,
            image: product.image,
            brand: product.brand,
            category: product.category,
            countInStock: product.countInStock,
            rating: product.rating,
            numReviews: product.numReviews,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            reviews: product.reviews ? product.reviews.map(review => ({
                rating: review.rating,
                comment: review.comment,
                userName: review.name || 'Anonymous',
                createdAt: review.createdAt
            })) : [],
            salesData: {
                averageRating: product.rating || 0,
                totalReviews: product.numReviews || 0,
                stockStatus: product.countInStock > 0 ? 'In Stock' : 'Out of Stock',
                stockLevel: product.countInStock
            }
        };

        return {
            success: true,
            product: adminProductData,
            message: `Retrieved admin details for "${product.name}" - Price: $${product.price}, Stock: ${product.countInStock}, Rating: ${product.rating || 'No rating'}`,
            rawData: adminProductData
        };

    } catch (error) {
        console.error('Error in getProductForAdmin tool:', error);
        return {
            success: false,
            product: null,
            message: `Error retrieving product details: ${error.message}`,
            rawData: null
        };
    }
};

/**
 * Bulk update multiple products
 * Allows updating the same field across multiple products
 */
export const bulkUpdateProducts = async ({ productIds, updates }) => {
    try {
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            throw new Error('Product IDs array is required');
        }

        if (!updates || Object.keys(updates).length === 0) {
            throw new Error('At least one field to update is required');
        }

        // Validate update fields
        const allowedFields = ['name', 'price', 'description', 'image', 'brand', 'category', 'countInStock'];
        const invalidFields = Object.keys(updates).filter(field => !allowedFields.includes(field));
        
        if (invalidFields.length > 0) {
            throw new Error(`Invalid fields: ${invalidFields.join(', ')}. Allowed fields: ${allowedFields.join(', ')}`);
        }

        const results = [];
        let successCount = 0;
        let failureCount = 0;

        // Update each product
        for (const productId of productIds) {
            try {
                // First get current product data
                const currentResponse = await fetch(`/api/products/${productId}`);
                if (!currentResponse.ok) {
                    results.push({
                        productId,
                        success: false,
                        message: `Product not found - Status: ${currentResponse.status}`
                    });
                    failureCount++;
                    continue;
                }

                const currentProduct = await currentResponse.json();

                // Merge current product data with updates
                const updateData = {
                    productId,
                    name: updates.name !== undefined ? updates.name : currentProduct.name,
                    price: updates.price !== undefined ? updates.price : currentProduct.price,
                    description: updates.description !== undefined ? updates.description : currentProduct.description,
                    image: updates.image !== undefined ? updates.image : currentProduct.image,
                    brand: updates.brand !== undefined ? updates.brand : currentProduct.brand,
                    category: updates.category !== undefined ? updates.category : currentProduct.category,
                    countInStock: updates.countInStock !== undefined ? updates.countInStock : currentProduct.countInStock,
                };
                
                const response = await fetch(`/api/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData)
                });

                if (response.ok) {
                    const updatedProduct = await response.json();
                    results.push({
                        productId,
                        success: true,
                        productName: updatedProduct.name,
                        message: `Successfully updated "${updatedProduct.name}"`
                    });
                    successCount++;
                } else {
                    results.push({
                        productId,
                        success: false,
                        message: `Failed to update product - Status: ${response.status}`
                    });
                    failureCount++;
                }
            } catch (error) {
                results.push({
                    productId,
                    success: false,
                    message: `Error updating product: ${error.message}`
                });
                failureCount++;
            }
        }

        // Invalidate RTK Query cache to refresh UI
        try {
            store.dispatch({ 
                type: 'api/invalidateTags', 
                payload: ['Products', 'Product'] 
            });
        } catch (cacheError) {
            console.warn('Failed to invalidate cache:', cacheError);
        }

        return {
            success: successCount > 0,
            productIds,
            updates,
            results,
            successCount,
            failureCount,
            totalProcessed: productIds.length,
            fieldsUpdated: Object.keys(updates),
            message: `Bulk update completed: ${successCount} successful, ${failureCount} failed out of ${productIds.length} products`,
            rawData: {
                productIds,
                updates,
                results,
                summary: {
                    successCount,
                    failureCount,
                    totalProcessed: productIds.length
                }
            }
        };

    } catch (error) {
        console.error('Error in bulkUpdateProducts tool:', error);
        return {
            success: false,
            productIds: productIds || [],
            updates: {},
            results: [],
            successCount: 0,
            failureCount: 0,
            totalProcessed: 0,
            fieldsUpdated: [],
            message: `Error in bulk update: ${error.message}`,
            rawData: null
        };
    }
};

/**
 * Update product stock levels
 * Specialized function for updating inventory
 */
export const updateProductStock = async ({ productId, newStockLevel, operation }) => {
    try {
        if (!productId) {
            throw new Error('Product ID is required');
        }

        if (newStockLevel === undefined || newStockLevel < 0) {
            throw new Error('Valid stock level is required');
        }

        // Get current product
        const currentResponse = await fetch(`/api/products/${productId}`);
        if (!currentResponse.ok) {
            throw new Error(`Product not found with status ${currentResponse.status}`);
        }

        const currentProduct = await currentResponse.json();
        const oldStockLevel = currentProduct.countInStock;

        let finalStockLevel;
        if (operation === 'add') {
            finalStockLevel = oldStockLevel + newStockLevel;
        } else if (operation === 'subtract') {
            finalStockLevel = Math.max(0, oldStockLevel - newStockLevel);
        } else {
            finalStockLevel = newStockLevel;
        }

        // Update the product
        // Merge current product data with stock update
        const updateData = {
            productId,
            name: currentProduct.name,
            price: currentProduct.price,
            description: currentProduct.description,
            image: currentProduct.image,
            brand: currentProduct.brand,
            category: currentProduct.category,
            countInStock: finalStockLevel,
        };

        const updateResponse = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });

        if (!updateResponse.ok) {
            throw new Error(`Failed to update stock with status ${updateResponse.status}`);
        }

        const updatedProduct = await updateResponse.json();

        // Invalidate RTK Query cache to refresh UI
        try {
            store.dispatch({ 
                type: 'api/invalidateTags', 
                payload: ['Products', 'Product'] 
            });
        } catch (cacheError) {
            console.warn('Failed to invalidate cache:', cacheError);
        }

        return {
            success: true,
            productId,
            productName: updatedProduct.name,
            oldStockLevel,
            newStockLevel: finalStockLevel,
            operation,
            stockChange: finalStockLevel - oldStockLevel,
            updatedProduct,
            message: `Updated stock for "${updatedProduct.name}" from ${oldStockLevel} to ${finalStockLevel} (${operation === 'add' ? 'added' : operation === 'subtract' ? 'subtracted' : 'set to'} ${newStockLevel})`,
            rawData: {
                productId,
                oldStockLevel,
                newStockLevel: finalStockLevel,
                operation,
                updatedProduct
            }
        };

    } catch (error) {
        console.error('Error in updateProductStock tool:', error);
        return {
            success: false,
            productId: productId || null,
            productName: null,
            oldStockLevel: 0,
            newStockLevel: 0,
            operation: operation || null,
            stockChange: 0,
            updatedProduct: null,
            message: `Error updating product stock: ${error.message}`,
            rawData: null
        };
    }
};
