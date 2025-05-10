import React, { useState } from 'react'
import { ToolType, ShapeType } from '../types'
import DrawingCanvas from './canvas/DrawingCanvas'
import Toolbar from './toolbar/Toolbar'
import ToolbarToggle from './toolbar/ToolbarToggle'

const App: React.FC = () => {
  const [toolbarVisible, setToolbarVisible] = useState(true)
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.Shape)
  const [activeShape, setActiveShape] = useState<ShapeType>(ShapeType.Rectangle)
  const [activeColor, setActiveColor] = useState('#000000')

  const toggleToolbar = (): void => {
    const newVisibility = toolbarVisible == null
    setToolbarVisible(newVisibility)
    window.electronAPI.toggleToolbar(newVisibility)
  }

  const handleClearCanvas = (): void => {
    const event = new CustomEvent('clear-canvas')
    document.dispatchEvent(event)
  }

  const handleAddCenterText = (): void => {
    const event = new CustomEvent('add-center-text')
    document.dispatchEvent(event)
  }

  const handleElementSelect = (element: any): void => {
    console.log('Selected element:', element)
  }

  return (
    <div className="app">
      <div className="titlebar">
        <div className="titlebar-drag-region" />
        <div className="window-title">Screen Cap</div>
      </div>
      <div className="main-content">
        <ToolbarToggle isToolbarVisible={toolbarVisible} onToggleToolbar={toggleToolbar} />
        <Toolbar
          isVisible={toolbarVisible}
          activeTool={activeTool}
          activeShape={activeShape}
          activeColor={activeColor}
          onToolSelect={setActiveTool}
          onShapeSelect={setActiveShape}
          onColorSelect={setActiveColor}
          onClearCanvas={handleClearCanvas}
          onAddCenterText={handleAddCenterText}
        />
        <DrawingCanvas
          activeTool={activeTool}
          activeShape={activeShape}
          activeColor={activeColor}
          onSelectElement={handleElementSelect}
        />
      </div>
    </div>
  )
}

export default App