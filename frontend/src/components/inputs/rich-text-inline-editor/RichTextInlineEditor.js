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

import { Typography } from '@mui/material'
import { CharacterCount } from '@tiptap/extension-character-count'
import Link from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Extension } from '@tiptap/core'
import classNames from 'classnames'
import React, { useEffect, useRef, useState } from 'react'
import sanitizeHtml from 'sanitize-html'
import { makeStyles } from 'tss-react/mui'
import RawTextLabel from '../../data-display/raw-text-label/RawTextLabel'
import RichTextToolbar from '../rich-text-toolbar/RichTextToolbar'

const INDENT_TYPES = ['paragraph', 'heading']
const MAX_INDENT = 7
const INDENT_PX = 24

const IndentExtension = Extension.create({
  name: 'indent',

  addGlobalAttributes() {
    return [
      {
        types: INDENT_TYPES,
        attributes: {
          indent: {
            default: 0,
            parseHTML: el =>
              Math.min(
                Math.round((parseInt(el.style.paddingLeft) || 0) / INDENT_PX),
                MAX_INDENT
              ),
            renderHTML: attrs =>
              attrs.indent
                ? { style: `padding-left: ${attrs.indent * INDENT_PX}px` }
                : {},
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      indent:
        () =>
        ({ state, dispatch }) => {
          const { from, to } = state.selection
          const tr = state.tr
          let changed = false
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (
              INDENT_TYPES.includes(node.type.name) &&
              (node.attrs.indent || 0) < MAX_INDENT
            ) {
              if (dispatch)
                tr.setNodeMarkup(pos, null, {
                  ...node.attrs,
                  indent: (node.attrs.indent || 0) + 1,
                })
              changed = true
            }
          })
          if (changed && dispatch) dispatch(tr)
          return changed
        },
      outdent:
        () =>
        ({ state, dispatch }) => {
          const { from, to } = state.selection
          const tr = state.tr
          let changed = false
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (
              INDENT_TYPES.includes(node.type.name) &&
              (node.attrs.indent || 0) > 0
            ) {
              if (dispatch)
                tr.setNodeMarkup(pos, null, {
                  ...node.attrs,
                  indent: (node.attrs.indent || 0) - 1,
                })
              changed = true
            }
          })
          if (changed && dispatch) dispatch(tr)
          return changed
        },
    }
  },
})

const sanitize = html => {
  const htmlSanitizeOptions = {
    allowedTags: [
      'p',
      'br',
      'ul',
      'ol',
      'li',
      'u',
      'b',
      'i',
      'em',
      'strong',
      'a',
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
      h1: ['style'],
      h2: ['style'],
      h3: ['style'],
      h4: ['style'],
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

const useStyles = makeStyles()(theme => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  placeholderText: {
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
  },
  description: {
    color: theme.palette.text.primary,
    lineHeight: theme.spacing(2),
    '& h1': { fontSize: '1.5rem', fontWeight: 700, margin: 0 },
    '& h2': { fontSize: '1.25rem', fontWeight: 700, margin: 0 },
    '& h3': { fontSize: '1.125rem', fontWeight: 600, margin: 0 },
    '& h4': { fontSize: '1rem', fontWeight: 600, margin: 0 },
    '& h5': { fontSize: '0.875rem', fontWeight: 600, margin: 0 },
    '& h6': { fontSize: '0.8125rem', fontWeight: 600, margin: 0 },
  },
  hoverEffect: {
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  editorWrapper: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    '& .ProseMirror': {
      minHeight: '54px',
      maxHeight: '500px',
      overflowY: 'auto',
      outline: 'none',
      padding: theme.spacing(1),
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
      maxHeight: 'none',
      outline: 'none',
      padding: theme.spacing(2),
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.body1.fontSize,
    },
  },
  editorScrollArea: {
    flex: 1,
    overflowY: 'auto',
  },
  charCount: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    textAlign: 'right',
    padding: theme.spacing(0.25, 1),
  },
  charCountExceeded: {
    color: theme.palette.error.main,
  },
}))

const isHtmlEffectivelyEmpty = html => !html || sanitize(html) === '<p></p>'

