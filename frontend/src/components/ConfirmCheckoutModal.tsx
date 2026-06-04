import type { Cart, CouponPreview } from "../types/api";

type ConfirmCheckoutModalProps = {
  show: boolean;
  cart: Cart;
  preview: CouponPreview | null;
  productNames: Map<string, string>;
  checkingOut: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const ConfirmCheckoutModal = ({
  show,
  cart,
  preview,
  productNames,
  checkingOut,
  onCancel,
  onConfirm,
}: ConfirmCheckoutModalProps) => {
  if (!show) {
    return null;
  }

  const total = preview?.total ?? cart.subtotal;
  const savings = preview?.savings ?? preview?.discountAmount ?? 0;

  return (
    <>
      <div className="modal-backdrop fade show" aria-hidden />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmCheckoutTitle"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content confirm-modal">
            <div className="modal-header border-0 pb-0">
              <h2 className="modal-title confirm-modal__title" id="confirmCheckoutTitle">
                Confirm your order
              </h2>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onCancel}
                disabled={checkingOut}
              />
            </div>

            <div className="modal-body">
              <p className="confirm-modal__lead">
                Please review your order details before placing it.
              </p>

              <ul className="list-unstyled confirm-modal__items mb-4">
                {cart.items.map((item) => {
                  const line = preview?.lines.find((l) => l.productId === item.productId);
                  const name = productNames.get(item.productId) ?? item.productId;
                  return (
                    <li
                      key={item.productId}
                      className={`confirm-modal__item ${
                        line && !line.isEligible && preview?.productId
                          ? "confirm-modal__item--ineligible"
                          : ""
                      }`}
                    >
                      <div>
                        <span className="confirm-modal__item-name">{name}</span>
                        <span className="confirm-modal__item-meta d-block">
                          Qty {item.quantity} · ${item.unitPrice.toFixed(2)} each
                        </span>
                        {line && !line.isEligible && preview?.productId ? (
                          <span className="confirm-modal__item-note">
                            Not covered by this coupon
                          </span>
                        ) : null}
                        {line && line.discountAmount > 0 ? (
                          <span className="confirm-modal__item-note confirm-modal__item-note--save">
                            Coupon saves ${line.discountAmount.toFixed(2)} on this line
                          </span>
                        ) : null}
                      </div>
                      <span className="confirm-modal__item-price">
                        ${item.lineTotal.toFixed(2)}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="confirm-modal__totals">
                <div className="cart-summary__row">
                  <span>Subtotal</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>

                {preview && savings > 0 ? (
                  <>
                    <div className="cart-summary__row">
                      <span>
                        Discount ({preview.couponCode}, {preview.percentage}%)
                        {preview.productName ? (
                          <span className="d-block small text-muted">
                            Only on {preview.productName}
                          </span>
                        ) : null}
                      </span>
                      <span className="text-success">−${savings.toFixed(2)}</span>
                    </div>
                    <div className="savings-highlight" role="status">
                      <span>You save</span>
                      <strong>${savings.toFixed(2)}</strong>
                    </div>
                  </>
                ) : null}

                <div className="cart-summary__row cart-summary__row--total">
                  <span>Amount due</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer border-0 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-outline-modern"
                onClick={onCancel}
                disabled={checkingOut}
              >
                Go back
              </button>
              <button
                type="button"
                className="btn btn-checkout flex-grow-1"
                onClick={onConfirm}
                disabled={checkingOut}
              >
                {checkingOut ? "Placing order…" : "Confirm & place order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
