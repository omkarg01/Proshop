import React, { useState, useEffect } from 'react';
import { Badge, Button, ListGroup, Spinner, Modal } from 'react-bootstrap';
import { getOrderHistory } from '../services/orderService';
import { z } from 'zod';
import { Link } from 'react-router-dom';

export const OrderHistoryCardPropsSchema = z.object({
    limit: z.number().optional().default(5),
    status: z.string().nullable().optional(),
    autoOpen: z.boolean().optional().default(false),
});

type OrderHistoryCardProps = z.infer<typeof OrderHistoryCardPropsSchema>;

const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({
    limit = 5,
    status,
    autoOpen = false
}) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(autoOpen);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const result = await getOrderHistory({
                days: undefined,
                startDate: undefined,
                endDate: undefined,
                status: status || undefined
            });
            if (result.success && result.orders) {
                setOrders(result.orders.slice(0, limit));
            } else {
                setError(result.message || 'Failed to fetch orders');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (showModal) {
            fetchOrders();
        }
    }, [showModal, limit, status]);

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const getStatusVariant = (orderStatus: string) => {
        switch (orderStatus.toLowerCase()) {
            case 'delivered': return 'success';
            case 'paid': return 'primary';
            case 'pending': return 'warning';
            default: return 'secondary';
        }
    };

    return (
        <>
            <Button variant="info" onClick={handleShow} className="text-white">
                📦 View My Recent Orders
            </Button>

            <Modal show={showModal} onHide={handleClose} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>📦 Recent Orders</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger">{error}</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                            <p>No orders found.</p>
                            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
                        </div>
                    ) : (
                        <ListGroup variant="flush">
                            {orders.map(order => (
                                <ListGroup.Item key={order.id} className="d-flex justify-content-between align-items-center flex-wrap">
                                    <div>
                                        <div className="fw-bold">Order #{order.id.substring(0, 10)}...</div>
                                        <small className="text-muted">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </small>
                                        <div className="mt-1">
                                            {order.items && order.items.slice(0, 2).map((item: any, idx: number) => (
                                                <span key={idx} className="badge bg-light text-dark me-1 border">
                                                    {item.quantity}x {item.name.substring(0, 15)}{item.name.length > 15 ? '...' : ''}
                                                </span>
                                            ))}
                                            {order.items && order.items.length > 2 && (
                                                <span className="badge bg-light text-dark border">+{order.items.length - 2} more</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-end mt-2 mt-sm-0">
                                        <div className="fw-bold">${order.totalPrice.toFixed(2)}</div>
                                        <Badge bg={getStatusVariant(order.status)}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </Badge>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Link to="/profile" className="btn btn-primary" onClick={handleClose}>
                        View Full History
                    </Link>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default OrderHistoryCard;
