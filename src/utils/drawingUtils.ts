import { Point, ShapeType, ShapeObject, ChildType, DrawCompType } from '../types'

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11)
}

export const snapToShape = (
  startPoint: Point,
  currentPoint: Point,
  shapeType: ShapeType
): Point => {
  switch (shapeType) {
    case ShapeType.Circle: {
      const dx = currentPoint.x - startPoint.x
      const dy = currentPoint.y - startPoint.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      return {
        x: startPoint.x + distance * Math.sign(dx),
        y: startPoint.y + distance * Math.sign(dy),
      }
    }
    case ShapeType.Rectangle: {
      const isSquare = false
      if (isSquare) {
        const dx = Math.abs(currentPoint.x - startPoint.x)
        const dy = Math.abs(currentPoint.y - startPoint.y)
        const size = Math.max(dx, dy)
        return {
          x: startPoint.x + size * Math.sign(currentPoint.x - startPoint.x),
          y: startPoint.y + size * Math.sign(currentPoint.y - startPoint.y),
        }
      }
      return currentPoint
    }
    case ShapeType.Triangle:
    case ShapeType.Line:
    case ShapeType.Freehand:
    default:
      return currentPoint
  }
}

export interface RenderableComponent {
  type: DrawCompType
  props: {
    style: React.CSSProperties
    children?: RenderableChild[]
  }
}

export interface RenderableChild {
  type: ChildType
  props: {
    points?: string
    fill?: string
    stroke: string
    strokeWidth: number
    x1?: number
    y1?: number
    x2?: number
    y2?: number
    d?: string 
  }
}

export const renderShape = (shape: ShapeObject): RenderableComponent | null => {
  const { shapeType, startPoint, endPoint, color } = shape

  switch (shapeType) {
    case ShapeType.Rectangle: {
      const left = Math.min(startPoint.x, endPoint.x)
      const top = Math.min(startPoint.y, endPoint.y)
      const width = Math.abs(endPoint.x - startPoint.x)
      const height = Math.abs(endPoint.y - startPoint.y)

      return {
        type: DrawCompType.Div,
        props: {
          style: {
            position: 'absolute',
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`,
            border: `2px solid ${color}`,
            pointerEvents: 'none',
          },
        },
      }
    }
    case ShapeType.Circle: {
      const centerX = (startPoint.x + endPoint.x) / 2
      const centerY = (startPoint.y + endPoint.y) / 2
      const radius =
        Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)) /
        2

      return {
        type: DrawCompType.Div,
        props: {
          style: {
            position: 'absolute',
            left: `${centerX - radius}px`,
            top: `${centerY - radius}px`,
            width: `${radius * 2}px`,
            height: `${radius * 2}px`,
            border: `2px solid ${color}`,
            borderRadius: '50%',
            pointerEvents: 'none',
          },
        },
      }
    }
    case ShapeType.Triangle: {
      const x1 = startPoint.x
      const y1 = endPoint.y
      const x2 = (startPoint.x + endPoint.x) / 2
      const y2 = startPoint.y
      const x3 = endPoint.x
      const y3 = endPoint.y

      return {
        type: DrawCompType.SVG,
        props: {
          style: {
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          },
          children: [
            {
              type: ChildType.Polygon,
              props: {
                points: `${x1},${y1} ${x2},${y2} ${x3},${y3}`,
                fill: 'transparent',
                stroke: color,
                strokeWidth: 2,
              },
            },
          ],
        },
      }
    }
    case ShapeType.Line: {
      return {
        type: DrawCompType.SVG,
        props: {
          style: {
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          },
          children: [
            {
              type: ChildType.Line,
              props: {
                x1: startPoint.x,
                y1: startPoint.y,
                x2: endPoint.x,
                y2: endPoint.y,
                stroke: color,
                strokeWidth: 2,
              },
            },
          ],
        },
      }
    }
    case ShapeType.Freehand: {
      if (shape.points == null || shape.points.length < 2) {
        return null
      }

      const pathPoints = shape.points
        .map((point, index) => {
          return index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
        })
        .join(' ')

      return {
        type: DrawCompType.SVG,
        props: {
          style: {
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          },
          children: [
            {
              type: ChildType.Path,
              props: {
                d: pathPoints,
                fill: 'none',
                stroke: color,
                strokeWidth: 2,
              },
            },
          ],
        },
      }
    }
    default:
      return null
  }
}
