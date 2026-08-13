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
import { Placeholder } from '@tiptap/extension-placeholder'
import { CharacterCount } from '@tiptap/extension-character-count'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../theme/raw-colours'

const CHAR_LIMIT = 500

const style = makeStyles()(theme => ({
  wrapper: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    '& .ProseMirror': {
      minHeight: '54px',
      maxHeight: '200px',
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
      '& p': { margin: 0 },
    },
  },
  disabled: {
    pointerEvents: 'none',
    filter: 'contrast(0.5)',
    cursor: 'unset',
  },
  maxChar: {
    color: rawColours.error.primary,
    margin: theme.spacing(0.5),
  },
}))

const AddUserEmailMessageEditor = props => {
  const { classes } = style()
  const { t } = useTranslation()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
        heading: false,
        bulletList: false,
        orderedList: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,
        link: false,
        underline: false,
      }),
      CharacterCount.configure({ limit: CHAR_LIMIT }),
      Placeholder.configure({
        placeholder: t('matterAdmin.people.whatWouldYouLikeToSay'),
      }),
    ],
    // v3 no longer re-renders consumers on each transaction by default; opt in
    // so the live character count below updates as the user types.
    shouldRerenderOnTransaction: true,
    editorProps: {
      handlePaste(view, event) {
        const text = event.clipboardData?.getData('text/plain') || ''
        const currentLength = view.state.doc.textContent.length
        const available = CHAR_LIMIT - currentLength
        if (available <= 0) return true
        const truncated = text.substring(0, available)
        const tr = view.state.tr.insertText(truncated)
        view.dispatch(tr)
        return true
      },
    },
    onUpdate: ({ editor }) => {
      props.handleMessageUpdate(editor.getText())
    },
  })

  const charCount = editor ? editor.storage.characterCount.characters() : 0
  const charLimitReached = charCount >= CHAR_LIMIT

  return (
    <div
      className={props.disabled ? classes.disabled : classes.wrapper}
      data-test={`add-user-email-message-wrapper${
        props.disabled ? '-disabled' : ''
      }`}
    >
      {charLimitReached && (
        <Typography className={classes.maxChar}>
          {t('matterAdmin.people.maxCharLimitReached')}
        </Typography>
      )}
      <EditorContent
        editor={editor}
        data-test={`add-user-email-message${props.disabled ? '-disabled' : ''}`}
      />
    </div>
  )
}

export default AddUserEmailMessageEditor
