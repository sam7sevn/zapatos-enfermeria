import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, orderBy, query
} from "firebase/firestore";

// ============================================================
// 🔧 CONFIGURA AQUÍ TU CONTRASEÑA DE ADMIN Y TUS PRECIOS
// ============================================================
const ADMIN_PASSWORD = "Mellamo123";   // ← cambia esto
const MODELOS = {
  mujer:  { label: "👩 Dama",      precio: 45000 },
  hombre: { label: "👨 Caballero", precio: 48000 },
};
// ============================================================

const TALLAS = ["35","36","37","38","39","40","41","42"];

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

function calcStatus(pedido) {
  const pagado = (pedido.abonos || []).reduce((s, a) => s + a.monto, 0);
  if (pagado >= pedido.precio) return "entregado";
  if (pagado >= pedido.precio * 0.5) return pedido.produccionStatus || "produccion";
  return "pendiente";
}

const STATUS_LABELS = {
  pendiente:  { label: "Pendiente pago",     color: "#e53e3e", bg: "#fff5f5" },
  produccion: { label: "En producción",       color: "#d69e2e", bg: "#fffff0" },
  listo:      { label: "Listo para entrega",  color: "#2b6cb0", bg: "#ebf8ff" },
  entregado:  { label: "Entregado ✓",         color: "#276749", bg: "#f0fff4" },
};

