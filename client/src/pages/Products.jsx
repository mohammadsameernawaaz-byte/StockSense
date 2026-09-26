import { useEffect, useMemo, useState } from "react";
import Shell from "../components/Shell";
import { api } from "../api";

const CATEGORY_PRESETS = [
  "Raw Material",
  "Finished Goods",
  "Semi-Finished Goods",
  "Components",
  "Consumables",
  "Packaging",
  "Spare Parts",
];

const UOM_PRESETS = [
  "pcs",
  "kg",
  "g",
  "litre",
  "meter",
  "box",
  "set",
  "unit",
];

function Icon({ name, size = 18 }) {
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
    package: (
      <svg {...common}>
        <path d="M3 7.5 12 3l9 4.5L12 12 3 7.5Z" />
        <path d="M3 7.5V17l9 4 9-4V7.5" />
        <path d="M12 12v9" />
      </svg>
    ),

    search: (
      <svg {...common}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
    ),

    filter: (
      <svg {...common}>
        <path d="M4 6h16" />
        <path d="M7 12h10" />
        <path d="M10 18h4" />
      </svg>
    ),

    refresh: (
      <svg {...common}>
        <path d="M20 11a8 8 0 0 0-14.8-4" />
        <path d="M5 3v4h4" />
        <path d="M4 13a8 8 0 0 0 14.8 4" />
        <path d="M19 21v-4h-4" />
      </svg>
    ),

    plus: (
      <svg {...common}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    ),

    close: (
      <svg {...common}>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </svg>
    ),

    check: (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    ),

    warning: (
      <svg {...common}>
        <path d="M12 4 21 20H3L12 4Z" />
        <path d="M12 9v5" />
        <path d="M12 17h.01" />
      </svg>
    ),

    reorder: (
      <svg {...common}>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h10" />
        <path d="m16 15 3 3-3 3" />
      </svg>
    ),

    empty: (
      <svg {...common}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    ),
  };

  return icons[name] || null;
}

