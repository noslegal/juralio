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
import JuralioTable from '../../../../components/table/JuralioTable'

const useStyles = makeStyles()(theme => ({
  root: {
    minWidth: theme.spacing(65),
  },
}))

// Handles display of projects in the Matter Admin screens.
const ProjectsTable = ({ columns, rows }) => {
  const { classes } = useStyles()

  return (
    <div data-test="projects-table-wrapper" className={classes.root}>
      <JuralioTable
        columns={columns}
        rows={rows}
        tableBodyHeight="calc(100vh - 440px)"
      />
    </div>
  )
}

export default ProjectsTable
