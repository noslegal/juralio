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

import AddIcon from '@mui/icons-material/Add'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import CheckIcon from '@mui/icons-material/Check'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatIndentDecreaseIcon from '@mui/icons-material/FormatIndentDecrease'
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import InsertLinkIcon from '@mui/icons-material/InsertLink'
import RedoIcon from '@mui/icons-material/Redo'
import TextFormatIcon from '@mui/icons-material/TextFormat'
import UndoIcon from '@mui/icons-material/Undo'
import {
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Toolbar,
} from '@mui/material'
import classNames from 'classnames'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(theme => ({
  toolbar: {
    minHeight: 38,
    flexWrap: 'wrap',
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.grey[100],
    gap: theme.spacing(0.25),
    padding: theme.spacing(0.5),
  },
  toolbarCompact: {
    minHeight: 28,
    padding: theme.spacing(0.25),
    gap: 0,
  },
  divider: {
    margin: theme.spacing(0.5, 0.25),
    alignSelf: 'stretch',
    height: 'auto',
  },
  dividerCompact: {
    margin: theme.spacing(0.25, 0.25),
  },
  iconButton: {
    padding: theme.spacing(0.5),
    borderRadius: 0,
  },
  iconButtonCompact: {
    padding: theme.spacing(0.25),
  },
  headingSelect: {
    fontSize: '0.8rem',
    height: 28,
    '& .MuiSelect-select': {
      padding: theme.spacing(0.25, 1),
      paddingRight: `${theme.spacing(3)} !important`,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.divider,
    },
  },
  compactDropdownButton: {
    minWidth: 0,
    padding: theme.spacing(0, 0.5),
    height: 22,
    fontSize: '0.75rem',
    borderRadius: 0,
    color: theme.palette.text.primary,
    textTransform: 'none',
    lineHeight: 1,
    '& .MuiButton-endIcon': {
      marginLeft: 1,
    },
  },
  compactMenuIcon: {
    minWidth: 28,
  },
  compactMenuItem: {
    fontSize: '0.875rem',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
  },
}))

