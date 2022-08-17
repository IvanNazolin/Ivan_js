import Swal from 'sweetalert2'

import { Stars, Sky, OrbitControls, Billboard, Text, Html, Plane, Sphere, softShadows } from "@react-three/drei"
import React, { useRef, Suspense, useEffect, useMemo, useState } from "react"
import { Canvas, extend, useThree, useFrame, useLoader } from "@react-three/fiber"
import { GLTFLoader } from "three-stdlib";
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from "three";
import { Physics, useBox, usePlane, useSphere } from "use-cannon"
import { MeshStandardMaterial, SphereBufferGeometry } from "three";
import { useGLTF, PerspectiveCamera } from '@react-three/drei'
import { useSpring } from "react-spring";
//extend({ OrbitControls })
softShadows()



const HINT_PHRASE = ""
//14 words
const birthdayText = "Happy birthday to you Ivan I wish you good luck in new school 1502"
const word_list = birthdayText.split(" ").reverse()

function Box({position, scale}) {
  //const [ref, api] = useBox(() => ({ mass: 1, position: [0, 10, 0], onCollide: (e)=>e.body.material.color.g = Math.random() }))
  const star = useRef()
  // function handleClick() {
  //   console.log(api)
  //   api.velocity.set(0, 5, 0)
  // }
  const vector = [10*Math.random(), 10*Math.random(), 10*Math.random()]

  useFrame(({clock}) => {
    star.current.position.x += vector[0]/100
    star.current.position.y += vector[1]/100
    star.current.position.z += vector[2]/100
  })

  return (
    <>

      <mesh ref={star} position={position} receiveShadow castShadow scale={scale}>
        <boxBufferGeometry attach="geometry" />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </>
  )
}

const CameraControls = () => {
  // Get a reference to the Three.js Camera, and the canvas html element.
  // We need these to setup the OrbitControls class.
  // https://threejs.org/docs/#examples/en/controls/OrbitControls

  const {
    camera,
    gl: { domElement }
  } = useThree();

  // Ref to the controls, so that we can update them on every frame using useFrame
  const controls = useRef();
  useFrame(state => controls.current.update());
  return (
    <orbitControls
      ref={controls}
      args={[camera, domElement]}
      enableZoom={true}
    />
  );
};

function BillBoard({ position }) {
  return (
    <Billboard
      follow={true}
      lockX={false}
      lockY={false}
      lockZ={false} // Lock the rotation on the z axis (default=false)
      position={position}
      children={
        <LoveText rotation={[0, 0, 0]} fontSize={5} maxWidth={20} lineHeight={1} textAlign="center">
          My Baby!
          My princess!
          I love you so much ❤
        </LoveText>
      }
    />
  )
}

function FallingStars({ count }) {
  const positions = useMemo(() => {
    let positions = []
    for (let i = 0; i < count; i++) {
      const r = 3600
      const theta = 2 * Math.PI * Math.random()
      const phi = Math.acos(2 * Math.random() - 1)
      const x = r * Math.cos(theta) * Math.sin(phi) + (-2000 + Math.random() * 4000)
      const y = r * Math.sin(theta) * Math.sin(phi) + (-2000 + Math.random() * 4000)
      const z = r * Math.cos(phi) + (-1000 + Math.random() * 2000)
      positions.push(x)
      positions.push(y)
      positions.push(z)
    }
    return new Float32Array(positions)
  }, [count])

  let group = useRef();

  useFrame(() => (group.current.rotation.y -= 0.001))

  return (
    <group ref={group}>
      <points>
        <bufferGeometry attach="geometry">
          <bufferAttribute attachObject={['attributes', 'position']} count={positions.length / 3} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial attach="material" size={12.5} sizeAttenuation color="red" fog={false} />
      </points>
    </group>
  )
}


