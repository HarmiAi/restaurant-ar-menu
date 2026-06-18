import {
  Box3,
  Matrix4,
  Quaternion,
  Vector3,
  type Group,
  type Object3D,
} from 'three'
import type { FoodItem } from '../types'

export const FOOD_MODEL_SCALE = {
  min: 0.65,
  default: 1,
  max: 1.35,
}

const realisticDiameterByType: Record<FoodItem['modelType'], number> = {
  pizza: 0.28,
  burger: 0.18,
  pasta: 0.24,
  sandwich: 0.2,
  biryani: 0.23,
  dessert: 0.16,
  drinks: 0.09,
}

export interface PlacementPose {
  matrix: Matrix4
  position: Vector3
  quaternion: Quaternion
}

export function createPlacementPose(matrix: Matrix4): PlacementPose {
  return {
    matrix: matrix.clone(),
    position: new Vector3().setFromMatrixPosition(matrix),
    quaternion: new Quaternion().setFromRotationMatrix(matrix),
  }
}

export function applyPlacementPose(target: Object3D, pose: PlacementPose) {
  target.position.copy(pose.position)
  target.quaternion.copy(pose.quaternion)
}

export function clampFoodScale(scale: number) {
  return Math.min(FOOD_MODEL_SCALE.max, Math.max(FOOD_MODEL_SCALE.min, scale))
}

export function getRealisticPlateDiameter(item: FoodItem) {
  if (item.width && item.width > 0) {
    const factor = item.unit === 'in' ? 0.0254 : 0.01
    return item.width * factor
  }
  return realisticDiameterByType[item.modelType] ?? 0.22
}

export function normalizeFoodModelScale(model: Group, item: FoodItem) {
  const box = new Box3().setFromObject(model)
  const size = new Vector3()
  box.getSize(size)

  const footprint = Math.max(size.x, size.z)
  if (!Number.isFinite(footprint) || footprint <= 0) return null

  const targetDiameter = getRealisticPlateDiameter(item)
  const scale = targetDiameter / footprint
  model.scale.setScalar(scale)
  return scale
}

export function buildSceneViewerUrl(modelUrl: string, title: string) {
  const params = new URLSearchParams({
    file: modelUrl,
    mode: 'ar_preferred',
    title,
    resizable: 'true',
  })
  const fallback = encodeURIComponent(window.location.href)

  return `intent://arvr.google.com/scene-viewer/1.0?${params.toString()}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${fallback};end;`
}

export function openQuickLook(modelUrl: string) {
  const link = document.createElement('a')
  link.href = modelUrl
  link.rel = 'ar'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export function openNativeARFallback(item: FoodItem) {
  if (!item.modelUrl) return false

  const userAgent = navigator.userAgent.toLowerCase()
  const isAndroid = userAgent.includes('android')
  const isIOS = /iphone|ipad|ipod/.test(userAgent)
  const modelUrl = new URL(item.modelUrl, window.location.href).href

  if (isAndroid) {
    window.location.href = buildSceneViewerUrl(modelUrl, item.name)
    return true
  }

  if (isIOS && /\.(usdz|reality)(\?|#|$)/i.test(modelUrl)) {
    openQuickLook(modelUrl)
    return true
  }

  return false
}
