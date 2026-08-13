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

import juralioColours from '../../../theme/juralio-colours'
import { JuralioCoreColors } from '../../../theme/juralio-core-colors'
import rawColours from '../../../theme/raw-colours'

export const MuiDataGridTheme = {
  border: 'none',
  borderRadius: '8px',
  background: 'white',
  fontFamily: 'Montserrat',
  fontSize: '14px',
  '& .MuiDataGrid-columnSeparator': {
    display: 'none',
  },
  '& .MuiDataGrid-columnHeader': {
    background: 'white',
    borderTop: `2px solid ${rawColours.primary.black.black}`,
    borderBottom: `2px solid ${rawColours.primary.black.black}`,
    color: rawColours.primary.black.black,
    fontFamily: 'Montserrat',
    fontSize: '0.8125rem',
    fontWeight: 700,
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontFamily: 'Montserrat',
    fontSize: '0.8125rem',
    fontWeight: 700,
  },
  '& .MuiDataGrid-cell': {
    fontFamily: 'Montserrat',
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.66,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  '& .MuiDataGrid-row:hover': {
    cursor: 'pointer',
  },
  '& .MuiDataGrid-paper': {
    boxShadow: 'none',
  },
  '& .MuiTablePagination-root': {
    fontSize: '0.75rem',
    fontFamily: 'Montserrat',
  },
  '& .MuiDataGrid-toolbarContainer': {
    padding: '8px',
    background: 'white',
    borderRadius: '8px 8px 0 0',
    justifyContent: 'flex-end',
  },
  color: juralioColours.named?.black?.main ?? rawColours.primary.black.black,
}

export const dataGridPrimaryColor = {
  '& .MuiDataGrid-columnHeader--sorted .MuiDataGrid-sortIcon': {
    color: JuralioCoreColors.primary.main,
  },
}
