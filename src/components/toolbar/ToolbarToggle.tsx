import React from 'react'
import { ToolbarToggleProps } from '../../types'

const ToolbarToggle: React.FC<ToolbarToggleProps> = ({ isToolbarVisible, onToggleToolbar }) => {
  return (
    <div
      className="toolbar-toggle"
      onClick={onToggleToolbar}
      title={isToolbarVisible ? 'Hide Toolbar' : 'Show Toolbar'}
    />
  )
}

export default ToolbarToggle