// ─── Formulario estudiante ────────────────────────────────────────────────────
function FormularioEstudiante({ onEnviar }) {
  const [form, setForm] = useState({ nombre: "", telefono: "", talla: "37", modelo: "mujer" });
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const handleEnviar = async () => {
    if (!form.nombre.trim() || !form.telefono.trim()) {
      setError("Por favor completa tu nombre y teléfono.");
      return;
    }
    setEnviando(true);
    setError("");
    try {
      await onEnviar(form);
      setEnviado(true);
    } catch (e) {
      setError("Ocurrió un error, intenta de nuevo.");
    }
    setEnviando(false);
  };

  if (enviado) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#f7f3ff,#e8f4fd)" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "40px 32px", maxWidth: 420, width: "100%", textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize: 60 }}>✅</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, marginTop: 16, color: "#1a202c" }}>¡Pedido registrado!</div>
        <div style={{ color: "#718096", marginTop: 10, fontSize: 15 }}>
          Tu pedido fue recibido. Recuerda que la producción inicia cuando realices el <strong>abono del 50%</strong>.
        </div>
        <div style={{ marginTop: 20, background: "#f7f3ff", borderRadius: 12, padding: "14px 18px" }}>
          <div style={{ fontSize: 13, color: "#553c9a" }}>Abono mínimo para iniciar</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#553c9a" }}>{fmt(MODELOS[form.modelo].precio * 0.5)}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f7f3ff 0%,#e8f4fd 50%,#f0fff4 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", maxWidth: 440, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img src="/logo.png" style={{ width: 140, height: 140, objectFit: "contain" }} />
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "#1a202c", marginTop: 8 }}>Calzado de Enfermería</div>
          <div style={{ color: "#718096", fontSize: 13, marginTop: 4 }}>Inscripción · calzado de enfermería</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "#718096", fontWeight: 700 }}>NOMBRE COMPLETO</label>
            <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
              placeholder="Tu nombre completo"
              style={{ width: "100%", marginTop: 5, padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", fontFamily: "inherit" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#718096", fontWeight: 700 }}>TELÉFONO / WHATSAPP</label>
            <input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})}
              placeholder="3001234567"
              type="tel"
              style={{ width: "100%", marginTop: 5, padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", fontFamily: "inherit" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#718096", fontWeight: 700 }}>TALLA</label>
            <select value={form.talla} onChange={e => setForm({...form, talla: e.target.value})}
              style={{ width: "100%", marginTop: 5, padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", background: "#fff", fontFamily: "inherit" }}>
              {TALLAS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#718096", fontWeight: 700 }}>MODELO</label>
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              {Object.entries(MODELOS).map(([key, val]) => (
                <button key={key} onClick={() => setForm({...form, modelo: key})}
                  style={{
                    flex: 1, padding: "14px 10px", borderRadius: 12, cursor: "pointer", fontSize: 14,
                    border: form.modelo === key ? "2px solid #667eea" : "2px solid #e2e8f0",
                    background: form.modelo === key ? "#f3f0ff" : "#fff",
                    color: form.modelo === key ? "#553c9a" : "#4a5568", fontWeight: 600,
                    transition: "all 0.2s", textAlign: "center"
                  }}>
                  {val.label}<br/>
                  <span style={{ fontSize: 15 }}>{fmt(val.precio)}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: "#f7f3ff", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#553c9a" }}>💡 Abono mínimo (50%)</span>
            <span style={{ fontWeight: 700, fontSize: 18, color: "#553c9a" }}>{fmt(MODELOS[form.modelo].precio * 0.5)}</span>
          </div>

          {error && <div style={{ color: "#e53e3e", fontSize: 13, textAlign: "center" }}>{error}</div>}

          <button onClick={handleEnviar} disabled={enviando}
            style={{
              width: "100%", padding: "14px", borderRadius: 12,
              background: enviando ? "#a0aec0" : "linear-gradient(135deg,#667eea,#764ba2)",
              color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: enviando ? "not-allowed" : "pointer"
            }}>
            {enviando ? "Enviando..." : "Inscribir mi pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tarjeta de pedido (admin) ────────────────────────────────────────────────
function PedidoCard({ pedido, onAbonar, onUpdateStatus, onDelete }) {
  const [abonoInput, setAbonoInput] = useState("");
  const [showAbonos, setShowAbonos] = useState(false);
  const pagado = (pedido.abonos || []).reduce((s, a) => s + a.monto, 0);
  const restante = pedido.precio - pagado;
  const min50 = pedido.precio * 0.5;
  const pct = Math.min(100, Math.round((pagado / pedido.precio) * 100));
  const aprobado = pagado >= min50;
  const completado = pagado >= pedido.precio;
  const status = calcStatus(pedido);
  const st = STATUS_LABELS[status];

  const handleAbonar = () => {
    const monto = parseInt(abonoInput.replace(/\D/g, ""));
    if (!monto || monto <= 0) return;
    onAbonar(pedido.id, monto);
    setAbonoInput("");
  };

  return (
    <div style={{
      background: "#fff", borderRadius: 16,
      border: `2px solid ${aprobado ? "#68d391" : "#fed7d7"}`,
      padding: "18px 20px",
      boxShadow: aprobado ? "0 4px 20px rgba(72,187,120,0.1)" : "0 4px 20px rgba(229,62,62,0.07)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position:"absolute",top:0,left:0,right:0,height:4, background: aprobado ? "linear-gradient(90deg,#48bb78,#38a169)" : "linear-gradient(90deg,#fc8181,#e53e3e)" }} />

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
        <div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, color:"#1a202c" }}>{pedido.nombre}</div>
          <div style={{ color:"#718096", fontSize:13, marginTop:2 }}>
            📞 {pedido.telefono} &nbsp;·&nbsp; Talla {pedido.talla} &nbsp;·&nbsp; {MODELOS[pedido.modelo]?.label}
          </div>
          <div style={{ color:"#a0aec0", fontSize:11, marginTop:1 }}>Registrado: {pedido.fecha}</div>
        </div>
        <div style={{ background:st.bg, color:st.color, border:`1px solid ${st.color}30`, borderRadius:20, padding:"3px 12px", fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>
          {st.label}
        </div>
      </div>

      <div style={{ margin:"12px 0 8px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#718096", marginBottom:4 }}>
          <span>Pagado: <strong style={{ color: aprobado ? "#276749" : "#c53030" }}>{fmt(pagado)}</strong></span>
          <span>{pct}%</span>
        </div>
        <div style={{ height:10, background:"#edf2f7", borderRadius:10, overflow:"hidden", position:"relative" }}>
          <div style={{ height:"100%", width:`${pct}%`, background: completado ? "linear-gradient(90deg,#38a169,#276749)" : aprobado ? "linear-gradient(90deg,#68d391,#38a169)" : "linear-gradient(90deg,#fc8181,#e53e3e)", borderRadius:10, transition:"width 0.5s" }} />
          <div style={{ position:"absolute", top:0, bottom:0, left:"50%", width:2, background:"#2d3748", opacity:0.25 }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#a0aec0", marginTop:3 }}>
          <span>Precio: {fmt(pedido.precio)}</span>
          <span>Falta: {fmt(Math.max(0, restante))}</span>
        </div>
        {!aprobado && <div style={{ fontSize:11, color:"#e53e3e", marginTop:2 }}>⚠ Necesita {fmt(min50 - pagado)} más para iniciar producción</div>}
      </div>

      <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
        {!completado && (
          <div style={{ display:"flex", gap:6, flex:1, minWidth:180 }}>
            <input type="number" placeholder="Monto abono" value={abonoInput} onChange={e => setAbonoInput(e.target.value)} onKeyDown={e => e.key==="Enter" && handleAbonar()}
              style={{ flex:1, padding:"7px 10px", borderRadius:8, border:"1.5px solid #e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit" }} />
            <button onClick={handleAbonar} style={{ background:"linear-gradient(135deg,#667eea,#764ba2)", color:"#fff", border:"none", borderRadius:8, padding:"7px 13px", fontSize:13, cursor:"pointer", fontWeight:600 }}>+ Abonar</button>
          </div>
        )}
        <button onClick={() => setShowAbonos(!showAbonos)} style={{ background:"#edf2f7", border:"none", borderRadius:8, padding:"7px 11px", fontSize:12, cursor:"pointer", color:"#4a5568" }}>
          {showAbonos ? "Ocultar" : `Pagos (${(pedido.abonos||[]).length})`}
        </button>
        {status === "produccion" && (
          <button onClick={() => onUpdateStatus(pedido.id, "listo")} style={{ background:"#ebf8ff", border:"1.5px solid #90cdf4", borderRadius:8, padding:"7px 11px", fontSize:12, cursor:"pointer", color:"#2b6cb0" }}>✓ Listo</button>
        )}
        {status === "listo" && (
          <button onClick={() => onUpdateStatus(pedido.id, "entregado")} style={{ background:"#f0fff4", border:"1.5px solid #9ae6b4", borderRadius:8, padding:"7px 11px", fontSize:12, cursor:"pointer", color:"#276749" }}>📦 Entregado</button>
        )}
        <button onClick={() => onDelete(pedido.id)} style={{ background:"#fff5f5", border:"1.5px solid #fed7d7", borderRadius:8, padding:"7px 11px", fontSize:12, cursor:"pointer", color:"#c53030" }}>🗑</button>
      </div>

      {showAbonos && (pedido.abonos||[]).length > 0 && (
        <div style={{ marginTop:10, borderTop:"1px solid #edf2f7", paddingTop:8 }}>
          {(pedido.abonos||[]).map((a, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"3px 0", borderBottom:"1px dashed #edf2f7" }}>
              <span style={{ color:"#4a5568" }}>{a.fecha}</span>
              <span style={{ color:"#276749", fontWeight:600 }}>+{fmt(a.monto)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Panel Admin ──────────────────────────────────────────────────────────────
function AdminPanel({ pedidos, onAbonar, onUpdateStatus, onDelete, onLogout }) {
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const filtrados = pedidos.filter(p => {
    const pagado = (p.abonos||[]).reduce((s,a)=>s+a.monto,0);
    const aprobado = pagado >= p.precio * 0.5;
    const status = calcStatus(p);
    if (filtro === "aprobados" && !aprobado) return false;
    if (filtro === "pendientes" && aprobado) return false;
    if (filtro === "produccion" && status !== "produccion") return false;
    if (filtro === "entregados" && status !== "entregado") return false;
    if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const totalRecaudado = pedidos.reduce((s,p)=>s+(p.abonos||[]).reduce((ss,a)=>ss+a.monto,0),0);
  const totalEsperado = pedidos.reduce((s,p)=>s+p.precio,0);
  const aprobados = pedidos.filter(p=>(p.abonos||[]).reduce((s,a)=>s+a.monto,0)>=p.precio*0.5).length;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#f7f3ff,#e8f4fd,#f0fff4)" }}>
      <div style={{ background:"linear-gradient(135deg,#2d3748,#1a202c)", padding:"24px 20px 18px", color:"#fff" }}>
        <div style={{ maxWidth:820, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24 }}>👟 Panel de Administración</div>
              <div style={{ color:"#a0aec0", fontSize:12, marginTop:2 }}>Calzado de Enfermería · 3er semestre</div>
            </div>
            <button onClick={onLogout} style={{ background:"rgba(255,255,255,0.1)", color:"#fff", border:"1px solid rgba(255,255,255,0.2)", borderRadius:8, padding:"8px 14px", fontSize:13, cursor:"pointer" }}>
              Cerrar sesión
            </button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginTop:18 }}>
            {[
              { label:"Total pedidos", value:pedidos.length, icon:"📋" },
              { label:"Con 50%+", value:aprobados, icon:"✅" },
              { label:"Recaudado", value:fmt(totalRecaudado), icon:"💵" },
              { label:"Por cobrar", value:fmt(Math.max(0,totalEsperado-totalRecaudado)), icon:"⏳" },
            ].map((s,i) => (
              <div key={i} style={{ background:"rgba(255,255,255,0.08)", borderRadius:12, padding:"10px 12px" }}>
                <div style={{ fontSize:18 }}>{s.icon}</div>
                <div style={{ fontSize:17, fontWeight:700, marginTop:3 }}>{s.value}</div>
                <div style={{ fontSize:10, color:"#a0aec0", marginTop:1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:820, margin:"0 auto", padding:"18px 14px" }}>
        <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
          <input placeholder="🔍 Buscar por nombre..." value={busqueda} onChange={e=>setBusqueda(e.target.value)}
            style={{ flex:1, minWidth:160, padding:"8px 14px", borderRadius:20, border:"1.5px solid #e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit" }} />
          {["todos","aprobados","pendientes","produccion","entregados"].map(f => (
            <button key={f} onClick={()=>setFiltro(f)} style={{
              padding:"7px 13px", borderRadius:20, border:"none", cursor:"pointer",
              background: filtro===f ? "#2d3748" : "#e2e8f0",
              color: filtro===f ? "#fff" : "#4a5568", fontSize:12, fontWeight:600
            }}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
          ))}
        </div>

        {filtrados.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", color:"#a0aec0" }}>
            <div style={{ fontSize:48 }}>👟</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, marginTop:10, color:"#4a5568" }}>
              {pedidos.length===0 ? "Aún no hay pedidos" : "Sin resultados"}
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {filtrados.map(p => (
              <PedidoCard key={p.id} pedido={p} onAbonar={onAbonar} onUpdateStatus={onUpdateStatus} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Login Admin ──────────────────────────────────────────────────────────────
function LoginAdmin({ onLogin }) {
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const handleLogin = () => {
    if (pass === ADMIN_PASSWORD) { onLogin(); setError(false); }
    else setError(true);
  };
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#2d3748,#1a202c)" }}>
      <div style={{ background:"#fff", borderRadius:20, padding:"36px 30px", maxWidth:340, width:"100%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
        <div style={{ fontSize:40 }}>🔐</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, marginTop:12, color:"#1a202c" }}>Admin</div>
        <input type="password" placeholder="Contraseña" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}
          style={{ width:"100%", marginTop:20, padding:"12px 14px", borderRadius:10, border:`1.5px solid ${error?"#e53e3e":"#e2e8f0"}`, fontSize:14, outline:"none", fontFamily:"inherit" }} />
        {error && <div style={{ color:"#e53e3e", fontSize:12, marginTop:6 }}>Contraseña incorrecta</div>}
        <button onClick={handleLogin} style={{ width:"100%", marginTop:14, padding:"13px", borderRadius:10, background:"linear-gradient(135deg,#667eea,#764ba2)", color:"#fff", border:"none", fontSize:15, fontWeight:700, cursor:"pointer" }}>
          Entrar
        </button>
      </div>
    </div>
  );
}

// ─── App principal ────────────────────────────────────────────────────────────
export default function App() {
  const [pedidos, setPedidos] = useState([]);
  const [vista, setVista] = useState("estudiante"); // "estudiante" | "login" | "admin"
  const [loading, setLoading] = useState(true);

  // Escuchar pedidos en tiempo real desde Firebase
  useEffect(() => {
    const q = query(collection(db, "pedidos"), orderBy("fechaTimestamp", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPedidos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  // Detectar si la URL tiene ?admin para ir al login
  useEffect(() => {
    if (window.location.search.includes("admin")) setVista("login");
  }, []);

  const handleNuevoPedido = async (form) => {
    await addDoc(collection(db, "pedidos"), {
      ...form,
      precio: MODELOS[form.modelo].precio,
      abonos: [],
      produccionStatus: null,
      fecha: new Date().toLocaleDateString("es-CO"),
      fechaTimestamp: Date.now(),
    });
  };

  const handleAbonar = async (id, monto) => {
    const pedido = pedidos.find(p => p.id === id);
    const nuevosAbonos = [...(pedido.abonos||[]), { monto, fecha: new Date().toLocaleDateString("es-CO") }];
    await updateDoc(doc(db, "pedidos", id), { abonos: nuevosAbonos });
  };

  const handleUpdateStatus = async (id, st) => {
    await updateDoc(doc(db, "pedidos", id), { produccionStatus: st });
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este pedido?")) return;
    await deleteDoc(doc(db, "pedidos", id));
  };

  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"'Playfair Display',serif",fontSize:20,color:"#667eea" }}>
      Cargando...
    </div>
  );

  if (vista === "estudiante") return <FormularioEstudiante onEnviar={handleNuevoPedido} />;
  if (vista === "login") return <LoginAdmin onLogin={() => setVista("admin")} />;
  if (vista === "admin") return (
    <AdminPanel
      pedidos={pedidos}
      onAbonar={handleAbonar}
      onUpdateStatus={handleUpdateStatus}
      onDelete={handleDelete}
      onLogout={() => setVista("login")}
    />
  );
}
