"use client";
import { useEffect, useRef } from "react";
import { useLoader } from "@react-three/fiber";
import { Center, useAnimations } from "@react-three/drei";
import { GLTFLoader, DRACOLoader } from "three-stdlib";
import * as THREE from "three";

export function LotteryMachine() {
  // 🧩 Load Draco-compressed GLB model
  const gltf = useLoader(GLTFLoader, "/lottery_machine-transformed.glb", (loader) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/"); // Draco decoder
    loader.setDRACOLoader(dracoLoader);
  });

  const group = useRef<THREE.Group>(null);
  const { scene, animations } = gltf;
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    if (names.length > 0 && actions[names[0]]) {
      const action = actions[names[0]];
      if (action) {
        action.reset().fadeIn(0.5).play();
        action.timeScale = 1;
      }
    }
  }, [actions, names]);

  return (
    <Center>
      <primitive
        ref={group}
        object={scene}
        scale={0.03}
        rotation={[0, 0, 0]}
        position={[0, -0.2, 0]}
        castShadow
        receiveShadow
      />
    </Center>

  );
}
