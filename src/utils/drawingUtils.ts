import { ShapeType, ShapeObject, Point } from '../types'

export interface RenderableComponent {
  type: 'div' | 'svg'
  props: {
    style: React.CSSProperties
    children?: RenderableChild[]
  }
}

export interface RenderableChild {
  type: 'polygon' | 'line' | 'path' | 'circle'
  props: {
    points?: string
    x1?: number
    y1?: number
    x2?: number
    y2?: number
    fill?: string
    stroke?: string
    strokeWidth?: number
    d?: string
    cx?: string
    cy?: string
    r?: string
  }
}

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

export const snapToShape = (start: Point, end: Point, shapeType: ShapeType): Point => {
  if (shapeType === ShapeType.Rectangle) {
    const width = Math.abs(end.x - start.x)
    const height = Math.abs(end.y - start.y)
    const size = Math.max(width, height)

    return {
      x: start.x + (end.x > start.x ? size : -size),
      y: start.y + (end.y > start.y ? size : -size),
    }
  }
  return end
}

export const renderShape = (shape: ShapeObject): RenderableComponent | null => {
  const { startPoint, endPoint, shapeType, color } = shape

  switch (shapeType) {
    case ShapeType.Rectangle: {
      const left = Math.min(startPoint.x, endPoint.x)
      const top = Math.min(startPoint.y, endPoint.y)
      const width = Math.abs(endPoint.x - startPoint.x)
      const height = Math.abs(endPoint.y - startPoint.y)

      return {
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`,
            border: `2px solid ${color}`,
            backgroundColor: 'transparent',
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
        type: 'svg',
        props: {
          style: {
            position: 'absolute',
            left: `${centerX - radius}px`,
            top: `${centerY - radius}px`,
            width: `${radius * 2}px`,
            height: `${radius * 2}px`,
          },
          children: [
            {
              type: 'circle',
              props: {
                cx: `${radius}`,
                cy: `${radius}`,
                r: `${radius}`,
                fill: 'transparent',
                stroke: color,
                strokeWidth: 2,
              },
            },
          ],
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
        type: 'svg',
        props: {
          style: {
            position: 'absolute',
            left: `${Math.min(x1, x2, x3)}px`,
            top: `${Math.min(y1, y2, y3)}px`,
            width: `${Math.abs(Math.max(x1, x2, x3) - Math.min(x1, x2, x3))}px`,
            height: `${Math.abs(Math.max(y1, y2, y3) - Math.min(y1, y2, y3))}px`,
          },
          children: [
            {
              type: 'polygon',
              props: {
                points: `${x1 - Math.min(x1, x2, x3)},${y1 - Math.min(y1, y2, y3)} ${x2 - Math.min(x1, x2, x3)},${y2 - Math.min(y1, y2, y3)} ${x3 - Math.min(x1, x2, x3)},${y3 - Math.min(y1, y2, y3)}`,
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
        type: 'svg',
        props: {
          style: {
            position: 'absolute',
            left: `${Math.min(startPoint.x, endPoint.x)}px`,
            top: `${Math.min(startPoint.y, endPoint.y)}px`,
            width: `${Math.abs(endPoint.x - startPoint.x)}px`,
            height: `${Math.abs(endPoint.y - startPoint.y)}px`,
          },
          children: [
            {
              type: 'line',
              props: {
                x1: startPoint.x - Math.min(startPoint.x, endPoint.x),
                y1: startPoint.y - Math.min(startPoint.y, endPoint.y),
                x2: endPoint.x - Math.min(startPoint.x, endPoint.x),
                y2: endPoint.y - Math.min(startPoint.y, endPoint.y),
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

      const pathData = shape.points.reduce((path, point, index) => {
        if (index === 0) {
          return `M ${point.x} ${point.y}`
        }
        return `${path} L ${point.x} ${point.y}`
      }, '')

      return {
        type: 'svg',
        props: {
          style: {
            position: 'absolute',
            left: '0',
            top: '0',
            width: '100%',
            height: '100%',
          },
          children: [
            {
              type: 'path',
              props: {
                d: pathData,
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