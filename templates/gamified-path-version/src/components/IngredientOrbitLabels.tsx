"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float } from "@react-three/drei";
import * as THREE from "three";

interface IngredientOrbitLabelsProps {
  labels: { name: string; color: string; angle: number }[];
  radius?: number;
}

export function IngredientOrbitLabels({
  labels,
  radius = 2.5,
}: IngredientOrbitLabelsProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {labels.map((label, i) => {
        const angle = label.angle;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <Float
            key={label.name + i}
            speed={0.5}
            rotationIntensity={0.1}
            floatIntensity={0.2}
          >
            <group position={[x, 0.2, z]}>
              <mesh>
                <planeGeometry args={[1, 0.3]} />
                <meshBasicMaterial
                  color={label.color}
                  transparent
                  opacity={0.85}
                  side={THREE.DoubleSide}
                />
              </mesh>
              <Text
                position={[0, 0, 0.01]}
                fontSize={0.065}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {label.name}
              </Text>
            </group>
          </Float>
        );
      })}
    </group>
  );
}