function Heart(props) {
  const { gl, camera } = useThree()
  
  //camera.position.x = 4000

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
  const { nodes, materials } = useLoader(GLTFLoader, "models/heart.glb");
  console.log(nodes)

  useEffect(()=>{
    heart.current.scale.x = 0.1
    heart.current.scale.y = 0.1
    heart.current.scale.z = 0.1

    group.current.rotation.y = 0
    group.current.rotation.z = 0
    group.current.rotation.x = -Math.PI/2
  })

  useFrame(({clock}) => {
    const scale = 1 + Math.sin(clock.elapsedTime*1.5) * 0.05
    //console.log(scale)
    heart.current.rotation.z += 0.005
    heart.current.scale.y = scale
    heart.current.scale.x = scale
    heart.current.scale.z = scale

    if(!props.animationFinished){
      camera.position.x = x.get()
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
      <LoveText rotation={[-Math.PI/2, group.current ? group.current.rotation.z : 0, -Math.PI]} position={[0, 0, 25]} fontSize={7}>Happy Birthday, Ivan!</LoveText>
    </group>
  )
}


function MyPlane({ position, width, height, color }) {
  const [ref] = usePlane(() => ({ position: [0, 0, 0], rotation: [-Math.PI / 2, 0, 0] }))

  return (
    <>
    <mesh position={[position[0], position[1], position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeBufferGeometry attach="geometry" args={[width, height]} />
      <shadowMaterial attach="material" opacity={0.1}/>
    </mesh>
    <mesh position={[position[0], position[1], position[2]]} rotation={[-Math.PI / 2, 0, 0]} ref={ref} receiveShadow={true}>
      <planeBufferGeometry attach="geometry" args={[width, height]} />
      <meshStandardMaterial
        attach="material"
        side={THREE.DoubleSide}
        color="lightblue"
      />
    </mesh>
    </>
  )
}

function LoveText({ rotation, children, fontSize, maxWidth, lineHeight, textAlign, position }) {
  const textref = useRef()

  const { camera } = useThree();
  console.log(camera.rotation.y)
  React.useEffect(() => {
    textref.current.rotation.x = rotation[0]
    textref.current.rotation.y = rotation[1]
    textref.current.rotation.z = rotation[2]

    textref.current.position.x = position[0]
    textref.current.position.y = position[1]
    textref.current.position.z = position[2]
  })

  useFrame(({camera}) => {
    textref.current.rotation.y = -(camera.rotation.z+Math.PI)
    //console.log(camera.rotation.z)
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

function Ball(){
  const [ref, api] = useSphere(() => ({mass: 1, position: [1, 4, 1]}))
  return(
    <mesh ref={ref} castShadow position = {[1, 4, 1]}>
      <SphereBufferGeometry attach="geometry" />
      <MeshStandardMaterial attach="material" color="red"/>
    </mesh>
  )
}

function MyLight(){
  const lightRef = useRef()

  
  return(
    <pointLight position={[10, 15, 10]} angle={0.3} intensity={0.5}
        castShadow
        shadowMapWidth={1024}
        shadowMapHeight={1024}
        ref={lightRef}
        
        />
  )
}

function Word({ children, ...props }) {
  const color = new THREE.Color()
  const fontProps = { font: '/font.woff', fontSize: 3.5, letterSpacing: -0.05, lineHeight: 1, 'material-toneMapped': false }
  const ref = useRef()
  const [hovered, setHovered] = useState(false)
  const over = (e) => (e.stopPropagation(), setHovered(true))
  const out = () => setHovered(false)
  // Change the mouse cursor on hover
  useEffect(() => {
    if (hovered) document.body.style.cursor = 'pointer'
    return () => (document.body.style.cursor = 'auto')
  }, [hovered])
  // Tie component to the render-loop
  useFrame(({ camera }) => {
    // Make text face the camera
    ref.current.quaternion.copy(camera.quaternion)
    // Animate font color
    ref.current.material.color.lerp(color.set(hovered ? '#fa2720' : '#0294f5'), 0.1)
  })

  function handleClick(){
    if(children=="Happy" && props.index===97){
      Swal.fire("Ураааа!", `${HINT_PHRASE}`, "success")
    }
  }

  return <Text ref={ref} onPointerOver={over} onPointerOut={out} onPointerDown={handleClick} {...props} {...fontProps} children={children}/>
}

function Cloud({ count = 10, radius = 20 }) {
  // Create a count x count random words with spherical distribution
  const words = useMemo(() => {
    const temp = []
    const spherical = new THREE.Spherical()
    const phiSpan = Math.PI / (count + 1)
    const thetaSpan = (Math.PI * 2) / count
    for (let i = 1; i < count + 1; i++)
      // Taken from https://discourse.threejs.org/t/can-i-place-obects-on-a-sphere-surface-evenly/4773/6
      for (let j = 0; j < count; j++) temp.push([new THREE.Vector3().setFromSpherical(spherical.set(radius, phiSpan * i, thetaSpan * j)), word_list[j]])
    return temp
  }, [count, radius])
  return words.map(([pos, word], index) => <Word key={index} position={pos} children={word} index={index}/>)
}

const AnimatedCamera = ({ animate }) => {
  const [dollyFinished, setDollyFinished] = useState(false);
  const controls = useRef();

  const { y, x } = useSpring({
    from: { y: 20, x: -20 },
    to: animate ? { y: 0, x: -2 } : {},
    config: {
      mass: 1.5,
      tension: 280,
      friction: 140
    },
    onRest: () => setDollyFinished(true)
  });

  const { targetY } = useSpring({
    from: { targetY: 20 },
    to: animate ? { targetY: 0 } : {},
    config: {
      tension: 330,
      friction: 70
    }
  });

  useFrame(({ camera }) => {
    if (!dollyFinished) {
      controls.current.target.y = targetY.value;

      if (camera.position.y > 0) {
        camera.position.y = y.value;
        camera.position.x = x.value;
        controls.current.update();
      }
    }
  });

  return (
    <>
      <OrbitControls
        enabled={true}
        ref={controls}
        target={[0, 20, 0]}
      />
      <PerspectiveCamera makeDefault position={[-20, 20, 4]} />;
    </>
  );
};

function App() {
  const canvasRef = useRef()
  const radius = 3600
  const [animationFinished, setAnimationFinished] = useState(false)


  return (
    <Canvas ref={canvasRef} camera={{ fov: 75, near: 0.1, far: 8000, position: [9, 0, 5] }} style={{ height: "100vh" }}
      shadows
      
      onCreated={({ gl, scene }) => {

        scene.background = new THREE.Color('#000000')
      }}>

      <Stars />


        <MyLight/>
        <ambientLight intensity={0.3}/>
      
      

      <OrbitControls enabled={animationFinished} maxPolarAngle={Math.PI/2} minPolarAngle={Math.PI/2}/>

      <Suspense fallback={null}><Heart setAnimationFinished={setAnimationFinished} animationFinished={animationFinished}/></Suspense>
      
      {/* <Physics>
        
        <MyPlane position={[0, -1, 0]} width={10} height={10} color="lightblue" />
        
      </Physics> */}

      
      <Cloud count={14} radius={40} /> 

    </Canvas>
  );
}

export default App;
