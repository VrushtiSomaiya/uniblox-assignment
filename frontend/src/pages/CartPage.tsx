import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { checkout, getErrorMessage, getProducts, previewCoupon } from "../api/client";
import { ConfirmCheckoutModal } from "../components/ConfirmCheckoutModal";
import { IconCart, IconCheck } from "../components/Icons";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { useCart } from "../context/CartContext";
import type { CouponPreview, Product } from "../types/api";

export const CartPage = () => {
  const { cartId, cart, loading, refreshCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [preview, setPreview] = useState<CouponPreview | null>(null);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmPreview, setConfirmPreview] = useState<CouponPreview | null>(null);

  const productNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const product of products) {
      map.set(product.id, product.name);
    }
    return map;
  }, [products]);

  useEffect(() => {
    void getProducts()
      .then(setProducts)
      .catch(() => undefined);
  }, []);

  const clearCouponPreview = useCallback(() => {
    setPreview(null);
    setAppliedCode(null);
    setConfirmPreview(null);
  }, []);

  const revalidateAppliedCoupon = useCallback(async () => {
    if (!appliedCode) {
      return true;
    }

    try {
      const result = await previewCoupon(cartId, appliedCode);
      setPreview(result);
      setConfirmPreview(result);
      return true;
    } catch (err) {
      clearCouponPreview();
      setCouponCode("");
      setError(getErrorMessage(err));
      return false;
    }
  }, [appliedCode, cartId, clearCouponPreview]);

  useEffect(() => {
    if (!appliedCode || cart.items.length === 0) {
      return;
    }

    void revalidateAppliedCoupon();
  }, [cart.items, cart.subtotal, appliedCode, revalidateAppliedCoupon]);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      setError("Enter a discount code first.");
      return;
    }

    setApplyingCoupon(true);
    setError(null);
    setMessage(null);
    try {
      const result = await previewCoupon(cartId, code);
      setPreview(result);
      setAppliedCode(result.couponCode);
      setCouponCode(result.couponCode);
    } catch (err) {
      clearCouponPreview();
      setError(getErrorMessage(err));
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleOpenConfirm = async () => {
    setError(null);

    const typedCode = couponCode.trim();
    if (typedCode && typedCode !== appliedCode) {
      setError("Click Apply to validate your coupon before checkout.");
      return;
    }

    if (appliedCode) {
      setApplyingCoupon(true);
      try {
        const fresh = await previewCoupon(cartId, appliedCode);
        setPreview(fresh);
        setConfirmPreview(fresh);
      } catch (err) {
        clearCouponPreview();
        setCouponCode("");
        setError(getErrorMessage(err));
        return;
      } finally {
        setApplyingCoupon(false);
      }
    } else {
      setConfirmPreview(null);
    }

    setShowConfirmModal(true);
  };

  const handleConfirmCheckout = async () => {
    setCheckingOut(true);
    setError(null);
    try {
      if (appliedCode) {
        const stillValid = await revalidateAppliedCoupon();
        if (!stillValid) {
          setShowConfirmModal(false);
          return;
        }
      }

      const result = await checkout(cartId, appliedCode ?? undefined);
      await refreshCart();
      setShowConfirmModal(false);
      setCouponCode("");
      clearCouponPreview();
      setMessage(
        `Order ${result.order.id} placed. Total: $${result.order.total.toFixed(2)}` +
          (result.order.discountAmount > 0
            ? ` (you saved $${result.order.discountAmount.toFixed(2)})`
            : "") +
          (result.generatedCoupon
            ? ` | New coupon: ${result.generatedCoupon.code}`
            : ""),
      );
    } catch (err) {
      setError(getErrorMessage(err));
      setShowConfirmModal(false);
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading cart..." />;
  }

  const itemLabel = (productId: string) =>
    productNames.get(productId) ?? productId;

  const displayTotal = preview?.total ?? cart.subtotal;
  const savings = preview?.savings ?? preview?.discountAmount ?? 0;

  return (
    <div className="cart-page">
      <PageHeader
        title="Your Bag"
        subtitle="Apply a product-specific coupon, review your savings, then confirm your order."
      />

      {error && <div className="app-alert app-alert--danger">{error}</div>}

      {message ? (
        <div className="checkout-success mb-4">
          <div className="checkout-success__icon">
            <IconCheck size={28} />
          </div>
          <h2 className="checkout-success__title">Order placed successfully</h2>
          <p className="checkout-success__message">{message}</p>
        </div>
      ) : null}

      {cart.items.length === 0 ? (
        <div className="app-card empty-state">
          <div className="empty-state__icon">
            <IconCart size={28} />
          </div>
          <h2 className="empty-state__title">Your cart is empty</h2>
          <p className="empty-state__text">Add products to get started.</p>
          <Link to="/" className="btn btn-gradient">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="app-card app-card--elevated cart-items-panel">
            <div className="cart-items-panel__head">
              {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
            </div>
            <div>
              {cart.items.map((item) => {
                const line = preview?.lines.find(
                  (entry) => entry.productId === item.productId,
                );
                const isIneligible =
                  preview?.productId && line && !line.isEligible;

                return (
                  <div
                    className={`cart-item ${isIneligible ? "cart-item--ineligible" : ""} ${
                      line?.isEligible && line.discountAmount > 0
                        ? "cart-item--eligible"
                        : ""
                    }`}
                    key={item.productId}
                  >
                    <div className="cart-item__thumb" aria-hidden>
                      {itemLabel(item.productId).charAt(0).toUpperCase()}
                    </div>
                    <div className="cart-item__details">
                      <p className="cart-item__name">{itemLabel(item.productId)}</p>
                      <p className="cart-item__meta">
                        Qty {item.quantity} · ${item.unitPrice.toFixed(2)} each
                      </p>
                      {line?.isEligible && line.discountAmount > 0 ? (
                        <p className="cart-item__discount">
                          Coupon saves ${line.discountAmount.toFixed(2)}
                        </p>
                      ) : null}
                      {isIneligible ? (
                        <p className="cart-item__ineligible">
                          Coupon does not apply to this item
                        </p>
                      ) : null}
                    </div>
                    <p className="cart-item__line-total">
                      ${item.lineTotal.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="cart-summary">
            <div className="app-card app-card--elevated app-card--glass cart-summary__card">
              <h2 className="cart-summary__title">Order Summary</h2>

              {preview && savings > 0 ? (
                <div className="savings-banner" role="status">
                  <p className="savings-banner__label">You&apos;re saving</p>
                  <p className="savings-banner__amount">${savings.toFixed(2)}</p>
                  {preview.productName ? (
                    <p className="savings-banner__detail">
                      {preview.percentage}% off {preview.productName} only — other
                      items are full price
                    </p>
                  ) : (
                    <p className="savings-banner__detail">
                      {preview.percentage}% off your entire order
                    </p>
                  )}
                </div>
              ) : null}

              <div className="cart-summary__row">
                <span>Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>

              {preview && savings > 0 ? (
                <div className="discount-breakdown">
                  <p className="discount-breakdown__title">Coupon breakdown</p>
                  <div className="cart-summary__row">
                    <span>
                      Code <strong>{preview.couponCode}</strong>
                    </span>
                  </div>
                  {preview.productName ? (
                    <div className="cart-summary__row">
                      <span>Applies to</span>
                      <span>{preview.productName}</span>
                    </div>
                  ) : null}
                  <div className="cart-summary__row">
                    <span>Eligible amount</span>
                    <span>${preview.eligibleSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="cart-summary__row cart-summary__row--discount">
                    <span>Discount ({preview.percentage}%)</span>
                    <span>−${savings.toFixed(2)}</span>
                  </div>
                </div>
              ) : null}

              <div className="cart-summary__row cart-summary__row--total">
                <span>Total</span>
                <span>${displayTotal.toFixed(2)}</span>
              </div>

              <div className="coupon-panel">
                <label htmlFor="coupon" className="coupon-panel__label">
                  Have a discount code?
                </label>
                <div className="coupon-input-group d-flex gap-2">
                  <input
                    id="coupon"
                    className="form-control flex-grow-1"
                    value={couponCode}
                    onChange={(event) => {
                      setCouponCode(event.target.value);
                      if (appliedCode && event.target.value.trim() !== appliedCode) {
                        clearCouponPreview();
                      }
                    }}
                    placeholder="Enter code"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-modern"
                    onClick={() => void handleApplyCoupon()}
                    disabled={applyingCoupon}
                  >
                    {applyingCoupon ? "..." : "Apply"}
                  </button>
                </div>
                {appliedCode ? (
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-muted p-0 mb-3"
                    onClick={() => {
                      setCouponCode("");
                      clearCouponPreview();
                    }}
                  >
                    Remove coupon
                  </button>
                ) : null}
              </div>

              <button
                type="button"
                className="btn btn-checkout"
                disabled={checkingOut || applyingCoupon}
                onClick={() => void handleOpenConfirm()}
              >
                Review & place order
              </button>
            </div>
          </aside>
        </div>
      )}

      <ConfirmCheckoutModal
        show={showConfirmModal}
        cart={cart}
        preview={confirmPreview}
        productNames={productNames}
        checkingOut={checkingOut}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={() => void handleConfirmCheckout()}
      />
    </div>
  );
};
