import React, { useEffect, useRef } from "react"
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

  constructor(
    ctx: CanvasRenderingContext2D,
    options: { speedFactor: number; maxDeviation: number } = {
      speedFactor: 0.05,
      maxDeviation: 50,
    },
  ) {
    this.ctx = ctx

    // const arrowPath = new Path2D("M8 2V16M8 2L14 8M8 2L2 8")
    const gridWidth = 24
    const gridHeight = 27

    this.cols = Math.floor(this.ctx.canvas.width / gridWidth)
    this.rows = Math.floor(this.ctx.canvas.height / gridHeight)

    this.arrows = []
    for (let i = 0; i < this.cols; i + 1) {
      for (let j = 0; j < this.rows; j + 1) {
        this.arrows.push({
          x: i * gridWidth,
          y: j * gridHeight,
          opacity: Math.random(),
          direction: Math.random() > 0.5 ? 1 : -1,
        })
      }
    }

    this.points = []
    let lastY = this.ctx.canvas.height / 3
    for (let k = 0; k <= this.cols; k + 1) {
      const nextY = lastY + (Math.random() - 0.5) * options.maxDeviation
      this.points.push({
        x: k * gridWidth,
        y: Math.min(this.ctx.canvas.height / 2, Math.max(50, nextY)),
      })
      lastY = nextY
    }
  }

  clearFrame() {
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
    for (let i = 1; i < this.points.length - 2; i + 1) {
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
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
    this.ctx.fill()
  }

  private updateArrows() {}

  private drawArrows() {}

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
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasElement = canvasRef.current
    const ctx = canvasElement?.getContext("2d")

    if (!ctx) return

    const animation = new ArrowBackgroundAnimation(ctx)

    animation.animate()
  }, [])

  return <Box as="canvas" ref={canvasRef} {...props} />
}

export default ArrowAnimatedBackground