const RichTextInlineEditor = props => {
  const { classes } = useStyles()
  const [isEditing, setIsEditing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [input, setInput] = useState(
    props.text === undefined ? null : props.text
  )
  const wrapperRef = useRef(null)
  const pendingSaveRef = useRef(false)
  const hasOpenMenuRef = useRef(false)
  // TipTap's canonical serialization of props.text. Used instead of props.text
  // for change-detection so a parse-roundtrip doesn't look like a user edit.
  const baselineRef = useRef('')

  const maxChars = props.maxChars ? parseInt(props.maxChars) : undefined

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false, underline: false }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      CharacterCount.configure({ limit: maxChars }),
      Placeholder.configure({ placeholder: props.placeholder }),
      IndentExtension,
    ],
    // v3 no longer re-renders consumers on each transaction by default; opt in
    // so the toolbar's active-state (headings, bold, etc.) stays in sync.
    shouldRerenderOnTransaction: true,
    content: input || '',
    editable: false,
    onUpdate: ({ editor }) => {
      setInput(editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(isEditing && !props.isReadOnly)
    if (isEditing && !props.isReadOnly) {
      editor.commands.focus('end')
    }
  }, [isEditing, editor, props.isReadOnly])

  useEffect(() => {
    if (!editor) return
    if (input !== props.text) {
      const content = props.text || ''
      setInput(content)
      editor.commands.setContent(content, { emitUpdate: false })
    }
    baselineRef.current = editor.isEmpty ? '' : editor.getHTML()
  }, [props.text, editor, window.location.href]) // eslint-disable-line

  const startEditing = () => {
    pendingSaveRef.current = false
    setIsEditing(true)
  }

  const saveAndExit = html => {
    if (pendingSaveRef.current) return
    pendingSaveRef.current = true
    setIsEditing(false)
    setIsFullscreen(false)
    const content = editor && editor.isEmpty ? '' : sanitize(html)
    props.saveHandler(content)
  }

  useEffect(() => {
    const handleClickOutside = event => {
      if (hasOpenMenuRef.current) return
      if (
        isEditing &&
        !props.isReadOnly &&
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        const currentHtml =
          editor && editor.isEmpty ? '' : editor ? editor.getHTML() : input
        if (currentHtml !== baselineRef.current) {
          saveAndExit(currentHtml)
        } else {
          setIsEditing(false)
          setIsFullscreen(false)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [wrapperRef, input, isEditing, props.isReadOnly, editor]) // eslint-disable-line

  const handleKeyDown = e => {
    if (e.key === 'Escape' && isEditing) {
      e.preventDefault()
      const content = props.text || ''
      setInput(content)
      if (editor) editor.commands.setContent(content, { emitUpdate: false })
      setIsEditing(false)
      setIsFullscreen(false)
    }
  }

  const charCount = editor ? editor.storage.characterCount.characters() : 0
  const isOverLimit = maxChars && charCount > maxChars

  if (
    (!input || isHtmlEffectivelyEmpty(input)) &&
    !isEditing &&
    !props.isReadOnly
  ) {
    return (
      <div className={classes.root} data-test="zero-state-placeholder">
        <Typography
          onClick={props.isReadOnly ? () => {} : () => startEditing()}
          className={classNames([
            classes.placeholderText,
            !props.isReadOnly && classes.hoverEffect,
          ])}
          variant="body1"
        >
          {props.placeholder}
        </Typography>
      </div>
    )
  }

  return (
    <div className={classes.root} ref={wrapperRef} onKeyDown={handleKeyDown}>
      {isEditing && !props.isReadOnly ? (
        <div
          className={classNames(
            classes.editorWrapper,
            isFullscreen && classes.fullscreenWrapper
          )}
        >
          <RichTextToolbar
            editor={editor}
            showFullscreen={true}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(f => !f)}
            compact={props.compact}
            onMenuOpen={() => {
              hasOpenMenuRef.current = true
            }}
            onMenuClose={() => {
              hasOpenMenuRef.current = false
            }}
          />
          <div className={isFullscreen ? classes.editorScrollArea : undefined}>
            <EditorContent editor={editor} />
          </div>
          {props.showCharCount && (
            <div
              className={classNames(
                classes.charCount,
                isOverLimit && classes.charCountExceeded
              )}
            >
              {charCount} / {props.maxChars}
            </div>
          )}
        </div>
      ) : (
        <div
          className={classNames([
            classes.description,
            !props.isReadOnly && classes.hoverEffect,
          ])}
        >
          <RawTextLabel
            rawText={sanitize(input)}
            variant={props.variant}
            keepHtmlMarkup={true}
            collapseProps={props.collapseProps}
            onClick={props.isReadOnly ? () => {} : () => startEditing()}
          />
        </div>
      )}
    </div>
  )
}

export default RichTextInlineEditor