export default function Products() {
  const [products, setProducts] = useState([]);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    customCategory: "",
    uom: "",
    stock: "",
    min_stock: "",
    reorder_qty: "",
  });

  const [formError, setFormError] = useState("");

  async function loadProducts() {
    setPageLoading(true);

    try {
      const { response, data } = await api("/products");

      if (response.ok) {
        setProducts(Array.isArray(data) ? data : []);
      } else {
        setFormError(
          data.message || "Unable to load products."
        );
      }
    } catch {
      setFormError(
        "Unable to connect to the inventory server."
      );
    } finally {
      setPageLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const existing = products
      .map((product) => product.category)
      .filter(Boolean);

    return [
      "ALL",
      ...new Set([
        ...CATEGORY_PRESETS,
        ...existing,
      ]),
    ];
  }, [products]);

  const stats = useMemo(() => {
    let low = 0;
    let out = 0;
    let reorder = 0;

    products.forEach((product) => {
      const stock = Number(product.stock || 0);
      const minimum = Number(product.min_stock || 0);

      if (stock <= 0) {
        out++;
      } else if (stock <= minimum) {
        low++;
      }

      if (
        Number(product.reorder_qty || 0) > 0 &&
        stock <= minimum
      ) {
        reorder++;
      }
    });

    return {
      total: products.length,
      healthy: products.length - low - out,
      low,
      out,
      reorder,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const stock = Number(product.stock || 0);
      const minimum = Number(product.min_stock || 0);

      const status =
        stock <= 0
          ? "OUT"
          : stock <= minimum
          ? "LOW"
          : "HEALTHY";

      const matchesSearch =
        !query ||
        String(product.name || "")
          .toLowerCase()
          .includes(query) ||
        String(product.sku || "")
          .toLowerCase()
          .includes(query) ||
        String(product.category || "")
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "ALL" ||
        product.category === category;

      const matchesStatus =
        statusFilter === "ALL" ||
        statusFilter === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    products,
    search,
    category,
    statusFilter,
  ]);

  const openingStock =
    form.stock === ""
      ? 0
      : Number(form.stock);

  const minimumStock =
    form.min_stock === ""
      ? 0
      : Number(form.min_stock);

  const reorderQuantity =
    form.reorder_qty === ""
      ? 0
      : Number(form.reorder_qty);

  const preview =
    openingStock <= 0
      ? {
          tone: "out",
          title: "No opening stock",
          description:
            "This product will be created with zero available stock.",
        }
      : openingStock <= minimumStock
      ? {
          tone: "low",
          title: "Reorder threshold reached",
          description:
            reorderQuantity > 0
              ? `Suggested reorder quantity: ${reorderQuantity} ${form.uom || "units"}.`
              : "Set a reorder quantity to define the replenishment rule.",
        }
      : {
          tone: "healthy",
          title: "Healthy opening stock",
          description:
            "Opening stock is above the configured reorder point.",
        };

  function updateForm(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setFormError("");
  }

  function resetForm() {
    setForm({
      name: "",
      sku: "",
      category: "",
      customCategory: "",
      uom: "",
      stock: "",
      min_stock: "",
      reorder_qty: "",
    });

    setFormError("");
  }

  function openCreateForm() {
    resetForm();
    setOpen(true);
  }

  function generateSku() {
    if (!form.name.trim()) {
      setFormError(
        "Enter the product name first."
      );
      return;
    }

    const prefix = form.name
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 4)
      .toUpperCase();

    const suffix = Date.now()
      .toString()
      .slice(-4);

    updateForm(
      "sku",
      `${prefix || "PROD"}-${suffix}`
    );
  }

  async function createProduct(event) {
    event.preventDefault();
    setFormError("");

    const finalCategory =
      form.category === "CUSTOM"
        ? form.customCategory.trim()
        : form.category.trim();

    if (
      !form.name.trim() ||
      !form.sku.trim() ||
      !finalCategory ||
      !form.uom.trim()
    ) {
      setFormError(
        "Complete all required product fields."
      );
      return;
    }

    if (
      openingStock < 0 ||
      minimumStock < 0 ||
      reorderQuantity < 0
    ) {
      setFormError(
        "Stock values cannot be negative."
      );
      return;
    }

    if (
      reorderQuantity > 0 &&
      minimumStock === 0
    ) {
      setFormError(
        "Set a minimum stock/reorder point before adding a reorder quantity."
      );
      return;
    }

    setLoading(true);

    try {
      const { response, data } =
        await api("/products", {
          method: "POST",
          body: JSON.stringify({
            name: form.name.trim(),
            sku: form.sku.trim(),
            category: finalCategory,
            uom: form.uom.trim(),

            stock:
              form.stock === ""
                ? 0
                : openingStock,

            min_stock:
              form.min_stock === ""
                ? 0
                : minimumStock,

            reorder_qty:
              form.reorder_qty === ""
                ? 0
                : reorderQuantity,
          }),
        });

      if (!response.ok) {
        setFormError(
          data.message ||
            "Unable to create product."
        );
        return;
      }

      setOpen(false);
      resetForm();

      await loadProducts();
    } catch {
      setFormError(
        "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell
      title="Products"
      subtitle="Manage products and stock levels."
    >
      <div className="products-page">

        <div className="products-page-header">

          <div className="products-title-row">
            <div className="products-title-icon">
              <Icon
                name="package"
                size={19}
              />
            </div>

            <div>
              <h2>Product Inventory</h2>
              <p>
                Manage products, categories and
                replenishment rules.
              </p>
            </div>
          </div>

          <div className="products-header-actions">

            <button
              className="products-icon-button"
              onClick={loadProducts}
              title="Refresh inventory"
            >
              <Icon
                name="refresh"
                size={17}
              />
            </button>

            <button
              className="products-primary-button"
              onClick={openCreateForm}
            >
              <Icon
                name="plus"
                size={16}
              />
              Add Product
            </button>

          </div>

        </div>

        <div className="products-summary">

          <SummaryCard
            label="Total Products"
            value={stats.total}
            icon="package"
            tone="neutral"
          />

          <SummaryCard
            label="Healthy Stock"
            value={stats.healthy}
            icon="check"
            tone="healthy"
          />

          <SummaryCard
            label="Needs Reorder"
            value={stats.reorder}
            icon="reorder"
            tone="warning"
          />

          <SummaryCard
            label="Out of Stock"
            value={stats.out}
            icon="warning"
            tone="danger"
          />

        </div>

        <div className="products-filter-panel">

          <div className="products-search-box">

            <Icon
              name="search"
              size={17}
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search product, SKU or category..."
            />

          </div>

          <div className="products-filter-field">

            <Icon
              name="filter"
              size={15}
            />

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
            >
              {categories.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item === "ALL"
                    ? "All Categories"
                    : item}
                </option>
              ))}
            </select>

          </div>

          <select
            className="products-filter-select"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="ALL">
              All Stock Status
            </option>
            <option value="HEALTHY">
              Healthy Stock
            </option>
            <option value="LOW">
              Needs Reorder
            </option>
            <option value="OUT">
              Out of Stock
            </option>
          </select>

          <button
            className="products-reset-button"
            onClick={() => {
              setSearch("");
              setCategory("ALL");
              setStatusFilter("ALL");
            }}
          >
            Reset
          </button>

        </div>

        <div className="products-result-line">
          <span>
            Showing{" "}
            <strong>
              {filteredProducts.length}
            </strong>{" "}
            of{" "}
            <strong>
              {products.length}
            </strong>{" "}
            products
          </span>
        </div>

        <div className="products-table-card">

          {pageLoading ? (
            <div className="products-state">
              <div className="products-state-spinner" />
              <strong>
                Loading products
              </strong>
              <span>
                Fetching inventory data.
              </span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="products-state">

              <div className="products-state-icon">
                <Icon
                  name="empty"
                  size={22}
                />
              </div>

              <strong>
                No matching products
              </strong>

              <span>
                Try a different search or filter.
              </span>

            </div>
          ) : (

            <div className="products-table-wrap">

              <table className="products-table">

                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>SKU</th>
                    <th>CATEGORY</th>
                    <th>UNIT</th>
                    <th>STOCK</th>
                    <th>REORDER POINT</th>
                    <th>REORDER QTY</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredProducts.map((product) => {

                    const stock =
                      Number(product.stock || 0);

                    const minimum =
                      Number(
                        product.min_stock || 0
                      );

                    const reorderQty =
                      Number(
                        product.reorder_qty || 0
                      );

                    const status =
                      stock <= 0
                        ? "Out of Stock"
                        : stock <= minimum
                        ? "Needs Reorder"
                        : "Healthy";

                    const statusClass =
                      stock <= 0
                        ? "danger"
                        : stock <= minimum
                        ? "warning"
                        : "healthy";

                    return (
                      <tr key={product.id}>

                        <td>
                          <div className="products-product-cell">

                            <div className="products-product-avatar">
                              {product.name
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {product.name}
                              </strong>

                              <span>
                                Product #{product.id}
                              </span>
                            </div>

                          </div>
                        </td>

                        <td>
                          <span className="products-sku">
                            {product.sku}
                          </span>
                        </td>

                        <td>
                          {product.category}
                        </td>

                        <td>
                          {product.uom}
                        </td>

                        <td>
                          <strong>
                            {stock}
                          </strong>
                        </td>

                        <td>
                          {minimum}
                        </td>

                        <td>
                          {reorderQty || "—"}
                        </td>

                        <td>
                          <span
                            className={`products-status ${statusClass}`}
                          >
                            <span />
                            {status}
                          </span>
                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

      {open && (

        <div
          className="products-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setOpen(false);
            }
          }}
        >

          <div className="products-modal">

            <div className="products-modal-header">

              <div>
                <div className="products-modal-icon">
                  <Icon
                    name="package"
                    size={19}
                  />
                </div>

                <div>
                  <h2>
                    Add New Product
                  </h2>

                  <p>
                    Define the product and its
                    inventory rules.
                  </p>
                </div>
              </div>

              <button
                className="products-modal-close"
                onClick={() => setOpen(false)}
              >
                <Icon
                  name="close"
                  size={18}
                />
              </button>

            </div>

            <form onSubmit={createProduct}>

              <div className="products-modal-body">

                <div className="products-form-section">

                  <div className="products-section-title">
                    <strong>
                      Basic Information
                    </strong>

                    <span>
                      Product identification
                    </span>
                  </div>

                  <div className="products-form-grid">

                    <FormField
                      label="Product Name"
                      required
                      hint="Use the name your warehouse team recognizes."
                    >
                      <input
                        autoFocus
                        value={form.name}
                        onChange={(event) =>
                          updateForm(
                            "name",
                            event.target.value
                          )
                        }
                        placeholder="Example: Steel Rod"
                      />
                    </FormField>

                    <FormField
                      label="SKU / Product Code"
                      required
                      hint="A unique identifier for the product."
                    >
                      <div className="products-input-with-action">

                        <input
                          value={form.sku}
                          onChange={(event) =>
                            updateForm(
                              "sku",
                              event.target.value
                            )
                          }
                          placeholder="Example: STL-001"
                        />

                        <button
                          type="button"
                          onClick={generateSku}
                        >
                          Generate
                        </button>

                      </div>
                    </FormField>

                    <FormField
                      label="Category"
                      required
                      hint="Used for organization and filtering."
                    >
                      <select
                        value={form.category}
                        onChange={(event) =>
                          updateForm(
                            "category",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select category
                        </option>

                        {CATEGORY_PRESETS.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          )
                        )}

                        <option value="CUSTOM">
                          Custom Category
                        </option>
                      </select>

                      {form.category ===
                        "CUSTOM" && (
                        <input
                          className="products-category-custom"
                          value={form.customCategory}
                          onChange={(event) =>
                            updateForm(
                              "customCategory",
                              event.target.value
                            )
                          }
                          placeholder="Enter custom category"
                        />
                      )}

                    </FormField>

                    <FormField
                      label="Unit of Measure"
                      required
                      hint="How inventory quantity is counted."
                    >
                      <select
                        value={form.uom}
                        onChange={(event) =>
                          updateForm(
                            "uom",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select unit
                        </option>

                        {UOM_PRESETS.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          )
                        )}
                      </select>
                    </FormField>

                  </div>

                </div>

                <div className="products-form-section">

                  <div className="products-section-title">
                    <strong>
                      Inventory & Reordering
                    </strong>

                    <span>
                      Initial quantity and replenishment rules
                    </span>
                  </div>

                  <div className="products-form-grid">

                    <FormField
                      label="Initial Stock"
                      hint="Optional. Leave blank if the product arrives later through a receipt."
                    >
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.stock}
                        onChange={(event) =>
                          updateForm(
                            "stock",
                            event.target.value
                          )
                        }
                        placeholder="0"
                      />
                    </FormField>

                    <FormField
                      label="Minimum Stock / Reorder Point"
                      hint="When stock reaches this level, the product needs replenishment."
                    >
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.min_stock}
                        onChange={(event) =>
                          updateForm(
                            "min_stock",
                            event.target.value
                          )
                        }
                        placeholder="Example: 10"
                      />
                    </FormField>

                    <FormField
                      label="Reorder Quantity"
                      hint="Suggested quantity to replenish when the reorder point is reached."
                    >
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.reorder_qty}
                        onChange={(event) =>
                          updateForm(
                            "reorder_qty",
                            event.target.value
                          )
                        }
                        placeholder="Example: 50"
                      />
                    </FormField>

                  </div>

                  <div
                    className={`products-stock-preview ${preview.tone}`}
                  >

                    <div className="products-preview-icon">
                      <Icon
                        name={
                          preview.tone ===
                          "healthy"
                            ? "check"
                            : "warning"
                        }
                        size={18}
                      />
                    </div>

                    <div>
                      <strong>
                        {preview.title}
                      </strong>

                      <span>
                        {preview.description}
                      </span>
                    </div>

                  </div>

                </div>

                {formError && (
                  <div className="products-form-error">
                    {formError}
                  </div>
                )}

              </div>

              <div className="products-modal-footer">

                <button
                  type="button"
                  className="products-cancel-button"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="products-submit-button"
                  disabled={loading}
                >
                  {loading
                    ? "Creating Product..."
                    : "Create Product"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}
    </Shell>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
}) {
  return (
    <div className="products-summary-card">

      <div
        className={`products-summary-icon ${tone}`}
      >
        <Icon
          name={icon}
          size={18}
        />
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

    </div>
  );
}

function FormField({
  label,
  required,
  hint,
  children,
}) {
  return (
    <div className="products-form-field">

      <div className="products-form-label">

        <label>
          {label}

          {required && (
            <span>Required</span>
          )}
        </label>

        <small>
          {hint}
        </small>

      </div>

      {children}

    </div>
  );
}