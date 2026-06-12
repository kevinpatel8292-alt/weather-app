import React from 'react';

/* ─── Sun + Cloud (Partly Cloudy) ─────────────────────────────── */
const SunCloud = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ filter: 'drop-shadow(0 6px 18px rgba(255,160,0,0.45))' }}>
    <defs>
      <radialGradient id="sunCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%"  stopColor="#FFF176"/>
        <stop offset="45%" stopColor="#FFB300"/>
        <stop offset="100%" stopColor="#FF6F00"/>
      </radialGradient>
      <radialGradient id="cloudGrad1" cx="40%" cy="40%" r="60%">
        <stop offset="0%"  stopColor="#FFFFFF"/>
        <stop offset="100%" stopColor="#B3E5FC"/>
      </radialGradient>
      <radialGradient id="cloudGrad2" cx="40%" cy="30%" r="60%">
        <stop offset="0%"  stopColor="#E1F5FE"/>
        <stop offset="100%" stopColor="#81D4FA"/>
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2.5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    {/* ── Outer glow ring ── */}
    <circle cx="52" cy="44" r="30" fill="rgba(255,180,0,0.18)"
      style={{ animation: 'iconGlow 3s ease-in-out infinite' }}/>

    {/* ── Flame rays (top arc) ── */}
    {[
      { x: 52, y: 7,  rot: 0   },
      { x: 70, y: 13, rot: 30  },
      { x: 82, y: 28, rot: 58  },
      { x: 34, y: 13, rot: -30 },
      { x: 22, y: 28, rot: -58 },
    ].map((ray, i) => (
      <g key={i} transform={`rotate(${ray.rot}, 52, 44)`}>
        <ellipse cx={52} cy={12} rx={5} ry={12}
          fill={`url(#rayGrad${i})`}
          style={{ animation: `flicker${i % 3} 2s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }}
        />
        <defs>
          <linearGradient id={`rayGrad${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF8F00"/>
            <stop offset="60%" stopColor="#FFB300"/>
            <stop offset="100%" stopColor="#FFE082"/>
          </linearGradient>
        </defs>
      </g>
    ))}

    {/* ── Sun disk ── */}
    <circle cx="52" cy="44" r="22" fill="url(#sunCore)" filter="url(#glow)"
      style={{ animation: 'sunSpin 12s linear infinite' }}/>
    {/* Sun inner highlight */}
    <circle cx="46" cy="38" r="7" fill="rgba(255,255,255,0.28)"/>

    {/* ── Cloud — back layer (darker) ── */}
    <g style={{ animation: 'cloudBob 4s ease-in-out infinite', animationDelay: '0.3s' }}>
      <circle cx="35" cy="82" r="16" fill="url(#cloudGrad2)"/>
      <circle cx="55" cy="74" r="20" fill="url(#cloudGrad2)"/>
      <circle cx="76" cy="81" r="14" fill="url(#cloudGrad2)"/>
      <rect x="35" y="82" width="55" height="16" fill="url(#cloudGrad2)" rx="2"/>
    </g>

    {/* ── Cloud — front layer (lighter) ── */}
    <g style={{ animation: 'cloudBob 4s ease-in-out infinite' }}>
      <circle cx="30" cy="88" r="17" fill="url(#cloudGrad1)"/>
      <circle cx="52" cy="80" r="22" fill="url(#cloudGrad1)"/>
      <circle cx="75" cy="87" r="16" fill="url(#cloudGrad1)"/>
      <rect x="30" y="88" width="61" height="18" fill="url(#cloudGrad1)" rx="2"/>
      {/* Cloud shine highlights */}
      <ellipse cx="42" cy="77" rx="8" ry="5" fill="rgba(255,255,255,0.55)"/>
      <ellipse cx="60" cy="73" rx="6" ry="3.5" fill="rgba(255,255,255,0.45)"/>
    </g>

    <style>{`
      @keyframes sunSpin {
        from { transform-origin: 52px 44px; transform: rotate(0deg); }
        to   { transform-origin: 52px 44px; transform: rotate(360deg); }
      }
      @keyframes iconGlow {
        0%,100% { opacity:0.6; r:30; }
        50%      { opacity:1;   r:35; }
      }
      @keyframes cloudBob {
        0%,100% { transform: translateY(0px); }
        50%      { transform: translateY(-4px); }
      }
      @keyframes flicker0 {
        0%,100% { transform-origin:52px 44px; transform:scaleY(1) rotate(0deg); }
        50%      { transform-origin:52px 44px; transform:scaleY(1.15) rotate(0deg); }
      }
      @keyframes flicker1 {
        0%,100% { transform-origin:52px 44px; transform:scaleY(0.9) rotate(0deg); }
        50%      { transform-origin:52px 44px; transform:scaleY(1.2) rotate(0deg); }
      }
      @keyframes flicker2 {
        0%,100% { transform-origin:52px 44px; transform:scaleY(1.1) rotate(0deg); }
        50%      { transform-origin:52px 44px; transform:scaleY(0.85) rotate(0deg); }
      }
    `}</style>
  </svg>
);

/* ─── Clear / Sunny ────────────────────────────────────────────── */
const SunClear = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ filter: 'drop-shadow(0 6px 24px rgba(255,180,0,0.6))' }}>
    <defs>
      <radialGradient id="cs" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFF59D"/>
        <stop offset="50%" stopColor="#FFB300"/>
        <stop offset="100%" stopColor="#FF6F00"/>
      </radialGradient>
    </defs>
    {/* Rays */}
    {Array.from({ length: 8 }, (_, i) => (
      <g key={i} transform={`rotate(${i * 45}, 60, 60)`}>
        <rect x="57" y="8" width="6" height="14" rx="3" fill="#FFB300"
          style={{ animation: `rayPulse 2s ease-in-out infinite`, animationDelay: `${i * 0.12}s` }}/>
      </g>
    ))}
    <circle cx="60" cy="60" r="26" fill="url(#cs)"/>
    <circle cx="53" cy="53" r="9" fill="rgba(255,255,255,0.3)"/>
    <style>{`
      @keyframes rayPulse {
        0%,100% { opacity:0.8; transform:scaleY(1); }
        50%      { opacity:1;   transform:scaleY(1.2); }
      }
    `}</style>
  </svg>
);

