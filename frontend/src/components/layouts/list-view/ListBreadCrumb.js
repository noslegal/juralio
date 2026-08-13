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

import React from 'react'
import { makeStyles } from 'tss-react/mui'
import classNames from 'classnames'

const style = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    zIndex: 1001,
  },
}))

const UnselectedSubLevel = props => {
  const { classes } = style()
  return (
    <div
      style={
        props.currentLevel - 1 !== props.level ? { marginRight: '-5px' } : {}
      }
      className={classes.wrapper}
    >
      <svg
        width="15"
        height="16"
        viewBox="0 0 15 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.772 1.55A1 1 0 0 1 2.607 0H6.25v16H2.607a1 1 0 0 1-.835-1.55L5.298 9.1a2 2 0 0 0 0-2.2zM6.25 0h.5a3 3 0 0 1 2.4 1.2l4.2 5.6a2 2 0 0 1 0 2.4l-4.2 5.6a3 3 0 0 1-2.4 1.2h-.5z"
          fill="#504C4B"
          fillOpacity=".1"
        />
      </svg>
    </div>
  )
}

const SelectedEndCapNoSubtasks = props => {
  const { classes } = style()
  switch (props.level) {
    case 2:
      return (
        <svg
          width="25"
          height="16"
          viewBox="0 0 25 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ cursor: 'pointer', marginLeft: '-4px' }}
          data-test={`selected-end-cap`}
        >
          <path
            d="M1.02196 1.55036C0.583681 0.885474 1.06054 0 1.85688 0H8V8V16H1.85688C1.06054 16 0.583682 15.1145 1.02196 14.4496L4.54782 9.10072C4.98802 8.43292 4.98801 7.56708 4.54782 6.89928L1.02196 1.55036Z"
            fill="#504C4B"
          />
          <g>
            <rect
              width="9"
              height="16"
              transform="translate(8)"
              fill="#504C4B"
            />
            <path
              d="M9.84456 12V3.6H13.4686C14.4046 3.6 15.1286 3.788 15.6406 4.164C16.1606 4.54 16.4206 5.072 16.4206 5.76C16.4206 6.216 16.3126 6.6 16.0966 6.912C15.8886 7.224 15.6006 7.46 15.2326 7.62C14.8726 7.78 14.4766 7.86 14.0446 7.86L14.2486 7.572C14.7846 7.572 15.2446 7.656 15.6286 7.824C16.0206 7.984 16.3246 8.228 16.5406 8.556C16.7566 8.876 16.8646 9.276 16.8646 9.756C16.8646 10.468 16.6006 11.02 16.0726 11.412C15.5526 11.804 14.7646 12 13.7086 12H9.84456ZM10.7326 11.268H13.6966C14.4326 11.268 14.9966 11.144 15.3886 10.896C15.7806 10.64 15.9766 10.236 15.9766 9.684C15.9766 9.14 15.7806 8.744 15.3886 8.496C14.9966 8.24 14.4326 8.112 13.6966 8.112H10.6366V7.38H13.4086C14.0806 7.38 14.6006 7.252 14.9686 6.996C15.3446 6.74 15.5326 6.36 15.5326 5.856C15.5326 5.344 15.3446 4.964 14.9686 4.716C14.6006 4.46 14.0806 4.332 13.4086 4.332H10.7326V11.268Z"
              fill="#F8F8F6"
            />
          </g>
          <path
            d="M17 0H21C23.2091 0 25 1.79086 25 4V8V12C25 14.2091 23.2091 16 21 16H17V8V0Z"
            fill="#504C4B"
          />
          <defs>
            <clipPath id="clip0_387_1839">
              <rect
                width="9"
                height="16"
                fill="white"
                transform="translate(8)"
              />
            </clipPath>
          </defs>
        </svg>
      )
    case 3:
      return (
        <svg
          width="25"
          height="16"
          viewBox="0 0 25 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ cursor: 'pointer', marginLeft: '-4px' }}
          data-test={`selected-end-cap`}
        >
          <path
            d="M1.02196 1.55036C0.583681 0.885474 1.06054 0 1.85688 0H8V8V16H1.85688C1.06054 16 0.583682 15.1145 1.02196 14.4496L4.54782 9.10072C4.98802 8.43292 4.98801 7.56708 4.54782 6.89928L1.02196 1.55036Z"
            fill="#504C4B"
          />
          <g>
            <rect
              width="9"
              height="16"
              transform="translate(8)"
              fill="#504C4B"
            />
            <path
              d="M13.2035 12.072C12.5715 12.072 11.9875 11.968 11.4515 11.76C10.9155 11.544 10.4515 11.244 10.0595 10.86C9.6675 10.476 9.3595 10.024 9.1355 9.504C8.9195 8.984 8.8115 8.416 8.8115 7.8C8.8115 7.184 8.9195 6.616 9.1355 6.096C9.3595 5.576 9.6675 5.124 10.0595 4.74C10.4595 4.356 10.9275 4.06 11.4635 3.852C11.9995 3.636 12.5835 3.528 13.2155 3.528C13.8235 3.528 14.3955 3.632 14.9315 3.84C15.4675 4.04 15.9195 4.344 16.2875 4.752L15.7235 5.316C15.3795 4.964 14.9995 4.712 14.5835 4.56C14.1675 4.4 13.7195 4.32 13.2395 4.32C12.7355 4.32 12.2675 4.408 11.8355 4.584C11.4035 4.752 11.0275 4.996 10.7075 5.316C10.3875 5.628 10.1355 5.996 9.9515 6.42C9.7755 6.836 9.6875 7.296 9.6875 7.8C9.6875 8.304 9.7755 8.768 9.9515 9.192C10.1355 9.608 10.3875 9.976 10.7075 10.296C11.0275 10.608 11.4035 10.852 11.8355 11.028C12.2675 11.196 12.7355 11.28 13.2395 11.28C13.7195 11.28 14.1675 11.2 14.5835 11.04C14.9995 10.88 15.3795 10.624 15.7235 10.272L16.2875 10.836C15.9195 11.244 15.4675 11.552 14.9315 11.76C14.3955 11.968 13.8195 12.072 13.2035 12.072Z"
              fill="#F8F8F6"
            />
          </g>
          <path
            d="M17 0H21C23.2091 0 25 1.79086 25 4V8V12C25 14.2091 23.2091 16 21 16H17V8V0Z"
            fill="#504C4B"
          />
          <defs>
            <clipPath id="clip0_387_1839">
              <rect
                width="9"
                height="16"
                fill="white"
                transform="translate(8)"
              />
            </clipPath>
          </defs>
        </svg>
      )
    case 4:
      return (
        <svg
          width="25"
          height="16"
          viewBox="0 0 25 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ cursor: 'pointer', marginLeft: '-4px' }}
          data-test={`selected-end-cap`}
        >
          <path
            d="M1.02196 1.55036C0.583681 0.885474 1.06054 0 1.85688 0H8V8V16H1.85688C1.06054 16 0.583682 15.1145 1.02196 14.4496L4.54782 9.10072C4.98802 8.43292 4.98801 7.56708 4.54782 6.89928L1.02196 1.55036Z"
            fill="#504C4B"
          />
          <g>
            <rect
              width="9"
              height="16"
              transform="translate(8)"
              fill="#504C4B"
            />
            <path
              d="M9.41097 12V3.6H12.831C13.727 3.6 14.511 3.78 15.183 4.14C15.863 4.492 16.391 4.984 16.767 5.616C17.143 6.248 17.331 6.976 17.331 7.8C17.331 8.624 17.143 9.352 16.767 9.984C16.391 10.616 15.863 11.112 15.183 11.472C14.511 11.824 13.727 12 12.831 12H9.41097ZM10.299 11.232H12.783C13.527 11.232 14.171 11.088 14.715 10.8C15.267 10.504 15.695 10.1 15.999 9.588C16.303 9.068 16.455 8.472 16.455 7.8C16.455 7.12 16.303 6.524 15.999 6.012C15.695 5.5 15.267 5.1 14.715 4.812C14.171 4.516 13.527 4.368 12.783 4.368H10.299V11.232Z"
              fill="#F8F8F6"
            />
          </g>
          <path
            d="M17 0H21C23.2091 0 25 1.79086 25 4V8V12C25 14.2091 23.2091 16 21 16H17V8V0Z"
            fill="#504C4B"
          />
          <defs>
            <clipPath id="clip0_387_1839">
              <rect
                width="9"
                height="16"
                fill="white"
                transform="translate(8)"
              />
            </clipPath>
          </defs>
        </svg>
      )
    case 5:
      return (
        <svg
          width="25"
          height="16"
          viewBox="0 0 25 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ cursor: 'pointer', marginLeft: '-4px' }}
          data-test={`selected-end-cap`}
        >
          <path
            d="M1.02196 1.55036C0.583681 0.885474 1.06054 0 1.85688 0H8V8V16H1.85688C1.06054 16 0.583682 15.1145 1.02196 14.4496L4.54782 9.10072C4.98802 8.43292 4.98801 7.56708 4.54782 6.89928L1.02196 1.55036Z"
            fill="#504C4B"
          />
          <g>
            <rect
              width="9"
              height="16"
              transform="translate(8)"
              fill="#504C4B"
            />
            <path
              d="M10.6463 7.356H15.0863V8.112H10.6463V7.356ZM10.7423 11.232H15.7943V12H9.85433V3.6H15.6143V4.368H10.7423V11.232Z"
              fill="#F8F8F6"
            />
          </g>
          <path
            d="M17 0H21C23.2091 0 25 1.79086 25 4V8V12C25 14.2091 23.2091 16 21 16H17V8V0Z"
            fill="#504C4B"
          />
          <defs>
            <clipPath id="clip0_387_1839">
              <rect
                width="9"
                height="16"
                fill="white"
                transform="translate(8)"
              />
            </clipPath>
          </defs>
        </svg>
      )
    case 6:
      return (
        <div>
          <svg
            width="24"
            height="16"
            viewBox="0 0 24 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ cursor: 'pointer', marginLeft: '-4px' }}
            data-test={`selected-end-cap`}
          >
            <path
              d="M1.02196 1.55036C0.583681 0.885474 1.06054 0 1.85688 0H8V8V16H1.85688C1.06054 16 0.583682 15.1145 1.02196 14.4496L4.54782 9.10072C4.98802 8.43292 4.98801 7.56708 4.54782 6.89928L1.02196 1.55036Z"
              fill="#504C4B"
            />
            <g>
              <rect
                width="8"
                height="16"
                transform="translate(8)"
                fill="#504C4B"
              />
              <path
                d="M10.4591 4.368V7.668H14.8031V8.436H10.4591V12H9.57113V3.6H15.3311V4.368H10.4591Z"
                fill="#F8F8F6"
              />
            </g>
            <path
              d="M16 0H20C22.2091 0 24 1.79086 24 4V8V12C24 14.2091 22.2091 16 20 16H16V8V0Z"
              fill="#504C4B"
            />
            <defs>
              <clipPath id="clip0_72_18788">
                <rect
                  width="8"
                  height="16"
                  fill="white"
                  transform="translate(8)"
                />
              </clipPath>
            </defs>
          </svg>
        </div>
      )

    default:
      return null
  }
}

