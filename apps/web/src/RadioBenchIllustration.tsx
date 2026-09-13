export function RadioBenchIllustration() {
  return (
    <figure className="bench-illustration">
      <div className="bench-figure-label"><span>From one radio to another</span><span>145 MHz · VHF</span></div>
      <svg viewBox="0 0 600 390" role="img" aria-label="Two handheld radios with a direct radio path above a hill. An illustration of the experiment, not a measurement.">
        <defs>
          <pattern id="bench-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#344b59" strokeWidth=".6" /></pattern>
        </defs>
        <rect width="600" height="390" fill="url(#bench-grid)" />
        <path d="M0 314L75 303 132 311 202 272 259 281 310 204 355 234 390 289 453 301 505 278 600 306V390H0Z" fill="#344d5c" />
        <path d="M105 55L465 66" fill="none" stroke="#efbd4b" strokeWidth="2" strokeDasharray="6 7" />
        <path d="M452 58L465 66 452 73" fill="none" stroke="#efbd4b" strokeWidth="2" />
        {[84, 452].map((x, i) => <g key={x} transform={`translate(${x} ${i ? 139 : 128})`}>
          <rect x="13" y="-77" width="8" height="90" rx="4" fill="#e5e7df" />
          <rect x="45" y="-8" width="15" height="17" rx="3" fill="#d8dedc" />
          <rect width="75" height="166" rx="10" fill="#dbe1df" />
          <rect x="7" y="8" width="61" height="145" rx="5" fill="#253b49" />
          <rect x="16" y="21" width="44" height="35" rx="2" fill="#d2dfc0" />
          <text x="38" y="44" textAnchor="middle" fill="#233c30" fontSize="15" fontFamily="monospace">{i ? "RX" : "TX"}</text>
          {[75, 84, 93, 102].map(y => <path key={y} d={`M19 ${y}H56`} stroke="#122733" strokeWidth="4" />)}
          <circle cx="37" cy="127" r="8" fill="#efbd4b" />
        </g>)}
        <text x="121" y="338" textAnchor="middle" fill="#edf2ee" fontSize="13" fontFamily="monospace">BASE CAMP</text>
        <text x="488" y="338" textAnchor="middle" fill="#edf2ee" fontSize="13" fontFamily="monospace">REMOTE TEAM</text>
        <text x="300" y="181" textAnchor="middle" fill="#b9c8cf" fontSize="12" fontFamily="monospace">What gets in the way?</text>
      </svg>
      <figcaption><span>Change the power. Raise the antenna.</span><strong>See what makes the difference.</strong></figcaption>
    </figure>
  );
}
