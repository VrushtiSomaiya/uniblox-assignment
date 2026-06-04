import { useCallback, useEffect, useMemo, useState } from "react";
import { getErrorMessage, getProducts, listOrders, updateOrderStatus } from "../api/client";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import type { DeliveryStatus, Order, Product } from "../types/api";

type StatusTab = "all" | DeliveryStatus;

const TABS: { id: StatusTab; label: string }[] = [
  { id: "all", label: "All Orders" },
  { id: "pending", label: "Not Delivered" },
  { id: "out_for_shipment", label: "Out for Shipment" },
  { id: "delivered", label: "Delivered" },
];

const statusLabel: Record<DeliveryStatus, string> = {
  pending: "Not Delivered",
  out_for_shipment: "Out for Shipment",
  delivered: "Delivered",
};

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const productNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      map.set(p.id, p.name);
    }
    return map;
  }, [products]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersData, productsData] = await Promise.all([
        listOrders(),
        getProducts(),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") {
      return orders;
    }
    return orders.filter((order) => order.deliveryStatus === activeTab);
  }, [orders, activeTab]);

  const tabCounts = useMemo(() => {
    const counts: Record<StatusTab, number> = {
      all: orders.length,
      pending: 0,
      out_for_shipment: 0,
      delivered: 0,
    };
    for (const order of orders) {
      counts[order.deliveryStatus] += 1;
    }
    return counts;
  }, [orders]);

  const handleStatusChange = async (orderId: string, status: DeliveryStatus) => {
    setUpdatingId(orderId);
    setError(null);
    try {
      await updateOrderStatus(orderId, status);
      await loadOrders();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <LoadingState message="Loading orders..." />;
  }

  return (
    <div className="orders-page">
      <PageHeader
        title="Orders"
        subtitle="Track received orders and update delivery status."
      />

      {error && <div className="app-alert app-alert--danger">{error}</div>}

      <ul className="nav nav-tabs order-tabs mb-4" role="tablist">
        {TABS.map((tab) => (
          <li className="nav-item" key={tab.id} role="presentation">
            <button
              type="button"
              role="tab"
              className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              aria-selected={activeTab === tab.id}
            >
              {tab.label}
              <span className="order-tabs__count">{tabCounts[tab.id]}</span>
            </button>
          </li>
        ))}
      </ul>

      {filteredOrders.length === 0 ? (
        <div className="app-card empty-state">
          <h2 className="empty-state__title">No orders in this view</h2>
          <p className="empty-state__text">
            {orders.length === 0
              ? "Orders will appear here after customers complete checkout."
              : "Try another tab to see orders with a different status."}
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {filteredOrders.map((order) => (
            <article className="app-card order-card" key={order.id}>
              <div className="order-card__header">
                <div>
                  <h2 className="order-card__id">{order.id}</h2>
                  <p className="order-card__meta">
                    {new Date(order.createdAt).toLocaleString()} · Cart {order.cartId}
                  </p>
                </div>
                <span className={`badge status-badge status-badge--${order.deliveryStatus}`}>
                  {statusLabel[order.deliveryStatus]}
                </span>
              </div>

              <div className="order-card__items">
                <p className="order-card__items-title">Products ordered</p>
                <ul className="list-unstyled mb-0">
                  {order.items.map((item) => (
                    <li className="order-line" key={`${order.id}-${item.productId}`}>
                      <span className="order-line__name">
                        {productNames.get(item.productId) ?? item.productId}
                      </span>
                      <span className="order-line__qty">× {item.quantity}</span>
                      <span className="order-line__price">
                        ${item.lineTotal.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="order-card__totals">
                <div className="cart-summary__row">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                {order.discountAmount > 0 ? (
                  <div className="cart-summary__row cart-summary__row--discount">
                    <span>
                      Discount{order.discountCode ? ` (${order.discountCode})` : ""}
                    </span>
                    <span>−${order.discountAmount.toFixed(2)}</span>
                  </div>
                ) : null}
                <div className="cart-summary__row cart-summary__row--total">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="order-card__actions">
                <label className="form-label small mb-1" htmlFor={`status-${order.id}`}>
                  Update delivery status
                </label>
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <select
                    id={`status-${order.id}`}
                    className="form-select form-select-sm order-status-select"
                    value={order.deliveryStatus}
                    disabled={updatingId === order.id}
                    onChange={(event) =>
                      void handleStatusChange(
                        order.id,
                        event.target.value as DeliveryStatus,
                      )
                    }
                  >
                    <option value="pending">Not Delivered</option>
                    <option value="out_for_shipment">Out for Shipment</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  {updatingId === order.id ? (
                    <span className="small text-muted">Saving…</span>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
