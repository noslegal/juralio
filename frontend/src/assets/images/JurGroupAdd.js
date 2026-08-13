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

const JurGroupAdd = ({ fontSize = 24, color = 'currentColor' }) => {
  const s = fontSize
  const plusSize = s * 0.28
  const plusStroke = s * 0.08

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={s * 1.15}
      height={s}
      viewBox={`${-plusSize / 2} 0 ${s * 1.15} ${s}`}
      fill={color}
      aria-hidden="true"
    >
      {/* MUI GroupsIcon paths */}
      <g transform={`scale(${s / 24})`}>
        {/* Central person */}
        <circle cx="12" cy="7" r="2.5" />
        <path d="M12 11c-2.67 0-8 1.34-8 4v1.5h16V15c0-2.66-5.33-4-8-4z" />
        {/* Left person */}
        <circle cx="5.5" cy="7.5" r="2" />
        <path d="M5.5 11c-.93 0-1.83.17-2.65.47C4.1 12.2 4 13.13 4 14v1.5H0V14c0-2.21 2.69-3.47 5.5-3z" />
        {/* Right person */}
        <circle cx="18.5" cy="7.5" r="2" />
        <path d="M18.5 11c2.81.53 5.5 1.79 5.5 3v1.5H20V14c0-.87-.1-1.8-1.85-2.53.82-.3 1.72-.47 2.35-.47z" />
      </g>

      {/* Plus icon — top left corner */}
      <g transform={`translate(${plusSize / 2 - 2}, ${plusSize / 2 + 1})`}>
        <rect
          x={-plusSize / 2}
          y={-plusStroke / 2}
          width={plusSize}
          height={plusStroke}
          rx={plusStroke / 2}
        />
        <rect
          x={-plusStroke / 2}
          y={-plusSize / 2}
          width={plusStroke}
          height={plusSize}
          rx={plusStroke / 2}
        />
      </g>
    </svg>
  )
}

export default JurGroupAdd
