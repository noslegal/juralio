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

import { mdiFileExcel } from '@mdi/js'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import {
  Button,
  ButtonGroup,
  Checkbox,
  DialogContent,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import {
  TASK_MAP,
  TASK_MAP_LEVELS_INTEGER_LOOKUP,
} from '../../../app/constants'
import { fetchProjectWithTaskTeams } from '../../../app/project/project-actions'
import { useUserDetailsData } from '../../../hooks/user-hooks'
import { generateDownload } from '../../../services/export/export-service'
import {
  EXPORT_FORMATS,
  EXPORT_NAMES,
} from '../../../services/export/reports/common/constants-reports'
import organisationService from '../../../services/organisation/organisation-service'
import { formatUserDisplayName } from '../../../services/user/helper/user-format-service'
import juralioColours from '../../../theme/juralio-colours'
import JuralioDialog from '../juralio-dialog/JuralioDialog'

const styles = makeStyles()(theme => ({
  checkboxRow: {
    justifyContent: 'space-around',
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  buttonGroup: {
    '& :first-of-type': {
      borderTopLeftRadius: theme.spacing(2),
      borderBottomLeftRadius: theme.spacing(2),
    },
    '& :last-child': {
      borderTopRightRadius: theme.spacing(2),
      borderBottomRightRadius: theme.spacing(2),
    },
    marginTop: theme.spacing(2),
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  buttonSelectedNoHover: {
    color: `${juralioColours.whiteText.primary} !important`,
    border: `1px solid ${juralioColours.darkText.secondary} `,
    background: juralioColours.theme.primary.main,
    '&:hover': {
      color: `${juralioColours.whiteText.primary} !important`,
      border: `1px solid ${juralioColours.darkText.secondary} `,
      background: juralioColours.theme.primary.main,
    },
  },
  buttonUnselected: {
    color: `${juralioColours.darkText.secondary} !important`,
    border: `1px solid ${juralioColours.darkText.secondary} `,
    background: juralioColours.levelSelector.unselected,
    '&:hover': {
      color: `${juralioColours.whiteText.primary} !important`,
      border: `1px solid ${juralioColours.darkText.secondary} `,
      background: juralioColours.theme.primary.main,
    },
  },
  buttonGroupWrapper: {
    display: 'flex',
    paddingBottom: theme.spacing(1),
  },
  radioOption: {
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'flex',
  },
  advancedOptions: {
    marginLeft: 'auto',
    marginBottom: theme.spacing(),
  },
  advancedOptionsText: {
    textTransform: 'initial',
    fontSize: theme.spacing(1.5),
  },
  row: { width: '100%', display: 'flex' },
}))

const generateCheckbox = (checked, setCheck, label, dataTest) => (
  <FormControlLabel
    label={label}
    control={
      <Checkbox
        color="primary"
        checked={checked}
        name={label}
        data-test={dataTest}
        onChange={e => setCheck(e.target.checked)}
      />
    }
  />
)

const generateButtonGroup = (selectedLevel = 0, setLevel = () => {}) => {
  const { classes } = styles()
  /**
   * Have to fill the  array with data to map over it as map ignores empty entries
   * Have to look up index +1 as taskmap levels commit the cardinal sin of not being zero indexed
   */
  const getClass = i => {
    if (i + 1 === selectedLevel) {
      return classes.buttonSelectedNoHover
    } else {
      return i < selectedLevel
        ? classes.buttonSelectedNoHover
        : classes.buttonUnselected
    }
  }
  return (
    <div className={classes.buttonGroupWrapper}>
      <ButtonGroup color="primary" className={classes.buttonGroup}>
        {new Array(TASK_MAP.MAX_TASK_DEPTH).fill(0).map((_, i) => (
          <Button
            key={i}
            className={getClass(i)}
            onClick={() => setLevel(i + 1)}
            data-test="level-button"
          >
            {TASK_MAP_LEVELS_INTEGER_LOOKUP[i + 1]}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  )
}

const WorkstreamExportDialog = props => {
  const { t } = useTranslation()
  const { isTemplate } = props
  const dispatch = useDispatch()
  const userDetails = useUserDetailsData()
  const { classes } = styles()
  const [printType, setPrintType] = useState('A4')
  const [teams, setTeams] = useState(true)
  const [tasks, setTasks] = useState(true)
  const [roadmap, setRoadmap] = useState(true)
  const [labels, setLabels] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState(6)
  const [isLoading, setIsLoading] = useState(false)
  const matter = useSelector(state => state.matterDetails.matter)
  const project = useSelector(state => state.project)
  const team = useSelector(state => state.matterTeam.mainPage.team)
  const template = useSelector(state => state.template.template)
  const isSingleWorkstreamMatter = matter?.numProjects === 1
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  const handlePrintTypeChange = event => setPrintType(event.target.value)

  const blobToBase64 = blob => {
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    return new Promise(resolve => {
      reader.onloadend = () => {
        resolve(reader.result)
      }
    })
  }

  const handleDownload = () => {
    setIsLoading(true)
    if (isTemplate) {
      const reportData = {
        template,
        username: formatUserDisplayName(userDetails),
      }

      generateDownload(
        t,
        EXPORT_NAMES.TEMPLATE_TASK_LIST,
        EXPORT_FORMATS.EXCEL,
        reportData,
        {
          selectedLevel,
          printType,
          includeLabels: labels,
        },
        props.onClose
      )
    } else {
      const isPrivate = project.isPrivate
      let reportData = {
        project: project,
        matter: matter,
        team: isPrivate
          ? team.filter(t =>
              project.privateWorkstreamTeam.map(p => p.id).includes(t.user.id)
            )
          : team,
        username: formatUserDisplayName(userDetails),
      }
      dispatch(fetchProjectWithTaskTeams(matter.id, project.id)).then(
        response => {
          organisationService
            .getOrganisationLogo(matter.organisation.id)
            .then(logoResponse => {
              reportData.project.tasks = response.project?.tasks
              if (logoResponse.status === 200) {
                blobToBase64(logoResponse.body).then(b64 => {
                  let i = new Image()
                  i.onload = () => {
                    reportData.logo = {
                      blob: b64,
                      width: i.width,
                      height: i.height,
                    }
                    generateDownload(
                      t,
                      EXPORT_NAMES.WORKSTREAM_TASK_LIST,
                      EXPORT_FORMATS.EXCEL,
                      reportData,
                      {
                        teams,
                        roadmap,
                        tasks,
                        level: selectedLevel,
                        taskList: tasks,
                        printType: printType,
                        includeLabels: labels,
                      },
                      props.onClose
                    )
                  }
                  i.src = b64
                })
              } else {
                generateDownload(
                  t,
                  EXPORT_NAMES.WORKSTREAM_TASK_LIST,
                  EXPORT_FORMATS.EXCEL,
                  reportData,
                  {
                    teams,
                    roadmap,
                    tasks,
                    level: selectedLevel,
                    taskList: tasks,
                    printType: printType,
                    includeLabels: labels,
                  },
                  props.onClose
                )
              }
            })
        }
      )
    }
  }

  const getTitleText = (isTemplate, isSingleWorkstreamMatter) => {
    if (isTemplate) {
      return (
        t('exports.reportDownload.templateTaskList.confirmation.header') +
        `: ${template.name}`
      )
    } else if (isSingleWorkstreamMatter) {
      return (
        t('exports.reportDownload.projectTaskList.confirmation.headerMatter') +
        `: ${matter.name}`
      )
    }
    return (
      t('exports.reportDownload.projectTaskList.confirmation.header') +
      `: ${project.name}`
    )
  }

  return (
    <JuralioDialog
      titleIcon={mdiFileExcel}
      open={true}
      onClose={props.onClose}
      titleText={getTitleText(isTemplate, isSingleWorkstreamMatter)}
      handleAction={handleDownload}
      hideCancel={false}
      handleCancel={props.onClose}
      actionLabel={t('common.download')}
      disabled={(!isTemplate && !(teams || tasks || roadmap)) || isLoading}
      showLoadingBar={isLoading}
      loadingText={t('exports.common.preparingYourDownload')}
      cancelText={t('common.cancel')}
    >
      <DialogContent>
        {!isTemplate && (
          <>
            <Typography>
              {t('exports.reportDownload.projectTaskList.confirmation.sheets')}
            </Typography>
            <FormGroup row className={classes.checkboxRow}>
              {generateCheckbox(
                teams,
                setTeams,
                t('exports.reportDownload.projectTaskList.confirmation.team'),
                'teams-checkbox'
              )}
              {generateCheckbox(
                tasks,
                setTasks,
                t('exports.reportDownload.projectTaskList.confirmation.tasks'),
                'tasks-checkbox'
              )}
              {generateCheckbox(
                roadmap,
                setRoadmap,
                t(
                  'exports.reportDownload.projectTaskList.confirmation.roadmap'
                ),
                'roadmap-checkbox'
              )}
            </FormGroup>
          </>
        )}
        <Typography>
          {t('exports.reportDownload.projectTaskList.confirmation.levels')}
        </Typography>

        {generateButtonGroup(selectedLevel, setSelectedLevel)}
        <div className={classes.row}>
          <Button
            data-test="exports-advanced-options"
            onClick={() => {
              setShowAdvancedOptions(!showAdvancedOptions)
            }}
            className={classes.advancedOptions}
            endIcon={
              showAdvancedOptions ? (
                <KeyboardArrowUpIcon className={classes.advancedOptionsText} />
              ) : (
                <KeyboardArrowDownIcon
                  className={classes.advancedOptionsText}
                />
              )
            }
          >
            <Typography
              className={classes.advancedOptionsText}
              variant="caption"
            >
              {t('common.advancedOptions')}
            </Typography>
          </Button>
        </div>
        {showAdvancedOptions && (
          <>
            <Typography>
              {t(
                'exports.reportDownload.projectTaskList.confirmation.printType'
              )}
            </Typography>
            <RadioGroup
              name="printType"
              value={printType}
              onChange={handlePrintTypeChange}
            >
              <div className={classes.radioOption}>
                <FormControlLabel
                  value="A4"
                  control={<Radio color={'primary'} />}
                  label={t(
                    'exports.reportDownload.projectTaskList.confirmation.A4'
                  )}
                />
                <FormControlLabel
                  value="Letter"
                  control={<Radio color={'primary'} />}
                  label={t(
                    'exports.reportDownload.projectTaskList.confirmation.letter'
                  )}
                />
              </div>
            </RadioGroup>
            {generateCheckbox(
              labels,
              setLabels,
              t('exports.reportDownload.projectTaskList.confirmation.labels'),
              'label-checkbox'
            )}
          </>
        )}
      </DialogContent>
    </JuralioDialog>
  )
}

export default WorkstreamExportDialog
