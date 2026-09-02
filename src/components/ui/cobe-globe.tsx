"use client"

import React, { useEffect, useRef, useCallback } from "react"
import createGlobe from "cobe"

export interface Marker {
  id: string
  location: [number, number]
  label: string
  size?: number
}

export interface Arc {
  id: string
  from: [number, number]
  to: [number, number]
  label?: string
}

export interface GlobeProps {
  markers?: Marker[]
  arcs?: Arc[]
  className?: string
  markerColor?: [number, number, number]
  baseColor?: [number, number, number]
  arcColor?: [number, number, number]
  glowColor?: [number, number, number]
  dark?: number
  mapBrightness?: number
  markerSize?: number
  markerElevation?: number
  arcWidth?: number
  arcHeight?: number
  speed?: number
  theta?: number
  diffuse?: number
  mapSamples?: number
  focusLocation?: [number, number] | null
}

export function Globe({
  markers = [],
  arcs = [],
  className = "",
  markerColor = [0.3, 0.45, 0.85],
  baseColor = [1, 1, 1],
  arcColor = [0.3, 0.45, 0.85],
  glowColor = [0.94, 0.93, 0.91],
  dark = 0,
  mapBrightness = 10,
  markerSize = 0.025,
  markerElevation = 0.01,
  arcWidth = 0.5,
  arcHeight = 0.25,
  speed = 0.003,
  theta = 0.2,
  diffuse = 1.5,
  mapSamples = 16000,
  focusLocation = null,
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const lastPointer = useRef<{ x: number; y: number; t: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const velocity = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  // Keep references updated without triggering full WebGL teardown/rebuild
  const markersRef = useRef(markers)
  const arcsRef = useRef(arcs)
  const focusLocationRef = useRef<[number, number] | null>(focusLocation)
  const propsRef = useRef({
    markerColor,
    baseColor,
    arcColor,
    glowColor,
    dark,
    mapBrightness,
    markerSize,
    markerElevation,
    speed,
    theta,
  })

  useEffect(() => {
    markersRef.current = markers
  }, [markers])

  useEffect(() => {
    arcsRef.current = arcs
  }, [arcs])

  useEffect(() => {
    focusLocationRef.current = focusLocation
  }, [focusLocation])

  useEffect(() => {
    propsRef.current = {
      markerColor,
      baseColor,
      arcColor,
      glowColor,
      dark,
      mapBrightness,
      markerSize,
      markerElevation,
      speed,
      theta,
    }
  }, [markerColor, baseColor, arcColor, glowColor, dark, mapBrightness, markerSize, markerElevation, speed, theta])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (pointerInteracting.current !== null) {
      const deltaX = e.clientX - pointerInteracting.current.x
      const deltaY = e.clientY - pointerInteracting.current.y
      dragOffset.current = { phi: deltaX / 280, theta: deltaY / 900 }
      const now = Date.now()
      if (lastPointer.current) {
        const dt = Math.max(now - lastPointer.current.t, 1)
        const maxVelocity = 0.12
        velocity.current = {
          phi: Math.max(-maxVelocity, Math.min(maxVelocity, ((e.clientX - lastPointer.current.x) / dt) * 0.25)),
          theta: Math.max(-maxVelocity, Math.min(maxVelocity, ((e.clientY - lastPointer.current.y) / dt) * 0.08)),
        }
      }
      lastPointer.current = { x: e.clientX, y: e.clientY, t: now }
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
      lastPointer.current = null
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerMove, handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width,
        height: width,
        phi: 0,
        theta,
        dark,
        diffuse,
        mapSamples,
        mapBrightness,
        baseColor,
        markerColor,
        glowColor,
        markerElevation,
        markers: markersRef.current.map((m) => ({
          location: m.location,
          size: m.size ?? markerSize,
          id: m.id,
        })),
        arcs: arcsRef.current.map((a) => ({
          from: a.from,
          to: a.to,
          id: a.id,
        })),
        arcColor,
        arcWidth,
        arcHeight,
        opacity: 0.85,
      })

      function animate() {
        if (!isPausedRef.current) {
          if (focusLocationRef.current) {
            const targetLat = focusLocationRef.current[0]
            const targetLng = focusLocationRef.current[1]
            const targetPhi = -((targetLng * Math.PI) / 180)
            const targetTheta = Math.max(-0.35, Math.min(0.35, ((targetLat * Math.PI) / 180) * 0.35))

            let diffPhi = (targetPhi - (phi + phiOffsetRef.current)) % (2 * Math.PI)
            if (diffPhi > Math.PI) diffPhi -= 2 * Math.PI
            if (diffPhi < -Math.PI) diffPhi += 2 * Math.PI
            phiOffsetRef.current += diffPhi * 0.08

            let diffTheta = targetTheta - (propsRef.current.theta + thetaOffsetRef.current)
            thetaOffsetRef.current += diffTheta * 0.08
          } else {
            phi += propsRef.current.speed
          }

          if (
            Math.abs(velocity.current.phi) > 0.0001 ||
            Math.abs(velocity.current.theta) > 0.0001
          ) {
            phiOffsetRef.current += velocity.current.phi
            thetaOffsetRef.current += velocity.current.theta
            velocity.current.phi *= 0.94
            velocity.current.theta *= 0.94
          }
          const thetaMin = -0.4,
            thetaMax = 0.4
          if (thetaOffsetRef.current < thetaMin) {
            thetaOffsetRef.current += (thetaMin - thetaOffsetRef.current) * 0.1
          } else if (thetaOffsetRef.current > thetaMax) {
            thetaOffsetRef.current += (thetaMax - thetaOffsetRef.current) * 0.1
          }
        }

        if (globe) {
          const currentProps = propsRef.current
          globe.update({
            phi: phi + phiOffsetRef.current + dragOffset.current.phi,
            theta: currentProps.theta + thetaOffsetRef.current + dragOffset.current.theta,
            dark: currentProps.dark,
            mapBrightness: currentProps.mapBrightness,
            markerColor: currentProps.markerColor,
            baseColor: currentProps.baseColor,
            arcColor: currentProps.arcColor,
            markerElevation: currentProps.markerElevation,
            markers: markersRef.current.map((m) => ({
              location: m.location,
              size: m.size ?? currentProps.markerSize,
              id: m.id,
            })),
            arcs: arcsRef.current.map((a) => ({
              from: a.from,
              to: a.to,
              id: a.id,
            })),
          })
        }
        animationId = requestAnimationFrame(animate)
      }
      animate()
      setTimeout(() => canvas && (canvas.style.opacity = "1"), 50)
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [diffuse, mapSamples, arcWidth, arcHeight]) // Only re-init if structural WebGL parameters change

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />
      {markers.map((m) => (
        <div
          key={m.id}
          style={{
            position: "absolute",
            positionAnchor: `--cobe-${m.id}`,
            bottom: "anchor(top)",
            left: "anchor(center)",
            translate: "-50% 0",
            marginBottom: 8,
            padding: "2px 6px",
            background: "#18181B",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "4px",
            color: "#fff",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.6rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
            transition: "opacity 0.8s, filter 0.8s",
          } as React.CSSProperties}
        >
          {m.label}
          <span
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translate3d(-50%, -1px, 0)",
              border: "4px solid transparent",
              borderTopColor: "#18181B",
            }}
          />
        </div>
      ))}
      {arcs
        .filter((a) => a.label)
        .map((a) => (
          <div
            key={a.id}
            style={{
              position: "absolute",
              positionAnchor: `--cobe-arc-${a.id}`,
              bottom: "anchor(top)",
              left: "anchor(center)",
              translate: "-50% 0",
              marginBottom: 8,
              padding: "2px 6px",
              background: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: "4px",
              color: "#18181B",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.6rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              opacity: `var(--cobe-visible-arc-${a.id}, 0)`,
              filter: `blur(calc((1 - var(--cobe-visible-arc-${a.id}, 0)) * 8px))`,
              transition: "opacity 0.8s, filter 0.8s",
            } as React.CSSProperties}
          >
            {a.label}
            <span
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translate3d(-50%, -1px, 0)",
                border: "4px solid transparent",
                borderTopColor: "#fff",
              }}
            />
          </div>
        ))}
    </div>
  )
}

export default Globe
