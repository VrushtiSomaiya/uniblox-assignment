import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  createDiscountCode,
  generateDiscountCode,
  getErrorMessage,
  getProducts,
  getStatistics,
  listDiscountCodes,
} from "../api/client";
import {
  IconBox,
  IconDollar,
  IconOrders,
  IconPercent,
  IconSparkles,
  IconTicket,
} from "../components/Icons";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import type { DiscountCode, Product, Statistics } from "../types/api";

const metrics = [
  {
    key: "revenue" as const,
    label: "Total Revenue",
    format: (s: Statistics) => `$${s.revenue.toFixed(2)}`,
    icon: IconDollar,
    iconClass: "metric-card__icon--primary",
    cardClass: "metric-card--revenue",
  },
  {
    key: "orders" as const,
    label: "Total Orders",
    format: (s: Statistics) => String(s.totalOrders),
    icon: IconOrders,
    iconClass: "metric-card__icon--accent",
    cardClass: "metric-card--orders",
  },
  {
    key: "items" as const,
    label: "Items Purchased",
    format: (s: Statistics) => String(s.itemsPurchased),
    icon: IconBox,
    iconClass: "metric-card__icon--secondary",
    cardClass: "metric-card--items",
  },
  {
    key: "coupons" as const,
    label: "Coupons Generated",
    format: (s: Statistics) => String(s.discountCodesGenerated),
    icon: IconTicket,
    iconClass: "metric-card__icon--warning",
    cardClass: "metric-card--coupons",
  },
  {
    key: "discounts" as const,
    label: "Discounts Given",
    format: (s: Statistics) => `$${s.totalDiscountsGiven.toFixed(2)}`,
    icon: IconPercent,
    iconClass: "metric-card__icon--success",
    cardClass: "metric-card--discounts",
  },
];

export const AdminPage = () => {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<DiscountCode[]>([]);
  const [productId, setProductId] = useState("");
  const [percentage, setPercentage] = useState("10");
  const [orderNumber, setOrderNumber] = useState("3");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, productsData, couponsData] = await Promise.all([
        getStatistics(),
        getProducts(),
        listDiscountCodes(),
      ]);
      setStats(statsData);
      setProducts(productsData);
      setCoupons(couponsData);
      setProductId((current) => current || productsData[0]?.id || "");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleCreateCoupon = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const parsed = Number(percentage);
      const created = await createDiscountCode(productId, parsed);
      setMessage(
        `Coupon created: ${created.code} — ${created.percentage}% off ${
          created.productName ?? productId
        }`,
      );
      await loadDashboard();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleGenerateNth = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const parsed = Number(orderNumber);
      const generated = await generateDiscountCode(parsed);
      if (!generated) {
        setMessage(`No coupon generated for order #${parsed} (not divisible by 3).`);
      } else {
        setMessage(
          `Auto coupon: ${generated.code} (${generated.percentage}% off entire cart)`,
        );
      }
      await loadDashboard();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Dashboard"
        subtitle="Analytics, discount codes, and order fulfillment."
      />

      <div className="d-flex flex-wrap gap-2 mb-4">
        <Link to="/orders" className="btn btn-outline-modern btn-sm">
          View Orders →
        </Link>
      </div>

      {error && <div className="app-alert app-alert--danger">{error}</div>}
      {message && <div className="app-alert app-alert--success">{message}</div>}

      {stats && (
        <div className="row g-4 dashboard-metrics">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const colClass =
              metric.key === "coupons" || metric.key === "discounts"
                ? "col-md-6"
                : "col-md-4";
            return (
              <div className={colClass} key={metric.key}>
                <div className={`app-card metric-card ${metric.cardClass}`}>
                  <div className="metric-card__header">
                    <div>
                      <p className="metric-card__label">{metric.label}</p>
                      <p className="metric-card__value">{metric.format(stats)}</p>
                    </div>
                    <div className={`metric-card__icon ${metric.iconClass}`}>
                      <Icon size={20} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="row g-4 admin-section">
        <div className="col-lg-5">
          <div className="app-card app-card--glass admin-form-card h-100">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="metric-card__icon metric-card__icon--primary">
                <IconSparkles size={20} />
              </div>
              <div>
                <h2 className="admin-section__title mb-0">Create Discount Code</h2>
                <p className="text-muted small mb-0">
                  Choose a product and discount percentage.
                </p>
              </div>
            </div>

            <form onSubmit={(event) => void handleCreateCoupon(event)}>
              <label htmlFor="productId" className="form-label">
                Product
              </label>
              <select
                id="productId"
                className="form-select mb-3"
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (${product.price.toFixed(2)})
                  </option>
                ))}
              </select>

              <label htmlFor="percentage" className="form-label">
                Discount (%)
              </label>
              <input
                id="percentage"
                type="number"
                min={1}
                max={99}
                className="form-control mb-4"
                value={percentage}
                onChange={(event) => setPercentage(event.target.value)}
              />

              <button type="submit" className="btn btn-gradient w-100">
                Create Coupon
              </button>
            </form>

            <hr className="my-4" />

            <p className="small text-muted mb-2">
              Or generate an auto coupon (10% off cart) when order # is divisible by 3:
            </p>
            <form onSubmit={(event) => void handleGenerateNth(event)} className="d-flex gap-2">
              <input
                type="number"
                min={1}
                className="form-control"
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
                aria-label="Order number"
              />
              <button type="submit" className="btn btn-outline-modern text-nowrap">
                Nth Order
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="app-card app-card--elevated admin-form-card h-100">
            <h2 className="admin-section__title">Coupon Codes</h2>
            <p className="text-muted small mb-4">
              All codes created for this store session.
            </p>

            {coupons.length === 0 ? (
              <p className="text-muted mb-0">No coupons yet. Create one to get started.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle admin-table mb-0">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Product</th>
                      <th>Off</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr key={coupon.code}>
                        <td>
                          <code className="coupon-code">{coupon.code}</code>
                        </td>
                        <td>
                          {coupon.productName ??
                            (coupon.productId ? coupon.productId : "Entire cart")}
                        </td>
                        <td>{coupon.percentage}%</td>
                        <td>
                          <span
                            className={`badge status-badge ${
                              coupon.isUsed ? "status-badge--used" : "status-badge--active"
                            }`}
                          >
                            {coupon.isUsed ? "Used" : "Available"}
                          </span>
                        </td>
                        <td className="small text-muted">
                          {new Date(coupon.generatedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
