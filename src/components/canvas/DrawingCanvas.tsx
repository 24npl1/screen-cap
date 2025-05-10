import React, { useRef, useState, useEffect, MouseEvent } from 'react'
import {
  ShapeType,
  ToolType,
  Point,
  DrawableElement,
  ShapeObject,
  TextObject,
  ElementType,
} from '../../types'
import {
  generateId,
  snapToShape,
  renderShape,
  RenderableComponent,
  RenderableChild,
} from '../../utils/drawingUtils'

interface DrawingCanvasProps {
  activeTool: ToolType
  activeShape: ShapeType
  activeColor: string
  onSelectElement?: (element: DrawableElement | null) => void
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  activeTool,
  activeShape,
  activeColor,
  onSelectElement,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const textInputRef = useRef<HTMLTextAreaElement>(null)
  const [elements, setElements] = useState<DrawableElement[]>([])
  const [selectedElement, setSelectedElement] = useState<DrawableElement | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 })
  const [currentPoint, setCurrentPoint] = useState<Point>({ x: 0, y: 0 })
  const [textInputPosition, setTextInputPosition] = useState<Point | null>(null)
  const [textInputValue, setTextInputValue] = useState('')
  const [textInputSize, setTextInputSize] = useState({ width: 200, height: 100 })
  const [currentFreehandPoints, setCurrentFreehandPoints] = useState<Point[]>([])
  const [currentDrawingShape, setCurrentDrawingShape] = useState<ShapeObject | null>(null)
  const [selectionRect, setSelectionRect] = useState<{ start: Point; end: Point } | null>(null)
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [isMovingElements, setIsMovingElements] = useState(false)
  const [moveOffset, setMoveOffset] = useState<Point>({ x: 0, y: 0 })

  useEffect(() => {
    const handleClearCanvas = () => {
      setElements([])
      setSelectedElement(null)
      setSelectedElements([])
      if (onSelectElement) {
        onSelectElement(null)
      }
    }

    const handleAddCenterText = () => {
      if (canvasRef.current == null) return

      const width = canvasRef.current.clientWidth
      const height = canvasRef.current.clientHeight
      const centerX = width / 2 - textInputSize.width / 2
      const centerY = height / 2 - textInputSize.height / 2

      setTextInputPosition({ x: centerX, y: centerY })
      setTextInputValue('')

      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus()
        }
      }, 100)
    }

    document.addEventListener('clear-canvas', handleClearCanvas)
    document.addEventListener('add-center-text', handleAddCenterText)

    return () => {
      document.removeEventListener('clear-canvas', handleClearCanvas)
      document.removeEventListener('add-center-text', handleAddCenterText)
    }
  }, [onSelectElement, textInputSize])

  useEffect(() => {
    if (selectedElement && onSelectElement) {
      onSelectElement(selectedElement)
    }
  }, [selectedElement, onSelectElement])

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (canvasRef.current == null) return

    const rect = canvasRef.current.getBoundingClientRect()
    const point: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    setStartPoint(point)
    setCurrentPoint(point)

    if (activeTool === ToolType.Shape) {
      setSelectedElements([])
      setSelectedElement(null)

      setDrawing(true)

      if (activeShape === ShapeType.Freehand) {
        const newPoints = [point]
        setCurrentFreehandPoints(newPoints)

        const newFreehandShape: ShapeObject = {
          id: generateId(),
          type: ElementType.Shape,
          shapeType: ShapeType.Freehand,
          position: point,
          startPoint: point,
          endPoint: point,
          color: activeColor,
          points: newPoints,
        }

        setCurrentDrawingShape(newFreehandShape)
      } else {
        setCurrentDrawingShape(null)
      }
    } else if (activeTool === ToolType.Text) {
      setSelectedElements([])
      setSelectedElement(null)

      if (textInputPosition == null) {
        if (e.altKey) {
          setTextInputPosition(point)
          setTextInputValue('')
        } else {
          setDrawing(true)
          setStartPoint(point)
          setCurrentPoint(point)
          setSelectionRect({ start: point, end: point })
        }
      }
    } else if (activeTool === ToolType.Select) {
      const clickedElementIndex = elements.findIndex(
        element => selectedElements.includes(element.id) && isPointInElement(point, element)
      )

      if (clickedElementIndex !== -1) {
        setIsMovingElements(true)
        setMoveOffset({ x: point.x, y: point.y })
      } else {
        if (e.shiftKey == null) {
          setSelectedElements([])
          setSelectedElement(null)
        }

        setDrawing(true)
        setSelectionRect({ start: point, end: point })
        const clickedElement = elements
          .slice()
          .reverse()
          .find(element => isPointInElement(point, element))

        if (clickedElement != null) {
          if (e.shiftKey) {
            setSelectedElements(prev => [...prev, clickedElement.id])
          } else {
            setSelectedElements([clickedElement.id])
          }

          setSelectedElement(clickedElement)
          if (onSelectElement) {
            onSelectElement(clickedElement)
          }
        }
      }
    } else if (activeTool === ToolType.Eraser) {
      setSelectedElements([])
      setSelectedElement(null)

      setDrawing(true)
      setSelectionRect({ start: point, end: point })
    }
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (canvasRef.current == null) return

    const rect = canvasRef.current.getBoundingClientRect()
    const point: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    setCurrentPoint(point)

    if (isMovingElements) {
      const dx = point.x - moveOffset.x
      const dy = point.y - moveOffset.y

      setElements(prevElements =>
        prevElements.map(element => {
          if (selectedElements.includes(element.id)) {
            if (element.type === ElementType.Shape) {
              const shape = element as ShapeObject
              return {
                ...shape,
                position: {
                  x: shape.position.x + dx,
                  y: shape.position.y + dy,
                },
                startPoint: {
                  x: shape.startPoint.x + dx,
                  y: shape.startPoint.y + dy,
                },
                endPoint: {
                  x: shape.endPoint.x + dx,
                  y: shape.endPoint.y + dy,
                },
                points: shape.points?.map(p => ({ x: p.x + dx, y: p.y + dy })),
              }
            } else if (element.type === ElementType.Text) {
              const text = element as TextObject
              return {
                ...text,
                position: {
                  x: text.position.x + dx,
                  y: text.position.y + dy,
                },
              }
            }
          }
          return element
        })
      )

      setMoveOffset(point)
    } else if (drawing) {
      if (
        activeTool === ToolType.Shape &&
        activeShape === ShapeType.Freehand &&
        currentDrawingShape
      ) {
        const updatedPoints = [...currentFreehandPoints, point]
        setCurrentFreehandPoints(updatedPoints)

        const updatedShape: ShapeObject = {
          ...currentDrawingShape,
          endPoint: point,
          points: updatedPoints,
        }

        setCurrentDrawingShape(updatedShape)
      } else if (activeTool === ToolType.Select || activeTool === ToolType.Eraser) {
        if (selectionRect) {
          setSelectionRect({
            ...selectionRect,
            end: point,
          })
        }
      } else if (activeTool === ToolType.Text) {
        setCurrentPoint(point)
      }
    }
  }

  const getElementsInRect = (rect: { start: Point; end: Point }): string[] => {
    if (rect == null) return []

    const left = Math.min(rect.start.x, rect.end.x)
    const top = Math.min(rect.start.y, rect.end.y)
    const right = Math.max(rect.start.x, rect.end.x)
    const bottom = Math.max(rect.start.y, rect.end.y)

    return elements
      .filter(element => {
        if (element.type === ElementType.Shape) {
          const shape = element as ShapeObject
          const elementLeft = Math.min(shape.startPoint.x, shape.endPoint.x)
          const elementTop = Math.min(shape.startPoint.y, shape.endPoint.y)
          const elementRight = Math.max(shape.startPoint.x, shape.endPoint.x)
          const elementBottom = Math.max(shape.startPoint.y, shape.endPoint.y)

          return (
            elementRight >= left &&
            elementLeft <= right &&
            elementBottom >= top &&
            elementTop <= bottom
          )
        } else if (element.type === ElementType.Text) {
          const text = element as TextObject
          const textWidth = text.content.length * (text.fontSize * 0.6)
          const textHeight = text.fontSize * 1.2

          return (
            text.position.x + textWidth >= left &&
            text.position.x <= right &&
            text.position.y + textHeight >= top &&
            text.position.y <= bottom
          )
        }
        return false
      })
      .map(element => element.id)
  }

  const handleMouseUp = () => {
    if (isMovingElements) {
      setIsMovingElements(false)
    } else if (drawing) {
      if (activeTool === ToolType.Shape) {
        if (activeShape === ShapeType.Freehand) {
          if (currentDrawingShape && currentFreehandPoints.length > 1) {
            const newShape: ShapeObject = {
              ...currentDrawingShape,
              endPoint: currentPoint,
            }

            setElements(prev => [...prev, newShape])
          }
        } else {
          const snappedEndPoint = snapToShape(startPoint, currentPoint, activeShape)

          const newShape: ShapeObject = {
            id: generateId(),
            type: ElementType.Shape,
            shapeType: activeShape,
            position: startPoint,
            startPoint,
            endPoint: snappedEndPoint,
            color: activeColor,
          }

          setElements(prev => [...prev, newShape])
        }
      } else if (activeTool === ToolType.Text) {
        if (
          Math.abs(currentPoint.x - startPoint.x) > 10 &&
          Math.abs(currentPoint.y - startPoint.y) > 10
        ) {
          const left = Math.min(startPoint.x, currentPoint.x)
          const top = Math.min(startPoint.y, currentPoint.y)
          const width = Math.abs(currentPoint.x - startPoint.x)
          const height = Math.abs(currentPoint.y - startPoint.y)

          setTextInputPosition({ x: left, y: top })
          setTextInputSize({ width, height })
        } else {
          setTextInputPosition(startPoint)
        }
      } else if (activeTool === ToolType.Select && selectionRect) {
        const elementsInRect = getElementsInRect(selectionRect)
        setSelectedElements(elementsInRect)

        if (elementsInRect.length > 0) {
          const selectedElement = elements.find(el => el.id === elementsInRect[0]) || null
          setSelectedElement(selectedElement)
          if (onSelectElement) {
            onSelectElement(selectedElement)
          }
        }
      } else if (activeTool === ToolType.Eraser && selectionRect) {
        const elementsToRemove = getElementsInRect(selectionRect)
        if (elementsToRemove.length > 0) {
          setElements(prevElements =>
            prevElements.filter(element => elementsToRemove.includes(element.id) == null)
          )
        }
      }

      setDrawing(false)
      setCurrentFreehandPoints([])
      setCurrentDrawingShape(null)
    }

    setSelectionRect(null)
  }

  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInputValue(e.target.value)
  }

  const initTextareaResize = () => {
    if (textInputRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        const container = entries[0].target.parentElement
        if (container) {
          setTextInputSize({
            width: container.clientWidth,
            height: container.clientHeight,
          })
        }
      })

      resizeObserver.observe(textInputRef.current)

      return () => {
        if (textInputRef.current) {
          resizeObserver.unobserve(textInputRef.current)
        }
      }
    }
  }

  useEffect(() => {
    if (textInputPosition != null) {
      return initTextareaResize()
    }
  }, [textInputPosition])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedElements.length > 0 &&
        textInputPosition == null
      ) {
        setElements(prevElements =>
          prevElements.filter(element => selectedElements.includes(element.id) == null)
        )
        setSelectedElements([])
        setSelectedElement(null)
        if (onSelectElement) {
          onSelectElement(null)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedElements, textInputPosition, onSelectElement])

  const handleTextInputBlur = () => {
    if (textInputPosition && textInputValue.trim() !== '') {
      const newText: TextObject = {
        id: generateId(),
        type: ElementType.Text,
        content: textInputValue,
        position: textInputPosition,
        fontSize: 16,
        color: activeColor,
      }

      setElements(prev => [...prev, newText])
    }

    setTextInputPosition(null)
    setTextInputValue('')
  }

  const isPointInElement = (point: Point, element: DrawableElement): boolean => {
    if (element.type === ElementType.Shape) {
      const { startPoint, endPoint, shapeType } = element

      if (shapeType === ShapeType.Rectangle) {
        return (
          point.x >= Math.min(startPoint.x, endPoint.x) &&
          point.x <= Math.max(startPoint.x, endPoint.x) &&
          point.y >= Math.min(startPoint.y, endPoint.y) &&
          point.y <= Math.max(startPoint.y, endPoint.y)
        )
      } else if (shapeType === ShapeType.Circle) {
        const centerX = (startPoint.x + endPoint.x) / 2
        const centerY = (startPoint.y + endPoint.y) / 2
        const radius =
          Math.sqrt(
            Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
          ) / 2

        return Math.sqrt(Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)) <= radius
      } else if (shapeType === ShapeType.Triangle) {
        const x1 = startPoint.x
        const y1 = endPoint.y
        const x2 = (startPoint.x + endPoint.x) / 2
        const y2 = startPoint.y
        const x3 = endPoint.x
        const y3 = endPoint.y

        return isPointInTriangle(point, { x: x1, y: y1 }, { x: x2, y: y2 }, { x: x3, y: y3 })
      }
    } else if (element.type === ElementType.Text) {
      const textWidth = element.content.length * (element.fontSize * 0.6)
      const textHeight = element.fontSize * 1.2

      return (
        point.x >= element.position.x &&
        point.x <= element.position.x + textWidth &&
        point.y >= element.position.y &&
        point.y <= element.position.y + textHeight
      )
    }

    return false
  }

  const isPointInTriangle = (point: Point, v1: Point, v2: Point, v3: Point): boolean => {
    const area = 0.5 * Math.abs(v1.x * (v2.y - v3.y) + v2.x * (v3.y - v1.y) + v3.x * (v1.y - v2.y))

    const area1 =
      0.5 * Math.abs(point.x * (v2.y - v3.y) + v2.x * (v3.y - point.y) + v3.x * (point.y - v2.y))

    const area2 =
      0.5 * Math.abs(v1.x * (point.y - v3.y) + point.x * (v3.y - v1.y) + v3.x * (v1.y - point.y))

    const area3 =
      0.5 * Math.abs(v1.x * (v2.y - point.y) + v2.x * (point.y - v1.y) + point.x * (v1.y - v2.y))

    return Math.abs(area - (area1 + area2 + area3)) < 0.01
  }

  const renderShapeComponent = (shapeDescriptor: RenderableComponent | null) => {
    if (shapeDescriptor == null) return null

    if (shapeDescriptor.type === 'div') {
      return <div style={shapeDescriptor.props.style} />
    } else if (shapeDescriptor.type === 'svg') {
      return (
        <svg style={shapeDescriptor.props.style}>
          {shapeDescriptor.props.children?.map((child: RenderableChild, index: number) => {
            if (child.type === 'polygon') {
              return (
                <polygon
                  key={index}
                  points={child.props.points}
                  fill={child.props.fill}
                  stroke={child.props.stroke}
                  strokeWidth={child.props.strokeWidth}
                />
              )
            } else if (child.type === 'line') {
              return (
                <line
                  key={index}
                  x1={child.props.x1}
                  y1={child.props.y1}
                  x2={child.props.x2}
                  y2={child.props.y2}
                  stroke={child.props.stroke}
                  strokeWidth={child.props.strokeWidth}
                />
              )
            } else if (child.type === 'path') {
              return (
                <path
                  key={index}
                  d={child.props.d}
                  fill={child.props.fill}
                  stroke={child.props.stroke}
                  strokeWidth={child.props.strokeWidth}
                />
              )
            }
            return null
          })}
        </svg>
      )
    }

    return null
  }

  const getCanvasClassName = () => {
    let className = 'drawing-canvas'

    if (isMovingElements) {
      className += ' moving'
    } else if (activeTool === ToolType.Eraser) {
      className += ' erasing'
    } else if (activeTool === ToolType.Select) {
      className += ' selecting'
    }

    return className
  }

  return (
    <div
      ref={canvasRef}
      className={getCanvasClassName()}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {elements.map(element => (
        <div
          key={element.id}
          className={`drawable-element ${selectedElements.includes(element.id) ? 'selected' : ''}`}
        >
          {element.type === ElementType.Shape &&
            renderShapeComponent(renderShape(element as ShapeObject))}
          {element.type === ElementType.Text && (
            <div
              style={{
                position: 'absolute',
                left: `${element.position.x}px`,
                top: `${element.position.y}px`,
                color: element.color,
                fontSize: `${(element as TextObject).fontSize}px`,
              }}
            >
              {(element as TextObject).content}
            </div>
          )}
        </div>
      ))}
      {drawing && activeTool === ToolType.Shape && (
        <div className="preview-shape">
          {activeShape === ShapeType.Freehand && currentDrawingShape
            ? renderShapeComponent(renderShape(currentDrawingShape))
            : renderShapeComponent(
                renderShape({
                  id: 'preview',
                  type: ElementType.Shape,
                  shapeType: activeShape,
                  position: startPoint,
                  startPoint,
                  endPoint: snapToShape(startPoint, currentPoint, activeShape),
                  color: activeColor,
                })
              )}
        </div>
      )}

      {drawing &&
        (activeTool === ToolType.Select ||
          activeTool === ToolType.Text ||
          activeTool === ToolType.Eraser) &&
        selectionRect && (
          <div
            className={`selection-rect ${activeTool === ToolType.Eraser ? 'eraser-rect' : ''} ${activeTool === ToolType.Text ? 'text-rect' : ''}`}
            style={{
              position: 'absolute',
              left: `${Math.min(selectionRect.start.x, selectionRect.end.x)}px`,
              top: `${Math.min(selectionRect.start.y, selectionRect.end.y)}px`,
              width: `${Math.abs(selectionRect.end.x - selectionRect.start.x)}px`,
              height: `${Math.abs(selectionRect.end.y - selectionRect.start.y)}px`,
            }}
          />
        )}

      {drawing && activeTool === ToolType.Text && selectionRect == null && (
        <div
          className="text-rect"
          style={{
            position: 'absolute',
            left: `${Math.min(startPoint.x, currentPoint.x)}px`,
            top: `${Math.min(startPoint.y, currentPoint.y)}px`,
            width: `${Math.abs(currentPoint.x - startPoint.x)}px`,
            height: `${Math.abs(currentPoint.y - startPoint.y)}px`,
          }}
        />
      )}

      {textInputPosition && (
        <div
          className="text-input-container"
          style={{
            left: `${textInputPosition.x}px`,
            top: `${textInputPosition.y}px`,
            width: `${textInputSize.width}px`,
            height: `${textInputSize.height}px`,
          }}
        >
          <textarea
            ref={textInputRef}
            className="text-input"
            style={{
              color: activeColor,
            }}
            autoFocus
            placeholder="Type your text here..."
            value={textInputValue}
            onChange={handleTextInput}
            onBlur={handleTextInputBlur}
          />
          <div className="text-resize-handle" />
        </div>
      )}
    </div>
  )
}

export default DrawingCanvas