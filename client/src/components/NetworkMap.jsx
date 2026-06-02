const PADDING = 40;

function NetworkMap({ network, startStation = null, destinationStation = null, showLines = true }) {
    if (!network || network.length === 0) return null;

    const seen = new Set();
    const allStations = network.flatMap(l => l.Stations).filter(s => {
        if (seen.has(s.name)) return false;
        seen.add(s.name);
        return true;
    });
    const xs = allStations.map(s => s.x);
    const ys = allStations.map(s => s.y);
    const minX = Math.min(...xs) - PADDING;
    const minY = Math.min(...ys) - PADDING;
    const width = Math.max(...xs) - minX + PADDING;
    const height = Math.max(...ys) - minY + PADDING;

    return (
        <svg viewBox={`${minX} ${minY} ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
            {showLines && network.map(line =>
                line.Stations.map((s, i) => {
                    if (i === line.Stations.length - 1) return null;
                    const next = line.Stations[i + 1];
                    return (
                        <line
                            key={`${line.code}-${i}`}
                            x1={s.x} y1={s.y}
                            x2={next.x} y2={next.y}
                            stroke={line.color}
                            strokeWidth={4}
                            strokeLinecap="round"
                        />
                    );
                })
            )}
            {allStations.map(s => {
                const isStart = s.name === startStation;
                const isDest = s.name === destinationStation;
                const isHighlighted = isStart || isDest;
                return (
                    <g key={s.name}>
                        <circle
                            cx={s.x} cy={s.y} r={isHighlighted ? 10 : 6}
                            fill={isStart ? '#28a745' : isDest ? '#dc3545' : '#fff'}
                            stroke={isStart ? '#155724' : isDest ? '#721c24' : '#333'}
                            strokeWidth={isHighlighted ? 3 : 2}
                        />
                        <text
                            x={s.x} y={s.y - 12}
                            fontSize={10}
                            textAnchor="middle"
                            fill="#222"
                        >
                            {s.name}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

export default NetworkMap;
