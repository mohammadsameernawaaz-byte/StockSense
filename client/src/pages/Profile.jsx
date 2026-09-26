import Shell from "../components/Shell";
import { getUser } from "../api";

export default function Profile() {
  const user = getUser();
  return <Shell title="My Profile" subtitle="View your StockSense account details.">
    <div className="content">
      <div className="panel" style={{padding:24}}>
        <h2>{user?.name || "Inventory Manager"}</h2>
        <p>{user?.email || "Administrator"}</p>
        <p>Role: {user?.role || "MANAGER"}</p>
      </div>
    </div>
  </Shell>;
}
