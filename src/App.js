import Swal from 'sweetalert2'
import { Stars, OrbitControls, Text } from "@react-three/drei"
import React, { useRef, Suspense, useEffect, useMemo, useState } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { GLTFLoader } from "three-stdlib";
import * as THREE from "three";
import { useSpring } from "react-spring";
import { useBox } from "use-cannon"

// ... (ваш другой импорт)

const HINT_PHRASE = "Удачи на соревнованиях"
const birthdayText = "known. ever have I which girl best the and awesome most the are you Nika,"

const word_list = birthdayText.split(" ").reverse()

function Heart(props) {
  const { camera } = useThree()
  
  const { x } = useSpring({
    from: { x: 8000 },
    to: { x: 10 },
    config: {
      mass: 1.5,
      tension: 200,
      friction: 140
    },
    delay: 3000,
    onRest: () => props.setAnimationFinished(true)
  });

  const group = useRef()
  const heart = useRef()
  const { nodes } = useLoader(GLTFLoader, "models/heart.glb");

  useEffect(() => {
    heart.current.scale.set(0.1, 0.1, 0.1);
    group.current.rotation.y = 0;
    group.current.rotation.z = 0;
    group.current.rotation.x = -Math.PI/2;
  }, [])

  useFrame(({clock}) => {
    const scale = 1 + Math.sin(clock.elapsedTime * 1.5) * 0.05;
    heart.current.rotation.z += 0.005;
    heart.current.scale.set(scale, scale, scale);

    if (!props.animationFinished) {
      camera.position.x = x.get();
    }
  })

  return (
    <group ref={group} {...props} dispose={null} scale={0.1}>
      <mesh visible geometry={nodes.Heart.geometry} ref={heart} scale={0.1}>
        <meshStandardMaterial
          attach="material"
          color="red"
          roughness={0.3}
          metalness={0.3}
        />
      </mesh>
      <LoveText rotation={[-Math.PI/2, group.current ? group.current.rotation.z : 0, -Math.PI]} position={[0, 0, 25]} fontSize={7}>
        Good luck, Nika! And have a good summer!
      </LoveText>
    </group>
  )
}

function LoveText({ rotation, children, fontSize, maxWidth, lineHeight, textAlign, position }) {
  const textref = useRef()

  useEffect(() => {
    textref.current.rotation.x = rotation[0]
    textref.current.rotation.y = rotation[1]
    textref.current.rotation.z = rotation[2]

    textref.current.position.x = position[0]
    textref.current.position.y = position[1]
    textref.current.position.z = position[2]
  }, [])

  useFrame(({camera}) => {
    textref.current.rotation.y = -(camera.rotation.z + Math.PI);
  });

  return (
    <Text ref={textref} fontSize={fontSize && fontSize} maxWidth={maxWidth && maxWidth} lineHeight={lineHeight ? lineHeight : 1} textAlign={textAlign ? textAlign : "left"} font='/font.woff'>
      {children}
      <meshBasicMaterial
        attach="material"
        side={THREE.DoubleSide}
        color="red"
      />
    </Text>
  )
}

function MyLight({ position, angle, intensity, color }) {
  return (
    <spotLight position={position} angle={angle} intensity={intensity} color={color} castShadow shadowMapWidth={1024} shadowMapHeight={1024} />
  )
}

function Word({ children, ...props }) {
  // ... (ваш компонент Word)
}

function Cloud({ count = 10, radius = 20 }) {
  // ... (ваш компонент Cloud)
}

function App() {
  const canvasRef = useRef()
  const [animationFinished, setAnimationFinished] = useState(false)

  return (
    <Canvas ref={canvasRef} camera={{ fov: 75, near: 0.1, far: 8000, position: [9, 0, 5] }} style={{ height: "100vh" }} shadows onCreated={({ gl, scene }) => {
        scene.background = new THREE.Color('#000000')
      }}>
      <Stars />
      <Suspense fallback={null}><Heart setAnimationFinished={setAnimationFinished} animationFinished={animationFinished}/></Suspense>
      <MyLight position={[10, 15, 10]} angle={0.3} intensity={0.5} color="white" />
      <MyLight position={[-10, -15, -10]} angle={0.3} intensity={0.5} color="red" />
      <OrbitControls enabled={animationFinished} maxPolarAngle={Math.PI/2} minPolarAngle={Math.PI/2} enablePan={false}/>
      <Cloud count={15} radius={40} />
    </Canvas>
  )
}

export default App;
