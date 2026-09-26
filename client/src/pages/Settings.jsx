import Shell from "../components/Shell";

export default function Settings() {
  return <Shell title="Settings" subtitle="Manage your inventory workspace settings.">
    <div className="content">
      <div className="panel" style={{padding:24}}>
        <h2>Warehouse Settings</h2>
        <p>Warehouse and location configuration will be connected to the backend.</p>
      </div>
    </div>
  </Shell>;
}
