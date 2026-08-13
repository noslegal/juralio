/*
 * Copyright 2026 Graeme and Joanna Johnston
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const css = `
  .scene { position: relative; width: 640px; height: 400px; cursor: pointer; transform: scale(0.8275); transform-origin: top center; margin-bottom: -69px; }

  .blob { position: absolute; border-radius: 28px; transition: transform 0.5s cubic-bezier(.34,1.56,.64,1); }
  .scene:hover .blob-green  { transform: translate(-6px, -6px); }
  .scene:hover .blob-purple { transform: translate(6px, 6px); }
  .scene:hover .card        { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(0,0,0,0.14); }
  .coin-stack svg { transition: transform 0.4s cubic-bezier(.34,1.56,.64,1); }
  .scene:hover .coin-stack svg { transform: translateY(-4px); }

  .chart-line {
    stroke-dasharray: 400;
    stroke-dashoffset: 400;
    animation: drawLine 1.4s ease forwards;
  }
  .chart-area {
    opacity: 0;
    animation: fadeIn 1s 0.8s ease forwards;
  }
  .chart-dot {
    opacity: 0;
    animation: fadeIn 0.6s 1.2s ease forwards;
  }
  @keyframes drawLine { to { stroke-dashoffset: 0; } }
  @keyframes fadeIn   { to { opacity: 1; } }

  .shimmer {
    background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%);
    background-size: 200% 100%;
    border-radius: 4px;
    animation: shimmer 2s infinite;
  }
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .pie-slice { transform-origin: 34px 34px; }
  .pie-s1 { animation: pieIn  1s 0.3s ease-out both; }
  .pie-s2 { animation: pieIn2 1s 0.5s ease-out both; }
  .pie-s3 { animation: pieIn3 1s 0.7s ease-out both; }
  @keyframes pieIn  { from { opacity:0; transform:scale(0.5); } to { opacity:1;   transform:scale(1); } }
  @keyframes pieIn2 { from { opacity:0; transform:scale(0.5); } to { opacity:0.6; transform:scale(1); } }
  @keyframes pieIn3 { from { opacity:0; transform:scale(0.5); } to { opacity:0.5; transform:scale(1); } }
`

const Shimmer = ({ style }) => (
  <div className="shimmer" style={{ borderRadius: 4, ...style }} />
)

const CostsDashboardIllustration = () => (
  <div style={s.body}>
    <style>{css}</style>
    <div className="scene">
      <div className="blob blob-green" style={{ ...s.blob, ...s.blobGreen }} />
      <div
        className="blob blob-purple"
        style={{ ...s.blob, ...s.blobPurple }}
      />

      <div className="card" style={s.card}>
        {/* Line chart panel */}
        <div style={s.chartPanel}>
          <svg style={s.fill} viewBox="0 0 310 190" fill="none">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A8D4DC" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#A8D4DC" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {[[160], [135], [110], [85]].map(([y]) => (
              <line
                key={y}
                x1="36"
                y1={y}
                x2="298"
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            ))}
            <line
              x1="164"
              y1="20"
              x2="164"
              y2="168"
              stroke="#CBD5E1"
              strokeWidth="1.2"
              strokeDasharray="5,4"
            />
            <path
              className="chart-area"
              d="M36,158 L80,145 L126,132 L164,118 L206,95 L251,65 L298,48 L298,168 L36,168 Z"
              fill="url(#areaGrad)"
            />
            <polyline
              className="chart-line"
              points="36,158 80,145 126,132 164,118 206,95 251,65 298,48"
              fill="none"
              stroke="#3B8B9E"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle
              className="chart-dot"
              cx="164"
              cy="118"
              r="4"
              fill="white"
              stroke="#3B8B9E"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Stats panel */}
        <div style={s.statsPanel}>
          <div className="coin-stack" style={s.coinStack}>
            <svg width="42" height="48" viewBox="0 0 42 48" fill="none">
              <ellipse
                cx="21"
                cy="40"
                rx="14"
                ry="5.5"
                fill="#3B8B9E"
                opacity="0.25"
              />
              <rect
                x="7"
                y="35"
                width="28"
                height="5"
                fill="#3B8B9E"
                opacity="0.35"
              />
              <ellipse
                cx="21"
                cy="35"
                rx="14"
                ry="5.5"
                fill="#5BA8BC"
                opacity="0.5"
              />
              <ellipse
                cx="21"
                cy="28"
                rx="14"
                ry="5.5"
                fill="#3B8B9E"
                opacity="0.5"
              />
              <rect
                x="7"
                y="23"
                width="28"
                height="5"
                fill="#3B8B9E"
                opacity="0.6"
              />
              <ellipse
                cx="21"
                cy="23"
                rx="14"
                ry="5.5"
                fill="#5BA8BC"
                opacity="0.75"
              />
              <ellipse
                cx="21"
                cy="16"
                rx="14"
                ry="5.5"
                fill="#3B8B9E"
                opacity="0.75"
              />
              <rect
                x="7"
                y="11"
                width="28"
                height="5"
                fill="#3B8B9E"
                opacity="0.85"
              />
              <ellipse cx="21" cy="11" rx="14" ry="5.5" fill="#3B8B9E" />
            </svg>
          </div>

          <Shimmer
            style={{
              position: 'absolute',
              top: 22,
              left: 16,
              width: 130,
              height: 9,
            }}
          />
          <Shimmer
            style={{
              position: 'absolute',
              top: 38,
              left: 16,
              width: 95,
              height: 9,
            }}
          />

          <div style={s.pieWrap}>
            <svg width="68" height="68" viewBox="0 0 68 68">
              <path
                className="pie-slice pie-s1"
                d="M34,34 L34,0 A34,34 0 0,1 63.4,51 Z"
                fill="#3B8B9E"
              />
              <path
                className="pie-slice pie-s2"
                d="M34,34 L63.4,51 A34,34 0 0,1 4.6,51 Z"
                fill="#5BA8BC"
              />
              <path
                className="pie-slice pie-s3"
                d="M34,34 L4.6,51 A34,34 0 0,1 34,0 Z"
                fill="#A8D4DC"
              />
              <circle cx="34" cy="34" r="15" fill="#F7F8FA" />
            </svg>
          </div>

          <Shimmer
            style={{
              position: 'absolute',
              top: 100,
              left: 86,
              width: 110,
              height: 9,
            }}
          />
          <Shimmer
            style={{
              position: 'absolute',
              top: 116,
              left: 86,
              width: 80,
              height: 9,
            }}
          />
        </div>

        <div style={s.divider} />

        <div style={{ ...s.row, ...s.row1 }}>
          <Shimmer style={{ width: 160, height: 8 }} />
        </div>
        <div style={{ ...s.row, ...s.row2 }}>
          <Shimmer style={{ width: 120, height: 8 }} />
          <Shimmer style={{ width: 80, height: 8 }} />
        </div>
      </div>
    </div>
  </div>
)

