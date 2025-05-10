export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'line' | 'freehand';
export type ToolType = 'shape' | 'text' | 'select' | 'eraser';

export interface WindowControlProps {
  onMinimize: () => void;
  onClose: () => void;
}

export interface ToolbarProps {
  isVisible: boolean;
  activeTool: ToolType;
  activeShape: ShapeType;
  activeColor: string;
  onToolSelect: (tool: ToolType) => void;
  onShapeSelect: (shape: ShapeType) => void;
  onColorSelect: (color: string) => void;
  onClearCanvas: () => void;
  onAddCenterText?: () => void;
}

export interface ToolbarToggleProps {
  isToolbarVisible: boolean;
  onToggleToolbar: () => void;
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawableObject {
  id: string;
  type: 'shape' | 'text';
  position: Point;
}

export interface ShapeObject extends DrawableObject {
  type: 'shape';
  shapeType: ShapeType;
  startPoint: Point;
  endPoint: Point;
  color: string;
  points?: Point[]; // For freehand drawing
}

export interface TextObject extends DrawableObject {
  type: 'text';
  content: string;
  fontSize: number;
  color: string;
}

export type DrawableElement = ShapeObject | TextObject;

declare global {
  interface Window {
    electronAPI: {
      minimizeWindow: () => void;
      closeWindow: () => void;
      toggleToolbar: (visible: boolean) => void;
    };
  }
}