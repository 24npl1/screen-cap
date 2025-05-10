export enum ShapeType {
  Rectangle = 'rectangle',
  Circle = 'circle',
  Triangle = 'triangle',
  Line = 'line',
  Freehand = 'freehand',
}

export enum ToolType {
  Shape = 'shape',
  Text = 'text',
  Select = 'select',
  Eraser = 'eraser',
}

export enum ElementType {
  Shape = 'shape',
  Text = 'text',
}

export interface WindowControlProps {
  onMinimize: () => void
  onClose: () => void
}

export interface ToolbarProps {
  isVisible: boolean
  activeTool: ToolType
  activeShape: ShapeType
  activeColor: string
  onToolSelect: (tool: ToolType) => void
  onShapeSelect: (shape: ShapeType) => void
  onColorSelect: (color: string) => void
  onClearCanvas: () => void
  onAddCenterText?: () => void
}

export interface ToolbarToggleProps {
  isToolbarVisible: boolean
  onToggleToolbar: () => void
}

export interface Point {
  x: number
  y: number
}

export interface DrawableObject {
  id: string
  type: ElementType
  position: Point
}

export interface ShapeObject extends DrawableObject {
  type: ElementType.Shape
  shapeType: ShapeType
  startPoint: Point
  endPoint: Point
  color: string
  points?: Point[]
}

export interface TextObject extends DrawableObject {
  type: ElementType.Text
  content: string
  fontSize: number
  color: string
}

export type DrawableElement = ShapeObject | TextObject

declare global {
  interface Window {
    electronAPI: {
      minimizeWindow: () => void
      closeWindow: () => void
      toggleToolbar: (visible: boolean) => void
    }
  }
}
