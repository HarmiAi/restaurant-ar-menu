import { Suspense, useCallback, useRef, useState, type TouchEvent } from 'react'
import { Canvas } from '@react-three/fiber'
import { XR } from '@react-three/xr'
import { Maximize2, Move3D, RotateCcw, Smartphone } from 'lucide-react'
import { useARSession } from '../../hooks/useARSession'
import ARScene from './ARScene'
import ARErrorBoundary from './ARErrorBoundary'
import type { FoodItem } from '../../types'

interface ARViewerProps {
  item: FoodItem
  onPlaced?: () => void
}

interface GestureState {
  lastX: number
  lastDistance: number
}

function Loader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 rounded-full border-2 border-[var(--color-gold)]/30 border-t-[var(--color-gold)] animate-spin" />
      <p className="text-xs text-white/40">Loading 3D model...</p>
    </div>
  )
}

function touchDistance(touches: TouchEvent<HTMLDivElement>['touches']) {
  if (touches.length < 2) return 0
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.hypot(dx, dy)
}

function emitAREvent(name: string, detail?: unknown) {
  window.dispatchEvent(new CustomEvent(name, { detail }))
}

export default function ARViewer({ item, onPlaced }: ARViewerProps) {
  const [placed, setPlaced] = useState(false)
  const [hasSurface, setHasSurface] = useState(false)
  const gestureRef = useRef<GestureState | null>(null)
  const { error, isPresenting, startAR, supportState, xrStore } = useARSession({ item })

  const handlePlaced = useCallback(() => {
    setPlaced(true)
    onPlaced?.()
  }, [onPlaced])

  const handlePlacementStateChange = useCallback((isPlaced: boolean) => {
    setPlaced(isPlaced)
  }, [])

  const handleTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    if (!isPresenting || !placed) return

    if (event.touches.length === 1) {
      gestureRef.current = {
        lastX: event.touches[0].clientX,
        lastDistance: 0,
      }
    }

    if (event.touches.length >= 2) {
      gestureRef.current = {
        lastX: event.touches[0].clientX,
        lastDistance: touchDistance(event.touches),
      }
    }
  }, [isPresenting, placed])

  const handleTouchMove = useCallback((event: TouchEvent<HTMLDivElement>) => {
    if (!isPresenting || !placed || !gestureRef.current) return
    event.preventDefault()

    if (event.touches.length === 1) {
      const x = event.touches[0].clientX
      const rotateDelta = (x - gestureRef.current.lastX) * 0.012
      gestureRef.current.lastX = x
      emitAREvent('ar-transform-model', { rotateDelta })
      return
    }

    if (event.touches.length >= 2) {
      const distance = touchDistance(event.touches)
      if (gestureRef.current.lastDistance > 0) {
        const scaleMultiplier = distance / gestureRef.current.lastDistance
        emitAREvent('ar-transform-model', { scaleMultiplier })
      }
      gestureRef.current.lastDistance = distance
    }
  }, [isPresenting, placed])

  const handleTouchEnd = useCallback(() => {
    gestureRef.current = null
  }, [])

  const placeDish = useCallback(() => {
    emitAREvent('ar-place')
  }, [])

  const repositionDish = useCallback(() => {
    emitAREvent('ar-reset-placement')
  }, [])

  return (
    <div
      className="relative h-full min-h-[55dvh] w-full overflow-hidden bg-[#0a0a0f]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <ARErrorBoundary>
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [0, 0.4, 0.9], fov: 45, near: 0.01, far: 25 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          }}
          style={{ width: '100%', height: '100%', touchAction: 'none' }}
        >
          <XR store={xrStore}>
            <Suspense fallback={null}>
              <ARScene
                item={item}
                onPlaced={handlePlaced}
                onPlacementStateChange={handlePlacementStateChange}
                onSurfaceStateChange={setHasSurface}
              />
            </Suspense>
          </XR>
        </Canvas>
      </ARErrorBoundary>

      {!isPresenting && (
        <div className="absolute left-3 right-3 top-3 flex items-center gap-2 rounded-lg border border-white/10 bg-black/50 px-3 py-2 backdrop-blur-sm pointer-events-none">
          <RotateCcw size={14} className="shrink-0 text-[var(--color-gold)]" />
          <p className="text-xs text-white/60">3D Preview - drag to rotate, pinch to zoom</p>
        </div>
      )}

      {isPresenting && (
        <div className="pointer-events-none absolute left-4 right-4 top-4 z-10 rounded-lg border border-white/10 bg-black/45 px-4 py-3 text-center backdrop-blur-md">
          <p className="text-sm font-semibold text-white">
            {placed ? 'Drag to rotate. Pinch to resize.' : 'Move your phone slowly to detect a table surface.'}
          </p>
          {!placed && (
            <p className="mt-1 text-xs text-[var(--color-gold)]">
              {hasSurface ? 'Tap to place the dish.' : 'Looking for a flat table surface...'}
            </p>
          )}
        </div>
      )}

      <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-10 flex flex-col gap-2">
        {isPresenting && !placed && (
          <button
            onClick={placeDish}
            disabled={!hasSurface}
            className="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-gold-dark)] to-[var(--color-gold)] py-4 text-base font-bold text-black shadow-xl transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Move3D size={18} />
            Tap to Place Dish
          </button>
        )}

        {isPresenting && placed && (
          <button
            onClick={repositionDish}
            className="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/45 py-3 text-sm font-semibold text-white/80 backdrop-blur-md transition-colors hover:bg-black/60"
          >
            <Maximize2 size={16} />
            Reposition Dish
          </button>
        )}

        {!isPresenting && supportState !== 'unsupported' && (
          <button
            onClick={() => void startAR()}
            disabled={supportState === 'checking'}
            className="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-gold-dark)] to-[var(--color-gold)] py-4 text-base font-bold text-black shadow-xl transition-transform active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
          >
            <Smartphone size={18} />
            {supportState === 'checking' ? 'Checking AR Support...' : 'View in AR'}
          </button>
        )}

        {!isPresenting && supportState === 'unsupported' && (
          <button
            onClick={() => void startAR()}
            className="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-gold)]/25 bg-[var(--color-gold)]/10 py-3 text-sm font-semibold text-[var(--color-gold-light)]"
          >
            <Smartphone size={16} />
            Open Native AR
          </button>
        )}

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-center text-xs text-red-300">
            {error}
          </p>
        )}
      </div>

      <Suspense fallback={<Loader />}>
        <span className="hidden" />
      </Suspense>
    </div>
  )
}
