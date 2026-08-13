const template = `
// Block of third party libs
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

// Block of Material imports
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'

// Block of Juralio imports

const useStyles = makeStyles()(theme => ({
  root: {
    border: '1px solid red', // This is to guide you in positioning your component.
    maxWidth: theme.spacing(60),
  },
  text: { color: 'black' },
}))

// To us in an application: import COMPONENT_NAME from './COMPONENT_NAME'
// The COMPONENT_NAME handles display of ____
const COMPONENT_NAME = props => {
  const {classes} = useStyles()
  const { t } = useTranslation()
  const [myState, setMyState] = useState(true)

  console.log('COMPONENT_NAME:', props, myState)

  const handleComponentClick = e => setMyState(!myState)

  useEffect(() => {
    console.log('COMPONENT_NAME Component - UseEffect Triggered')

    return () =>
      console.log('COMPONENT_NAME Component - UseEffect clean up Triggered')
  }, [myState])

  // Early bail out if key data not available.
  if (!props.myKeyProp) return null

  return (
    <div
      data-test="LOWER_COMPONENT_NAME-wrapper"
      className={classes.root}
      onClick={handleComponentClick}
    >
      <Typography
        className={classes.text}
        data-test={'LOWER_COMPONENT_NAME-text'}
        variant="body2"
      >
        COMPONENT_NAME
        <br />
        State [{myState.toString()}]
        <br />
        myKeyProp {props.myKeyProp}
        <br />
        i18n {t('translated.LOWER_COMPONENT_NAME')}
      </Typography>
    </div>
  )
}

COMPONENT_NAME.propTypes = {
  myKeyProp: PropTypes.string.isRequired,
}

export default COMPONENT_NAME

`

const containerTemplate = `
// Block of third party libs
import React from 'react'
import PropTypes from 'prop-types'

// Block of Juralio imports
import COMPONENT_NAME from './COMPONENT_NAME.js'

// To us in an application: import COMPONENT_NAMEContainer from './COMPONENT_NAMEContainer'
// The COMPONENT_NAMEContainer handles display of ____
const COMPONENT_NAMEContainer = props => {
  console.log('COMPONENT_NAMEContainer:', props)
  return <COMPONENT_NAME myKeyProp={props.myKeyProp} />
}

COMPONENT_NAMEContainer.propTypes = {
  myKeyProp: PropTypes.string.isRequired,
}

export default COMPONENT_NAMEContainer
`

module.exports = { template, containerTemplate }
