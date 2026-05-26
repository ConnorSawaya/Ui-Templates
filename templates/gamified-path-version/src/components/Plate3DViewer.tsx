"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Html, Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import type { FoodAnalysis, Ingredient } from "@/lib/types";
import { generateDishModelData, type DishIngredient } from "@/lib/ai/generateDishModelData";
import { LayerBreakdownView } from "./LayerBreakdownView";
import { Maximize2, Minimize2, Layers, RotateCw } from "lucide-react";

interface Plate3DViewerProps {
  analysis: FoodAnalysis;
}

function Plate({ color = "#e5e7eb" }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
      <ringGeometry args={[1.2, 2, 64]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

function FoodIngredient({
  position,
  color,
  volume,
  name,
  isSelected,
  onClick,
}: DishIngredient & { isSelected: boolean; onClick: () => void }) {
  const height = volume * 0.3 + 0.1;
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && !isSelected) {
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.02;
    }
  });

  return (
    <group position={[position[0], position[1], position[2]]}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        castShadow
      >
        <sphereGeometry args={[0.2 + volume * 0.1, 24, 24]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={isSelected ? 1 : 0.85}
        />
      </mesh>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <Text
          position={[0, 0.4, 0]}
          fontSize={0.08}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {name}
        </Text>
      </Float>
    </group>
  );
}

function IngredientLabel({ ingredient, color }: { ingredient: Ingredient; color: string }) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 2.2;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  return (
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group position={[x, 0.5, z]}>
        <mesh>
          <planeGeometry args={[0.8, 0.25]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.06}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {ingredient.name}
        </Text>
      </group>
    </Float>
  );
}

function Scene({
  modelData,
  ingredients,
  onSelectIngredient,
  selectedIndex,
}: {
  modelData: { ingredients: DishIngredient[]; dishColor: string; plateColor: string };
  ingredients: Ingredient[];
  onSelectIngredient: (index: number) => void;
  selectedIndex: number | null;
}) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(3, 2, 3);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.1;
    camera.position.x = 3 * Math.cos(t);
    camera.position.z = 3 * Math.sin(t);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 2, -5]} intensity={0.3} />
      <hemisphereLight args={["#ffffff", "#444444", 0.3]} />

      <Plate color={modelData.plateColor} />

      {modelData.ingredients.map((di, i) => (
        <FoodIngredient
          key={di.name}
          {...di}
          isSelected={selectedIndex === i}
          onClick={() => onSelectIngredient(i)}
        />
      ))}

      {ingredients.map((ing, i) => {
        const di = modelData.ingredients[i];
        if (!di) return null;
        return <IngredientLabel key={ing.name} ingredient={ing} color={di.color} />;
      })}
    </>
  );
}

export function Plate3DViewer({ analysis }: Plate3DViewerProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [layerView, setLayerView] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [modelData, setModelData] = useState<{
    ingredients: DishIngredient[];
    dishColor: string;
    plateColor: string;
  } | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    generateDishModelData(
      analysis.dishName,
      analysis.ingredients.map((i) => ({ name: i.name, category: i.category }))
    ).then(setModelData);
  }, [analysis]);

  if (!modelData) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground">
        Loading 3D view...
      </div>
    );
  }

  const selectedIngredient =
    selectedIndex !== null ? analysis.ingredients[selectedIndex] : null;

  return (
    <div className={`space-y-4 ${fullscreen ? "fixed inset-0 z-50 bg-background p-4" : ""}`}>
      <div
        className={`relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-muted/50 ${
          fullscreen ? "h-[calc(100vh-8rem)]" : "h-96 sm:h-[500px]"
        }`}
      >
        <Canvas
          shadows
          camera={{ position: [3, 2, 3], fov: 45 }}
          gl={{ antialias: true }}
        >
          <Scene
            modelData={modelData}
            ingredients={analysis.ingredients}
            onSelectIngredient={setSelectedIndex}
            selectedIndex={selectedIndex}
          />
          <OrbitControls
            enablePan={false}
            autoRotate={autoRotate}
            autoRotateSpeed={1}
          />
        </Canvas>

        <div className="absolute left-4 top-4 flex gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="glass rounded-full p-2 text-muted-foreground hover:text-foreground"
            title={autoRotate ? "Pause rotation" : "Auto rotate"}
          >
            <RotateCw className={`h-4 w-4 ${autoRotate ? "" : "opacity-50"}`} />
          </button>
          <button
            onClick={() => setLayerView(!layerView)}
            className="glass rounded-full p-2 text-muted-foreground hover:text-foreground"
            title="Layer view"
          >
            <Layers className="h-4 w-4" />
          </button>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="glass rounded-full p-2 text-muted-foreground hover:text-foreground"
            title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {fullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-center text-xs text-muted-foreground/70 backdrop-blur-sm">
            Drag to rotate · Scroll to zoom
          </p>
        </div>
      </div>

      <AnimatePresence>
        {layerView && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <LayerBreakdownView ingredients={analysis.ingredients} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedIngredient && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass rounded-2xl p-4 shadow-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold">{selectedIngredient.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedIngredient.category} · {selectedIngredient.estimatedQuantity} ·{" "}
                  {selectedIngredient.calories} cal
                </p>
              </div>
              <button
                onClick={() => setSelectedIndex(null)}
                className="rounded-full p-1 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {selectedIngredient.notes}
            </p>
            {selectedIngredient.substitutions.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-accent">Substitutions: </span>
                {selectedIngredient.substitutions.join(", ")}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
