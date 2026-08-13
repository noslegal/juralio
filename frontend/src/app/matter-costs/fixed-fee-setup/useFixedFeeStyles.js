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

import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../theme/raw-colours'
import juralioColours from '../../../theme/juralio-colours'
import colorModifiers from '../../../theme/color-modifiers'

const useFixedFeeStyles = makeStyles()(theme => ({
  shell: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '48px 32px 80px',
    fontFamily:
      'Montserrat, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    color: rawColours.primary.black.black,
    background: rawColours.primary.grey[100],
    minHeight: '100%',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  pageHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  closeButton: {
    color: rawColours.primary.black[200],
  },
  pageTitle: {
    fontWeight: 500,
    fontSize: 28,
    lineHeight: '36px',
    color: rawColours.primary.black.black,
    letterSpacing: '-0.2px',
    margin: 0,
  },
  pageSub: {
    marginTop: 6,
    color: rawColours.primary.black[100],
    fontSize: 14,
  },
  stepSectionTitle: {
    fontWeight: 500,
    fontSize: 15,
    color: rawColours.primary.black.black,
    margin: '22px 0 8px',
  },
  stepSectionTitleFirst: {
    marginTop: 0,
  },
  card: {
    background: rawColours.primary.white.primary,
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: 12,
    padding: '24px 28px',
    '& + &': { marginTop: 16 },
  },
  cardDesc: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    color: rawColours.primary.black[100],
    fontSize: 14,
    marginBottom: 18,
  },
  cardIcon: {
    fontSize: 20,
    color: rawColours.primary.black[100],
  },
  fieldLabel: {
    fontSize: 13,
    color: rawColours.primary.black[100],
    marginBottom: 6,
  },
  fieldHelp: {
    marginTop: 8,
    fontSize: 12,
    color: rawColours.primary.black[100],
  },
  prefilledHint: {
    marginTop: 8,
    fontSize: 12,
    color: rawColours.primary.green.primary,
  },
  required: {
    color: rawColours.error.primary,
    marginLeft: 2,
  },
  amountWrapper: {
    position: 'relative',
    marginTop: 4,
    maxWidth: 460,
  },
  amountPrefix: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: rawColours.primary.black[100],
    fontWeight: 500,
    pointerEvents: 'none',
    zIndex: 1,
  },
  amountInputRoot: {
    width: '100%',
    padding: '12px 14px 12px 60px',
    borderRadius: 8,
    border: '1px solid rgba(0, 0, 0, 0.12)',
    background: rawColours.primary.white.primary,
    height: 56,
    boxSizing: 'border-box',
    transition: 'border-color 150ms, box-shadow 150ms',
    '&:hover': { borderColor: rawColours.primary.primary.main },
    '&.Mui-focused': {
      borderColor: rawColours.primary.primary.main,
      boxShadow: '0 0 0 3px rgba(63,121,155,0.15)',
    },
  },
  amountInputInput: {
    padding: 0,
    height: '100%',
    fontSize: 22,
    fontWeight: 500,
    fontFamily: 'Montserrat, sans-serif',
    color: rawColours.primary.black.black,
  },
  currencyField: {
    maxWidth: 420,
  },
  fieldTitle: {
    fontWeight: 500,
    fontSize: 14,
    color: rawColours.primary.black.black,
    marginBottom: 8,
  },
  postApprovalHeader: {
    paddingTop: 18,
    marginTop: 18,
    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
  },
  postApprovalTitle: {
    font: '500 13.5px Montserrat',
    color: rawColours.primary.black.black,
    letterSpacing: 0.2,
  },
  postApprovalSubtitle: {
    fontSize: 12,
    color: rawColours.primary.black[100],
    marginTop: 3,
  },
  postApprovalSubtitleWarn: {
    color: rawColours.riskLabels.red.primary,
    fontWeight: 500,
  },
  postApprovalBody: {
    marginTop: 12,
  },
  scopeSummary: {
    display: 'grid',
    gridTemplateColumns: '1fr',
  },
  scopeStatRow: {
    display: 'grid',
    gridTemplateColumns: '24px 160px 1fr auto',
    gap: 12,
    alignItems: 'center',
    padding: '12px 0',
    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
    '&:first-of-type': { borderTop: 0 },
  },
  scopeStatIcon: {
    color: rawColours.primary.black[100],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scopeStatLabel: {
    color: rawColours.primary.black[100],
    fontSize: 14,
  },
  scopeStatValue: {
    color: rawColours.primary.black.black,
    fontWeight: 500,
    fontSize: 14,
    display: 'flex',
    alignItems: 'baseline',
    flexWrap: 'nowrap',
    whiteSpace: 'nowrap',
  },
  scopeStatMuted: {
    color: rawColours.primary.black[100],
    fontWeight: 400,
  },
  scopeStatAmount: {
    color: rawColours.primary.black.black,
    fontWeight: 600,
    marginLeft: 8,
  },
  scopeStatBadge: {
    cursor: 'default',
    display: 'flex',
    alignItems: 'center',
  },
  scopeStatBadgeSuccess: { color: rawColours.primary.green.primary },
  scopeStatBadgeWarn: { color: rawColours.riskLabels.amber.primary },
  scopeRowIcon: { fontSize: 18 },
  scopeStatDurationSuffix: {
    color: rawColours.primary.black[100],
    marginLeft: 8,
  },
  step3SummaryHeading: { marginBottom: 8 },
  postApprovalRequiredMark: { color: rawColours.primary.primary.main },
  sectionHeading: {
    marginTop: 18,
    marginBottom: 8,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionHeadingTitle: {
    font: '500 15px Montserrat',
    color: rawColours.primary.black.black,
  },
  sectionHeadingMeta: {
    color: rawColours.primary.black[100],
    fontSize: 13,
  },
  infoAlert: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    padding: '10px 14px',
    margin: '0 0 12px',
    borderRadius: 8,
    background: rawColours.primary.primary.light,
    border: `1px solid ${rawColours.primary.primary.main}55`,
    color: rawColours.primary.black.black,
    fontSize: 12.5,
    lineHeight: '18px',
  },
  infoAlertIcon: {
    fontSize: 18,
    color: rawColours.primary.primary.main,
    marginTop: 1,
    flex: 'none',
  },
  phaseCard: {
    background: rawColours.primary.white.primary,
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: 12,
    marginTop: 12,
    overflow: 'hidden',
  },
  phaseHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '12px 24px',
  },
  phaseHeadNotRequired: {
    background: rawColours.status.notRequired.light,
  },
  phaseHeadNotStarted: {
    background: rawColours.status.notStarted.light,
  },
  phaseHeadInProgress: {
    background: rawColours.status.inProgress.light,
  },
  phaseHeadDone: {
    background: rawColours.status.done.light,
  },
  phaseHeadTemplate: {
    background: rawColours.status.template.light,
  },
  phaseBody: {
    padding: '16px 24px 20px',
  },
  phaseTitle: {
    fontWeight: 500,
    fontSize: 15,
    color: rawColours.primary.black.black,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  phaseDates: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    color: rawColours.primary.black[100],
    fontSize: 13,
    // The shared date pill greys its background only for NOT_STARTED tasks.
    // Within this step we force a consistent background across every phase
    // date regardless of task status.
    '& [data-test*="start-date"], & [data-test*="end-date"]': {
      backgroundColor: colorModifiers.restingButtonOpacity(
        rawColours.primary.grey.main
      ),
    },
  },
  phaseDateIcon: { fontSize: 16 },
  phaseRangeDash: { color: rawColours.primary.black[100] },
  phaseDuration: { color: rawColours.primary.black[100], marginLeft: 6 },
  phaseHeadIcon: {
    color: rawColours.primary.black[100],
    fontSize: 18,
  },
  phaseBadgeWarn: {
    color: rawColours.riskLabels.amber.primary,
    cursor: 'default',
    display: 'flex',
    alignItems: 'center',
  },
  phaseBadgeOk: {
    color: rawColours.primary.green.primary,
    cursor: 'default',
    display: 'flex',
    alignItems: 'center',
  },
  phaseBadgeIcon: { fontSize: 20 },
  phaseGrid: {
    marginTop: 8,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
  },
  // The titles for Assumptions / Deliverables sit in their own always-visible
  // row (the collapse toggle lives at its right end), aligned over the two
  // list columns below.
  phaseSubsectionTitles: {
    marginTop: 14,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  },
  phaseSubsectionTitle: {
    color: rawColours.primary.black[100],
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  phaseSubsectionChevron: {
    marginLeft: 'auto',
    fontSize: 18,
    color: rawColours.primary.black[100],
  },
  phaseSubsectionIcon: { fontSize: 16 },
  workstreamGroup: {
    marginTop: 12,
  },
  workstreamHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    userSelect: 'none',
    padding: '10px 12px',
    borderRadius: 8,
    background: rawColours.primary.grey[200],
  },
  workstreamHeaderIcon: {
    fontSize: 18,
    color: rawColours.primary.black[100],
  },
  workstreamHeaderTitle: {
    fontWeight: 500,
    fontSize: 14,
    color: rawColours.primary.black.black,
  },
  workstreamHeaderCount: {
    fontSize: 13,
    color: rawColours.primary.black[100],
  },
  workstreamChevron: {
    marginLeft: 'auto',
    fontSize: 20,
    color: rawColours.primary.black[100],
  },
  // Both shared SVGs hard-code their stroke colour (and width, for the
  // deliverable), so they don't pick up the row's `rawColours.primary.black[100]`
  // cascade. Force them to match the neighbouring icons here.
  assumptionIcon: {
    '& path': { stroke: rawColours.primary.black[100] },
  },
  deliverableIcon: {
    '& path': {
      stroke: rawColours.primary.black[100],
      strokeWidth: 1,
    },
  },
  phaseHeadRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 'none',
  },
  noticeBar: {
    marginTop: 8,
    padding: '14px 18px',
    borderRadius: 8,
    background: rawColours.primary.grey[200],
    color: rawColours.primary.black[200],
    textAlign: 'center',
    fontSize: 13,
  },
  feeHero: {
    background: rawColours.primary.primary.dark,
    color: rawColours.primary.white.primary,
    borderRadius: 10,
    padding: '24px 28px',
    marginBottom: 16,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  feeHeroLabel: {
    fontSize: 13,
    opacity: 0.7,
    letterSpacing: 0.3,
  },
  feeHeroAmount: {
    fontWeight: 300,
    fontSize: 40,
    lineHeight: '48px',
    marginTop: 6,
  },
  feeHeroAmountPlaceholder: {
    fontSize: 28,
    lineHeight: '36px',
  },
  feeHeroAside: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    alignItems: 'flex-end',
  },
  durationPill: {
    background: 'rgba(255,255,255,0.95)',
    color: rawColours.primary.primary.dark,
    padding: '6px 14px',
    borderRadius: 9999,
    font: '500 12px Montserrat',
  },
  feeHeroDates: {
    fontSize: 12,
    opacity: 0.75,
  },
  sectionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 14,
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    marginBottom: 18,
  },
  sectionTitleIcon: {
    color: rawColours.primary.black[100],
    fontSize: 22,
  },
  sectionTitleText: {
    fontWeight: 500,
    fontSize: 15,
    color: rawColours.primary.black.black,
  },
  sectionTitleSuffix: {
    color: rawColours.primary.black[100],
    fontWeight: 400,
    marginLeft: 6,
  },
  phasePillRow: {
    display: 'flex',
    gap: 14,
    alignItems: 'flex-start',
    padding: '14px 0',
    '& + &': { borderTop: '1px solid rgba(0, 0, 0, 0.06)' },
  },
  phasePillBody: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  phasePillTitle: {
    margin: 0,
    fontWeight: 500,
    fontSize: 14,
    color: rawColours.primary.black.black,
  },
  phasePillMeta: {
    color: rawColours.primary.black[200],
    fontSize: 13,
    marginTop: 6,
  },
  phasePillRight: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
    alignSelf: 'end',
  },
  phasePillRange: {
    font: '500 13px Montserrat',
    color: rawColours.primary.black.black,
  },
  phasePillRangeMeta: {
    fontSize: 12,
    color: rawColours.primary.black[100],
  },
  kvRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    padding: '10px 0',
    fontSize: 14,
  },
  kvKey: {
    color: rawColours.primary.black[100],
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  kvVal: {
    color: rawColours.primary.black.black,
    fontWeight: 400,
    minWidth: 0,
    textAlign: 'right',
    overflowWrap: 'anywhere',
  },
  footerBar: {
    marginTop: 32,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  btn: {
    appearance: 'none',
    border: 0,
    cursor: 'pointer',
    font: '500 14px Montserrat',
    padding: '12px 20px',
    borderRadius: 8,
    minWidth: 0,
    textTransform: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    whiteSpace: 'nowrap',
    transition:
      'background 150ms, color 150ms, border-color 150ms, box-shadow 150ms',
  },
  btnGhost: {
    background: rawColours.primary.white.primary,
    color: rawColours.primary.black.black,
    border: '1px solid rgba(0, 0, 0, 0.12)',
    '&:hover': { background: rawColours.primary.grey[200] },
    '&:disabled, &.Mui-disabled': {
      color: rawColours.primary.black.black,
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  },
  btnPrimary: {
    background: rawColours.status.done.dark,
    color: rawColours.primary.white.primary,
    '&:hover': { background: '#4F8F92' },
    '&:disabled, &.Mui-disabled': {
      background: '#B6CDCE',
      color: rawColours.primary.white.primary,
      cursor: 'not-allowed',
    },
  },
  btnConfirm: {
    background: rawColours.primary.primary.dark,
    color: rawColours.primary.white.primary,
    '&:hover': { background: '#00496A' },
    '&:disabled, &.Mui-disabled': {
      background: rawColours.primary.primary.dark,
      color: rawColours.primary.white.primary,
      cursor: 'not-allowed',
    },
  },
  btnIcon: { fontSize: 18 },
  continueGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  continueHint: {
    fontSize: 12,
    color: rawColours.primary.black[100],
  },
  toast: {
    position: 'fixed',
    bottom: 32,
    left: '50%',
    transform: 'translateX(-50%) translateY(20px)',
    background: rawColours.primary.black.black,
    color: rawColours.primary.white.primary,
    padding: '14px 20px',
    borderRadius: 8,
    font: '500 13px Montserrat',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 250ms, transform 250ms',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    zIndex: 100,
  },
  toastShow: {
    opacity: 1,
    transform: 'translateX(-50%) translateY(0)',
    pointerEvents: 'auto',
  },
  toastIcon: { color: rawColours.status.done.dark },
  welcomeOuter: {
    padding: theme.spacing(4),
  },
  welcomeContainer: {
    padding: theme.spacing(5),
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
  },
  welcomeBody: {
    display: 'flex',
    gap: theme.spacing(4),
    alignItems: 'center',
  },
  welcomeLeftCol: {
    flex: '0 0 38%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  },
  welcomeRightCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  welcomeSubtitle: {
    color: rawColours.primary.black[100],
  },
  welcomeMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    padding: theme.spacing(2),
    backgroundColor: rawColours.primary.grey[200],
    borderRadius: theme.spacing(),
    width: '100%',
  },
  welcomeMetaLabel: {
    color: rawColours.primary.black[100],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  welcomeMetaValue: {
    fontWeight: 500,
    color: juralioColours.darkText.primary,
  },
  welcomeCtaButton: {
    textTransform: 'none',
    fontWeight: 'bold',
    marginTop: theme.spacing(3),
    color: rawColours.primary.grey.main,
    backgroundColor: rawColours.primary.black[200],
    '&:hover': {
      backgroundColor: rawColours.primary.black.black,
    },
  },
  stepPane: { animation: '$stepIn 280ms cubic-bezier(0,0,0.2,1)' },
  '@keyframes stepIn': {
    from: { opacity: 0, transform: 'translateY(8px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
}))

export default useFixedFeeStyles
