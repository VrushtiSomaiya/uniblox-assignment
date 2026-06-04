import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";

export const Navbar = () => {
  const { itemCount } = useCart();

  return (
    <nav className="navbar navbar-expand-lg app-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <span className="brand-logo" aria-hidden>
            U
          </span>
          Uniblox Store
        </Link>
        <button
          className="navbar-toggler border-0 ms-auto me-2"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <div className="navbar-nav ms-lg-auto gap-1">
            <NavLink className="nav-link" to="/" end>
              Products
            </NavLink>
            <NavLink className="nav-link" to="/cart">
              Cart
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </NavLink>
            <NavLink className="nav-link" to="/orders">
              Orders
            </NavLink>
            <NavLink className="nav-link" to="/admin">
              Admin
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};
