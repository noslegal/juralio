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

import { Tooltip } from '@mui/material'
import Typography from '@mui/material/Typography'
import { CharacterCount } from '@tiptap/extension-character-count'
import Link from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import debounce from 'lodash/debounce'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import sanitizeHtml from 'sanitize-html'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import RichTextToolbar from '../rich-text-toolbar/RichTextToolbar'

const sanitize = html => {
  const htmlSanitizeOptions = {
    allowedTags: [
      'p',
      'br',
      'ul',
      'li',
      'u',
      'b',
      'i',
      'em',
      'strong',
      'a',
      'table',
      'tbody',
      'tr',
      'td',
      'th',
      'thead',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      ul: ['style'],
      p: ['style'],
      tbody: ['style'],
      tr: ['style'],
      td: ['style', 'colspan', 'rowspan'],
      th: ['style', 'colspan', 'rowspan'],
      table: ['style'],
    },
    parseStyleAttributes: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        target: '_blank',
        rel: 'noopener noreferrer',
      }),
    },
  }

  return sanitizeHtml(html || '', htmlSanitizeOptions)
}

const styles = makeStyles()(theme => ({
  editorWrapper: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    flexDirection: 'column',
    '& .ProseMirror': {
      flex: 1,
      overflowY: 'auto',
      outline: 'none',
      padding: theme.spacing(1, 2),
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.body1.fontSize,
      '& p.is-editor-empty:first-of-type::before': {
        content: 'attr(data-placeholder)',
        float: 'left',
        color: theme.palette.text.secondary,
        fontStyle: 'italic',
        pointerEvents: 'none',
        height: 0,
      },
      '& ul': { paddingLeft: theme.spacing(3), listStyleType: 'disc' },
      '& ol': { paddingLeft: theme.spacing(3), listStyleType: 'decimal' },
      '& h1': { fontSize: '1.5rem', fontWeight: 700, margin: 0 },
      '& h2': { fontSize: '1.25rem', fontWeight: 700, margin: 0 },
      '& h3': { fontSize: '1.125rem', fontWeight: 600, margin: 0 },
      '& h4': { fontSize: '1rem', fontWeight: 600, margin: 0 },
      '& h5': { fontSize: '0.875rem', fontWeight: 600, margin: 0 },
      '& h6': { fontSize: '0.8125rem', fontWeight: 600, margin: 0 },
      '& p': { margin: 0 },
      '& a': { color: theme.palette.primary.main },
      '& table': {
        borderCollapse: 'collapse',
        width: '100%',
        '& td, & th': {
          border: `1px solid ${theme.palette.divider}`,
          padding: theme.spacing(0.5, 1),
          minWidth: '1em',
          verticalAlign: 'top',
          position: 'relative',
        },
        '& th': {
          backgroundColor: theme.palette.action.hover,
          fontWeight: theme.typography.fontWeightBold,
        },
      },
    },
  },
  fullscreenWrapper: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: theme.zIndex.modal + 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    '& .ProseMirror': {
      flex: 1,
      maxHeight: 'none',
      overflowY: 'auto',
      outline: 'none',
      padding: theme.spacing(2),
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.body1.fontSize,
    },
  },
  charCount: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    textAlign: 'right',
    padding: theme.spacing(0.25, 1),
  },
  readStateContainer: {
    cursor: 'text',
    minHeight: 0,
    '&:hover': {
      background: juralioColours.editor.hover,
    },
    overflowY: 'auto',
    overflowX: 'hidden',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    '& ul': { paddingLeft: theme.spacing(3), listStyleType: 'disc' },
    '& ol': { paddingLeft: theme.spacing(3), listStyleType: 'decimal' },
    '& h1': { fontSize: '1.5rem', fontWeight: 700, margin: 0 },
    '& h2': { fontSize: '1.25rem', fontWeight: 700, margin: 0 },
    '& h3': { fontSize: '1.125rem', fontWeight: 600, margin: 0 },
    '& h4': { fontSize: '1rem', fontWeight: 600, margin: 0 },
    '& h5': { fontSize: '0.875rem', fontWeight: 600, margin: 0 },
    '& h6': { fontSize: '0.8125rem', fontWeight: 600, margin: 0 },
    '& table': {
      borderCollapse: 'collapse',
      width: '100%',
      '& td, & th': {
        border: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(0.5, 1),
      },
    },
    '& a': { color: theme.palette.primary.main },
  },
  readStateContainerDisabled: {
    minHeight: 0,
    overflowY: 'auto',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    '& ul': { paddingLeft: theme.spacing(3), listStyleType: 'disc' },
    '& ol': { paddingLeft: theme.spacing(3), listStyleType: 'decimal' },
    '& h1': { fontSize: '1.5rem', fontWeight: 700, margin: 0 },
    '& h2': { fontSize: '1.25rem', fontWeight: 700, margin: 0 },
    '& h3': { fontSize: '1.125rem', fontWeight: 600, margin: 0 },
    '& h4': { fontSize: '1rem', fontWeight: 600, margin: 0 },
    '& h5': { fontSize: '0.875rem', fontWeight: 600, margin: 0 },
    '& h6': { fontSize: '0.8125rem', fontWeight: 600, margin: 0 },
    '& table': {
      borderCollapse: 'collapse',
      width: '100%',
      '& td, & th': {
        border: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(0.5, 1),
      },
    },
    '& a': { color: theme.palette.primary.main },
  },
  zeroStatePlaceholder: {
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
  },
}))