/* ─── Rainy ────────────────────────────────────────────────────── */
const RainIcon = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none"
    style={{ filter: 'drop-shadow(0 4px 12px rgba(30,100,255,0.3))' }}>
    <defs>
      <radialGradient id="rc" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#E3F2FD"/>
        <stop offset="100%" stopColor="#90CAF9"/>
      </radialGradient>
    </defs>
    <circle cx="38" cy="58" r="20" fill="url(#rc)"/>
    <circle cx="58" cy="48" r="25" fill="url(#rc)"/>
    <circle cx="80" cy="56" r="18" fill="url(#rc)"/>
    <rect x="38" y="56" width="60" height="20" rx="2" fill="url(#rc)"/>
    {[0,1,2,3,4].map(i => (
      <line key={i} x1={42 + i*10} y1="82" x2={38 + i*10} y2="98" stroke="#2196F3" strokeWidth="3" strokeLinecap="round"
        style={{ animation: `rainDrop 1.2s linear infinite`, animationDelay: `${i * 0.2}s` }}/>
    ))}
    <style>{`
      @keyframes rainDrop {
        0%  { opacity:0; transform:translateY(-6px); }
        50% { opacity:1; }
        100%{ opacity:0; transform:translateY(8px); }
      }
    `}</style>
  </svg>
);

/* ─── Snowy ────────────────────────────────────────────────────── */
const SnowIcon = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none"
    style={{ filter: 'drop-shadow(0 4px 12px rgba(180,220,255,0.5))' }}>
    <defs>
      <radialGradient id="sc2" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#FFFFFF"/>
        <stop offset="100%" stopColor="#B3E5FC"/>
      </radialGradient>
    </defs>
    <circle cx="38" cy="55" r="20" fill="url(#sc2)"/>
    <circle cx="60" cy="45" r="25" fill="url(#sc2)"/>
    <circle cx="82" cy="54" r="18" fill="url(#sc2)"/>
    <rect x="38" y="54" width="62" height="18" rx="2" fill="url(#sc2)"/>
    {[0,1,2,3,4].map(i => (
      <text key={i} x={38 + i * 11} y={88} fontSize="14" fill="#90CAF9" textAnchor="middle"
        style={{ animation: `snowFall 2s linear infinite`, animationDelay: `${i * 0.35}s` }}>❄</text>
    ))}
    <style>{`
      @keyframes snowFall {
        0%  { opacity:0; transform:translateY(-4px); }
        50% { opacity:1; }
        100%{ opacity:0; transform:translateY(10px); }
      }
    `}</style>
  </svg>
);