const RichTextToolbar = ({
  editor,
  showFullscreen,
  isFullscreen,
  onToggleFullscreen,
  compact,
  onMenuOpen,
  onMenuClose,
}) => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const [styleAnchor, setStyleAnchor] = useState(null)
  const [formatAnchor, setFormatAnchor] = useState(null)
  const [insertAnchor, setInsertAnchor] = useState(null)

  if (!editor) return null

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt(
      t('richTextToolbar.urlPrompt'),
      previousUrl || 'https://'
    )
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const headingValue = editor.isActive('heading', { level: 1 })
    ? '1'
    : editor.isActive('heading', { level: 2 })
      ? '2'
      : editor.isActive('heading', { level: 3 })
        ? '3'
        : editor.isActive('heading', { level: 4 })
          ? '4'
          : 'N'

  const setHeading = value => {
    if (value === 'N') {
      editor.chain().focus().setParagraph().run()
    } else {
      editor
        .chain()
        .focus()
        .toggleHeading({ level: parseInt(value) })
        .run()
    }
  }

  const canIndent =
    editor.can().sinkListItem('listItem') || editor.can().indent?.()
  const canOutdent =
    editor.can().liftListItem('listItem') || editor.can().outdent?.()

  const handleIndent = () => {
    if (editor.can().sinkListItem('listItem')) {
      editor.chain().focus().sinkListItem('listItem').run()
    } else {
      editor.chain().focus().indent?.().run()
    }
  }

  const handleOutdent = () => {
    if (editor.can().liftListItem('listItem')) {
      editor.chain().focus().liftListItem('listItem').run()
    } else {
      editor.chain().focus().outdent?.().run()
    }
  }

  if (compact) {
    const headingLabel =
      headingValue === 'N' ? t('richTextToolbar.normal') : `H${headingValue}`
    const menuProps = { disablePortal: true }

    return (
      <Toolbar
        variant="dense"
        disableGutters
        className={classNames(classes.toolbar, classes.toolbarCompact)}
      >
        {/* Style dropdown — stays open for multi-toggle */}
        <Button
          size="small"
          className={classes.compactDropdownButton}
          onClick={e => {
            setStyleAnchor(e.currentTarget)
            onMenuOpen?.()
          }}
          endIcon={<ArrowDropDownIcon fontSize="inherit" />}
          aria-label={t('richTextToolbar.textStyle')}
          data-test="toolbar-style-menu"
        >
          <TextFormatIcon fontSize="inherit" />
        </Button>
        <Menu
          anchorEl={styleAnchor}
          open={Boolean(styleAnchor)}
          onClose={() => {
            setStyleAnchor(null)
            onMenuClose?.()
          }}
          slotProps={{
            root: { disablePortal: isFullscreen },
            list: { disablePadding: true },
          }}
        >
          <MenuItem
            className={classes.compactMenuItem}
            onClick={() => editor.chain().focus().toggleBold().run()}
            data-test="toolbar-bold"
          >
            <ListItemIcon className={classes.compactMenuIcon}>
              {editor.isActive('bold') ? (
                <CheckIcon fontSize="small" color="primary" />
              ) : (
                <FormatBoldIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText
              slotProps={{
                primary: { fontWeight: 700 },
              }}
            >
              {t('richTextToolbar.bold')}
            </ListItemText>
          </MenuItem>
          <MenuItem
            className={classes.compactMenuItem}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            data-test="toolbar-italic"
          >
            <ListItemIcon className={classes.compactMenuIcon}>
              {editor.isActive('italic') ? (
                <CheckIcon fontSize="small" color="primary" />
              ) : (
                <FormatItalicIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText
              slotProps={{
                primary: { fontStyle: 'italic' },
              }}
            >
              {t('richTextToolbar.italic')}
            </ListItemText>
          </MenuItem>
          <MenuItem
            className={classes.compactMenuItem}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            data-test="toolbar-underline"
          >
            <ListItemIcon className={classes.compactMenuIcon}>
              {editor.isActive('underline') ? (
                <CheckIcon fontSize="small" color="primary" />
              ) : (
                <FormatUnderlinedIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText
              slotProps={{
                primary: { sx: { textDecoration: 'underline' } },
              }}
            >
              {t('richTextToolbar.underline')}
            </ListItemText>
          </MenuItem>
        </Menu>
        <IconButton
          size="small"
          className={classNames(classes.iconButton, classes.iconButtonCompact)}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          aria-label={t('richTextToolbar.undo')}
          data-test="toolbar-undo"
        >
          <UndoIcon fontSize="inherit" />
        </IconButton>
        <IconButton
          size="small"
          className={classNames(classes.iconButton, classes.iconButtonCompact)}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          aria-label={t('richTextToolbar.redo')}
          data-test="toolbar-redo"
        >
          <RedoIcon fontSize="inherit" />
        </IconButton>
        <Divider
          orientation="vertical"
          flexItem
          className={classNames(classes.divider, classes.dividerCompact)}
        />
        {/* Format dropdown — heading + indent/outdent */}
        <Button
          size="small"
          className={classes.compactDropdownButton}
          onClick={e => {
            setFormatAnchor(e.currentTarget)
            onMenuOpen?.()
          }}
          endIcon={<ArrowDropDownIcon fontSize="inherit" />}
          aria-label={t('richTextToolbar.paragraphFormat')}
          data-test="toolbar-format-menu"
        >
          {headingLabel}
        </Button>
        <Menu
          anchorEl={formatAnchor}
          open={Boolean(formatAnchor)}
          onClose={() => {
            setFormatAnchor(null)
            onMenuClose?.()
          }}
          slotProps={{
            root: { disablePortal: isFullscreen },
            list: { disablePadding: true },
          }}
        >
          {[
            {
              value: 'N',
              label: t('richTextToolbar.normal'),
              testId: 'toolbar-normal',
            },
            {
              value: '1',
              label: t('richTextToolbar.heading1'),
              testId: 'toolbar-heading-1',
            },
            {
              value: '2',
              label: t('richTextToolbar.heading2'),
              testId: 'toolbar-heading-2',
            },
            {
              value: '3',
              label: t('richTextToolbar.heading3'),
              testId: 'toolbar-heading-3',
            },
            {
              value: '4',
              label: t('richTextToolbar.heading4'),
              testId: 'toolbar-heading-4',
            },
          ].map(({ value, label, testId }) => (
            <MenuItem
              key={value}
              className={classes.compactMenuItem}
              onClick={() => {
                setHeading(value)
                setFormatAnchor(null)
                onMenuClose?.()
              }}
              data-test={testId}
            >
              <ListItemIcon className={classes.compactMenuIcon}>
                {headingValue === value ? (
                  <CheckIcon fontSize="small" color="primary" />
                ) : null}
              </ListItemIcon>
              <ListItemText>{label}</ListItemText>
            </MenuItem>
          ))}
          <Divider />
          <MenuItem
            className={classes.compactMenuItem}
            disabled={!canIndent}
            onClick={() => {
              handleIndent()
              setFormatAnchor(null)
              onMenuClose?.()
            }}
            data-test="toolbar-indent"
          >
            <ListItemIcon className={classes.compactMenuIcon}>
              <FormatIndentIncreaseIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('richTextToolbar.indent')}</ListItemText>
          </MenuItem>
          <MenuItem
            className={classes.compactMenuItem}
            disabled={!canOutdent}
            onClick={() => {
              handleOutdent()
              setFormatAnchor(null)
              onMenuClose?.()
            }}
            data-test="toolbar-outdent"
          >
            <ListItemIcon className={classes.compactMenuIcon}>
              <FormatIndentDecreaseIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('richTextToolbar.outdent')}</ListItemText>
          </MenuItem>
        </Menu>
        <Divider
          orientation="vertical"
          flexItem
          className={classNames(classes.divider, classes.dividerCompact)}
        />
        {/* Insert dropdown — bullet list, link */}
        <Button
          size="small"
          className={classes.compactDropdownButton}
          onClick={e => {
            setInsertAnchor(e.currentTarget)
            onMenuOpen?.()
          }}
          endIcon={<ArrowDropDownIcon fontSize="inherit" />}
          aria-label={t('richTextToolbar.insert')}
          data-test="toolbar-insert-menu"
        >
          <AddIcon fontSize="inherit" />
        </Button>
        <Menu
          anchorEl={insertAnchor}
          open={Boolean(insertAnchor)}
          onClose={() => {
            setInsertAnchor(null)
            onMenuClose?.()
          }}
          slotProps={{
            root: { disablePortal: isFullscreen },
            list: { disablePadding: true },
          }}
        >
          <MenuItem
            className={classes.compactMenuItem}
            onClick={() => {
              editor.chain().focus().toggleBulletList().run()
              setInsertAnchor(null)
              onMenuClose?.()
            }}
            data-test="toolbar-bullet-list"
          >
            <ListItemIcon className={classes.compactMenuIcon}>
              <FormatListBulletedIcon
                fontSize="small"
                color={editor.isActive('bulletList') ? 'primary' : 'inherit'}
              />
            </ListItemIcon>
            <ListItemText>{t('richTextToolbar.bulletList')}</ListItemText>
          </MenuItem>
          <MenuItem
            className={classes.compactMenuItem}
            onClick={() => {
              editor.chain().focus().toggleOrderedList().run()
              setInsertAnchor(null)
              onMenuClose?.()
            }}
            data-test="toolbar-numbered-list"
          >
            <ListItemIcon className={classes.compactMenuIcon}>
              <FormatListNumberedIcon
                fontSize="small"
                color={editor.isActive('orderedList') ? 'primary' : 'inherit'}
              />
            </ListItemIcon>
            <ListItemText>{t('richTextToolbar.numberedList')}</ListItemText>
          </MenuItem>
          <MenuItem
            className={classes.compactMenuItem}
            onClick={() => {
              setLink()
              setInsertAnchor(null)
              onMenuClose?.()
            }}
            data-test="toolbar-link"
          >
            <ListItemIcon className={classes.compactMenuIcon}>
              <InsertLinkIcon
                fontSize="small"
                color={editor.isActive('link') ? 'primary' : 'inherit'}
              />
            </ListItemIcon>
            <ListItemText>{t('richTextToolbar.link')}</ListItemText>
          </MenuItem>
        </Menu>
        {showFullscreen && (
          <>
            <Divider
              orientation="vertical"
              flexItem
              className={classNames(classes.divider, classes.dividerCompact)}
            />
            <IconButton
              size="small"
              className={classNames(
                classes.iconButton,
                classes.iconButtonCompact
              )}
              onClick={onToggleFullscreen}
              aria-label={
                isFullscreen
                  ? t('richTextToolbar.exitFullscreen')
                  : t('richTextToolbar.fullscreen')
              }
              data-test="toolbar-fullscreen"
            >
              {isFullscreen ? (
                <FullscreenExitIcon fontSize="inherit" />
              ) : (
                <FullscreenIcon fontSize="inherit" />
              )}
            </IconButton>
          </>
        )}
      </Toolbar>
    )
  }

  return (
    <Toolbar variant="dense" disableGutters className={classes.toolbar}>
      <IconButton
        size="small"
        className={classes.iconButton}
        onClick={() => editor.chain().focus().toggleBold().run()}
        color={editor.isActive('bold') ? 'primary' : 'default'}
        aria-label={t('richTextToolbar.bold')}
        data-test="toolbar-bold"
      >
        <FormatBoldIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        className={classes.iconButton}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        color={editor.isActive('italic') ? 'primary' : 'default'}
        aria-label={t('richTextToolbar.italic')}
        data-test="toolbar-italic"
      >
        <FormatItalicIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        className={classes.iconButton}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        color={editor.isActive('underline') ? 'primary' : 'default'}
        aria-label={t('richTextToolbar.underline')}
        data-test="toolbar-underline"
      >
        <FormatUnderlinedIcon fontSize="small" />
      </IconButton>
      <Divider orientation="vertical" flexItem className={classes.divider} />
      <IconButton
        size="small"
        className={classes.iconButton}
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        aria-label={t('richTextToolbar.undo')}
        data-test="toolbar-undo"
      >
        <UndoIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        className={classes.iconButton}
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        aria-label={t('richTextToolbar.redo')}
        data-test="toolbar-redo"
      >
        <RedoIcon fontSize="small" />
      </IconButton>
      <Divider orientation="vertical" flexItem className={classes.divider} />
      <IconButton
        size="small"
        className={classes.iconButton}
        onClick={handleIndent}
        disabled={!canIndent}
        aria-label={t('richTextToolbar.indent')}
        data-test="toolbar-indent"
      >
        <FormatIndentIncreaseIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        className={classes.iconButton}
        onClick={handleOutdent}
        disabled={!canOutdent}
        aria-label={t('richTextToolbar.outdent')}
        data-test="toolbar-outdent"
      >
        <FormatIndentDecreaseIcon fontSize="small" />
      </IconButton>
      <Select
        value={headingValue}
        onChange={e => setHeading(e.target.value)}
        onOpen={() => onMenuOpen?.()}
        onClose={() => onMenuClose?.()}
        size="small"
        variant="outlined"
        className={classes.headingSelect}
        MenuProps={{ disablePortal: isFullscreen }}
        inputProps={{ 'data-test': 'toolbar-heading-select' }}
      >
        <MenuItem value="N">{t('richTextToolbar.normal')}</MenuItem>
        <MenuItem value="1">{t('richTextToolbar.heading1')}</MenuItem>
        <MenuItem value="2">{t('richTextToolbar.heading2')}</MenuItem>
        <MenuItem value="3">{t('richTextToolbar.heading3')}</MenuItem>
        <MenuItem value="4">{t('richTextToolbar.heading4')}</MenuItem>
      </Select>
      <Divider orientation="vertical" flexItem className={classes.divider} />
      <IconButton
        size="small"
        className={classes.iconButton}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        color={editor.isActive('bulletList') ? 'primary' : 'default'}
        aria-label={t('richTextToolbar.bulletList')}
        data-test="toolbar-bullet-list"
      >
        <FormatListBulletedIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        className={classes.iconButton}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        color={editor.isActive('orderedList') ? 'primary' : 'default'}
        aria-label={t('richTextToolbar.numberedList')}
        data-test="toolbar-numbered-list"
      >
        <FormatListNumberedIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        className={classes.iconButton}
        onClick={setLink}
        color={editor.isActive('link') ? 'primary' : 'default'}
        aria-label={t('richTextToolbar.link')}
        data-test="toolbar-link"
      >
        <InsertLinkIcon fontSize="small" />
      </IconButton>
      {showFullscreen && (
        <>
          <Divider
            orientation="vertical"
            flexItem
            className={classes.divider}
          />
          <IconButton
            size="small"
            className={classes.iconButton}
            onClick={onToggleFullscreen}
            aria-label={
              isFullscreen
                ? t('richTextToolbar.exitFullscreen')
                : t('richTextToolbar.fullscreen')
            }
            data-test="toolbar-fullscreen"
          >
            {isFullscreen ? (
              <FullscreenExitIcon fontSize="small" />
            ) : (
              <FullscreenIcon fontSize="small" />
            )}
          </IconButton>
        </>
      )}
    </Toolbar>
  )
}

export default RichTextToolbar
