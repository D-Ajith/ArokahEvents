import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

/* ── Helpers ── */
const displayTime = (event) => {
  const start = event.startTime12h || event.startTime || "";
  const end   = event.endTime12h   || event.endTime   || "";
  if (!start && !end) return null;
  if (!end) return start;
  return `${start} – ${end}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const extractPrice = (p) => {
  if (!p || String(p).toLowerCase() === "free") return 0;
  const m = String(p).match(/\d+/);
  return m ? parseInt(m[0]) : 0;
};

const CATEGORY_CONFIG = {
  game:  { label: "Games",  icon: "🎮", color: "#702BDD" },
  food:  { label: "Food",   icon: "🍽️", color: "#059669" },
  music: { label: "Music",  icon: "🎵", color: "#7C3AED" },
  other: { label: "Extras", icon: "✨", color: "#10B981" },
};

/* ══════════════════════════════════════════════════════════
   SERVICES PAGE
══════════════════════════════════════════════════════════ */
function Services() {
  const [events, setEvents]     = useState([]);
  const [filter, setFilter]     = useState("all");
  const [loading, setLoading]   = useState(true);
  const [featured, setFeatured] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => {
        const order = { live: 0, upcoming: 1 };
        const diff  = (order[a.status] ?? 2) - (order[b.status] ?? 2);
        return diff !== 0 ? diff : (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0);
      });
      setEvents(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (events.length <= 1) return;
    const t = setInterval(() => setFeatured(p => (p + 1) % Math.min(events.length, 4)), 4500);
    return () => clearInterval(t);
  }, [events]);

  const liveCount     = events.filter((e) => e.status === "live").length;
  const upcomingCount = events.filter((e) => e.status === "upcoming").length;
  const filtered      = filter === "all" ? events : events.filter((e) => e.status === filter);
  const bannerEvents  = events.slice(0, 4);
  const featuredEvent = bannerEvents[featured];

  const FILTERS = [
    { key: "all",      icon: "⚡", label: "All Events",  count: events.length },
    { key: "live",     icon: "🟢", label: "Live Now",    count: liveCount },
    { key: "upcoming", icon: "📅", label: "Coming Soon", count: upcomingCount },
  ];

  return (
    <div className="s-root">

      {/* ════ HERO ════ */}
      <section className="s-hero">
        {featuredEvent ? (
          <>
            <div className="s-hero-bg"
              style={{ backgroundImage: featuredEvent.mainImage ? `url(${featuredEvent.mainImage})` : "none" }} />
            <div className="s-hero-overlay" />
            <div className="s-hero-inner">
              <div className="s-hero-text">
                <div className="s-hero-badges">
                  {featuredEvent.status === "live" && (
                    <span className="s-badge-live"><span className="s-pdot" />LIVE NOW</span>
                  )}
                  {featuredEvent.status === "upcoming" && (
                    <span className="s-badge-upcoming">📅 UPCOMING</span>
                  )}
                  {featuredEvent.type && (
                    <span className="s-badge-type">{featuredEvent.type}</span>
                  )}
                </div>
                <h1 className="s-hero-title">{featuredEvent.title}</h1>
                {featuredEvent.description && (
                  <p className="s-hero-desc">{featuredEvent.description}</p>
                )}
                <div className="s-hero-meta">
                  {formatDate(featuredEvent.eventDate) && <span>📅 {formatDate(featuredEvent.eventDate)}</span>}
                  {displayTime(featuredEvent) && <span>⏰ {displayTime(featuredEvent)}</span>}
                  {featuredEvent.location && <span>📍 {featuredEvent.location}</span>}
                </div>
                <div className="s-hero-cta-row">
                  <button className="s-hero-btn" onClick={() => navigate(`/services/${featuredEvent.id}`)}>
                    {featuredEvent.status === "live" ? "🎟️ Book Now" : "View & Book →"}
                  </button>
                  <div className="s-hero-price-block">
                    {extractPrice(featuredEvent.price) > 0
                      ? <><span className="s-hero-price-amt">₹{extractPrice(featuredEvent.price).toLocaleString()}</span><span className="s-hero-price-label">/person</span></>
                      : <span className="s-hero-free">✅ Free Entry</span>}
                  </div>
                </div>
              </div>
              {featuredEvent.mainImage && (
                <div className="s-hero-thumb">
                  <img src={featuredEvent.mainImage} alt={featuredEvent.title} />
                </div>
              )}
            </div>
            {bannerEvents.length > 1 && (
              <div className="s-dots">
                {bannerEvents.map((_, i) => (
                  <button key={i} onClick={() => setFeatured(i)}
                    className={`s-dot${i === featured ? " s-dot-on" : ""}`} />
                ))}
              </div>
            )}
          </>
        ) : !loading && (
          <div className="s-hero-empty"><span>🎭</span><p>Events coming soon!</p></div>
        )}
      </section>

      {/* ════ CONTENT ════ */}
      <div className="s-main">

        {/* Stats */}
        {!loading && events.length > 0 && (
          <div className="s-stats-row">
            <div className="s-stat-card">
              <span className="s-stat-num">{events.length}</span>
              <span className="s-stat-lbl">Total</span>
            </div>
            <div className="s-stat-sep" />
            <div className="s-stat-card">
              <span className="s-stat-num s-green">{liveCount}</span>
              <span className="s-stat-lbl">Live Now</span>
            </div>
            <div className="s-stat-sep" />
            <div className="s-stat-card">
              <span className="s-stat-num s-purple">{upcomingCount}</span>
              <span className="s-stat-lbl">Upcoming</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="s-filters">
          {FILTERS.map(({ key, icon, label, count }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`s-filter${filter === key ? " s-filter-on" : ""}`}>
              <span className="s-filter-icon">{icon}</span>
              <span className="s-filter-label">{label}</span>
              <span className={`s-filter-badge${filter === key ? " s-filter-badge-on" : ""}`}>{count}</span>
            </button>
          ))}
        </div>

        {/* Section heading */}
        <div className="s-section-row">
          <h2 className="s-section-title">
            {filter === "all"      && "All Events"}
            {filter === "live"     && <><span className="s-live-dot" />Live Right Now</>}
            {filter === "upcoming" && "Coming Soon"}
          </h2>
          <span className="s-section-count">{filtered.length} event{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Skeletons */}
        {loading && (
          <div className="s-grid">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="s-skel">
                <div className="s-skel-img" />
                <div className="s-skel-body">
                  <div className="s-skel-line" style={{width:"70%"}} />
                  <div className="s-skel-line" style={{width:"45%"}} />
                  <div className="s-skel-line" style={{width:"100%",height:40,borderRadius:10,marginTop:6}} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="s-empty">
            <span className="s-empty-ico">🎭</span>
            <p className="s-empty-title">
              {filter === "all" ? "No events yet" : `No ${filter === "live" ? "live" : "upcoming"} events right now`}
            </p>
            <p className="s-empty-sub">Something exciting is on the way — check back soon!</p>
            {filter !== "all" && (
              <button onClick={() => setFilter("all")} className="s-empty-btn">Browse all events</button>
            )}
          </div>
        )}

        {/* Cards */}
        {!loading && filtered.length > 0 && (
          <div className="s-grid">
            {filtered.map((event, idx) => (
              <EventCard key={event.id} event={event} idx={idx}
                onClick={() => navigate(`/services/${event.id}`)} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --purple: #330962;
          --purple-dark: #330962;
          --purple-light: #EEE8FF;
          --green: #059669;
          --green-dark: #047857;
          --green-light: #D1FAE5;
          --green-mid: #6EE7B7;
          --bg: #F5F3FF;
          --border: #DDD5F5;
          --text: #120A2E;
          --text-mid: #3D2E66;
          --text-soft: #7A6A9E;
          --white: #ffffff;
        }

        .s-root {
          font-family: 'Outfit', sans-serif;
          background: var(--bg);
          min-height: 100vh;
          padding-top: 56px;
          color: var(--text);
        }

        /* ── HERO ── */
        .s-hero { position: relative; height: 420px; overflow: hidden; background: #1a0a3a; }
        @media(max-width:768px){ .s-hero{ height: auto; min-height: 320px; } }

        .s-hero-bg {
          position: absolute; inset: -10px;
          background-size: cover; background-position: center;
          filter: blur(28px) brightness(0.22) saturate(1.6);
        }
        .s-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(130deg, rgba(10,3,30,.97) 0%, rgba(10,3,30,.75) 55%, rgba(112,43,221,.3) 100%);
        }
        .s-hero-inner {
          position: relative; z-index: 2;
          width: 90%; max-width: 1280px; margin: 0 auto;
          display: flex; align-items: center; gap: 40px;
          height: 420px; padding: 32px 0;
        }
        @media(max-width:768px){
          .s-hero-inner{ flex-direction:column; align-items:flex-start; justify-content:flex-end; height:auto; padding:20px 0 48px; gap:0; }
        }
        .s-hero-text { flex: 1; min-width: 0; }
        .s-hero-badges { display:flex; gap:7px; flex-wrap:wrap; margin-bottom:10px; }

        .s-badge-live {
          display:inline-flex; align-items:center; gap:6px;
          background:var(--green); color:#fff;
          font-size:10px; font-weight:800; letter-spacing:.1em;
          padding:5px 12px; border-radius:100px;
          box-shadow:0 0 18px rgba(5,150,105,.5);
        }
        .s-pdot { width:7px; height:7px; border-radius:50%; background:#fff; animation:pdot 1.2s infinite; flex-shrink:0; }
        @keyframes pdot{ 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.5)} }

        .s-badge-upcoming {
          display:inline-flex; align-items:center; gap:5px;
          background:rgba(112,43,221,.3); color:#D4BBFF;
          border:1px solid rgba(112,43,221,.4);
          font-size:10px; font-weight:800; letter-spacing:.08em;
          padding:5px 12px; border-radius:100px;
        }
        .s-badge-type {
          background:rgba(255,255,255,.12); color:rgba(255,255,255,.85);
          border:1px solid rgba(255,255,255,.2);
          font-size:10px; font-weight:600; padding:5px 12px; border-radius:100px;
        }

        .s-hero-title {
          font-family:'Playfair Display',serif;
          font-size:clamp(20px,4vw,46px); font-weight:800;
          color:#fff; line-height:1.1; margin-bottom:10px;
          text-shadow:0 2px 20px rgba(0,0,0,.6);
        }
        .s-hero-desc {
          font-size:13px; color:rgba(255,255,255,.72); line-height:1.6;
          max-width:450px; margin-bottom:14px;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }
        @media(max-width:480px){ .s-hero-desc{ display:none; } }

        .s-hero-meta { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:20px; }
        .s-hero-meta span {
          font-size:11px; font-weight:600; color:rgba(255,255,255,.85);
          background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.18);
          padding:5px 10px; border-radius:7px;
        }
        @media(max-width:480px){ .s-hero-meta span{ font-size:11px; padding:4px 9px; } }

        .s-hero-cta-row { display:flex; align-items:center; gap:18px; flex-wrap:wrap; }
        @media(max-width:480px){ .s-hero-cta-row{ flex-direction:column; align-items:flex-start; gap:10px; width:100%; } }

        .s-hero-btn {
          background:linear-gradient(135deg,var(--purple),var(--purple-dark));
          color:#fff; border:none; cursor:pointer;
          font-family:'Outfit',sans-serif; font-size:14px; font-weight:800;
          padding:12px 26px; border-radius:11px;
          box-shadow:0 6px 24px #330962; transition:all .2s; white-space:nowrap;
        }
        .s-hero-btn:hover{ transform:translateY(-2px); box-shadow:0 10px 32px #330962; }
        .s-hero-btn:active{ transform:scale(.97); }
        @media(max-width:480px){ .s-hero-btn{ width:100%; text-align:center; padding:13px; } }

        .s-hero-price-block { display:flex; align-items:baseline; gap:3px; }
        .s-hero-price-amt { font-size:24px; font-weight:900; color:#fff; }
        .s-hero-price-label { font-size:11px; color:rgba(255,255,255,.45); }
        .s-hero-free { font-size:14px; font-weight:800; color:var(--green-mid); }

        .s-hero-thumb {
          width:230px; flex-shrink:0; border-radius:14px; overflow:hidden; aspect-ratio:3/2;
          box-shadow:0 20px 56px rgba(0,0,0,.6); border:2px solid rgba(112,43,221,.35);
        }
        .s-hero-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
        @media(max-width:900px){ .s-hero-thumb{ display:none; } }

        .s-dots { position:absolute; bottom:14px; left:50%; transform:translateX(-50%); display:flex; gap:5px; z-index:3; }
        .s-dot { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,.3); border:none; cursor:pointer; transition:all .3s; padding:0; }
        .s-dot-on { width:20px; border-radius:4px; background:var(--purple); }

        .s-hero-empty {
          position:relative; z-index:2; height:100%;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:14px; color:rgba(255,255,255,.4);
        }
        .s-hero-empty span{ font-size:52px; }
        .s-hero-empty p{ font-size:15px; font-weight:600; }

        /* ── MAIN ── */
        .s-main { width:90%; max-width:1280px; margin:0 auto; padding:22px 0 64px; }

        /* Stats */
        .s-stats-row {
          display:flex; align-items:center;
          background:var(--white); border:1.5px solid var(--border);
          border-radius:14px; padding:14px 22px; gap:20px;
          margin-bottom:18px; width:fit-content;
          box-shadow:0 2px 14px rgba(112,43,221,.09);
        }
        @media(max-width:480px){ .s-stats-row{ width:100%; justify-content:space-around; padding:12px 10px; gap:0; } }
        .s-stat-card{ display:flex; flex-direction:column; align-items:center; gap:2px; }
        .s-stat-num{ font-size:26px; font-weight:900; color:var(--text); line-height:1; }
        .s-stat-lbl{ font-size:10px; font-weight:700; color:var(--text-soft); text-transform:uppercase; letter-spacing:.06em; }
        .s-stat-sep{ width:1px; height:34px; background:var(--border); }
        .s-green{ color:var(--green) !important; }
        .s-purple{ color:var(--purple) !important; }

        /* Filters */
        .s-filters{ display:flex; gap:7px; flex-wrap:wrap; margin-bottom:20px; }
        .s-filter {
          display:flex; align-items:center; gap:6px;
          background:var(--white); border:1.5px solid var(--border);
          color:var(--text-mid); cursor:pointer;
          font-family:'Outfit',sans-serif; font-size:13px; font-weight:700;
          padding:9px 15px; border-radius:11px; transition:all .2s;
          box-shadow:0 1px 5px rgba(112,43,221,.06);
        }
        .s-filter:hover{ border-color:var(--purple); color:var(--purple); }
        .s-filter-on{
          background:var(--purple) !important; border-color:var(--purple) !important;
          color:#fff !important; box-shadow:0 4px 16px rgba(112,43,221,.32) !important;
        }
        .s-filter-icon{ font-size:14px; }
        .s-filter-label{ white-space:nowrap; }
        .s-filter-badge{
          font-size:10px; font-weight:800;
          background:var(--purple-light); color:var(--purple);
          padding:2px 6px; border-radius:100px;
        }
        .s-filter-badge-on{ background:rgba(255,255,255,.25); color:#fff; }
        @media(max-width:420px){
          .s-filter{ padding:8px 11px; font-size:12px; gap:4px; }
          .s-filter-label{ font-size:11px; }
        }

        /* Section heading */
        .s-section-row{ display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .s-section-title{
          font-family:'Playfair Display',serif;
          font-size:clamp(17px,2.5vw,24px); font-weight:700; color:var(--text);
          display:flex; align-items:center; gap:9px;
        }
        .s-live-dot{
          display:inline-block; width:9px; height:9px; border-radius:50%;
          background:var(--green); flex-shrink:0; animation:pdot 1.2s infinite;
        }
        .s-section-count{ font-size:12px; font-weight:600; color:var(--text-soft); white-space:nowrap; }

        /* Skeleton */
        .s-skel{ background:var(--white); border-radius:16px; overflow:hidden; border:1.5px solid var(--border); }
        .s-skel-img{ height:150px; background:linear-gradient(90deg,#ede9ff 25%,#ddd5f5 50%,#ede9ff 75%); background-size:200% 100%; animation:shimmer 1.6s infinite; }
        .s-skel-body{ padding:14px; display:flex; flex-direction:column; gap:8px; }
        .s-skel-line{ height:11px; border-radius:5px; background:linear-gradient(90deg,#ede9ff 25%,#ddd5f5 50%,#ede9ff 75%); background-size:200% 100%; animation:shimmer 1.6s infinite; }
        @keyframes shimmer{ 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* Empty */
        .s-empty{ text-align:center; padding:70px 20px; }
        .s-empty-ico{ font-size:56px; display:block; margin-bottom:14px; }
        .s-empty-title{ font-size:18px; font-weight:800; color:var(--text); margin-bottom:7px; }
        .s-empty-sub{ font-size:13px; color:var(--text-soft); margin-bottom:20px; }
        .s-empty-btn{
          background:var(--white); border:1.5px solid var(--border);
          color:var(--text-mid); cursor:pointer;
          font-family:'Outfit',sans-serif; font-size:13px; font-weight:700;
          padding:10px 22px; border-radius:11px; transition:all .2s;
        }
        .s-empty-btn:hover{ border-color:var(--purple); color:var(--purple); }

        /* ── GRID ── */
        /* Desktop: 3 cols | Tablet: 2 cols | Mobile: 1 col compact */
        .s-grid{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:18px;
        }
        @media(max-width:1024px){ .s-grid{ grid-template-columns:repeat(2,1fr); } }
        @media(max-width:600px){
          /* Mobile: single column, horizontal card layout */
          .s-grid{ grid-template-columns:1fr; gap:12px; }
        }

        /* ── CARD ── */
        .s-card{
          background:var(--white); border:1.5px solid var(--border);
          border-radius:18px; overflow:hidden;
          cursor:pointer; display:flex; flex-direction:column;
          transition:all .28s cubic-bezier(.22,1,.36,1);
          animation:fadeUp .4s ease both;
          box-shadow:0 2px 12px rgba(112,43,221,.08);
        }
        .s-card:hover{
          transform:translateY(-4px); border-color:var(--purple);
          box-shadow:0 14px 40px rgba(112,43,221,.16);
        }
        .s-card:active{ transform:scale(.98); }
        @keyframes fadeUp{ from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

        /* ── MOBILE: horizontal card layout ── */
        @media(max-width:600px){
          .s-card{ flex-direction:row; border-radius:16px; min-height:0; }
          .s-cimg-wrap{ width:120px; flex-shrink:0; }
          .s-cimg{ width:120px; height:100% !important; min-height:130px; object-fit:cover; }
          .s-cimg-placeholder{ width:120px; height:100% !important; min-height:130px; font-size:36px; }
          .s-cimg-grad{ background:linear-gradient(to right,rgba(0,0,0,.45) 0%,transparent 100%); }
          .s-tag-live, .s-tag-up{ top:8px; left:8px; font-size:9px; padding:3px 8px; }
          .s-tag-type{ display:none; }
          .s-cprice{ bottom:8px; right:auto; left:8px; font-size:11px; padding:3px 8px; border-radius:6px; }
          .s-cbody{ padding:12px 12px 12px; flex:1; min-width:0; justify-content:space-between; }
          .s-ctitle{ font-size:15px !important; -webkit-line-clamp:2 !important; margin-bottom:4px; }
          .s-cdesc{ font-size:11px !important; -webkit-line-clamp:2; margin-bottom:8px; }
          .s-cinfo{ gap:4px; margin-bottom:10px; }
          .s-cinfo-row{ font-size:11px !important; }
          /* hide extras section on mobile for compactness */
          .s-extras-section{ display:none; }
          .s-exnote{ display:none; }
          .s-camount{ font-size:16px !important; }
          .s-btn-live, .s-btn-up{ padding:10px !important; font-size:13px !important; border-radius:10px !important; }
          .s-ctrust{ display:none; }
          /* show mini extras indicator instead */
          .s-mob-extras{ display:flex !important; }
        }

        /* Image */
        .s-cimg-wrap{ position:relative; overflow:hidden; flex-shrink:0; }
        .s-cimg{ width:100%; height:190px; object-fit:cover; display:block; transition:transform .5s ease; }
        .s-card:hover .s-cimg{ transform:scale(1.05); }
        .s-cimg-placeholder{
          height:190px; display:flex; align-items:center; justify-content:center;
          font-size:50px; background:linear-gradient(135deg,var(--purple-light),#F0FFF4);
        }
        .s-cimg-grad{
          position:absolute; inset:0;
          background:linear-gradient(to top,rgba(0,0,0,.52) 0%,rgba(0,0,0,.04) 50%,transparent 100%);
        }

        .s-tag-live{
          position:absolute; top:10px; left:10px;
          display:inline-flex; align-items:center; gap:5px;
          background:var(--green); color:#fff;
          font-size:9px; font-weight:800; letter-spacing:.1em;
          padding:4px 10px; border-radius:100px;
          box-shadow:0 0 12px rgba(5,150,105,.45);
        }
        .s-tag-up{
          position:absolute; top:10px; left:10px;
          display:inline-flex; align-items:center; gap:4px;
          background:rgba(20,10,50,.55); color:#fff;
          border:1px solid rgba(112,43,221,.5);
          font-size:9px; font-weight:800; letter-spacing:.08em;
          padding:4px 10px; border-radius:100px; backdrop-filter:blur(6px);
        }
        .s-tag-type{
          position:absolute; top:10px; right:10px;
          background:rgba(0,0,0,.5); color:#fff;
          font-size:9px; font-weight:700;
          padding:3px 9px; border-radius:100px;
        }
        .s-cprice{
          position:absolute; bottom:10px; right:10px;
          background:rgba(255,255,255,.97); color:var(--text);
          border:1px solid rgba(0,0,0,.06);
          font-size:12px; font-weight:900;
          padding:4px 10px; border-radius:7px;
          box-shadow:0 2px 8px rgba(0,0,0,.12);
        }
        .s-cprice-free{ color:var(--green); font-weight:800; }

        /* Card body */
        .s-cbody{ padding:14px 14px 16px; display:flex; flex-direction:column; flex-grow:1; }

        .s-ctitle{
          font-family:'Playfair Display',serif;
          font-size:17px; font-weight:700; color:var(--text);
          margin-bottom:5px; line-height:1.25;
          display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;
          transition:color .2s;
        }
        .s-card:hover .s-ctitle{ color:var(--purple); }

        .s-cdesc{
          font-size:12px; color:var(--text-mid); line-height:1.55;
          margin-bottom:10px;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }

        .s-cinfo{ display:flex; flex-direction:column; gap:5px; margin-bottom:12px; }
        .s-cinfo-row{
          display:flex; align-items:center; gap:5px;
          font-size:12px; color:var(--text-mid); font-weight:600;
        }
        .s-ci-sep{ color:var(--border); }
        .s-cinfo-text{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        /* Mobile-only extras pill (shown instead of full extras on mobile) */
        .s-mob-extras{
          display:none;
          align-items:center; gap:5px; flex-wrap:wrap;
          margin-bottom:10px;
        }
        .s-mob-ex-pill{
          font-size:10px; font-weight:700;
          background:var(--purple-light); color:var(--purple);
          border:1px solid var(--border); padding:2px 8px; border-radius:100px;
        }

        .s-divider{ height:1px; background:var(--border); margin:0 0 12px; }

        /* Extras (desktop only — hidden on mobile via .s-extras-section) */
        .s-extras-section{}
        .s-exhead{ display:flex; align-items:center; justify-content:space-between; margin-bottom:9px; }
        .s-exlabel{ font-size:9px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:var(--text-mid); }
        .s-exbadge{
          font-size:9px; font-weight:800;
          background:var(--green-light); color:var(--green-dark);
          border:1px solid var(--green-mid); padding:2px 8px; border-radius:100px;
        }
        .s-excats{ display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px; }
        .s-excat{
          display:flex; align-items:center; gap:3px;
          font-size:10px; font-weight:700;
          padding:3px 9px; border-radius:100px; border:1px solid;
        }
        .s-exitems{ display:flex; flex-direction:column; gap:5px; margin-bottom:8px; }
        .s-exrow{
          display:flex; align-items:center; gap:8px;
          background:var(--purple-light); border:1px solid var(--border);
          border-radius:9px; padding:7px 10px;
        }
        .s-exthumb{ width:30px; height:30px; border-radius:6px; object-fit:cover; flex-shrink:0; }
        .s-exinfo{ flex:1; min-width:0; }
        .s-exname{ font-size:11px; font-weight:700; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .s-exsub{ font-size:10px; color:var(--text-mid); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .s-exprice{ font-size:12px; font-weight:900; color:var(--purple); }
        .s-exper{ font-size:9px; color:var(--text-soft); }
        .s-exfree{ font-size:10px; font-weight:800; color:var(--green-dark); background:var(--green-light); border:1px solid var(--green-mid); padding:2px 7px; border-radius:100px; }
        .s-exmore{ text-align:center; font-size:11px; font-weight:700; color:var(--purple); background:var(--purple-light); border:1px solid var(--border); padding:7px; border-radius:7px; }
        .s-exnote{ font-size:11px; color:var(--text-mid); font-style:italic; margin-bottom:12px; display:flex; align-items:center; gap:4px; line-height:1.5; }

        /* CTA */
        .s-ccta{ margin-top:auto; }
        .s-cpricerow{ display:flex; align-items:center; justify-content:space-between; margin-bottom:9px; }
        .s-cfrom{ font-size:11px; color:var(--text-mid); font-weight:600; }
        .s-camount{ font-size:18px; font-weight:900; color:var(--text); }
        .s-camount span{ font-size:11px; font-weight:500; color:var(--text-soft); margin-left:2px; }

        .s-btn-live{
          width:100%; padding:13px;
          background:linear-gradient(135deg,var(--green),var(--green-dark));
          color:#fff; border:none; cursor:pointer;
          font-family:'Outfit',sans-serif; font-size:14px; font-weight:800;
          border-radius:11px; box-shadow:0 4px 16px rgba(5,150,105,.28); transition:all .2s;
        }
        .s-btn-live:hover{ box-shadow:0 8px 24px rgba(5,150,105,.42); transform:translateY(-1px); }
        .s-btn-live:active{ transform:scale(.98); }

        .s-btn-up{
          width:100%; padding:13px;
          background:linear-gradient(135deg,var(--purple),var(--purple-dark));
          color:#fff; border:none; cursor:pointer;
          font-family:'Outfit',sans-serif; font-size:14px; font-weight:800;
          border-radius:11px; box-shadow:0 4px 16px rgba(112,43,221,.28); transition:all .2s;
        }
        .s-btn-up:hover{ box-shadow:0 8px 24px rgba(112,43,221,.42); transform:translateY(-1px); }
        .s-btn-up:active{ transform:scale(.98); }

        .s-ctrust{ display:flex; align-items:center; justify-content:center; gap:8px; margin-top:9px; flex-wrap:wrap; }
        .s-ctrust span{ font-size:10px; color:var(--text-soft); font-weight:600; display:flex; align-items:center; gap:2px; }
        .s-tdot{ width:2px; height:2px; border-radius:50%; background:var(--border); }
      `}</style>
    </div>
  );
}

