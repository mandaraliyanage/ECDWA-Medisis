import React from 'react';


const Header = () => {
return (
<header className="health-header">
<style>{`
.health-header {
position: sticky; top: 0; z-index: 50;
background:
radial-gradient(700px 300px at 0% -40%, rgba(43,211,231,0.12), transparent 60%),
radial-gradient(600px 300px at 100% -40%, rgba(32,213,164,0.10), transparent 60%),
linear-gradient(180deg, rgba(11,18,32,0.95) 0%, rgba(10,15,26,0.85) 100%);
backdrop-filter: blur(8px);
border-bottom: 1px solid rgba(207,227,255,0.10);
}
.hh-shell { max-width: 1200px; margin: 0 auto; padding: 14px 24px; }
.hh-row { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 14px; }


.hh-title { display: flex; align-items: center; gap: 12px; }
.hh-logo { width: 36px; height: 36px; border-radius: 10px;
background: linear-gradient(135deg, var(--brand, #20d5a4), var(--brand-2, #2bd3e7));
display: grid; place-items: center; box-shadow: 0 10px 30px rgba(0,0,0,0.35);
}
.hh-logo svg { filter: drop-shadow(0 4px 10px rgba(43,211,231,0.35)); }
.hh-title h1 { margin: 0; font-size: 1.25rem; letter-spacing: 0.2px; color: var(--ink-1, #cfe3ff); }
.hh-sub { color: var(--ink-2, #90a6c8); font-size: .85rem; }


.hh-actions { display: flex; align-items: center; gap: 10px; }
.welcome-pill {
padding: 8px 12px; border-radius: 999px; font-size: .85rem; color: var(--ink-1, #cfe3ff);
border: 1px solid rgba(207,227,255,0.14); background: rgba(15,22,38,0.66);
}
.hh-btn { cursor: pointer; border-radius: 10px; padding: 8px 12px; border: 1px solid rgba(43,211,231,0.25);
background: linear-gradient(135deg, rgba(32,213,164,0.15), rgba(43,211,231,0.12)); color: var(--ink-1, #cfe3ff);
transition: transform .15s ease, box-shadow .15s ease; backdrop-filter: blur(6px);
}
.hh-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
`}</style>


<div className="hh-shell">
<div className="hh-row">
<div className="hh-title">
<div className="hh-logo" aria-hidden>
{/* Cross + pulse icon */}
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 3h4v4h4v4h-4v4h-4v-4H6V7h4V3Z" fill="#07111f"/>
</svg>
</div>
<div>
<h1>MediSys Dashboard</h1>
<div className="hh-sub">Care, insights, and alerts—at a glance</div>
</div>
</div>


<div className="hh-actions">
<span className="welcome-pill">Welcome</span>
{/* Optional quick links that align with the theme but keep Header API unchanged */}
<button className="hh-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Top</button>
</div>
</div>
</div>
</header>
);
};


export default Header;