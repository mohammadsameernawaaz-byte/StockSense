export default function PageHeader({ title, subtitle }) {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("stocksenseUser") || "null");
    } catch {
      return null;
    }
  })();

  return (
    <header className="dashboard-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="header-user">
        <div className="notification">♢</div>
        <div className="header-avatar">{(user?.name || "M").charAt(0).toUpperCase()}</div>
      </div>
    </header>
  );
}
