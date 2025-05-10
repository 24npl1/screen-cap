import React from 'react'
import { ToolbarProps, WindowControlProps, ToolType, ShapeType } from '../types'
import ColorPickerAdvanced from './ColorPickerAdvanced'

const WindowControls: React.FC<WindowControlProps> = ({ onMinimize, onClose }) => {
  return (
    <div className="toolbar-right">
      <button className="window-button" onClick={onMinimize}>
        −
      </button>
      <button className="window-button" onClick={onClose}>
        ×
      </button>
    </div>
  )
}

const ToolButton: React.FC<{
  name: string
  tool: ToolType
  activeTool: ToolType
  onClick: (tool: ToolType) => void
  title?: string
}> = ({ name, tool, activeTool, onClick, title }) => (
  <button
    className={`tool-button ${activeTool === tool ? 'active' : ''} ${tool === ToolType.PassThrough ? 'passthrough-button' : ''}`}
    onClick={() => onClick(tool)}
    title={title || tool}
  >
    {name}
  </button>
)

const ShapeButton: React.FC<{
  name: string
  shape: ShapeType
  activeShape: ShapeType
  onClick: (shape: ShapeType) => void
}> = ({ name, shape, activeShape, onClick }) => (
  <button
    className={`shape-button ${activeShape === shape ? 'active' : ''}`}
    onClick={() => onClick(shape)}
  >
    {name}
  </button>
)

// We'll replace this with our advanced color picker component

const Toolbar: React.FC<ToolbarProps> = ({
  isVisible,
  activeTool,
  activeShape,
  activeColor,
  onToolSelect,
  onShapeSelect,
  onColorSelect,
  onClearCanvas,
  onAddCenterText,
}) => {
  return (
    <div className={`toolbar ${isVisible ? '' : 'hidden'}`}>
      <div className="toolbar-left">
        <span className="toolbar-title">Screen Recorder</span>

        <div className="toolbar-divider" />

        <div className="toolbar-section">
          <div className="tool-buttons">
            <ToolButton
              name="✏️"
              tool={ToolType.Shape}
              activeTool={activeTool}
              onClick={onToolSelect}
            />
            <ToolButton
              name="📝"
              tool={ToolType.Text}
              activeTool={activeTool}
              onClick={onToolSelect}
            />
            <ToolButton
              name="👆"
              tool={ToolType.Select}
              activeTool={activeTool}
              onClick={onToolSelect}
            />
            <ToolButton
              name="🧹"
              tool={ToolType.Eraser}
              activeTool={activeTool}
              onClick={onToolSelect}
            />
            <ToolButton
              name="👻"
              tool={ToolType.PassThrough}
              activeTool={activeTool}
              onClick={onToolSelect}
              title="Passthrough Mode"
            />
          </div>
        </div>

        {activeTool === ToolType.Shape && (
          <>
            <div className="toolbar-divider" />
            <div className="toolbar-section">
              <div className="shape-buttons">
                <ShapeButton
                  name="⬜"
                  shape={ShapeType.Rectangle}
                  activeShape={activeShape}
                  onClick={onShapeSelect}
                />
                <ShapeButton
                  name="⭕"
                  shape={ShapeType.Circle}
                  activeShape={activeShape}
                  onClick={onShapeSelect}
                />
                <ShapeButton
                  name="🔺"
                  shape={ShapeType.Triangle}
                  activeShape={activeShape}
                  onClick={onShapeSelect}
                />
                <ShapeButton
                  name="📏"
                  shape={ShapeType.Line}
                  activeShape={activeShape}
                  onClick={onShapeSelect}
                />
                <ShapeButton
                  name="✍️"
                  shape={ShapeType.Freehand}
                  activeShape={activeShape}
                  onClick={onShapeSelect}
                />
              </div>
            </div>
          </>
        )}

        {(activeTool === ToolType.Shape || activeTool === ToolType.Text) && (
          <>
            <div className="toolbar-divider" />
            <div className="toolbar-section">
              <ColorPickerAdvanced activeColor={activeColor} onColorSelect={onColorSelect} />
            </div>
          </>
        )}

        {activeTool === ToolType.Text && onAddCenterText && (
          <>
            <div className="toolbar-divider" />
            <button className="action-button" onClick={onAddCenterText}>
              Add Text Box
            </button>
          </>
        )}

        <div className="toolbar-divider" />

        <button className="clear-button" onClick={onClearCanvas}>
          Clear All
        </button>
      </div>

      <WindowControls
        onMinimize={() => window.electronAPI.minimizeWindow()}
        onClose={() => window.electronAPI.closeWindow()}
      />
    </div>
  )
}

export default Toolbar