/* ─── Thunderstorm ─────────────────────────────────────────────── */
const StormIcon = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none"
    style={{ filter: 'drop-shadow(0 4px 16px rgba(255,200,0,0.5))' }}>
    <defs>
      <radialGradient id="stc" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#CFD8DC"/>
        <stop offset="100%" stopColor="#546E7A"/>
      </radialGradient>
    </defs>
    <circle cx="38" cy="52" r="20" fill="url(#stc)"/>
    <circle cx="60" cy="42" r="25" fill="url(#stc)"/>
    <circle cx="82" cy="50" r="18" fill="url(#stc)"/>
    <rect x="38" y="51" width="62" height="18" rx="2" fill="url(#stc)"/>
    {/* Lightning bolt */}
    <polygon points="68,70 58,88 65,88 54,108 72,86 64,86"
      fill="#FFD600"
      style={{ animation: 'lightning 2s ease-in-out infinite', filter: 'drop-shadow(0 0 6px #FFD600)' }}/>
    <style>{`
      @keyframes lightning {
        0%,45%,55%,100% { opacity:1; }
        50% { opacity:0.2; }
      }
    `}</style>
  </svg>
);

/* ─── Cloudy ───────────────────────────────────────────────────── */
const CloudyIcon = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none"
    style={{ filter: 'drop-shadow(0 4px 12px rgba(100,150,200,0.3))' }}>
    <defs>
      <radialGradient id="cc" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#ECEFF1"/>
        <stop offset="100%" stopColor="#B0BEC5"/>
      </radialGradient>
      <radialGradient id="cc2" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#FFFFFF"/>
        <stop offset="100%" stopColor="#CFD8DC"/>
      </radialGradient>
    </defs>
    {/* Back cloud */}
    <g style={{ animation: 'cloudBob2 5s ease-in-out infinite', opacity: 0.7 }}>
      <circle cx="45" cy="68" r="17" fill="url(#cc)"/>
      <circle cx="65" cy="60" r="21" fill="url(#cc)"/>
      <circle cx="84" cy="67" r="15" fill="url(#cc)"/>
      <rect x="45" y="67" width="54" height="17" rx="2" fill="url(#cc)"/>
    </g>
    {/* Front cloud */}
    <g style={{ animation: 'cloudBob2 4s ease-in-out infinite', animationDelay: '0.5s' }}>
      <circle cx="32" cy="75" r="18" fill="url(#cc2)"/>
      <circle cx="55" cy="65" r="24" fill="url(#cc2)"/>
      <circle cx="78" cy="73" r="17" fill="url(#cc2)"/>
      <rect x="32" y="74" width="63" height="20" rx="2" fill="url(#cc2)"/>
      <ellipse cx="46" cy="62" rx="9" ry="5" fill="rgba(255,255,255,0.6)"/>
    </g>
    <style>{`
      @keyframes cloudBob2 {
        0%,100% { transform: translateY(0); }
        50%      { transform: translateY(-5px); }
      }
    `}</style>
  </svg>
);

/* ─── Main export: picks icon by OWM condition code ───────────── */
const WeatherIcon = ({ icon = '', condition = '', size = 120 }) => {
  const c = condition.toLowerCase();

  if (c.includes('thunderstorm'))                         return <StormIcon  size={size}/>;
  if (c.includes('rain') || c.includes('drizzle'))        return <RainIcon   size={size}/>;
  if (c.includes('snow'))                                 return <SnowIcon   size={size}/>;
  if (c.includes('clear'))                                return <SunClear   size={size}/>;
  if (c.includes('cloud'))                                return <SunCloud   size={size}/>;

  // Fallback to OWM image
  if (icon) {
    return (
      <img
        src={`https://openweathermap.org/img/wn/${icon}@4x.png`}
        alt={condition}
        style={{ width: size, height: size, filter: 'drop-shadow(0 6px 20px rgba(255,200,0,0.4))' }}
      />
    );
  }
  return <SunCloud size={size}/>;
};

export default WeatherIcon;