const DEFAULT_NOTE_DESCRIPTION = '<p><br></p>'
const ToolbarHeight = 36

const RichTextReadEdit = props => {
  const divElement = useRef()
  const { t } = useTranslation()
  const editMode = useSelector(
    state => state.selectedTaskPostList.postDetails.editMode
  )
  const { classes } = styles()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const modelRef = useRef('')

  const debouncedOnModelChange = useCallback(
    debounce(html => props.onModelChange(sanitize(html)), 500),
    [props.onModelChange]
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false, underline: false }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      CharacterCount.configure({ limit: 1000 }),
      Placeholder.configure({ placeholder: props.placeholderText }),
    ],
    // v3 no longer re-renders consumers on each transaction by default; opt in
    // so the toolbar's active-state (headings, bold, etc.) stays in sync.
    shouldRerenderOnTransaction: true,
    content: sanitize(props.model || ''),
    editable: false,
    editorProps: {
      transformPastedHTML(html) {
        return sanitize(html)
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.isEmpty ? '' : editor.getHTML()
      if (html !== modelRef.current) {
        debouncedOnModelChange(html)
      }
    },
  })

  useEffect(() => {
    props.toggleEditMode(!!props.initializeInEdit)
    props.getTextAreaReference(divElement)
  }, []) // eslint-disable-line

  useEffect(() => {
    props.toggleEditMode(props.initializeInEdit)
  }, [props.initializeInEdit]) // eslint-disable-line

  useEffect(() => {
    if (!editor) return
    const shouldEdit = editMode && !props.readOnly
    editor.setEditable(shouldEdit)
    if (shouldEdit) {
      editor.commands.focus('end')
    }
  }, [editMode, editor, props.readOnly])

  useEffect(() => {
    if (!editor) return
    const sanitized = sanitize(props.model || '')
    if (sanitized !== editor.getHTML()) {
      editor.commands.setContent(sanitized, { emitUpdate: false })
    }
    // Baseline is TipTap's canonical serialization, so onUpdate's equality
    // check doesn't trip on parse-roundtrip differences from the stored HTML.
    modelRef.current = editor.isEmpty ? '' : editor.getHTML()
  }, [props.model, editor])

  const enterEditState = () => {
    if (!props.readOnly) props.toggleEditMode(true)
  }

  const charCount = editor ? editor.storage.characterCount.characters() : 0

  const renderEditState = () => {
    if (!props.height) return null
    return (
      <div
        className={
          isFullscreen ? classes.fullscreenWrapper : classes.editorWrapper
        }
        data-test="notes-content-edit-field"
        ref={divElement}
        style={
          isFullscreen ? undefined : { height: props.height + ToolbarHeight }
        }
      >
        <RichTextToolbar
          editor={editor}
          showFullscreen={true}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(f => !f)}
        />
        <EditorContent
          editor={editor}
          style={
            isFullscreen
              ? undefined
              : { height: props.height, overflowY: 'auto' }
          }
        />
        <div className={classes.charCount}>{charCount} / 1000</div>
      </div>
    )
  }

  const renderReadState = () => {
    const hasContent =
      props.model &&
      props.model !== DEFAULT_NOTE_DESCRIPTION &&
      !editor?.isEmpty

    const readState = (
      <div
        className={
          props.readOnly
            ? classes.readStateContainerDisabled
            : classes.readStateContainer
        }
        onClick={enterEditState}
        data-test="notes-content-read-field"
        style={{ height: props.height + ToolbarHeight + 'px' }}
      >
        {hasContent ? (
          <div dangerouslySetInnerHTML={{ __html: sanitize(props.model) }} />
        ) : (
          <Typography
            data-test="notes-content-placeholder"
            className={classes.zeroStatePlaceholder}
            variant="body2"
          >
            {props.placeholderText}
          </Typography>
        )}
      </div>
    )

    return (
      <div>
        {props.finalised ? (
          <Tooltip title={t('postDetails.isFinal')} placement={'top-end'}>
            {readState}
          </Tooltip>
        ) : (
          readState
        )}
      </div>
    )
  }

  return editMode && !props.readOnly ? renderEditState() : renderReadState()
}

export default RichTextReadEdit

RichTextReadEdit.propTypes = {
  initializeInEdit: PropTypes.bool,
  readOnly: PropTypes.bool.isRequired,
  onModelChange: PropTypes.func.isRequired,
  height: PropTypes.number,
  placeholderText: PropTypes.string.isRequired,
  model: PropTypes.string,
  toggleEditMode: PropTypes.func.isRequired,
  getTextAreaReference: PropTypes.func,
}
