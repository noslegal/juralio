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

import { useState, useEffect } from 'react'

export default function AnimatedDashboard() {
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const s = delay => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(8px)',
    transition: `opacity 0.5s ${delay}s ease, transform 0.5s ${delay}s ease`,
  })

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { stop-opacity: 1; }
          50% { stop-opacity: 0.4; }
          100% { stop-opacity: 1; }
        }
        .shim stop:nth-child(1) { animation: shimmer 2s ease-in-out infinite; }
        .shim stop:nth-child(2) { animation: shimmer 2s 0.3s ease-in-out infinite; }
        .shim stop:nth-child(3) { animation: shimmer 2s 0.6s ease-in-out infinite; }
        @keyframes piePop {
          from { transform: scale(0) rotate(-90deg); opacity: 0; }
          to { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .pie-seg { transform-origin: 290.95px 150.77px; }
        .pie-seg-1 { animation: piePop 0.6s 0.8s cubic-bezier(.34,1.56,.64,1) both; }
        .pie-seg-2 { animation: piePop 0.6s 0.95s cubic-bezier(.34,1.56,.64,1) both; }
        .pie-seg-3 { animation: piePop 0.6s 1.1s cubic-bezier(.34,1.56,.64,1) both; }
      `}</style>

      <div
        style={{
          display: 'inline-flex',
        }}
      >
        <div
          style={{ position: 'relative', cursor: 'pointer' }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <svg
            width="529"
            height="331"
            viewBox="0 0 529 331"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Shimmer gradients — light */}
              {[
                ['sL0', '71.4', '150.8'],
                ['sL1', '423.2', '456.3'],
                ['sL2', '72.7', '97.9'],
                ['sL3', '103.2', '124.3'],
                ['sL4', '129.6', '148.1'],
                ['sL5', '153.4', '187.8'],
                ['sL6', '193.1', '218.2'],
                ['sL14', '87.3', '179.9'],
                ['sL15', '79.4', '152.1'],
                ['sL17', '79.4', '165.3'],
                ['sL18', '79.4', '112.4'],
                ['sL19', '79.4', '138.9'],
                ['sL20', '79.4', '112.4'],
                ['sL21', '79.4', '148.8'],
                ['sL22', '79.4', '112.4'],
                ['sL24', '99.8', '156.1'],
                ['sL25', '99.8', '119.2'],
              ].map(([id, x1, x2]) => (
                <linearGradient
                  key={id}
                  id={id}
                  x1={x1}
                  y1="0"
                  x2={x2}
                  y2="0"
                  gradientUnits="userSpaceOnUse"
                  className="shim"
                >
                  <stop stopColor="#E2E8F0" />
                  <stop offset="0.25" stopColor="#F1F5F9" />
                  <stop offset="0.5" stopColor="#E2E8F0" />
                </linearGradient>
              ))}
              {/* Shimmer gradients — dark header */}
              {[
                ['sD7', '78', '144.2'],
                ['sD8', '316.1', '334.6'],
                ['sD9', '341.2', '359.7'],
                ['sD10', '366.3', '384.8'],
                ['sD11', '391.5', '410'],
                ['sD12', '416.6', '435.1'],
                ['sD13', '441.7', '456.9'],
              ].map(([id, x1, x2]) => (
                <linearGradient
                  key={id}
                  id={id}
                  x1={x1}
                  y1="0"
                  x2={x2}
                  y2="0"
                  gradientUnits="userSpaceOnUse"
                  className="shim"
                >
                  <stop stopColor="#5E6A7A" />
                  <stop offset="0.25" stopColor="#6B7789" />
                  <stop offset="0.5" stopColor="#5E6A7A" />
                </linearGradient>
              ))}
              {/* Gold shimmer */}
              <linearGradient
                id="sG16"
                x1="79.4"
                y1="0"
                x2="125.6"
                y2="0"
                gradientUnits="userSpaceOnUse"
                className="shim"
              >
                <stop stopColor="#FCD34D" />
                <stop offset="0.25" stopColor="#FDE68A" />
                <stop offset="0.5" stopColor="#FCD34D" />
              </linearGradient>
              {/* Title bar shimmer */}
              <linearGradient
                id="sT23"
                x1="80"
                y1="0"
                x2="139.5"
                y2="0"
                gradientUnits="userSpaceOnUse"
                className="shim"
              >
                <stop stopColor="#717182" />
                <stop offset="0.28" stopColor="#D5D9E0" />
                <stop offset="0.5" stopColor="#717182" />
              </linearGradient>
              <clipPath id="cardClip">
                <path d="M74.06 46.29C66.03 46.29 59.51 52.8 59.51 60.84V269.79C59.51 277.82 66.03 284.34 74.06 284.34H454.94C462.97 284.34 469.49 277.82 469.49 269.79V60.84C469.49 52.8 462.97 46.29 454.94 46.29H74.06Z" />
              </clipPath>
            </defs>

            {/* Blobs */}
            <rect
              opacity="0.75"
              x="13.2"
              y="19.8"
              width="251.3"
              height="205"
              rx="18.5"
              fill="#A9BFDE"
              style={{
                transition: 'transform 0.5s cubic-bezier(.34,1.56,.64,1)',
                transform: hovered ? 'translate(-4px, -4px)' : 'translate(0,0)',
              }}
            />
            <rect
              opacity="0.75"
              x="257.9"
              y="119"
              width="251.3"
              height="191.8"
              rx="18.5"
              fill="#9FDBCD"
              style={{
                transition: 'transform 0.5s cubic-bezier(.34,1.56,.64,1)',
                transform: hovered ? 'translate(4px, 4px)' : 'translate(0,0)',
              }}
            />

            {/* Card shadow */}
            <path
              d="M76.7 50.26C68.67 50.26 62.16 56.77 62.16 64.8V273.76C62.16 281.79 68.67 288.31 76.7 288.31H457.59C465.62 288.31 472.13 281.79 472.13 273.76V64.8C472.13 56.77 465.62 50.26 457.59 50.26H76.7Z"
              fill="black"
              opacity="0.08"
            />

            {/* Card body */}
            <g
              style={{
                transition: 'transform 0.4s cubic-bezier(.34,1.2,.64,1)',
                transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
              }}
            >
              <g clipPath="url(#cardClip)">
                {/* White base */}
                <rect
                  x="59.51"
                  y="46.29"
                  width="410"
                  height="238"
                  rx="14.55"
                  fill="white"
                />

                {/* Top header bar */}
                <g style={s(0.1)}>
                  <rect
                    x="59.51"
                    y="46.29"
                    width="410"
                    height="22.48"
                    fill="#F0EDE4"
                  />
                  <rect
                    x="71.4"
                    y="54.88"
                    width="79.4"
                    height="4.63"
                    rx="2.31"
                    fill="url(#sL0)"
                  />
                  <rect
                    x="156.06"
                    y="54.22"
                    width="18.52"
                    height="5.95"
                    rx="2.97"
                    fill="#5E6A7A"
                  />
                  <rect
                    x="423.2"
                    y="54.88"
                    width="33.06"
                    height="4.63"
                    rx="2.31"
                    fill="url(#sL1)"
                  />
                </g>

                {/* Metric cards area */}
                <g style={s(0.25)}>
                  <rect
                    x="59.51"
                    y="68.77"
                    width="410"
                    height="43.64"
                    fill="#F4E1BA"
                    fillOpacity="0.6"
                  />
                  <rect
                    x="59.51"
                    y="111.75"
                    width="410"
                    height="1.32"
                    fill="#94A3B8"
                  />
                  {/* Inner metric card */}
                  <rect
                    x="75.38"
                    y="90.59"
                    width="374.27"
                    height="21.16"
                    rx="3.97"
                    fill="#F7F8FA"
                    stroke="#DFA837"
                    strokeWidth="0.66"
                  />
                  {/* Title shimmer */}
                  <rect
                    x="80.01"
                    y="77.37"
                    width="59.51"
                    height="4.63"
                    rx="2.31"
                    fill="url(#sT23)"
                  />
                  {/* Metric shimmers */}
                  <rect
                    x="99.85"
                    y="95.88"
                    width="56.21"
                    height="3.97"
                    rx="1.98"
                    fill="url(#sL24)"
                  />
                  <rect
                    x="99.85"
                    y="102.33"
                    width="19.34"
                    height="5.16"
                    rx="2.58"
                    fill="url(#sL25)"
                  />
                  {/* Divider line */}
                  <line
                    x1="257.89"
                    y1="92.58"
                    x2="257.89"
                    y2="110.43"
                    stroke="#E2E5EA"
                    strokeWidth="0.78"
                  />
                </g>

                {/* Tabs */}
                <g style={s(0.35)}>
                  <rect
                    x="72.74"
                    y="117.7"
                    width="25.13"
                    height="3.97"
                    rx="1.98"
                    fill="url(#sL2)"
                  />
                  <rect
                    x="72.74"
                    y="123.65"
                    width="25.13"
                    height="1.32"
                    rx="0.66"
                    fill="#3B8B9E"
                  />
                  <rect
                    x="103.16"
                    y="117.7"
                    width="21.16"
                    height="3.97"
                    rx="1.98"
                    fill="url(#sL3)"
                  />
                  <rect
                    x="129.61"
                    y="117.7"
                    width="18.52"
                    height="3.97"
                    rx="1.98"
                    fill="url(#sL4)"
                  />
                  <rect
                    x="153.41"
                    y="117.7"
                    width="34.39"
                    height="3.97"
                    rx="1.98"
                    fill="url(#sL5)"
                  />
                  <rect
                    x="193.09"
                    y="117.7"
                    width="25.13"
                    height="3.97"
                    rx="1.98"
                    fill="url(#sL6)"
                  />
                </g>

                {/* Table header */}
                <g style={s(0.45)}>
                  <rect
                    x="71.42"
                    y="129.61"
                    width="390.78"
                    height="13.23"
                    rx="3.97"
                    fill="#475569"
                  />
                  <rect
                    x="78.03"
                    y="134.23"
                    width="66.12"
                    height="3.31"
                    rx="1.65"
                    fill="url(#sD7)"
                  />
                  <rect
                    x="316.08"
                    y="134.23"
                    width="18.52"
                    height="3.31"
                    rx="1.65"
                    fill="url(#sD8)"
                  />
                  <rect
                    x="341.21"
                    y="134.23"
                    width="18.52"
                    height="3.31"
                    rx="1.65"
                    fill="url(#sD9)"
                  />
                  <rect
                    x="366.33"
                    y="134.23"
                    width="18.52"
                    height="3.31"
                    rx="1.65"
                    fill="url(#sD10)"
                  />
                  <rect
                    x="391.46"
                    y="134.23"
                    width="18.52"
                    height="3.31"
                    rx="1.65"
                    fill="url(#sD11)"
                  />
                  <rect
                    x="416.59"
                    y="134.23"
                    width="18.52"
                    height="3.31"
                    rx="1.65"
                    fill="url(#sD12)"
                  />
                  <rect
                    x="441.72"
                    y="134.23"
                    width="15.21"
                    height="3.31"
                    rx="1.65"
                    fill="url(#sD13)"
                  />
                </g>

                {/* Main project row */}
                <g style={s(0.55)}>
                  <rect
                    x="71.42"
                    y="142.83"
                    width="388.81"
                    height="15.87"
                    fill="#C7CEDB"
                  />
                  <rect
                    x="78.03"
                    y="146.8"
                    width="5.29"
                    height="5.29"
                    rx="1.32"
                    fill="#64748B"
                  />
                  <rect
                    x="87.29"
                    y="148.12"
                    width="92.57"
                    height="3.97"
                    rx="1.98"
                    fill="url(#sL14)"
                  />
                  {/* Pie chart */}
                  <circle cx="290.95" cy="150.77" r="3.97" fill="#E5E7EB" />
                  <path
                    className="pie-seg pie-seg-1"
                    d="M290.95 150.77V146.8C291.65 146.8 292.33 146.98 292.94 147.33C293.54 147.68 294.04 148.18 294.39 148.78C294.74 149.38 294.92 150.07 294.92 150.76C294.92 151.46 294.74 152.15 294.39 152.75"
                    fill="#E25D33"
                  />
                  <path
                    className="pie-seg pie-seg-2"
                    d="M290.95 150.77L294.39 152.75C294.04 153.35 293.54 153.86 292.94 154.2C292.33 154.55 291.65 154.74 290.95 154.74C290.25 154.74 289.57 154.55 288.97 154.2C288.36 153.86 287.86 153.35 287.51 152.75"
                    fill="#88B253"
                  />
                  <path
                    className="pie-seg pie-seg-3"
                    d="M290.95 150.77L287.51 152.75C287.16 152.15 286.98 151.46 286.98 150.76C286.98 150.07 287.17 149.38 287.51 148.78C287.86 148.18 288.36 147.68 288.97 147.33C289.57 146.98 290.25 146.8 290.95 146.8"
                    fill="#4599DF"
                  />
                  <circle cx="290.95" cy="150.77" r="1.65" fill="#C7CEDB" />
                  {/* Cell placeholders */}
                  {[320, 345.2, 370.3, 395.4, 420.6, 445.7].map((x, i) => (
                    <rect
                      key={i}
                      x={x}
                      y="149.44"
                      width="8"
                      height="3.31"
                      rx="1.65"
                      fill={i === 5 ? '#94A3B8' : '#D5D9E0'}
                    />
                  ))}
                </g>

                {/* Row 1 — gold border */}
                <g style={s(0.65)}>
                  <rect
                    x="71.42"
                    y="161.35"
                    width="388.81"
                    height="22.48"
                    fill="#FEF9E7"
                  />
                  <rect
                    x="71.42"
                    y="161.35"
                    width="1.98"
                    height="22.48"
                    fill="#E6C760"
                  />
                  <rect
                    x="79.35"
                    y="166.64"
                    width="72.74"
                    height="3.97"
                    rx="1.98"
                    fill="url(#sL15)"
                  />
                  <rect
                    x="79.35"
                    y="173.25"
                    width="46.29"
                    height="2.65"
                    rx="1.32"
                    fill="url(#sG16)"
                  />
                  {/* Person icon */}
                  <circle cx="273.76" cy="169.94" r="2.31" fill="#94A3B8" />
                  <path
                    d="M269.13 176.55C269.13 174.35 270.67 173.25 273.76 173.25C276.84 173.25 278.39 174.35 278.39 176.55H269.13Z"
                    fill="#94A3B8"
                  />
                  {/* Grid icon */}
                  <rect
                    x="286.32"
                    y="167.3"
                    width="9.26"
                    height="9.26"
                    rx="1.98"
                    stroke="#CBD5E1"
                    strokeWidth="0.99"
                    fill="none"
                  />
                  <rect
                    x="288.97"
                    y="169.94"
                    width="3.97"
                    height="3.97"
                    rx="0.66"
                    fill="#CBD5E1"
                  />
                  {/* Cells */}
                  {[320, 345.2, 370.3, 395.4, 420.6, 445.7].map((x, i) => (
                    <rect
                      key={i}
                      x={x}
                      y="171.93"
                      width="5.95"
                      height="2.65"
                      rx="1.32"
                      fill={i === 5 ? '#94A3B8' : '#E5E7EB'}
                    />
                  ))}
                </g>

                {/* Row 2 */}
                <g style={s(0.75)}>
                  <rect
                    x="71.42"
                    y="183.83"
                    width="388.81"
                    height="22.48"
                    fill="white"
                  />
                  <rect
                    x="71.42"
                    y="183.83"
                    width="1.98"
                    height="22.48"
                    fill="#D1D5DB"
                  />
                  <rect
                    x="79.35"
                    y="189.12"
                    width="85.96"
                    height="3.97"
                    rx="1.98"
                    fill="url(#sL17)"
                  />
                  <rect
                    x="79.35"
                    y="195.73"
                    width="33.06"
                    height="2.65"
                    rx="1.32"
                    fill="url(#sL18)"
                  />
                  <circle cx="273.76" cy="192.42" r="2.31" fill="#94A3B8" />
                  <path
                    d="M269.13 199.04C269.13 196.83 270.67 195.73 273.76 195.73C276.84 195.73 278.39 196.83 278.39 199.04H269.13Z"
                    fill="#94A3B8"
                  />
                  <rect
                    x="286.32"
                    y="189.78"
                    width="9.26"
                    height="9.26"
                    rx="1.98"
                    stroke="#CBD5E1"
                    strokeWidth="0.99"
                    fill="none"
                  />
                  <rect
                    x="288.97"
                    y="192.42"
                    width="3.97"
                    height="3.97"
                    rx="0.66"
                    fill="#CBD5E1"
                  />
                  {[320, 345.2, 370.3, 395.4, 420.6, 445.7].map((x, i) => (
                    <rect
                      key={i}
                      x={x}
                      y="194.41"
                      width="5.95"
                      height="2.65"
                      rx="1.32"
                      fill={i === 5 ? '#94A3B8' : '#E5E7EB'}
                    />
                  ))}
                </g>

                {/* Row 3 */}
                <g style={s(0.85)}>
                  <rect
                    x="71.42"
                    y="206.31"
                    width="388.81"
                    height="22.48"
                    fill="#FEF9E7"
                  />
                  <rect
                    x="71.42"
                    y="206.31"
                    width="1.98"
                    height="22.48"
                    fill="#D1D5DB"
                  />
                  <rect
                    x="79.35"
                    y="211.6"
                    width="59.51"
                    height="3.97"
                    rx="1.98"
                    fill="url(#sL19)"
                  />
                  <rect
                    x="79.35"
                    y="218.21"
                    width="33.06"
                    height="2.65"
                    rx="1.32"
                    fill="url(#sL20)"
                  />
                  <circle cx="273.76" cy="214.91" r="2.31" fill="#94A3B8" />
                  <path
                    d="M269.13 221.52C269.13 219.31 270.67 218.21 273.76 218.21C276.84 218.21 278.39 219.31 278.39 221.52H269.13Z"
                    fill="#94A3B8"
                  />
                  <rect
                    x="286.32"
                    y="212.26"
                    width="9.26"
                    height="9.26"
                    rx="1.98"
                    stroke="#CBD5E1"
                    strokeWidth="0.99"
                    fill="none"
                  />
                  <rect
                    x="288.97"
                    y="214.91"
                    width="3.97"
                    height="3.97"
                    rx="0.66"
                    fill="#CBD5E1"
                  />
                  {[320, 345.2, 370.3, 395.4, 420.6, 445.7].map((x, i) => (
                    <rect
                      key={i}
                      x={x}
                      y="216.89"
                      width="5.95"
                      height="2.65"
                      rx="1.32"
                      fill={i === 5 ? '#94A3B8' : '#E5E7EB'}
                    />
                  ))}
                </g>

                {/* Row 4 */}
                <g style={s(0.95)}>
                  <rect
                    x="71.42"
                    y="228.79"
                    width="388.81"
                    height="22.48"
                    fill="white"
                  />
                  <rect
                    x="71.42"
                    y="228.79"
                    width="1.98"
                    height="22.48"
                    fill="#D1D5DB"
                  />
                  <rect
                    x="79.35"
                    y="234.08"
                    width="69.43"
                    height="3.97"
                    rx="1.98"
                    fill="url(#sL21)"
                  />
                  <rect
                    x="79.35"
                    y="240.7"
                    width="33.06"
                    height="2.65"
                    rx="1.32"
                    fill="url(#sL22)"
                  />
                  <circle cx="273.76" cy="237.39" r="2.31" fill="#94A3B8" />
                  <path
                    d="M269.13 244C269.13 241.8 270.67 240.7 273.76 240.7C276.84 240.7 278.39 241.8 278.39 244H269.13Z"
                    fill="#94A3B8"
                  />
                  <rect
                    x="286.32"
                    y="234.74"
                    width="9.26"
                    height="9.26"
                    rx="1.98"
                    stroke="#CBD5E1"
                    strokeWidth="0.99"
                    fill="none"
                  />
                  <rect
                    x="288.97"
                    y="237.39"
                    width="3.97"
                    height="3.97"
                    rx="0.66"
                    fill="#CBD5E1"
                  />
                  {[320, 345.2, 370.3, 395.4, 420.6, 445.7].map((x, i) => (
                    <rect
                      key={i}
                      x={x}
                      y="239.37"
                      width="5.95"
                      height="2.65"
                      rx="1.32"
                      fill={i === 5 ? '#94A3B8' : '#E5E7EB'}
                    />
                  ))}
                </g>
              </g>

              {/* Card outline */}
              <rect
                x="59.51"
                y="46.29"
                width="410"
                height="238"
                rx="14.55"
                fill="none"
                stroke="white"
                strokeWidth="0.33"
              />
            </g>
          </svg>
        </div>
      </div>
    </>
  )
}