const s = {
  body: {
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: { position: 'absolute', borderRadius: 28, opacity: 0.75 },
  blobGreen: {
    width: 304,
    height: 248,
    top: 24,
    left: 16,
    background: '#B5C9A1',
  },
  blobPurple: {
    width: 304,
    height: 232,
    top: 144,
    left: 312,
    background: '#C5B3D9',
  },
  card: {
    position: 'absolute',
    top: 56,
    left: 72,
    width: 496,
    height: 288,
    background: 'white',
    borderRadius: 22,
    boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
    transition:
      'transform 0.4s cubic-bezier(.34,1.2,.64,1), box-shadow 0.4s ease',
    overflow: 'hidden',
  },
  chartPanel: {
    position: 'absolute',
    top: 21,
    left: 19,
    width: 248,
    height: 152,
    background: '#F7F8FA',
    borderRadius: 12,
    overflow: 'hidden',
  },
  statsPanel: {
    position: 'absolute',
    top: 21,
    left: 280,
    width: 197,
    height: 152,
    background: '#F7F8FA',
    borderRadius: 12,
  },
  fill: { width: '100%', height: '100%' },
  coinStack: { position: 'absolute', top: 14, right: 16 },
  pieWrap: { position: 'absolute', top: 88, left: 16 },
  divider: {
    position: 'absolute',
    top: 187,
    left: 19,
    right: 19,
    height: 1,
    background: '#E5E7EB',
  },
  row: {
    position: 'absolute',
    left: 19,
    right: 19,
    height: 29,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    padding: '0 13px',
    gap: 10,
  },
  row1: { top: 197, background: '#F7F8FA' },
  row2: { top: 232, background: 'white', justifyContent: 'space-between' },
}

export default CostsDashboardIllustration
