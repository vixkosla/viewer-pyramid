import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Button, Box } from '@mui/material';
import PrimitiveModal from './components/PrimitiveModal';
import type { PrimitiveParams } from './components/PrimitiveModal';
import PrimitiveList from './components/PrimitiveList';
import type { PrimitiveInfo } from './components/PrimitiveList';
import * as THREE from 'three';
import { Outlines } from '@react-three/drei';

function getRandomColor() {
  const colors = ['#e53935', '#fbc02d', '#43a047', '#1e88e5', '#8e24aa', '#fb8c00'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// function getRandomFaceColors(n: number) {
//   return Array.from({ length: n }).map(getRandomColor);
// }

// function getRandomPosition() {
//   return [
//     Math.round(Math.random() * 8 - 4),
//     Math.round(Math.random() * 6 - 3),
//     Math.round(Math.random() * 8 - 4),
//   ] as [number, number, number];
// }

function hexToRgbArray(hex: string) {
  // #RRGGBB -> [r,g,b] (0..1)
  const c = hex.replace('#', '');
  return [0, 2, 4].map(i => parseInt(c.substring(i, i + 2), 16) / 255);
}

function createColoredBoxGeometry(length: number, height: number, width: number) {
  const box = new THREE.BoxGeometry(length, height, width);
  const baseColor = getRandomColor();
  let specialColor = getRandomColor();
  while (specialColor === baseColor) specialColor = getRandomColor();
  const specialIdx = Math.floor(Math.random() * 6);
  const colors: number[] = [];
  for (let faceIdx = 0; faceIdx < 6; faceIdx++) {
    const colorArr = faceIdx === specialIdx ? hexToRgbArray(specialColor) : hexToRgbArray(baseColor);
    for (let i = 0; i < 4; i++) {
      colors.push(...colorArr);
    }
  }
  box.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return box;
}

function createColoredPyramidGeometry(length: number, width: number, height: number) {
  const halfLength = length / 2;
  const halfWidth = width / 2;

  // Координаты вершин: основание на Y=0, вершина на Y=height
  const A = [-halfLength, 0, -halfWidth]; // Точка A основания
  const B = [halfLength, 0, -halfWidth];  // Точка B основания
  const C = [halfLength, 0, halfWidth];   // Точка C основания
  const D = [-halfLength, 0, halfWidth];  // Точка D основания
  const Top = [0, height, 0];             // Вершина пирамиды

  // Массив вершин для геометрии (позиции треугольников)
  const vertices = [
    // Основание: два треугольника (A-B-C и A-C-D)
    ...A, ...B, ...C,
    ...A, ...C, ...D,
    // Боковые грани: четыре треугольника (A-Top-B, B-Top-C, C-Top-D, D-Top-A)
    ...A, ...Top, ...B,
    ...B, ...Top, ...C,
    ...C, ...Top, ...D,
    ...D, ...Top, ...A
  ];

  // Пример назначения цветов (можно настроить под ваши нужды)
  const baseColorArr = hexToRgbArray(getRandomColor()); // Цвет основания
  let specialColorArr = hexToRgbArray(getRandomColor()); // Цвет одной боковой грани
  while (specialColorArr.join(',') === baseColorArr.join(',')) specialColorArr = hexToRgbArray(getRandomColor());
  const specialIdx = Math.floor(Math.random() * 4); // Случайная боковая грань

  const colors: number[] = [];
  // Цвета для основания (6 вершин)
  for (let i = 0; i < 6; i++) colors.push(...baseColorArr);
  // Цвета для боковых граней (4 треугольника по 3 вершины)
  for (let i = 0; i < 4; i++) {
    const arr = i === specialIdx ? specialColorArr : baseColorArr;
    colors.push(...arr, ...arr, ...arr);
  }

  // Создание геометрии
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}

export default function Viewer() {
  const [primitives, setPrimitives] = useState<PrimitiveInfo[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  console.log(selectedId)
  // --- GRID PLACEMENT UTILS ---
  const GRID_STEP = 4; // шаг сетки (в 2 раза больше размера фигуры)
  const GRID_RADIUS = 10; // радиус поиска по x/z (можно увеличить при необходимости)
  function getOccupiedPositions(prims: PrimitiveInfo[]) {
    return new Set(prims.map(p => `${p.position[0]},${p.position[2]}`));
  }
  function findFreePositions(count: number, occupied: Set<string>): [number, number, number][] {
    const result: [number, number, number][] = [];
    let found = 0;
    outer: for (let r = 0; r < GRID_RADIUS && found < count; r++) {
      for (let x = -r; x <= r; x++) {
        for (let z = -r; z <= r; z++) {
          if (Math.abs(x) !== r && Math.abs(z) !== r) continue; // только по "рамке"
          const key = `${x * GRID_STEP},${z * GRID_STEP}`;
          if (!occupied.has(key)) {
            result.push([x * GRID_STEP, 0, z * GRID_STEP]);
            occupied.add(key);
            found++;
            if (found >= count) break outer;
          }
        }
      }
    }
    return result;
  }

  const handleAddGroup = (params: PrimitiveParams) => {
    setPrimitives((prev) => {
      const occupied = getOccupiedPositions(prev);
      const positions = findFreePositions(params.number, occupied);
      if (positions.length < params.number) {
        alert('Недостаточно свободных мест на сетке!');
        return prev;
      }
      const newPrims: PrimitiveInfo[] = positions.map((pos, i) => {
        let geometry: THREE.BufferGeometry;
        if (params.type === 'box') {
          geometry = createColoredBoxGeometry(params.length || 1, params.height || 1, params.width || 1);
        } else {
          geometry = createColoredPyramidGeometry(params.length || 1, params.width || 1, params.height || 1);
        }
        return {
          id: `${Date.now()}-${Math.random()}-${i}`,
          type: params.type,
          position: pos,
          color: getRandomColor(),
          selected: false,
          length: params.length,
          width: params.width,
          height: params.height,
          geometry
        };
      });
      return [...prev, ...newPrims];
    });
    setModalOpen(false);
  };


  const handleSelect = (id: string) => {
    setSelectedId(id);
    setPrimitives((prev) => prev.map(p => ({ ...p, selected: p.id === id })));
  };

  const handleClear = () => {
    setPrimitives([]);
    setSelectedId(null);
  };


  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Список и кнопки */}
      <Box sx={{ width: 240, bgcolor: '#f5f5f5', p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <PrimitiveList items={primitives} onSelect={handleSelect} />
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <Button variant="contained" color="primary" onClick={() => setModalOpen(true)} fullWidth>Add group</Button>
          <Button variant="outlined" color="secondary" onClick={handleClear} fullWidth>Clear scene</Button>
        </Box>
      </Box>
      {/* 3D Viewer */}
      <Box sx={{ flex: 1, height: '100vh' }}>
        <Canvas camera={{ position: [6, 6, 18], fov: 50 }} shadows={{ enabled: true, type: THREE.VSMShadowMap }}>
        <color attach="background" args={['#e0e070']} />
        <fogExp2 attach="fog" args={['#e0e070', 0.03]} />
          {/* <OrbitControls/> */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[-5, 10, 5]}
            intensity={0.9}
            castShadow
            shadow-camera-left={-60}
            shadow-camera-right={60}
            shadow-camera-top={60}
            shadow-camera-bottom={-60}
            // shadow-bias={-0.0001}
          />
          {/* Плоскость для теней */}
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial color="#e0e070" />
          </mesh>
          {primitives.map((prim) => (
            <mesh
              key={prim.id}
              position={[prim.position[0], (prim.height / 2) || 0.5, prim.position[2]]}
              // scale={prim.selected ? [1.2, 1.2, 1.2] : [1, 1, 1]}
              castShadow
              receiveShadow
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(prim.id);
              }}
            >
              <primitive object={prim.geometry} attach="geometry" />
              <meshStandardMaterial vertexColors side={THREE.DoubleSide}/>
              { prim.selected && <Outlines thickness={4.5} color="#2fffff" />}
            </mesh>
          ))}
        </Canvas>
      </Box>
      <PrimitiveModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAddGroup} />
    </Box>
  );
}