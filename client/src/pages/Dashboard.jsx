import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import { api } from "../api";

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icons = {
    products: (
      <svg {...common}>
        <path d="M3 7.5 12 3l9 4.5L12 12 3 7.5Z" />
        <path d="M3 7.5V17l9 4 9-4V7.5" />
        <path d="M12 12v9" />
      </svg>
    ),

    stock: (
      <svg {...common}>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </svg>
    ),

    low: (
      <svg {...common}>
        <path d="M12 4v10" />
        <path d="M12 18h.01" />
        <path d="M10 4h4" />
      </svg>
    ),

    out: (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="m9 9 6 6M15 9l-6 6" />
      </svg>
    ),

    receipt: (
      <svg {...common}>
        <path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    ),

    delivery: (
      <svg {...common}>
        <path d="M3 6h11v11H3z" />
        <path d="M14 10h4l3 3v4h-7" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </svg>
    ),

    transfer: (
      <svg {...common}>
        <path d="M4 7h12" />
        <path d="m13 4 3 3-3 3" />
        <path d="M20 17H8" />
        <path d="m11 14-3 3 3 3" />
      </svg>
    ),

    adjustment: (
      <svg {...common}>
        <path d="M4 6h16M4 12h16M4 18h16" />
        <circle cx="9" cy="6" r="2" />
        <circle cx="15" cy="12" r="2" />
        <circle cx="10" cy="18" r="2" />
      </svg>
    ),
  };

  return icons[name] || null;
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStock: 0,
    outOfStock: 0,
    recentMovements: [],
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    setLoading(true);

    try {
      const [
        dashboardResult,
        productsResult,
      ] = await Promise.all([
        api("/dashboard"),
        api("/products"),
      ]);

      if (dashboardResult.response.ok) {
        setDashboard(dashboardResult.data);
      }

      if (productsResult.response.ok) {
        setProducts(productsResult.data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const healthyProducts = Math.max(
    0,
    dashboard.totalProducts -
      dashboard.lowStock -
      dashboard.outOfStock
  );

  const healthPercent =
    dashboard.totalProducts > 0
      ? Math.round(
          (healthyProducts /
            dashboard.totalProducts) *
            100
        )
      : 0;

  const attentionProducts = useMemo(() => {
    return products
      .filter((product) => {
        const stock = Number(product.stock || 0);
        const min = Number(product.min_stock || 0);

        return stock <= min;
      })
      .sort(
        (a, b) =>
          Number(a.stock) -
          Number(b.stock)
      )
      .slice(0, 5);
  }, [products]);

  const activity = useMemo(() => {
    const value = {
      RECEIPT: 0,
      DELIVERY: 0,
      TRANSFER: 0,
      ADJUSTMENT: 0,
    };

    dashboard.recentMovements.forEach(
      (movement) => {
        if (value[movement.type] !== undefined) {
          value[movement.type]++;
        }
      }
    );

    return value;
  }, [dashboard.recentMovements]);

  return (
    <Shell
      title="Dashboard"
      subtitle="Inventory control center"
    >
      <div className="dashboard-page">

        {/* TITLE */}

        <div className="dashboard-intro">

          <div>
            <h2>Inventory Overview</h2>

            <p>
              Monitor stock levels, operations and
              inventory health from one workspace.
            </p>
          </div>

          <div className="dashboard-actions">

            <button
              className="dashboard-refresh"
              onClick={loadDashboard}
            >
              Refresh
            </button>

            <Link
              to="/products"
              className="dashboard-primary"
            >
              Add Product
            </Link>

          </div>

        </div>

        {/* KPI */}

        <div className="dashboard-kpi-grid">

          <Kpi
            title="Total Products"
            value={dashboard.totalProducts}
            description="Products tracked"
            icon="products"
            theme="red"
          />

          <Kpi
            title="Total Stock"
            value={dashboard.totalStock}
            description="Units available"
            icon="stock"
            theme="dark"
          />

          <Kpi
            title="Low Stock"
            value={dashboard.lowStock}
            description="Requires attention"
            icon="low"
            theme="amber"
          />

          <Kpi
            title="Out of Stock"
            value={dashboard.outOfStock}
            description="Currently unavailable"
            icon="out"
            theme="danger"
          />

        </div>

        {/* OVERVIEW ROW */}

        <div className="dashboard-grid-two">

          <section className="dashboard-panel">

            <div className="dashboard-panel-header">

              <div>
                <h3>Inventory Health</h3>

                <p>
                  Product availability based on
                  minimum stock thresholds.
                </p>
              </div>

              <div className="health-number">
                {healthPercent}%
              </div>

            </div>

            <div className="health-track">
              <div
                className="health-fill"
                style={{
                  width: `${healthPercent}%`,
                }}
              />
            </div>

            <div className="health-breakdown">

              <HealthBlock
                label="Healthy"
                value={healthyProducts}
                tone="green"
              />

              <HealthBlock
                label="Low Stock"
                value={dashboard.lowStock}
                tone="amber"
              />

              <HealthBlock
                label="Out of Stock"
                value={dashboard.outOfStock}
                tone="red"
              />

            </div>

          </section>

          <section className="dashboard-panel">

            <div className="dashboard-panel-header">

              <div>
                <h3>Operations</h3>

                <p>
                  Recent activity by operation type.
                </p>
              </div>

              <Link
                to="/operations/move-history"
                className="dashboard-text-link"
              >
                View history
              </Link>

            </div>

            <div className="operations-list">

              <OperationRow
                label="Receipts"
                value={activity.RECEIPT}
                icon="receipt"
              />

              <OperationRow
                label="Delivery Orders"
                value={activity.DELIVERY}
                icon="delivery"
              />

              <OperationRow
                label="Internal Transfers"
                value={activity.TRANSFER}
                icon="transfer"
              />

              <OperationRow
                label="Adjustments"
                value={activity.ADJUSTMENT}
                icon="adjustment"
              />

            </div>

          </section>

        </div>

        {/* ATTENTION + ACTIONS */}

        <div className="dashboard-grid-two">

          <section className="dashboard-panel">

            <div className="dashboard-panel-header">

              <div>
                <h3>Stock Attention</h3>

                <p>
                  Products below their target stock level.
                </p>
              </div>

              <Link
                to="/products"
                className="dashboard-text-link"
              >
                View products
              </Link>

            </div>

            {attentionProducts.length ===
            0 ? (

              <div className="dashboard-empty">
                <strong>No stock issues</strong>
                <span>
                  All products are above their
                  minimum thresholds.
                </span>
              </div>

            ) : (

              <div className="attention-list">

                {attentionProducts.map(
                  (product) => {

                    const stock =
                      Number(product.stock || 0);

                    const min =
                      Number(product.min_stock || 0);

                    const isOut =
                      stock <= 0;

                    return (
                      <div
                        className="attention-row"
                        key={product.id}
                      >

                        <div className="attention-product">

                          <div className="attention-avatar">
                            {String(
                              product.name
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {product.name}
                            </strong>

                            <span>
                              {product.sku}
                            </span>
                          </div>

                        </div>

                        <div className="attention-quantity">
                          <strong>
                            {stock}
                          </strong>

                          <span>
                            / {min} minimum
                          </span>
                        </div>

                        <span
                          className={`attention-status ${
                            isOut
                              ? "danger"
                              : "warning"
                          }`}
                        >
                          {isOut
                            ? "Out of stock"
                            : "Low stock"}
                        </span>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </section>

          <section className="dashboard-panel">

            <div className="dashboard-panel-header">

              <div>
                <h3>Quick Actions</h3>

                <p>
                  Frequently used inventory operations.
                </p>
              </div>

            </div>

            <div className="quick-actions">

              <QuickAction
                title="Receive Stock"
                description="Register incoming inventory"
                path="/operations/receipts"
                icon="receipt"
              />

              <QuickAction
                title="Delivery Order"
                description="Process outgoing inventory"
                path="/operations/deliveries"
                icon="delivery"
              />

              <QuickAction
                title="Internal Transfer"
                description="Move stock between locations"
                path="/operations/transfers"
                icon="transfer"
              />

              <QuickAction
                title="Stock Adjustment"
                description="Reconcile physical stock"
                path="/operations/adjustments"
                icon="adjustment"
              />

            </div>

          </section>

        </div>

        {/* RECENT MOVEMENTS */}

        <section className="dashboard-panel dashboard-recent">

          <div className="dashboard-panel-header">

            <div>
              <h3>Recent Movements</h3>

              <p>
                Latest stock changes recorded in the system.
              </p>
            </div>

            <Link
              to="/operations/move-history"
              className="dashboard-text-link"
            >
              View all
            </Link>

          </div>

          {loading ? (

            <div className="dashboard-empty">
              <span>
                Loading inventory activity...
              </span>
            </div>

          ) : dashboard.recentMovements.length ===
            0 ? (

            <div className="dashboard-empty">
              <strong>No movements yet</strong>
              <span>
                Inventory transactions will appear
                here.
              </span>
            </div>

          ) : (

            <div className="dashboard-table-wrap">

              <table className="dashboard-table">

                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>SKU</th>
                    <th>OPERATION</th>
                    <th>QUANTITY</th>
                    <th>REFERENCE</th>
                    <th>DATE</th>
                  </tr>
                </thead>

                <tbody>

                  {dashboard.recentMovements
                    .slice(0, 8)
                    .map((movement) => (

                      <tr key={movement.id}>

                        <td>
                          <div className="movement-product">

                            <div className="movement-avatar">
                              {String(
                                movement.product_name
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <strong>
                              {movement.product_name}
                            </strong>

                          </div>
                        </td>

                        <td className="muted-cell">
                          {movement.sku}
                        </td>

                        <td>
                          <span
                            className={`operation-badge ${String(
                              movement.type
                            ).toLowerCase()}`}
                          >
                            {movement.type}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {movement.quantity}
                          </strong>
                        </td>

                        <td className="muted-cell">
                          {movement.reference ||
                            "No reference"}
                        </td>

                        <td className="muted-cell">
                          {new Date(
                            movement.created_at
                          ).toLocaleDateString()}
                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </div>
    </Shell>
  );
}

function Kpi({
  title,
  value,
  description,
  icon,
  theme,
}) {
  return (
    <div className="dashboard-kpi">

      <div
        className={`kpi-icon ${theme}`}
      >
        <Icon
          name={icon}
          size={21}
        />
      </div>

      <div className="kpi-content">

        <span>{title}</span>

        <strong>{value}</strong>

        <small>
          {description}
        </small>

      </div>

    </div>
  );
}

function HealthBlock({
  label,
  value,
  tone,
}) {
  return (
    <div className="health-block">

      <span
        className={`health-marker ${tone}`}
      />

      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>

    </div>
  );
}

function OperationRow({
  label,
  value,
  icon,
}) {
  return (
    <div className="operation-row">

      <div className="operation-icon">
        <Icon
          name={icon}
          size={17}
        />
      </div>

      <span>{label}</span>

      <strong>{value}</strong>

    </div>
  );
}

function QuickAction({
  title,
  description,
  path,
  icon,
}) {
  return (
    <Link
      to={path}
      className="quick-action"
    >

      <div className="quick-action-icon">
        <Icon
          name={icon}
          size={17}
        />
      </div>

      <div className="quick-action-text">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <span className="quick-action-arrow">
        →
      </span>

    </Link>
  );
}