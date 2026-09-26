import { useEffect, useState } from "react";
import Shell from "../components/Shell";
import { api } from "../api";

export default function MoveHistory() {
  const [rows,setRows]=useState([]);
  useEffect(()=>{api("/movements").then(({response,data})=>{if(response.ok)setRows(data);});},[]);
  return <Shell title="Move History" subtitle="Complete inventory movement history.">
    <div className="content">
      <div className="panel">
        {rows.length ? <table>
          <thead><tr><th>PRODUCT</th><th>SKU</th><th>TYPE</th><th>QUANTITY</th><th>FROM → TO</th><th>REFERENCE</th><th>DATE</th></tr></thead>
          <tbody>{rows.map(r=><tr key={r.id}>
            <td><strong>{r.product_name}</strong></td><td>{r.sku}</td><td><span className={`status ${r.type.toLowerCase()}`}>{r.type}</span></td><td>{r.quantity}</td>
            <td>{r.from_location||r.to_location?`${r.from_location||"—"} → ${r.to_location||"—"}`:"—"}</td><td>{r.reference||"—"}</td><td>{new Date(r.created_at).toLocaleDateString()}</td>
          </tr>)}</tbody>
        </table> : <div className="empty-state"><div className="empty-symbol">◷</div><h3>No movements yet</h3><p>Every operation will appear here.</p></div>}
      </div>
    </div>
  </Shell>;
}
