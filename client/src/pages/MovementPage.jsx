import { useEffect, useState } from "react";
import Shell from "../components/Shell";
import { api } from "../api";

export default function MovementPage({ type, title, description, icon, quantityLabel, referenceLabel, showLocations=false }) {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api("/products").then(({response,data}) => { if(response.ok) setProducts(data); });
  }, []);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const {response,data} = await api("/movements", {
        method:"POST",
        body:JSON.stringify({
          productId:Number(productId),
          type,
          quantity:Number(quantity),
          fromLocation:showLocations ? fromLocation || null : null,
          toLocation:showLocations ? toLocation || null : null,
          reference:reference || null,
        })
      });
      if(!response.ok) return alert(data.message || "Unable to complete operation.");
      alert(`${title} completed successfully.`);
      setProductId(""); setQuantity(""); setFromLocation(""); setToLocation(""); setReference("");
    } finally { setLoading(false); }
  }

  return <Shell title={title} subtitle="Manage and monitor your inventory operations.">
    <div className="content">
      <div className="content-heading"><div><h2>{title}</h2><p>{description}</p></div></div>
      <form className="product-panel" onSubmit={submit}>
        <div className="form-grid">
          <div className="field"><label>Product</label><select value={productId} onChange={(e)=>setProductId(e.target.value)} required>
            <option value="">Select a product</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
          </select></div>
          <Field label={quantityLabel} type="number" placeholder="10" value={quantity} onChange={setQuantity}/>
          {showLocations && <>
            <Field label="From Location" placeholder="Main Warehouse" value={fromLocation} onChange={setFromLocation} required={false}/>
            <Field label="To Location" placeholder="Production Floor" value={toLocation} onChange={setToLocation} required={false}/>
          </>}
          <Field label={referenceLabel} placeholder="Optional" value={reference} onChange={setReference} required={false}/>
        </div>
        <button className="red-button" disabled={loading || !products.length}>{loading ? "Processing..." : `${icon} Submit`}</button>
      </form>
    </div>
  </Shell>;
}

function Field({label,placeholder,value,onChange,type="text",required=true}) {
  return <div className="field"><label>{label}</label><input type={type} placeholder={placeholder} value={value} onChange={(e)=>onChange(e.target.value)} required={required}/></div>;
}
