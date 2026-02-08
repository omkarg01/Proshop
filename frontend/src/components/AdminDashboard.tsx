import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { searchProducts } from '../services/productService';
import { z } from 'zod';

// Define props schema using Zod
export const AdminDashboardPropsSchema = z.object({
    category: z.string().nullable().optional(),
    autoOpen: z.boolean().optional().default(false),
});

// Infer TypeScript type from schema
type AdminDashboardProps = z.infer<typeof AdminDashboardPropsSchema>;

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    category,
    autoOpen = false,
}) => {
    const [show, setShow] = useState(autoOpen);
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalProducts: 0,
        averageRating: 0,
        totalStockValue: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalRevenue: 0,
        averagePrice: 0,
    });

    // Fetch all products data
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await searchProducts({
                    query: '',
                    priceMin: undefined,
                    priceMax: undefined,
                    category: category || undefined,
                    minRating: undefined,
                });

                if (result.products && result.products.length > 0) {
                    const allProducts = result.products;
                    setProducts(allProducts);

                    // Calculate comprehensive statistics
                    const totalProducts = allProducts.length;
                    const averageRating = totalProducts > 0
                        ? allProducts.reduce((sum: number, p: any) => sum + (p.rating || 0), 0) / totalProducts
                        : 0;
                    const totalStockValue = allProducts.reduce(
                        (sum: number, p: any) => sum + (p.price * p.countInStock),
                        0
                    );
                    const lowStockCount = allProducts.filter((p: any) => p.countInStock > 0 && p.countInStock <= 10).length;
                    const outOfStockCount = allProducts.filter((p: any) => p.countInStock === 0).length;
                    const totalRevenue = allProducts.reduce(
                        (sum: number, p: any) => sum + (p.price * (p.numReviews || 0)),
                        0
                    );
                    const averagePrice = totalProducts > 0
                        ? allProducts.reduce((sum: number, p: any) => sum + p.price, 0) / totalProducts
                        : 0;

                    setStats({
                        totalProducts,
                        averageRating,
                        totalStockValue,
                        lowStockCount,
                        outOfStockCount,
                        totalRevenue,
                        averagePrice,
                    });
                } else {
                    setError('No products found in the system');
                }
            } catch (err: any) {
                setError(err.message || 'An error occurred while fetching data');
            } finally {
                setIsLoading(false);
            }
        };

        if (show) {
            fetchDashboardData();
        }
    }, [category, show]);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const getStockBadgeColor = (count: number) => {
        if (count === 0) return 'dark';
        if (count <= 5) return 'danger';
        if (count <= 10) return 'warning';
        return 'success';
    };

    const getStockStatus = (count: number) => {
        if (count === 0) return '❌ Out of Stock';
        if (count <= 5) return '🚨 Critical';
        if (count <= 10) return '⚠️ Low';
        return '✅ Good';
    };

    return (
        <>
            {/* Trigger Button */}
            <Button variant="primary" onClick={handleShow}>
                📊 View Admin Dashboard
            </Button>

            {/* Modal Dashboard */}
            <Modal show={show} onHide={handleClose} size="xl" centered>
                <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #007bff' }}>
                    <Modal.Title>
                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>📊 Admin Dashboard</span>
                        <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '5px' }}>
                            Complete inventory and product overview{category ? ` - ${category} Category` : ''}
                        </div>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {isLoading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger" role="alert">
                            <strong>Error:</strong> {error}
                        </div>
                    ) : (
                        <>
                            {/* Statistics Cards - Row 1 */}
                            <div className="row mb-3">
                                <div className="col-md-3">
                                    <div className="card text-center" style={{ borderLeft: '4px solid #007bff' }}>
                                        <div className="card-body">
                                            <h6 className="text-muted mb-2">Total Products</h6>
                                            <h3 className="mb-0" style={{ color: '#007bff' }}>{stats.totalProducts}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card text-center" style={{ borderLeft: '4px solid #28a745' }}>
                                        <div className="card-body">
                                            <h6 className="text-muted mb-2">Avg Rating</h6>
                                            <h3 className="mb-0" style={{ color: '#28a745' }}>
                                                ⭐ {stats.averageRating.toFixed(1)}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card text-center" style={{ borderLeft: '4px solid #ffc107' }}>
                                        <div className="card-body">
                                            <h6 className="text-muted mb-2">Avg Price</h6>
                                            <h3 className="mb-0" style={{ color: '#ffc107' }}>
                                                ${stats.averagePrice.toFixed(2)}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card text-center" style={{ borderLeft: '4px solid #17a2b8' }}>
                                        <div className="card-body">
                                            <h6 className="text-muted mb-2">Stock Value</h6>
                                            <h3 className="mb-0" style={{ color: '#17a2b8' }}>
                                                ${stats.totalStockValue.toFixed(2)}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Statistics Cards - Row 2 */}
                            <div className="row mb-4">
                                <div className="col-md-4">
                                    <div className="card text-center" style={{ borderLeft: '4px solid #dc3545' }}>
                                        <div className="card-body">
                                            <h6 className="text-muted mb-2">Out of Stock</h6>
                                            <h3 className="mb-0" style={{ color: '#dc3545' }}>
                                                ❌ {stats.outOfStockCount}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card text-center" style={{ borderLeft: '4px solid #fd7e14' }}>
                                        <div className="card-body">
                                            <h6 className="text-muted mb-2">Low Stock (≤10)</h6>
                                            <h3 className="mb-0" style={{ color: '#fd7e14' }}>
                                                ⚠️ {stats.lowStockCount}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card text-center" style={{ borderLeft: '4px solid #6f42c1' }}>
                                        <div className="card-body">
                                            <h6 className="text-muted mb-2">Est. Revenue</h6>
                                            <h3 className="mb-0" style={{ color: '#6f42c1' }}>
                                                ${stats.totalRevenue.toFixed(2)}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Products Table */}
                            {products.length === 0 ? (
                                <div className="alert alert-info text-center" role="alert">
                                    <strong>No products found</strong> in the system.
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover table-striped">
                                        <thead style={{ backgroundColor: '#007bff', color: 'white', position: 'sticky', top: 0 }}>
                                            <tr>
                                                <th>Image</th>
                                                <th>Product Name</th>
                                                <th>Category</th>
                                                <th>Brand</th>
                                                <th>Price</th>
                                                <th>Rating</th>
                                                <th>Stock</th>
                                                <th>Status</th>
                                                <th>Stock Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map((product) => (
                                                <tr key={product._id}>
                                                    <td>
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            style={{
                                                                width: '50px',
                                                                height: '50px',
                                                                objectFit: 'cover',
                                                                borderRadius: '5px',
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <strong>{product.name}</strong>
                                                        <br />
                                                        <small className="text-muted">ID: {product._id}</small>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-info">{product.category}</span>
                                                    </td>
                                                    <td>{product.brand}</td>
                                                    <td>
                                                        <strong>${product.price}</strong>
                                                    </td>
                                                    <td>
                                                        <span style={{ color: '#ffc107' }}>⭐</span> {product.rating || 0}
                                                        <br />
                                                        <small className="text-muted">({product.numReviews || 0} reviews)</small>
                                                    </td>
                                                    <td>
                                                        <span className={`badge bg-${getStockBadgeColor(product.countInStock)}`}>
                                                            {product.countInStock} units
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge bg-${getStockBadgeColor(product.countInStock)}`}>
                                                            {getStockStatus(product.countInStock)}
                                                        </span>
                                                    </td>
                                                    <td>${(product.price * product.countInStock).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer style={{ backgroundColor: '#f8f9fa' }}>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => window.location.reload()}>
                        🔄 Refresh Data
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AdminDashboard;
