import React, { useState } from 'react';
import Toolbar from './Toolbar';
import ToolbarToggle from './ToolbarToggle';
import DrawingCanvas from './DrawingCanvas';
import { ToolType, ShapeType, DrawableElement } from '../types';

const App: React.FC = () => {
  const [toolbarVisible, setToolbarVisible] = useState<boolean>(true);
  const [activeTool, setActiveTool] = useState<ToolType>('shape');
  const [activeShape, setActiveShape] = useState<ShapeType>('rectangle');
  const [activeColor, setActiveColor] = useState<string>('#FF0000');

  const toggleToolbar = (): void => {
    const newVisibility = !toolbarVisible;
    setToolbarVisible(newVisibility);
    window.electronAPI.toggleToolbar(newVisibility);
  };

  const handleToolSelect = (tool: ToolType): void => {
    setActiveTool(tool);
  };

  const handleShapeSelect = (shape: ShapeType): void => {
    setActiveShape(shape);
  };

  const handleColorSelect = (color: string): void => {
    setActiveColor(color);
  };

  const handleClearCanvas = (): void => {
    // This will be implemented in the DrawingCanvas component
    // We'll use a ref to trigger a clear action
    const event = new CustomEvent('clear-canvas');
    document.dispatchEvent(event);
  };
  
  const handleAddCenterTextBox = (): void => {
    // Create a text box in the center of the screen
    const event = new CustomEvent('add-center-text');
    document.dispatchEvent(event);
    
    // Switch to text tool
    setActiveTool('text');
  };

  const handleElementSelect = (element: DrawableElement | null): void => {
    // This function is for future implementation of element selection operations
    console.log('Element selected:', element?.id);
  };

  return (
    <div className="app-container">
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
      <div className="window-content">
        <ToolbarToggle 
          isToolbarVisible={toolbarVisible} 
          onToggleToolbar={toggleToolbar} 
        />
        <DrawingCanvas
          activeTool={activeTool}
          activeShape={activeShape}
          activeColor={activeColor}
          onSelectElement={handleElementSelect}
        />
      </div>
    </div>
  );
};

export default App;