const SelectedEndCapSubtasks = props => {
  const { classes } = style()
  switch (props.level) {
    case 2:
      return (
        <div
          onClick={() => {
            if (props.close) {
              props.close(props.level)
            }
          }}
        >
          <svg
            width="28"
            height="16"
            viewBox="0 0 28 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ cursor: 'pointer', marginLeft: '-4px' }}
            data-test={`selected-sublevel-${props.level}`}
          >
            <path
              d="M1.02196 1.55036C0.583681 0.885474 1.06054 0 1.85688 0H8V8V16H1.85688C1.06054 16 0.583682 15.1145 1.02196 14.4496L4.54782 9.10072C4.98802 8.43292 4.98801 7.56708 4.54782 6.89928L1.02196 1.55036Z"
              fill="#504C4B"
            />
            <g>
              <rect
                width="10"
                height="16"
                transform="translate(8)"
                fill="#504C4B"
              />
              <path
                d="M9.84456 12V3.6H13.4686C14.4046 3.6 15.1286 3.788 15.6406 4.164C16.1606 4.54 16.4206 5.072 16.4206 5.76C16.4206 6.216 16.3126 6.6 16.0966 6.912C15.8886 7.224 15.6006 7.46 15.2326 7.62C14.8726 7.78 14.4766 7.86 14.0446 7.86L14.2486 7.572C14.7846 7.572 15.2446 7.656 15.6286 7.824C16.0206 7.984 16.3246 8.228 16.5406 8.556C16.7566 8.876 16.8646 9.276 16.8646 9.756C16.8646 10.468 16.6006 11.02 16.0726 11.412C15.5526 11.804 14.7646 12 13.7086 12H9.84456ZM10.7326 11.268H13.6966C14.4326 11.268 14.9966 11.144 15.3886 10.896C15.7806 10.64 15.9766 10.236 15.9766 9.684C15.9766 9.14 15.7806 8.744 15.3886 8.496C14.9966 8.24 14.4326 8.112 13.6966 8.112H10.6366V7.38H13.4086C14.0806 7.38 14.6006 7.252 14.9686 6.996C15.3446 6.74 15.5326 6.36 15.5326 5.856C15.5326 5.344 15.3446 4.964 14.9686 4.716C14.6006 4.46 14.0806 4.332 13.4086 4.332H10.7326V11.268Z"
                fill="#F8F8F6"
              />
            </g>
            <path
              d="M18 0H20.5C21.4443 0 22.3334 0.444583 22.9 1.2L27.1 6.8C27.6333 7.51111 27.6333 8.48889 27.1 9.2L22.9 14.8C22.3334 15.5554 21.4443 16 20.5 16H18V8V0Z"
              fill="#504C4B"
            />
            <defs>
              <clipPath id="clip0_387_28254">
                <rect
                  width="10"
                  height="16"
                  fill="white"
                  transform="translate(8)"
                />
              </clipPath>
            </defs>
          </svg>
        </div>
      )
    case 3:
      return (
        <div
          onClick={() => {
            if (props.close) {
              props.close(props.level)
            }
          }}
        >
          <svg
            width="27"
            height="16"
            viewBox="0 0 27 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ cursor: 'pointer', marginLeft: '-4px' }}
            data-test={`unselected-sublevel-${props.level}`}
          >
            <path
              d="M1.02196 1.55036C0.583681 0.885474 1.06054 0 1.85688 0H8V8V16H1.85688C1.06054 16 0.583682 15.1145 1.02196 14.4496L4.54782 9.10072C4.98802 8.43292 4.98801 7.56708 4.54782 6.89928L1.02196 1.55036Z"
              fill="#504C4B"
            />
            <g>
              <rect
                width="9"
                height="16"
                transform="translate(8)"
                fill="#504C4B"
              />
              <path
                d="M13.2035 12.072C12.5715 12.072 11.9875 11.968 11.4515 11.76C10.9155 11.544 10.4515 11.244 10.0595 10.86C9.6675 10.476 9.3595 10.024 9.1355 9.504C8.9195 8.984 8.8115 8.416 8.8115 7.8C8.8115 7.184 8.9195 6.616 9.1355 6.096C9.3595 5.576 9.6675 5.124 10.0595 4.74C10.4595 4.356 10.9275 4.06 11.4635 3.852C11.9995 3.636 12.5835 3.528 13.2155 3.528C13.8235 3.528 14.3955 3.632 14.9315 3.84C15.4675 4.04 15.9195 4.344 16.2875 4.752L15.7235 5.316C15.3795 4.964 14.9995 4.712 14.5835 4.56C14.1675 4.4 13.7195 4.32 13.2395 4.32C12.7355 4.32 12.2675 4.408 11.8355 4.584C11.4035 4.752 11.0275 4.996 10.7075 5.316C10.3875 5.628 10.1355 5.996 9.9515 6.42C9.7755 6.836 9.6875 7.296 9.6875 7.8C9.6875 8.304 9.7755 8.768 9.9515 9.192C10.1355 9.608 10.3875 9.976 10.7075 10.296C11.0275 10.608 11.4035 10.852 11.8355 11.028C12.2675 11.196 12.7355 11.28 13.2395 11.28C13.7195 11.28 14.1675 11.2 14.5835 11.04C14.9995 10.88 15.3795 10.624 15.7235 10.272L16.2875 10.836C15.9195 11.244 15.4675 11.552 14.9315 11.76C14.3955 11.968 13.8195 12.072 13.2035 12.072Z"
                fill="#F8F8F6"
              />
            </g>
            <path
              d="M17 0H19.5C20.4443 0 21.3334 0.444583 21.9 1.2L26.1 6.8C26.6333 7.51111 26.6333 8.48889 26.1 9.2L21.9 14.8C21.3334 15.5554 20.4443 16 19.5 16H17V8V0Z"
              fill="#504C4B"
            />
            <defs>
              <clipPath id="clip0_387_27968">
                <rect
                  width="9"
                  height="16"
                  fill="white"
                  transform="translate(8)"
                />
              </clipPath>
            </defs>
          </svg>
        </div>
      )
    case 4:
      return (
        <div
          onClick={() => {
            if (props.close) {
              props.close(props.level)
            }
          }}
        >
          <svg
            width="28"
            height="16"
            viewBox="0 0 28 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ cursor: 'pointer', marginLeft: '-4px' }}
            data-test={`unselected-sublevel-${props.level}`}
          >
            <path
              d="M1.02196 1.55036C0.583681 0.885474 1.06054 0 1.85688 0H8V8V16H1.85688C1.06054 16 0.583682 15.1145 1.02196 14.4496L4.54782 9.10072C4.98802 8.43292 4.98801 7.56708 4.54782 6.89928L1.02196 1.55036Z"
              fill="#504C4B"
            />
            <g>
              <rect
                width="10"
                height="16"
                transform="translate(8)"
                fill="#504C4B"
              />
              <path
                d="M9.41097 12V3.6H12.831C13.727 3.6 14.511 3.78 15.183 4.14C15.863 4.492 16.391 4.984 16.767 5.616C17.143 6.248 17.331 6.976 17.331 7.8C17.331 8.624 17.143 9.352 16.767 9.984C16.391 10.616 15.863 11.112 15.183 11.472C14.511 11.824 13.727 12 12.831 12H9.41097ZM10.299 11.232H12.783C13.527 11.232 14.171 11.088 14.715 10.8C15.267 10.504 15.695 10.1 15.999 9.588C16.303 9.068 16.455 8.472 16.455 7.8C16.455 7.12 16.303 6.524 15.999 6.012C15.695 5.5 15.267 5.1 14.715 4.812C14.171 4.516 13.527 4.368 12.783 4.368H10.299V11.232Z"
                fill="#F8F8F6"
              />
            </g>
            <path
              d="M18 0H20.5C21.4443 0 22.3334 0.444583 22.9 1.2L27.1 6.8C27.6333 7.51111 27.6333 8.48889 27.1 9.2L22.9 14.8C22.3334 15.5554 21.4443 16 20.5 16H18V8V0Z"
              fill="#504C4B"
            />
            <defs>
              <clipPath id="clip0_387_28940">
                <rect
                  width="10"
                  height="16"
                  fill="white"
                  transform="translate(8)"
                />
              </clipPath>
            </defs>
          </svg>
        </div>
      )
    case 5:
      return (
        <div
          onClick={() => {
            if (props.close) {
              props.close(props.level)
            }
          }}
        >
          <svg
            width="27"
            height="16"
            viewBox="0 0 27 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ cursor: 'pointer', marginLeft: '-4px' }}
            data-test={`unselected-sublevel-${props.level}`}
          >
            <path
              d="M1.02196 1.55036C0.583681 0.885474 1.06054 0 1.85688 0H8V8V16H1.85688C1.06054 16 0.583682 15.1145 1.02196 14.4496L4.54782 9.10072C4.98802 8.43292 4.98801 7.56708 4.54782 6.89928L1.02196 1.55036Z"
              fill="#504C4B"
            />
            <g>
              <rect
                width="9"
                height="16"
                transform="translate(8)"
                fill="#504C4B"
              />
              <path
                d="M10.6463 7.356H15.0863V8.112H10.6463V7.356ZM10.7423 11.232H15.7943V12H9.85433V3.6H15.6143V4.368H10.7423V11.232Z"
                fill="#F8F8F6"
              />
            </g>
            <path
              d="M17 0H19.5C20.4443 0 21.3334 0.444583 21.9 1.2L26.1 6.8C26.6333 7.51111 26.6333 8.48889 26.1 9.2L21.9 14.8C21.3334 15.5554 20.4443 16 19.5 16H17V8V0Z"
              fill="#504C4B"
            />
            <defs>
              <clipPath id="clip0_387_22444">
                <rect
                  width="9"
                  height="16"
                  fill="white"
                  transform="translate(8)"
                />
              </clipPath>
            </defs>
          </svg>
        </div>
      )

    default:
      return null
  }
}

const ListBreadCrumb = props => {
  const { classes } = style()
  return (
    <div style={{ zIndex: 1005, width: '100%', justifyItems: 'center' }}>
      <div className={classNames([classes.wrapper])}>
        {new Array(props.maxLevel - 1).fill(0).map((currentElem, index) => {
          if (index === 0 || index === props.maxLevel - 1) {
            return null //skip level A
          }
          return (
            <UnselectedSubLevel level={index + 1} currentLevel={props.level} />
          )
        })}
        {props.task.tasks.length > 0 ? (
          <SelectedEndCapSubtasks level={props.level} />
        ) : (
          <SelectedEndCapNoSubtasks level={props.level} />
        )}
      </div>
    </div>
  )
}

export default ListBreadCrumb
