import { NavLink, useNavigate } from "react-router-dom";
import { getUser } from "../api";

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
    dashboard: (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),

    products: (
      <svg {...common}>
        <path d="M3 7.5 12 3l9 4.5L12 12 3 7.5Z" />
        <path d="M3 7.5V17l9 4 9-4V7.5" />
        <path d="M12 12v9" />
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

    history: (
      <svg {...common}>
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),

    settings: (
      <svg {...common}>
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        <path d="m5.6 5.6 2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
        <circle cx="12" cy="12" r="3.5" />
      </svg>
    ),

    profile: (
      <svg {...common}>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5 21c.8-4 3.2-6 7-6s6.2 2 7 6" />
      </svg>
    ),

    logout: (
      <svg {...common}>
        <path d="M10 5H5v14h5" />
        <path d="M14 8l4 4-4 4" />
        <path d="M8 12h10" />
      </svg>
    ),
  };

  return icons[name] || null;
}

function StockSenseMark() {
  return (
    <div className="stocksense-mark">
      <svg
        viewBox="0 0 48 48"
        width="32"
        height="32"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="12"
          fill="#ff3b3b"
        />

        <path
          d="M15 15h13c3.9 0 6 2 6 5s-2.1 5-6 5H20"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <path
          d="M20 25h8c3.9 0 6 2 6 5s-2.1 5-6 5H15"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default function Layout({ children }) {
  const navigate = useNavigate();
  const user = getUser();

  const mainLinks = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "dashboard",
    },
    {
      label: "Products",
      path: "/products",
      icon: "products",
    },
  ];

  const operationLinks = [
    {
      label: "Receipts",
      path: "/operations/receipts",
      icon: "receipt",
    },
    {
      label: "Delivery Orders",
      path: "/operations/deliveries",
      icon: "delivery",
    },
    {
      label: "Internal Transfers",
      path: "/operations/transfers",
      icon: "transfer",
    },
    {
      label: "Adjustments",
      path: "/operations/adjustments",
      icon: "adjustment",
    },
    {
      label: "Move History",
      path: "/operations/move-history",
      icon: "history",
    },
  ];

  function logout() {
    localStorage.removeItem("stocksenseToken");
    localStorage.removeItem("stocksenseUser");
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-layout">

      <aside className="sidebar">

        <div className="sidebar-brand">
          <StockSenseMark />

          <div className="sidebar-brand-text">
            <strong>StockSense</strong>
            <small>Inventory Management</small>
          </div>
        </div>

        <div className="menu-heading">
          WORKSPACE
        </div>

        {mainLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `menu-item ${
                isActive ? "selected" : ""
              }`
            }
          >
            <span className="nav-icon">
              <Icon name={link.icon} size={17} />
            </span>

            <span className="nav-label">
              {link.label}
            </span>
          </NavLink>
        ))}

        <div className="menu-heading">
          OPERATIONS
        </div>

        {operationLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `menu-item ${
                isActive ? "selected" : ""
              }`
            }
          >
            <span className="nav-icon">
              <Icon name={link.icon} size={17} />
            </span>

            <span className="nav-label">
              {link.label}
            </span>
          </NavLink>
        ))}

        <div className="sidebar-bottom">

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `menu-item ${
                isActive ? "selected" : ""
              }`
            }
          >
            <span className="nav-icon">
              <Icon name="settings" size={17} />
            </span>

            <span className="nav-label">
              Settings
            </span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `menu-item ${
                isActive ? "selected" : ""
              }`
            }
          >
            <span className="nav-icon">
              <Icon name="profile" size={17} />
            </span>

            <span className="nav-label">
              My Profile
            </span>
          </NavLink>

          <button
            className="menu-item logout-menu"
            onClick={logout}
          >
            <span className="nav-icon">
              <Icon name="logout" size={17} />
            </span>

            <span className="nav-label">
              Logout
            </span>
          </button>

          <div className="sidebar-user">

            <div className="sidebar-user-avatar">
              {(user?.name || "M")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="sidebar-user-info">
              <strong>
                {user?.name ||
                  "Inventory Manager"}
              </strong>

              <span>
                {user?.email ||
                  "Administrator"}
              </span>
            </div>

          </div>

        </div>

      </aside>

      <main className="dashboard-main">
        {children}
      </main>

    </div>
  );
}