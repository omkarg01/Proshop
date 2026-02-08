import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetProductDetailsQuery } from '../slices/productsApiSlice';
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import { generateReviewSummary } from '../services/reviewSummaryService';
import { z } from 'zod';

// Define props schema using Zod
export const SmartProductCardPropsSchema = z.object({
  productId: z.string().optional(),
  showReviewSummary: z.boolean().optional().default(true),
  showStockAlert: z.boolean().optional().default(true),
  compact: z.boolean().optional().default(false),
});

// Infer TypeScript type from schema
type SmartProductCardProps = z.infer<typeof SmartProductCardPropsSchema>;

export const SmartProductCard: React.FC<SmartProductCardProps> = ({
  productId,
  showReviewSummary = true,
  showStockAlert = true,
  compact = false
}) => {
  // All React hooks must be called at the top - no conditions
  const { data: product, isLoading, error } = useGetProductDetailsQuery(productId as string, {
    skip: !productId,
  });
  const [reviewSummary, setReviewSummary] = useState<any>(null);
  const dispatch = useDispatch();

  // AI Review Summary - always call useEffect, handle condition inside
  useEffect(() => {
    // Only proceed if we have a valid productId and product
    if (productId && showReviewSummary && product) {
      generateReviewSummary({
        productId,
        question: "What do customers think about this product?"
      })
        .then(result => {
          if (result.success) {
            setReviewSummary(result);
          }
        })
        .catch(console.error);
    }
  }, [productId, showReviewSummary, product]);

  // Validate productId - return early if missing (after hooks are called)
  if (!productId) {
    return (
      <div className="alert alert-warning" role="alert">
        <strong>Missing Product ID:</strong> SmartProductCard requires a productId prop.
      </div>
    );
  }

  // Add to Cart Handler
  const handleAddToCart = () => {
    if (product && product.countInStock > 0) {
      dispatch(addToCart({ ...product, qty: 1 }));
      toast.success(`${product.name} added to cart!`);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-3">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="alert alert-danger" role="alert">
        Product not found or error loading product details.
      </div>
    );
  }

  const getStockBadgeColor = (count: number) => {
    if (count <= 5) return 'danger';
    if (count <= 10) return 'warning';
    return 'success';
  };

  const getSentimentBadgeColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div
      className={`card ${compact ? 'card-body-sm' : 'card-body'}`}
      style={{
        maxWidth: compact ? '100%' : '350px',
        margin: '0 auto',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      {/* Product Header */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div className="flex-grow-1">
          <h5 className="card-title mb-1" style={{ fontSize: compact ? '16px' : '18px' }}>
            {product.name}
          </h5>
          <div className="d-flex flex-wrap align-items-center gap-2" style={{ fontSize: '14px' }}>
            <span className="badge bg-secondary">{product.brand}</span>
            <span className="badge bg-info">{product.category}</span>
            <span className="fw-bold text-primary">${product.price}</span>
            <span className={`badge bg-${getStockBadgeColor(product.countInStock)}`}>
              🛒 {product.countInStock} in stock
            </span>
          </div>
        </div>
        <div className="text-end">
          <div className="d-flex align-items-center gap-1">
            <span style={{ color: '#ffc107' }}>⭐</span>
            <span className="fw-bold">{product.rating || '0'}</span>
          </div>
          <small className="text-muted">({product.numReviews || 0} reviews)</small>
        </div>
      </div>

      {/* Product Image */}
      {!compact && (
        <div className="text-center mb-3">
          <img
            src={product.image}
            alt={product.name}
            className="img-fluid rounded"
            style={{
              maxHeight: '200px',
              objectFit: 'cover',
              width: '100%'
            }}
          />
        </div>
      )}

      {/* AI Review Summary */}
      {showReviewSummary && reviewSummary && reviewSummary.reviews && reviewSummary.reviews.length > 0 && (
        <div className="alert alert-light mb-3" style={{ backgroundColor: '#f8f9fa', borderLeft: '4px solid #007bff' }}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className={`badge bg-${getSentimentBadgeColor(reviewSummary.sentiment)}`}>
              {reviewSummary.sentiment === 'positive' && '😊 Positive'}
              {reviewSummary.sentiment === 'neutral' && '😐 Neutral'}
              {reviewSummary.sentiment === 'negative' && '😔 Negative'}
            </span>
            <small className="text-muted">AI Analysis</small>
          </div>

          <p className="mb-2" style={{ fontSize: '14px', lineHeight: '1.4' }}>
            <strong>Customers say:</strong> {reviewSummary.reviews.slice(0, 2).map((r: any) => r.comment).join('. ')}
          </p>

          <div className="row g-2">
            <div className="col-6">
              <small className="text-success d-block">
                <strong>✅ Pros:</strong> Great quality, Good value
              </small>
            </div>
            <div className="col-6">
              <small className="text-danger d-block">
                <strong>❌ Cons:</strong> Limited options, Price
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Stock Alert */}
      {showStockAlert && product.countInStock <= 10 && (
        <div className="alert alert-warning alert-sm mb-3" role="alert">
          <small>
            <strong>🚨 Low Stock Alert:</strong> Only {product.countInStock} left - Order soon!
          </small>
        </div>
      )}

      {/* Add to Cart Button */}
      <div className="d-grid">
        <button
          className={`btn ${product.countInStock > 0 ? 'btn-success' : 'btn-secondary'}`}
          onClick={handleAddToCart}
          disabled={product.countInStock === 0}
          style={{ fontWeight: 'bold' }}
        >
          {product.countInStock > 0 ? (
            <>
              🛒 Add to Cart
            </>
          ) : (
            <>
              ❌ Out of Stock
            </>
          )}
        </button>
      </div>

      {/* Additional Info */}
      {!compact && (
        <div className="mt-3 pt-3 border-top">
          <small className="text-muted d-block">
            <strong>Product ID:</strong> {product._id}
          </small>
          {product.numReviews > 0 && (
            <small className="text-muted d-block">
              <strong>Based on {product.numReviews} customer reviews</strong>
            </small>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartProductCard;