export default Services;

/* ══════════════════════════════════════════════════════════
   EVENT CARD
══════════════════════════════════════════════════════════ */
function EventCard({ event, idx, onClick }) {
  const isLive    = event.status === "live";
  const timeStr   = displayTime(event);
  const dateStr   = formatDate(event.eventDate);
  const extras    = event.extras || [];
  const hasExtras = extras.length > 0;
  const basePrice = extractPrice(event.price);

  const catCounts = Object.keys(CATEGORY_CONFIG).reduce((acc, k) => {
    acc[k] = extras.filter((e) => e.category === k).length;
    return acc;
  }, {});

  // Mobile extras pills — compact summary
  const extraCats = Object.entries(CATEGORY_CONFIG)
    .filter(([k]) => catCounts[k] > 0)
    .slice(0, 3);

  return (
    <div className="s-card" style={{ animationDelay: `${idx * 50}ms` }} onClick={onClick}>

      {/* Image */}
      <div className="s-cimg-wrap">
        {event.mainImage
          ? <img src={event.mainImage} alt={event.title} className="s-cimg" />
          : <div className="s-cimg-placeholder">🎉</div>}
        <div className="s-cimg-grad" />

        {isLive
          ? <div className="s-tag-live"><span className="s-pdot" style={{width:5,height:5}} />LIVE</div>
          : <div className="s-tag-up">📅 Soon</div>}

        {event.type && <div className="s-tag-type">{event.type}</div>}

        <div className="s-cprice">
          {basePrice > 0
            ? <>₹{basePrice.toLocaleString()}<span style={{fontSize:9,fontWeight:500,color:"#7A6A9E",marginLeft:1}}>/p</span></>
            : <span className="s-cprice-free">Free</span>}
        </div>
      </div>

      {/* Body */}
      <div className="s-cbody">
        <h3 className="s-ctitle">{event.title}</h3>
        {event.description && <p className="s-cdesc">{event.description}</p>}

        {/* Info rows */}
      <div className="s-cinfo">
  {(dateStr || timeStr) && (
    <div className="s-cinfo-block">
      {dateStr && (
        <div className="s-info-item">
          <span className="s-info-icon">📅</span>
          <span className="s-info-text">{dateStr}</span>
        </div>
      )}
      {timeStr && (
        <div className="s-info-item">
          <span className="s-info-icon">⏰</span>
          <span className="s-info-text">{timeStr}</span>
        </div>
      )}
    </div>
  )}

  {event.location && (
    <div className="s-info-item s-info-location">
      <span className="s-info-icon">📍</span>
      <span className="s-info-text">{event.location}</span>
    </div>
  )}
</div>

        {/* Mobile-only: compact extras pills */}
        {hasExtras && extraCats.length > 0 && (
          <div className="s-mob-extras">
            {extraCats.map(([k, { icon, label }]) => (
              <span key={k} className="s-mob-ex-pill">{icon} {label}</span>
            ))}
            {extras.length > 3 && (
              <span className="s-mob-ex-pill">+{extras.length - 3} more</span>
            )}
          </div>
        )}

        {/* Desktop: full extras section */}
        {hasExtras && (
          <div className="s-extras-section">
            <div className="s-divider" />
            <div className="s-exhead">
              <span className="s-exlabel">🎪 Optional Add-ons</span>
              <span className="s-exbadge">✅ Your choice</span>
            </div>
            <div className="s-excats">
              {Object.entries(CATEGORY_CONFIG).map(([key, { icon, label, color }]) => {
                const count = catCounts[key];
                if (!count) return null;
                return (
                  <span key={key} className="s-excat"
                    style={{ color, borderColor: color + "40", background: color + "14" }}>
                    {icon} {label} <span style={{opacity:.5}}>×{count}</span>
                  </span>
                );
              })}
            </div>
            <div className="s-exitems">
              {extras.slice(0, 2).map((extra, i) => {
                const price = extractPrice(extra.price);
                return (
                  <div key={extra.id || i} className="s-exrow">
                    {extra.imageURL && (
                      <img src={extra.imageURL} alt={extra.name} className="s-exthumb"
                        onError={(e) => { e.target.style.display = "none"; }} />
                    )}
                    <div className="s-exinfo">
                      <p className="s-exname">{extra.name}</p>
                      {extra.description && <p className="s-exsub">{extra.description}</p>}
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      {price > 0
                        ? <><div className="s-exprice">+₹{price.toLocaleString()}</div><div className="s-exper">/ticket</div></>
                        : <span className="s-exfree">Free</span>}
                    </div>
                  </div>
                );
              })}
              {extras.length > 2 && (
                <div className="s-exmore">+{extras.length - 2} more add-on{extras.length - 2 > 1 ? "s" : ""} inside →</div>
              )}
            </div>
            <p className="s-exnote"><span>💡</span>Entry alone is enough — add-ons are 100% optional</p>
          </div>
        )}

        {/* CTA */}
        <div className="s-ccta">
          {basePrice > 0 && (
            <div className="s-cpricerow">
              <span className="s-cfrom">Starts from</span>
              <span className="s-camount">₹{basePrice.toLocaleString()}<span>/person</span></span>
            </div>
          )}
          <button className={isLive ? "s-btn-live" : "s-btn-up"} onClick={onClick}>
            {isLive ? "🎟️ Book Now — Live!" : "View Details & Book →"}
          </button>
          <div className="s-ctrust">
            <span>🔒 Secure</span>
            <div className="s-tdot" />
            <span>✅ Instant Confirm</span>
            <div className="s-tdot" />
            <span>💳 No Hidden Fees</span>
          </div>
        </div>
      </div>
    </div>
  );
}
