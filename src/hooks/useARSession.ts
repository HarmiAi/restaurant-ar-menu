import { useCallback, useEffect, useMemo, useState } from 'react'
import { createXRStore, type XRStore } from '@react-three/xr'
import { openNativeARFallback } from '../utils/modelPlacement'
import type { FoodItem } from '../types'

export type ARSupportState = 'checking' | 'supported' | 'unsupported'

export function createRestaurantXRStore() {
  return createXRStore({
    hand: false,
    controller: false,
    transientPointer: false,
    gaze: false,
    screenInput: true,
    hitTest: 'required',
    anchors: true,
    planeDetection: true,
    meshDetection: true,
    domOverlay: true,
    foveation: 1,
    frameBufferScaling: 'low',
    frameRate: 'high',
  })
}

interface UseARSessionOptions {
  item: FoodItem
  store?: XRStore
}

export function useARSession({ item, store }: UseARSessionOptions) {
  const xrStore = useMemo(() => store ?? createRestaurantXRStore(), [store])
  const [supportState, setSupportState] = useState<ARSupportState>('checking')
  const [isPresenting, setIsPresenting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function checkSupport() {
      if (!('xr' in navigator)) {
        if (!cancelled) setSupportState('unsupported')
        return
      }

      try {
        const supported = await navigator.xr?.isSessionSupported('immersive-ar')
        if (!cancelled) setSupportState(supported ? 'supported' : 'unsupported')
      } catch {
        if (!cancelled) setSupportState('unsupported')
      }
    }

    checkSupport()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return xrStore.subscribe((state) => {
      setIsPresenting(state.session !== undefined)
    })
  }, [xrStore])

  useEffect(() => {
    return () => {
      const session = xrStore.getState().session
      if (session) void session.end().catch(() => undefined)
    }
  }, [xrStore])

  const startAR = useCallback(async () => {
    setError('')

    if (supportState === 'unsupported') {
      if (!openNativeARFallback(item)) {
        setError('AR is not supported on this browser. Open this dish on Android Chrome, or add a GLB/USDZ model for native AR fallback.')
      }
      return
    }

    try {
      await xrStore.enterAR()
    } catch {
      if (!openNativeARFallback(item)) {
        setSupportState('unsupported')
        setError('Could not start AR. Use Android Chrome on a WebXR-capable device over HTTPS.')
      }
    }
  }, [item, supportState, xrStore])

  const endAR = useCallback(async () => {
    const session = xrStore.getState().session
    if (session) await session.end()
  }, [xrStore])

  return {
    error,
    endAR,
    isPresenting,
    startAR,
    supportState,
    xrStore,
  }
}
