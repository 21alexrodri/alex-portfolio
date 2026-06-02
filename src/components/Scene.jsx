import gsap from 'gsap'
import * as THREE from 'three'
import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'

const GLOW_COLOR = new THREE.Color(0x00ff44)

const VASE_MAT_NAMES = new Set([
  'Mat_Jarron', 'Mat_Gold', 'MSepal', 'Stem', 'Leaf',
  'MRed', 'MPink', 'MWhite', 'MBud',
])

const MONITOR_MAT_NAMES = new Set(['Material.012', 'Material.013', 'Material.014'])

function shouldGlow(matName) {
  return matName?.startsWith('Mat_Libro') ||
         MONITOR_MAT_NAMES.has(matName) ||
         VASE_MAT_NAMES.has(matName)
}

const VIEWS = {
  default: {
    position: { x: -10, y: 7,  z: 10 },
    target:   { x: 0,   y: 0,  z: 0  },
  },
  books: {
    position: { x: -4,  y: 2,  z: 5  },
    target:   { x: 1.5, y: 0.5, z: -1 },
  },
  // Ajusta estas coordenadas para afinar el encuadre del monitor
  monitor: {
    position: { x: -2,  y: 2,  z: 4  },
    target:   { x: -1,  y: 0.8, z: 0  },
  },
  // Ajusta para apuntar al jarrón
  vase: {
    position: { x: -3,  y: 2,  z: 5  },
    target:   { x: -1,  y: 0.5, z: 0  },
  },
}

function isBookMesh(obj) {
  if (obj.name === 'Cube018' || obj.name === 'Cube018_1') return true
  if (obj.name.startsWith('Cube131')) return true
  const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
  return mats.some(m => m?.name?.startsWith('Mat_Libro') || m?.name === 'Mat_Paginas')
}

function isMonitorMesh(obj) {
  if (obj.name.startsWith('Cube023')) return true
  const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
  return mats.some(m => MONITOR_MAT_NAMES.has(m?.name) || m?.name?.startsWith('PC_'))
}

function isVaseMesh(obj) {
  if (obj.name === 'Torus' || obj.name === 'Torus_1') return true
  if (obj.name.startsWith('bsep_Bud')) return true
  const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
  return mats.some(m => VASE_MAT_NAMES.has(m?.name))
}

function Room({ onBooksClick, onMonitorClick, onVaseClick }) {
  const { scene } = useGLTF('/room.glb')
  const bookMatsRef = useRef([])

  useEffect(() => {
    const found = new Set()
    scene.traverse((obj) => {
      if (!obj.isMesh) return
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      mats.forEach((m) => {
        if (shouldGlow(m?.name) && !found.has(m)) {
          m.emissive = GLOW_COLOR.clone()
          m.emissiveIntensity = 0
          found.add(m)
        }
      })
    })
    bookMatsRef.current = [...found]
  }, [scene])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const intensity = 0.5 + 0.5 * Math.sin(t * 2)
    bookMatsRef.current.forEach((m) => {
      m.emissiveIntensity = intensity
    })
  })

  function handleClick(e) {
    if (isBookMesh(e.object)) {
      e.stopPropagation()
      onBooksClick()
    } else if (isMonitorMesh(e.object)) {
      e.stopPropagation()
      onMonitorClick()
    } else if (isVaseMesh(e.object)) {
      e.stopPropagation()
      onVaseClick()
    }
  }

  function handlePointerOver(e) {
    if (isBookMesh(e.object) || isMonitorMesh(e.object) || isVaseMesh(e.object)) {
      e.stopPropagation()
      document.body.style.cursor = 'pointer'
    }
  }

  function handlePointerOut() {
    document.body.style.cursor = 'auto'
  }

  return (
    <primitive
      object={scene}
      rotation={[0, Math.PI, 0]}
      scale={0.5}
      position={[0, -1, 0]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  )
}

function CameraFOV({ controlsRef }) {
  const { camera, size } = useThree()
  useEffect(() => {
    const isMobile = size.width < 600
    camera.fov = isMobile ? 52 : 25
    camera.updateProjectionMatrix()
    if (isMobile) {
      camera.position.set(-9, 7, 10)
      controlsRef.current?.update()
    }
  }, [size.width])
  return null
}

function CameraController({ activePanel, controlsRef }) {
  const { camera } = useThree()
  const mounted = useRef(false)

  useEffect(() => {
    if (activePanel) document.body.style.cursor = 'auto'
  }, [activePanel])

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }

    const controls = controlsRef.current
    if (!controls) return

    const view = activePanel ? VIEWS[activePanel] ?? VIEWS.default : VIEWS.default
    controls.enabled = false

    const tl = gsap.timeline({
      onComplete: () => { if (!activePanel) controls.enabled = true },
    })

    tl.to(camera.position, {
      ...view.position,
      duration: 1.5,
      ease: 'power2.inOut',
    }, 0)

    tl.to(controls.target, {
      ...view.target,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => controls.update(),
    }, 0)

    return () => tl.kill()
  }, [activePanel, camera])

  return null
}

export default function Scene({ activePanel, onObjectClick }) {
  const controlsRef = useRef()

  return (
    <Canvas
      style={{ width: '100vw', height: '100vh' }}
      camera={{ position: [-10, 7, 10], fov: 25 }}
      shadows
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />

      <Suspense fallback={null}>
        <Room
          onBooksClick={() => onObjectClick('books')}
          onMonitorClick={() => onObjectClick('monitor')}
          onVaseClick={() => onObjectClick('vase')}
        />
        <Environment preset="apartment" />
      </Suspense>

      <CameraController activePanel={activePanel} controlsRef={controlsRef} />
      <CameraFOV controlsRef={controlsRef} />

      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        minAzimuthAngle={-Math.PI / 4 - 0.25}
        maxAzimuthAngle={-Math.PI / 4 + 0.25}
        minPolarAngle={0.91}
        maxPolarAngle={1.31}
      />
    </Canvas>
  )
}

useGLTF.preload('/room.glb')
