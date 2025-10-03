<template>
  <div class="viewer-wrapper">
    <Renderer
      v-if="resolvedUrl"
      ref="rendererRef"
      :resize="true"
      :orbit-ctrl="{
        enableDamping: true,
        minDistance: orbitDistance.min,
        maxDistance: orbitDistance.max,
      }"
      class="glb-canvas"
      :alpha="true"
      :clear-color="0x000000"
      :clear-alpha="0"
    >
      <Scene>
        <Camera :position="{ x: 0, y: 1, z: 6 }" />
        <AmbientLight :intensity="0.7" />
        <DirectionalLight color="#ffffff" :intensity="1.2" :position="{ x: 5, y: 10, z: 7 }" />
        <GltfModel :src="resolvedUrl" :position="{ y: 0 }" @load="onModelLoad" />
      </Scene>
    </Renderer>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, onMounted } from 'vue'
import * as THREE from 'three'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import { Renderer, Camera, AmbientLight, DirectionalLight, GltfModel, Scene } from 'troisjs'
import axios from '@/plugins/axios'

const props = defineProps({
  modelUrl: { type: String, default: null },
  assetId: { type: [String, Number], default: null },
  extension: { type: String, default: 'glb' },
  showGrid: { type: Boolean, default: true },
  background: { type: String, default: '#371a76' },
  glow: { type: Boolean, default: false },
  sky: { type: Boolean, default: true },
  orbitDistance: {
    type: Object,
    default: () => ({
      min: 2,
      max: 10,
    }),
  },
})

const resolvedUrl = ref(null)
const blobUrl = ref(null)
const rendererRef = ref(null)
const modelRef = ref(null)
let gridHelper = null
let sky = null
let sun = new THREE.Vector3()

const addSkyToScene = () => {
  const scene = rendererRef.value?.scene
  const renderer = rendererRef.value?.renderer
  if (!scene || !renderer) return

  if (sky) {
    scene.remove(sky)
    sky.geometry.dispose()
    sky.material.dispose()
    sky = null
  }

  sky = new Sky()
  sky.scale.setScalar(10000)
  sky.name = 'skybox'

  const uniforms = sky.material.uniforms
  uniforms['turbidity'].value = 5
  uniforms['rayleigh'].value = 1.5
  uniforms['mieCoefficient'].value = 0.005
  uniforms['mieDirectionalG'].value = 0.8

  const phi = THREE.MathUtils.degToRad(90 - 45)
  const theta = THREE.MathUtils.degToRad(180)
  sun.setFromSphericalCoords(1, phi, theta)
  uniforms['sunPosition'].value.copy(sun)

  scene.children = [sky, ...scene.children.filter((obj) => obj !== sky)]

  sky.material.depthWrite = false
  sky.material.side = THREE.BackSide
  sky.material.transparent = true
  sky.material.opacity = 0.7

  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  renderer.outputEncoding = THREE.sRGBEncoding

  let sunLight = scene.getObjectByName('sunLight')
  if (!sunLight) {
    sunLight = new THREE.DirectionalLight(0xffffff, 1.3)
    sunLight.name = 'sunLight'
    scene.add(sunLight)
  }
  sunLight.position.copy(sun).multiplyScalar(1000)
  sunLight.castShadow = true

  const camera = scene.children.find((c) => c.isCamera)
  if (camera) {
    camera.far = 50000
    camera.updateProjectionMatrix()
  }
}

let glowMesh = null

const generateGlowTexture = () => {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size

  const context = canvas.getContext('2d')
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  // gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)')
  // gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.15)')
  // gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  return texture
}

const createGlowSprite = (model) => {
  const bbox = new THREE.Box3().setFromObject(model)
  const size = bbox.getSize(new THREE.Vector3())
  const center = bbox.getCenter(new THREE.Vector3())

  const spriteMaterial = new THREE.SpriteMaterial({
    map: generateGlowTexture(),
    color: 0xffffff,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  const sprite = new THREE.Sprite(spriteMaterial)
  sprite.scale.set(size.x * 2.5, size.y * 2.5, 1)
  sprite.position.copy(center)
  sprite.position.z += 0.01
  sprite.name = 'glowSprite'
  return sprite
}

const addHelpersBelowModel = () => {
  const scene = rendererRef.value?.scene
  const model = modelRef.value
  if (!scene || !model || !props.showGrid) return

  model.updateMatrixWorld(true)

  const bbox = new THREE.Box3().setFromObject(model)
  if (bbox.isEmpty()) return

  const minY = bbox.min.y

  if (gridHelper) {
    scene.remove(gridHelper)
    gridHelper.geometry.dispose()
    gridHelper.material.dispose()
    gridHelper = null
  }

  const gridSize = 30
  const divisions = 30

  gridHelper = new THREE.GridHelper(gridSize, divisions, 0xffffff, 0xffffff)

  gridHelper.material.opacity = 0.3
  gridHelper.material.transparent = true
  gridHelper.position.y = minY - 0.01
  gridHelper.material.depthWrite = false
  gridHelper.renderOrder = -1
  scene.add(gridHelper)
}

const onModelLoad = (object) => {
  if (object?.scene?.isObject3D) {
    modelRef.value = object.scene

    if (props.glow) {
      const scene = rendererRef.value?.scene
      if (scene) {
        const glow = createGlowSprite(modelRef.value)
        if (glow) {
          glowMesh = glow
          scene.add(glowMesh)
        }
      }
    }

    addHelpersBelowModel()
  } else {
    console.warn('Loaded object does not contain scene or is not Object3D:', object)
  }
}

watch(
  () => [props.modelUrl, props.assetId, props.extension],
  async ([modelUrl, assetId, extension]) => {
    if (blobUrl.value) {
      URL.revokeObjectURL(blobUrl.value)
      blobUrl.value = null
    }

    resolvedUrl.value = null

    if (modelUrl) {
      resolvedUrl.value = modelUrl
      return
    }

    if (assetId && extension) {
      try {
        const response = await axios.get(`/generated-assets/${assetId}/model.${extension}`, {
          responseType: 'blob',
        })
        const blob = response.data
        blobUrl.value = URL.createObjectURL(blob)
        resolvedUrl.value = blobUrl.value
      } catch (error) {
        console.error('Error loading model:', error)
      }
    }
  },
  { immediate: true },
)

onMounted(() => {
  setTimeout(() => {
    if (props.sky) {
      addSkyToScene()
    }
  }, 0)
})

onBeforeUnmount(() => {
  if (blobUrl.value) {
    URL.revokeObjectURL(blobUrl.value)
  }

  if (glowMesh && rendererRef.value?.scene) {
    rendererRef.value.scene.remove(glowMesh)
    glowMesh.geometry.dispose()
    glowMesh.material.dispose()
    glowMesh = null
  }

  const scene = rendererRef.value?.scene
  if (gridHelper && scene) {
    scene.remove(gridHelper)
    gridHelper.geometry.dispose()
    gridHelper.material.dispose()
    gridHelper = null
  }

  if (sky && scene) {
    scene.remove(sky)
    sky.geometry.dispose()
    sky.material.dispose()
    sky = null
  }
})
</script>

<style scoped>
.viewer-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  /* убрали background */
}

.glb-canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: block;
}

:deep(canvas) {
  width: 100% !important;
  height: 100% !important;
  display: block;
  background: transparent !important;
}
</style>
