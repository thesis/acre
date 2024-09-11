import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { BoxProps, Box } from "@chakra-ui/react"

type Point = {
  x: number
  y: number
}
type Arrow = Point & {
  opacity: number
  direction: number
}

class ArrowBackgroundAnimation {
  readonly ctx: CanvasRenderingContext2D

  readonly arrows: Arrow[]

  readonly points: Point[]

  readonly cols: number

  readonly rows: number

  readonly options: {
    speedFactor: number
    maxDeviation: number
    arrowColor: string
    arrowOrientation: "up" | "down"
  }

  readonly gridWidth = 24

  readonly gridHeight = 27

  readonly arrowPath = new Path2D("M8 2V16M8 2L14 8M8 2L2 8")

  constructor(
    ctx: CanvasRenderingContext2D,
    options = {
      speedFactor: 0.05,
      maxDeviation: 50,
      arrowColor: "#318401",
      arrowOrientation: "up" as const,
    },
  ) {
    this.ctx = ctx
    this.options = options

    this.cols = Math.floor(this.ctx.canvas.width / this.gridWidth)
    this.rows = Math.floor(this.ctx.canvas.height / this.gridHeight)

    console.log({
      w: this.ctx.canvas.width,
      h: this.ctx.canvas.height,
      cols: this.cols,
      rows: this.rows,
    })

    this.arrows = []
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        this.arrows.push({
          x: i * this.gridWidth,
          y: j * this.gridHeight,
          opacity: Math.random(),
          direction: Math.random() > 0.5 ? 1 : -1,
        })
      }
    }

    this.points = []
    let lastY = this.ctx.canvas.height / 3
    for (let k = 0; k <= this.cols; k++) {
      const nextY = lastY + (Math.random() - 0.5) * this.options.maxDeviation
      this.points.push({
        x: k * this.gridWidth,
        y: Math.min(this.ctx.canvas.height / 2, Math.max(50, nextY)),
      })
      lastY = nextY
    }
  }

  private clearFrame() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
  }

  private updateCurve() {
    this.points.forEach((point) => {
      point.y += (Math.random() - 0.5) * 2
    })
  }

  private drawCurve() {
    this.ctx.beginPath()
    this.ctx.moveTo(this.points[0].x, this.points[0].y)
    for (let i = 1; i < this.points.length - 2; i++) {
      const xc = (this.points[i].x + this.points[i + 1].x) / 2
      const yc = (this.points[i].y + this.points[i + 1].y) / 2
      this.ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc)
    }
    this.ctx.quadraticCurveTo(
      this.points[this.points.length - 2].x,
      this.points[this.points.length - 2].y,
      this.points[this.points.length - 1].x,
      this.points[this.points.length - 1].y,
    )
    this.ctx.lineTo(this.ctx.canvas.width, this.ctx.canvas.height)
    this.ctx.lineTo(0, this.ctx.canvas.height)
    this.ctx.closePath()
  }

  private updateArrows() {
    this.arrows.forEach((arrow) => {
      arrow.opacity += arrow.direction * this.options.speedFactor

      if (arrow.opacity <= 0) {
        arrow.opacity = 0
        arrow.direction = 1
      } else if (arrow.opacity >= 1) {
        arrow.opacity = 1
        arrow.direction = -1
      }
    })
  }

  private isBelowCurve(x, y) {
    for (let i = 0; i < this.points.length - 1; i++) {
      if (x >= this.points[i].x && x <= this.points[i + 1].x) {
        const t =
          (x - this.points[i].x) / (this.points[i + 1].x - this.points[i].x)
        const curveY = (1 - t) * this.points[i].y + t * this.points[i + 1].y
        return y > curveY
      }
    }
    return false
  }

  private getArrowRotationAngle() {
    const angleMap: Record<"up" | "down", number> = {
      up: 0,
      down: 180,
    }
    const angle = angleMap[this.options.arrowOrientation]
    return (angle * Math.PI) / 180
  }

  private drawArrows() {
    this.arrows.forEach((arrow) => {
      if (
        this.isBelowCurve(
          arrow.x + this.gridWidth / 2,
          arrow.y + this.gridHeight / 2,
        )
      ) {
        this.ctx.save()
        this.ctx.globalAlpha = arrow.opacity
        this.ctx.translate(
          arrow.x + this.gridWidth / 2,
          arrow.y + this.gridHeight / 2,
        )
        this.ctx.strokeStyle = this.options.arrowColor
        this.ctx.lineWidth = 3
        this.ctx.lineCap = "round"
        this.ctx.lineJoin = "round"
        this.ctx.rotate(this.getArrowRotationAngle())
        this.ctx.stroke(this.arrowPath)
        this.ctx.restore()
      }
    })
  }

  animate() {
    this.clearFrame()
    this.updateCurve()
    this.drawCurve()
    this.updateArrows()
    this.drawArrows()
    requestAnimationFrame(this.animate.bind(this))
  }
}

type ArrowAnimatedBackgroundProps = BoxProps

function ArrowAnimatedBackground(props: ArrowAnimatedBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [canvasWidth, setCanvasWidth] = useState(0)
  const [canvasHeight, setCanvasHeight] = useState(0)

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d")
    const scale = window.devicePixelRatio
    if (ctx) ctx.scale(scale, scale)

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect

      const displayWidth = width * scale
      const displayHeight = height * scale

      setCanvasWidth(displayWidth)
      setCanvasHeight(displayHeight)
    })

    resizeObserver.observe(containerRef.current!)

    return () => resizeObserver.disconnect()
  }, [])

  useLayoutEffect(() => {
    const canvasElement = canvasRef.current
    const ctx = canvasElement?.getContext("2d")

    if (!ctx) return

    const animation = new ArrowBackgroundAnimation(ctx)

    animation.animate()
  }, [])

  return (
    <Box
      ref={containerRef}
      position="fixed"
      bottom={0}
      left={0}
      boxSize="full"
      {...props}
    >
      <canvas width={canvasWidth} height={canvasHeight} ref={canvasRef} />
    </Box>
  )
}

export default ArrowAnimatedBackground
