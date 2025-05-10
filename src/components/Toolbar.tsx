import React from 'react';
import { ToolbarProps, WindowControlProps, ToolType, ShapeType } from '../types';
import ColorPickerAdvanced from './ColorPickerAdvanced';

const WindowControls: React.FC<WindowControlProps> = ({ onMinimize, onClose }) => {
  return (
    <div className="toolbar-right">
      <button className="window-button" onClick={onMinimize}>−</button>
      <button className="window-button" onClick={onClose}>×</button>
    </div>
  );
};

const ToolButton: React.FC<{
  name: string;
  tool: ToolType;
  activeTool: ToolType;
  onClick: (tool: ToolType) => void;
}> = ({ name, tool, activeTool, onClick }) => (
  <button 
    className={`tool-button ${activeTool === tool ? 'active' : ''}`}
    onClick={() => onClick(tool)}
  >
    {name}
  </button>
);

const ShapeButton: React.FC<{
  name: string;
  shape: ShapeType;
  activeShape: ShapeType;
  onClick: (shape: ShapeType) => void;
}> = ({ name, shape, activeShape, onClick }) => (
  <button 
    className={`shape-button ${activeShape === shape ? 'active' : ''}`}
    onClick={() => onClick(shape)}
  >
    {name}
  </button>
);

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
  onAddCenterText
}) => {
  return (
    <div className={`toolbar ${isVisible ? '' : 'hidden'}`}>
      <div className="toolbar-left">
        <span className="toolbar-title">Screen Recorder</span>
        
        <div className="toolbar-divider" />
        
        <div className="toolbar-section">
          <span className="section-title">Tools</span>
          <div className="tool-buttons">
            <ToolButton name="Shape" tool="shape" activeTool={activeTool} onClick={onToolSelect} />
            <ToolButton name="Text" tool="text" activeTool={activeTool} onClick={onToolSelect} />
            <ToolButton name="Select" tool="select" activeTool={activeTool} onClick={onToolSelect} />
            <ToolButton name="Eraser" tool="eraser" activeTool={activeTool} onClick={onToolSelect} />
          </div>
        </div>
        
        {activeTool === 'shape' && (
          <>
            <div className="toolbar-divider" />
            <div className="toolbar-section">
              <span className="section-title">Shapes</span>
              <div className="shape-buttons">
                <ShapeButton name="◼" shape="rectangle" activeShape={activeShape} onClick={onShapeSelect} />
                <ShapeButton name="◯" shape="circle" activeShape={activeShape} onClick={onShapeSelect} />
                <ShapeButton name="△" shape="triangle" activeShape={activeShape} onClick={onShapeSelect} />
                <ShapeButton name="╱" shape="line" activeShape={activeShape} onClick={onShapeSelect} />
                <ShapeButton name="✎" shape="freehand" activeShape={activeShape} onClick={onShapeSelect} />
              </div>
            </div>
          </>
        )}
        
        <div className="toolbar-divider" />
        
        <div className="toolbar-section">
          <span className="section-title">Color</span>
          <ColorPickerAdvanced activeColor={activeColor} onColorSelect={onColorSelect} />
        </div>
        
        <div className="toolbar-divider" />
        
        {activeTool === 'text' && onAddCenterText && (
          <button className="action-button" onClick={onAddCenterText}>
            Add Text Box
          </button>
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
  );
};

export default Toolbar;