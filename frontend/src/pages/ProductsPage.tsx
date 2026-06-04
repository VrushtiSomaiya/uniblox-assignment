import { useEffect, useState } from "react";
import { getErrorMessage, getProducts } from "../api/client";
import { IconPackage } from "../components/Icons";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { useCart } from "../context/CartContext";
import type { Product } from "../types/api";

export const ProductsPage = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleAdd = async (productId: string, name: string) => {
    setMessage(null);
    setError(null);
    try {
      await addItem(productId, 1);
      setMessage(`${name} added to cart.`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) {
    return <LoadingState message="Loading products..." />;
  }

  return (
    <div className="catalog-page">
      <PageHeader
        title="Our Collection"
        subtitle="Curated essentials with calm, thoughtful design — add what you love to your cart."
      />

      {error && <div className="app-alert app-alert--danger">{error}</div>}
      {message && <div className="app-alert app-alert--success">{message}</div>}

      <div className="row catalog-grid">
        {products.map((product) => (
          <div className="col-sm-6 col-lg-4" key={product.id}>
            <article className="app-card product-card h-100 d-flex flex-column">
              <div className="product-card__media">
                <div className="product-card__icon" aria-hidden>
                  <IconPackage size={28} />
                </div>
              </div>
              <div className="product-card__body d-flex flex-column flex-grow-1">
                <h2 className="product-card__title">{product.name}</h2>
                <p className="product-card__price mb-0">
                  ${product.price.toFixed(2)}
                  <span className="product-card__currency ms-1">
                    {product.currency}
                  </span>
                </p>
                <button
                  type="button"
                  className="btn btn-gradient mt-4 mt-md-auto"
                  onClick={() => void handleAdd(product.id, product.name)}
                >
                  Add to Cart
                </button>
              </div>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
};
