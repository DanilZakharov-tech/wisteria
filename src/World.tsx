import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Html,
  useGLTF,
  useAnimations,
} from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import { movement, player, useGame, avatarAnimation, npcs } from "./game";
function Box({
  p,
  s,
  c,
  ...props
}: {
  p: [number, number, number];
  s: [number, number, number];
  c: string;
  [key: string]: unknown;
}) {
  return (
    <mesh position={p} castShadow receiveShadow {...props}>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} />
    </mesh>
  );
}
function Tree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, 1, 0]} s={[0.24, 2, 0.24]} c="#80684e" />
      {[
        [-0.6, 2.6, 0],
        [0.5, 2.8, 0],
        [0, 3.3, 0],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <icosahedronGeometry args={[1.05, 1]} />
          <meshStandardMaterial color={i % 2 ? "#85a36a" : "#678950"} />
        </mesh>
      ))}
    </group>
  );
}
function House({ x, z, color }: { x: number; z: number; color: string }) {
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, 1.65, 0]} s={[5, 3.3, 3.7]} c={color} />
      <Box p={[0, 3.55, 0]} s={[5.4, 0.18, 4.1]} c="#f7e7ce" />
      <mesh position={[0, 4.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[3.9, 1.8, 4]} />
        <meshStandardMaterial color="#716d69" />
      </mesh>
      <Box p={[0, 0.9, 1.88]} s={[0.85, 1.8, 0.13]} c="#653b45" />
      {[-1.55, 1.55].map((a) => (
        <group key={a}>
          <Box p={[a, 1.9, 1.9]} s={[1, 1.25, 0.12]} c="#f7eedc" />
          <Box p={[a, 1.9, 1.98]} s={[0.75, 1, 0.04]} c="#88b1b3" />
          <Box p={[a, 1.9, 2.01]} s={[0.06, 1, 0.05]} c="#fff6de" />
        </group>
      ))}
      <Box p={[0, 0.15, 2.4]} s={[2, 0.3, 1]} c="#f4e7d3" />
      {[-2.2, 2.2].map((a) => (
        <Box key={a} p={[a, 1.35, 2.35]} s={[0.15, 2.7, 0.15]} c="#fff4de" />
      ))}
    </group>
  );
}
function RiggedAvatar({
  npc,
  color,
  model,
}: {
  npc: boolean;
  color: string;
  model: string;
}) {
  const gltf = useGLTF(model);
  const modelScene = useMemo(() => {
    const copy = clone(gltf.scene);
    copy.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true;
        const source = Array.isArray(o.material) ? o.material : [o.material];
        const mats = source.map((m) => {
          const c = m.clone();
          if (c.name === "Dress") c.color.set(color);
          return c;
        });
        o.material = Array.isArray(o.material) ? mats : mats[0];
      }
    });
    return copy;
  }, [gltf.scene, color]);
  const { actions } = useAnimations(gltf.animations, modelScene);
  const current = useRef("");
  useEffect(() => { current.current = ""; }, [modelScene]);
  useFrame(() => {
    const next =
      !npc && Math.hypot(movement.x, movement.z) > 0.1
        ? "walk"
        : !npc && Date.now() < avatarAnimation.until
          ? avatarAnimation.name
          : "idle";
    if (current.current !== next) {
      actions[current.current]?.fadeOut(0.2);
      actions[next]?.reset().fadeIn(0.2).play();
      current.current = next;
    }
  });
  return <primitive object={modelScene} />;
}
export function Person({
  pos = [0, 0, 0],
  npc = false,
  color = "#73324b",
  model = "/models/alina.glb",
}: {
  model?: string;
  pos?: [number, number, number];
  npc?: boolean;
  color?: string;
}) {
  const root = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    if (!npc) {
      const m = Math.hypot(movement.x, movement.z);
      player.x = THREE.MathUtils.clamp(
        player.x + movement.x * Math.min(dt, 0.05) * 3.2,
        -14,
        14,
      );
      player.z = THREE.MathUtils.clamp(
        player.z + movement.z * Math.min(dt, 0.05) * 3.2,
        -1.4,
        11,
      );
      root.current.position.set(player.x, 0, player.z);
      if (m > 0.1) root.current.rotation.y = Math.atan2(movement.x, movement.z);
    }
  });
  return (
    <group ref={root} position={pos}>
      <RiggedAvatar npc={npc} color={color} model={model} />
      <mesh position={[0, 2.27, 0]} rotation={[0, 0, Math.PI / 4]}>
        <octahedronGeometry args={[0.13]} />
        <meshStandardMaterial
          color={npc ? "#dfba72" : "#8151a3"}
          emissive={npc ? "#977238" : "#633282"}
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}
function Scene({
  inside,
  onNear,
}: {
  inside: boolean;
  onNear: (s: string) => void;
}) {
  const outfit = useGame((s) => s.outfit),
    decor = useGame((s) => s.decor);
  useFrame(() => {
    const closest = npcs.find(
      (n) => Math.hypot(player.x - n.x, player.z - n.z) < 2.2,
    );
    onNear(
      inside
        ? player.z < 1
          ? "door"
          : "room"
        : closest
          ? "npc:" + closest.id
          : Math.hypot(player.x + 6, player.z) < 2.8
            ? "door"
            : "",
    );
  });
  return (
    <>
      <color attach="background" args={["#dce9e4"]} />
      <fog attach="fog" args={["#dce9e4", 30, 65]} />
      <ambientLight intensity={1.5} />
      <directionalLight
        position={[-8, 18, 8]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <Box
        p={[0, -0.16, 0]}
        s={[80, 0.3, 70]}
        c={inside ? "#c3a384" : "#97ad75"}
      />
      {inside ? (
        <>
          <Box p={[0, 0.01, 4]} s={[14, 0.05, 13]} c="#dfc7a8" />
          <Box p={[0, 2, -2]} s={[14, 4, 0.2]} c="#e7d8c9" />
          <Box p={[-7, 2, 4]} s={[0.2, 4, 12]} c="#e7d8c9" />
          <Box p={[-4, 0.6, 5]} s={[3, 1.2, 1.3]} c="#c18c92" />
          <Box p={[-4, 0.8, 4.5]} s={[3, 0.6, 0.4]} c="#ead7c2" />
          <Box p={[0, 0.5, 4]} s={[2, 1, 1.3]} c="#8a6653" />
          <Box p={[4, 0.7, 0]} s={[3, 1.4, 1.2]} c="#f5e9d5" />
          {decor && <Tree x={-5} z={0} />}
          <Html position={[0, 3, -1]} center>
            <span className="world-label">Дом Алины · гостиная</span>
          </Html>
        </>
      ) : (
        <>
          <Box p={[0, -0.005, 7.7]} s={[60, 0.05, 5]} c="#b8b8ab" />
          <Box p={[0, 0.03, 4.5]} s={[60, 0.12, 1.2]} c="#e3d9c3" />
          <Box p={[0, 0.03, 10.8]} s={[60, 0.12, 1.2]} c="#e3d9c3" />
          {[-22, -15, -8, -1, 6, 13, 20].map((x) => (
            <Box key={x} p={[x, 0.04, 7.7]} s={[2.8, 0.02, 0.09]} c="#f0e9cf" />
          ))}
          {[-12, -6, 7, 13].map((x, i) => (
            <House
              key={x}
              x={x}
              z={-4}
              color={["#e8d7b4", "#f1e3cc", "#c5d0bb", "#d7b7ad"][i]}
            />
          ))}
          {[-17, -9, 9, 17].map((x) => (
            <Tree key={x} x={x} z={2} />
          ))}
          {Array.from({ length: 45 }, (_, i) => (
            <Box
              key={i}
              p={[-22 + i, 0.45, 0.2]}
              s={[0.12, 0.9, 0.12]}
              c="#fff5dc"
            />
          ))}
          {[0.25, 0.65].map((y) => (
            <Box key={y} p={[0, y, 0.2]} s={[44, 0.08, 0.1]} c="#fff5dc" />
          ))}
          <mesh position={[3, 0.22, 1.7]}>
            <cylinderGeometry args={[1.2, 1.3, 0.4, 24]} />
            <meshStandardMaterial color="#d6ccba" />
          </mesh>
          <mesh position={[3, 0.45, 1.7]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1, 24]} />
            <meshStandardMaterial color="#9fc4c0" />
          </mesh>
          {npcs.map((n) => (
            <group key={n.id}>
              <Person
                npc
                pos={[n.x, 0, n.z]}
                color={n.color}
                model={"/models/" + n.id + ".glb"}
              />
              <Html position={[n.x, 2.9, n.z]} center>
                <span className="world-label">
                  {n.name} <b>···</b>
                </span>
              </Html>
            </group>
          ))}
          {[-12, 12].map((x) => (
            <group key={x} position={[x, 0, 1]}>
              <Box p={[0, 2.7, 0]} s={[0.17, 5.4, 0.17]} c="#f3e1c8" />
              <Box p={[0, 5.2, 0]} s={[5, 0.2, 0.5]} c="#f3e1c8" />
              {Array.from({ length: 16 }, (_, i) => (
                <mesh
                  key={i}
                  position={[-2 + i * 0.27, 4.7 - Math.sin(i) * 0.3, 0]}
                >
                  <sphereGeometry args={[0.34, 6, 6]} />
                  <meshStandardMaterial color={i % 2 ? "#a382b6" : "#b89cc8"} />
                </mesh>
              ))}
            </group>
          ))}
        </>
      )}
      <Person color={outfit} />
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.25}
        scale={55}
        blur={2}
        far={12}
      />
      <OrbitControls
        makeDefault
        target={[0, 0, 1]}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={7}
        maxDistance={30}
        enablePan={false}
      />
    </>
  );
}
export default function World({
  inside,
  onNear,
  paused,
}: {
  inside: boolean;
  onNear: (s: string) => void;
  paused: boolean;
}) {
  const quality = useGame((s) => s.quality);
  useEffect(() => {
    if (paused) {
      movement.x = 0;
      movement.z = 0;
    }
    const down = (e: KeyboardEvent) => {
      if (paused) return;
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName,
        )
      )
        return;
      if (["w", "ArrowUp"].includes(e.key)) movement.z = -1;
      if (["s", "ArrowDown"].includes(e.key)) movement.z = 1;
      if (["a", "ArrowLeft"].includes(e.key)) movement.x = -1;
      if (["d", "ArrowRight"].includes(e.key)) movement.x = 1;
    };
    const up = () => {
      movement.x = 0;
      movement.z = 0;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", up);
    };
  }, [paused]);
  return (
    <Canvas
      shadows={quality === "Высокое"}
      dpr={quality === "Низкое" ? 1 : [1, 1.5]}
      camera={{ position: [14, 15, 21], fov: 38 }}
    >
      <Scene inside={inside} onNear={onNear} />
    </Canvas>
  );
}
