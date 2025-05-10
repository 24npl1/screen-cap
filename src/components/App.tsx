import React, { useState } from 'react'
import Toolbar from './Toolbar'
import ToolbarToggle from './ToolbarToggle'
import DrawingCanvas from './DrawingCanvas'
import { ToolType, ShapeType, DrawableElement } from '../types'

const App: React.FC = () => {
  const [toolbarVisible, setToolbarVisible] = useState<boolean>(true)
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.Shape)
  const [activeShape, setActiveShape] = useState<ShapeType>(ShapeType.Rectangle)
  const [activeColor, setActiveColor] = useState<string>('#FF0000')

  const toggleToolbar = (): void => {
    const newVisibility = !toolbarVisible
    setToolbarVisible(newVisibility)
    window.electronAPI.toggleToolbar(newVisibility)
  }

  const handleToolSelect = (tool: ToolType): void => {
    if (tool !== activeTool) {
      setActiveTool(tool)
      const shouldEnablePassthrough = tool === ToolType.PassThrough
      window.electronAPI.togglePassthrough(shouldEnablePassthrough)
    }
  }

  const handleShapeSelect = (shape: ShapeType): void => {
    setActiveShape(shape)
  }

  const handleColorSelect = (color: string): void => {
    setActiveColor(color)
  }

  const handleClearCanvas = (): void => {
    const event = new CustomEvent('clear-canvas')
    document.dispatchEvent(event)
  }

  const handleAddCenterTextBox = (): void => {
    const event = new CustomEvent('add-center-text')
    document.dispatchEvent(event)
    setActiveTool(ToolType.Text)
  }

  return (
    <div className={`app-container ${activeTool === ToolType.PassThrough ? 'passthrough-mode' : ''}`}>
      <Toolbar
        isVisible={toolbarVisible}
        activeTool={activeTool}
        activeShape={activeShape}
        activeColor={activeColor}
        onToolSelect={handleToolSelect}
        onShapeSelect={handleShapeSelect}
        onColorSelect={handleColorSelect}
        onClearCanvas={handleClearCanvas}
        onAddCenterText={handleAddCenterTextBox}
      />
      <div className={`window-content ${activeTool === ToolType.PassThrough ? 'passthrough-content' : ''}`}>
        <ToolbarToggle isToolbarVisible={toolbarVisible} onToggleToolbar={toggleToolbar} />
        {activeTool === ToolType.PassThrough && (
          <div className="passthrough-indicator">
            Passthrough Mode Active - Click toolbar ghost button to exit
          </div>
        )}
        <DrawingCanvas
          activeTool={activeTool}
          activeShape={activeShape}
          activeColor={activeColor}
        />
      </div>
    </div>
  )
}
export default App

