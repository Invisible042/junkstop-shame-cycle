import React, { useRef, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { colors, spacing, fontSizes } from '../styles/theme';
import { PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';

const { width } = Dimensions.get('window');

interface JunkFoodItem {
  id: string;
  name: string;
  category: string;
  shameRating: number;
  guiltRating: number;
  timestamp: Date;
  notes?: string;
  photo?: string;
}

interface JunkFood3DSceneProps {
  foodItems: JunkFoodItem[];
  onFoodItemClick?: (food: JunkFoodItem) => void;
}

export const JunkFood3DScene: React.FC<JunkFood3DSceneProps> = ({ 
  foodItems, 
  onFoodItemClick 
}) => {
  const [selectedFood, setSelectedFood] = useState<JunkFoodItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const foodMeshesRef = useRef<THREE.Mesh[]>([]);
  // Camera state
  const cameraTheta = useRef(Math.PI / 2); // horizontal angle
  const cameraPhi = useRef(Math.PI / 6);   // vertical angle
  const cameraRadius = useRef(8);
  const lastPan = useRef({ x: 0, y: 0 });
  const lastDistance = useRef(0);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Only show one modal per tap
  const showFoodModal = (food: JunkFoodItem) => {
    setSelectedFood(food);
    setModalVisible(true);
  };

  // PanResponder for drag and pinch
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      if (evt.nativeEvent.touches && evt.nativeEvent.touches.length === 2) {
        // Pinch start
        const [a, b] = evt.nativeEvent.touches;
        lastDistance.current = Math.sqrt(
          Math.pow(a.pageX - b.pageX, 2) + Math.pow(a.pageY - b.pageY, 2)
        );
      } else {
        lastPan.current = { x: gestureState.x0, y: gestureState.y0 };
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      if (evt.nativeEvent.touches && evt.nativeEvent.touches.length === 2) {
        // Pinch to zoom
        const [a, b] = evt.nativeEvent.touches;
        const dist = Math.sqrt(
          Math.pow(a.pageX - b.pageX, 2) + Math.pow(a.pageY - b.pageY, 2)
        );
        const delta = dist - lastDistance.current;
        cameraRadius.current = Math.max(4, Math.min(16, cameraRadius.current - delta * 0.01));
        lastDistance.current = dist;
      } else {
        // Drag to rotate/tilt
        const dx = gestureState.moveX - lastPan.current.x;
        const dy = gestureState.moveY - lastPan.current.y;
        cameraTheta.current -= dx * 0.01;
        cameraPhi.current = Math.max(0.1, Math.min(Math.PI / 2, cameraPhi.current - dy * 0.01));
        lastPan.current = { x: gestureState.moveX, y: gestureState.moveY };
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy < 10) {
        const { locationX, locationY } = evt.nativeEvent;
        const x = (locationX / width) * 2 - 1;
        const y = -(locationY / 300) * 2 + 1;
        if (cameraRef.current) {
          const mouse = new THREE.Vector2(x, y);
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, cameraRef.current);
          const intersects = raycaster.intersectObjects(foodMeshesRef.current);
          if (intersects.length > 0) {
            const mesh = intersects[0].object;
            const food = mesh.userData.food;
            showFoodModal(food); // Use single modal logic
          }
        }
      }
    },
  });

  const handleContextCreate = async (gl: any) => {
    const { drawingBufferWidth: w, drawingBufferHeight: h } = gl;
    const renderer = new Renderer({ gl });
    renderer.setSize(w, h);
    renderer.setClearColor(0x3b6ea5, 1); // blue wall

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x3b6ea5, 10, 50);

    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(
      cameraRadius.current * Math.sin(cameraPhi.current) * Math.cos(cameraTheta.current),
      cameraRadius.current * Math.cos(cameraPhi.current),
      cameraRadius.current * Math.sin(cameraPhi.current) * Math.sin(cameraTheta.current)
    );
    camera.lookAt(0, 0.5, -1.5);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);

    // Floor (wood)
    const floorGeometry = new THREE.PlaneGeometry(10, 8);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xc68642 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.5;
    scene.add(floor);

    // Back wall
    const wallGeometry = new THREE.PlaneGeometry(10, 5);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x3b6ea5 });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.z = -4;
    wall.position.y = 1;
    scene.add(wall);

    // Window
    const windowFrame = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 1.5),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    windowFrame.position.set(0, 2.2, -3.99);
    scene.add(windowFrame);
    const windowGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.1),
      new THREE.MeshStandardMaterial({ color: 0xb3e5fc })
    );
    windowGlass.position.set(0, 2.2, -3.98);
    scene.add(windowGlass);
    // Curtains
    const curtainL = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 1.5, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x4ecdc4 })
    );
    curtainL.position.set(-1.1, 2.2, -3.97);
    scene.add(curtainL);
    const curtainR = curtainL.clone();
    curtainR.position.x = 1.1;
    scene.add(curtainR);

    // Desk
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.25, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xf6c177 })
    );
    desk.position.set(0, -0.7, -1.5);
    scene.add(desk);
    // Desk drawers
    const drawers = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.7, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xf6c177 })
    );
    drawers.position.set(1.5, -1.1, -1.5);
    scene.add(drawers);
    // Drawer knobs
    for (let i = 0; i < 3; i++) {
      const knob = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24 })
      );
      knob.position.set(1.75, -0.9 - i * 0.25, -1.1);
      scene.add(knob);
    }
    // Chair
    const chairSeat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: 0x2563eb })
    );
    chairSeat.position.set(0, -1.2, -1.5);
    scene.add(chairSeat);
    const chairBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.5, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x2563eb })
    );
    chairBack.position.set(0, -0.95, -1.9);
    scene.add(chairBack);
    // Chair legs
    for (let i = 0; i < 5; i++) {
      const angle = (2 * Math.PI / 5) * i;
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8),
        new THREE.MeshStandardMaterial({ color: 0x22223b })
      );
      leg.position.set(
        Math.cos(angle) * 0.3,
        -1.35,
        -1.5 + Math.sin(angle) * 0.3
      );
      scene.add(leg);
    }
    // Desk lamps
    for (let i = 0; i < 2; i++) {
      const lampBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.05, 8),
        new THREE.MeshStandardMaterial({ color: 0x2563eb })
      );
      lampBase.position.set(-0.8 + i * 1.6, -0.55, -1.1);
      scene.add(lampBase);
      const lampArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x2563eb })
      );
      lampArm.position.set(-0.8 + i * 1.6, -0.35, -1.1);
      lampArm.rotation.z = i === 0 ? 0.7 : -0.7;
      scene.add(lampArm);
      const lampHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 8, 0, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x2563eb })
      );
      lampHead.position.set(-0.8 + i * 1.6 + (i === 0 ? 0.18 : -0.18), -0.15, -1.1);
      scene.add(lampHead);
    }
    // Shelf
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.08, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xf6c177 })
    );
    shelf.position.set(2.2, 2.2, -3.7);
    scene.add(shelf);
    // Books
    for (let i = 0; i < 2; i++) {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.3, 0.08),
        new THREE.MeshStandardMaterial({ color: i === 0 ? 0xf87171 : 0xfbbf24 })
      );
      book.position.set(2.1 + i * 0.22, 2.35, -3.6);
      scene.add(book);
    }
    // Plant
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.11, 0.13, 8),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24 })
    );
    pot.position.set(2.4, 2.3, -3.6);
    scene.add(pot);
    const plant = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x22c55e })
    );
    plant.position.set(2.4, 2.38, -3.6);
    scene.add(plant);
    // Rug
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(3.5, 1.2, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x2563eb })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, -1.49, -1.5);
    scene.add(rug);
    // Wall art
    const art = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.9),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24 })
    );
    art.position.set(-2.7, 2.1, -3.98);
    scene.add(art);
    // Like icon frame
    const likeFrame = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xf87171 })
    );
    likeFrame.position.set(2.7, 1.2, -3.98);
    scene.add(likeFrame);

    // --- Food Items on Desk ---
    foodMeshesRef.current = [];
    const deskTopY = -0.55;
    const deskLeft = -1.6; // wider desk area
    const deskFront = -2.2;
    const deskWidth = 3.2; // increased width
    const deskDepth = 1.2; // increased depth
    const itemSize = 0.4; // cube size
    const padding = 0.35; // much more space between cubes
    const maxCols = 3; // fewer columns for more rows
    const n = foodItems.length;
    const cols = Math.min(maxCols, Math.ceil(Math.sqrt(n)));
    const rows = Math.ceil(n / cols);
    const xStart = deskLeft + (deskWidth - (cols * (itemSize + padding) - padding)) / 2 + itemSize / 2;
    const zStart = deskFront + (deskDepth - (rows * (itemSize + padding) - padding)) / 2 + itemSize / 2;
    foodItems.forEach((food, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      // Add more random jitter for a playful look
      const jitterX = (Math.random() - 0.5) * 0.28;
      const jitterZ = (Math.random() - 0.5) * 0.28;
      const x = xStart + col * (itemSize + padding) + jitterX;
      const y = deskTopY + 0.25;
      const z = zStart + row * (itemSize + padding) + jitterZ;
      // Color by shame/guilt
      const avgRating = (food.shameRating + food.guiltRating) / 2;
      let color = 0xff0000;
      if (avgRating >= 8) color = 0xdc2626;
      else if (avgRating >= 6) color = 0xea580c;
      else if (avgRating >= 4) color = 0xd97706;
      else if (avgRating >= 2) color = 0x65a30d;
      else color = 0x16a34a;
      // Cube for food
      const geometry = new THREE.BoxGeometry(itemSize, itemSize, itemSize);
      const material = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.2 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.userData = { food };
      scene.add(mesh);
      foodMeshesRef.current.push(mesh);
      // --- Add food name label as a sprite ---
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(59, 110, 165, 0.85)'; // blue background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 32px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(food.name, canvas.width / 2, canvas.height / 2);
      }
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(0.9, 0.22, 1); // size of label
      sprite.position.set(x, y + itemSize / 2 + 0.18, z); // above the cube
      scene.add(sprite);
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      // Update camera position from state
      const r = cameraRadius.current;
      const theta = cameraTheta.current;
      const phi = cameraPhi.current;
      camera.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
      camera.lookAt(0, 0.5, -1.5);
      // Animate food cubes
      foodMeshesRef.current.forEach((mesh, i) => {
        mesh.rotation.y += 0.01 + (i * 0.001);
        mesh.position.y = -0.3 + Math.sin(Date.now() * 0.002 + i) * 0.05;
      });
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  };

  // --- Modal content ---
  const getDefaultNote = (food: JunkFoodItem) => {
    // Placeholder AI suggestion/alternative
    return `Try a healthy swap for "${food.name}"! For example, if you craved pizza, try a whole grain wrap with veggies and light cheese. Remember: mindful eating is progress!`;
  };

  return (
    <View
      style={{
        width: '100%',
        height: 300,
        borderRadius: 20,
        backgroundColor: '#3b6ea5',
        overflow: 'hidden',
        marginBottom: spacing.md,
      }}
      {...panResponder.panHandlers}
    >
      {foodItems.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.lg,
          }}
        >
          <Text
            style={{
              color: '#00c6fb',
              fontSize: fontSizes.heading,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: spacing.sm,
            }}
          >
            🎯 Start Your Mindful Journey
          </Text>
          <Text
            style={{
              color: '#666',
              fontSize: fontSizes.body,
              textAlign: 'center',
            }}
          >
            Log your first junk food item below
          </Text>
        </View>
      ) : (
        <GLView style={{ flex: 1 }} onContextCreate={handleContextCreate} />
      )}
      {/* Modal for food details */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.55)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {selectedFood && (
            <View
              style={{
                backgroundColor: '#23263a',
                borderRadius: 18,
                padding: 32,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 12,
                maxWidth: 320,
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 20,
                  fontWeight: 'bold',
                  marginBottom: 12,
                  textAlign: 'center',
                }}
              >
                {selectedFood.name}
              </Text>
              <Text
                style={{
                  color: '#ffd700',
                  fontSize: 15,
                  fontStyle: 'italic',
                  marginBottom: 12,
                  textAlign: 'center',
                }}
              >
                Shame: {selectedFood.shameRating}/10 • Guilt: {selectedFood.guiltRating}/10
              </Text>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 15,
                  marginBottom: 12,
                  textAlign: 'center',
                }}
              >
                {selectedFood.notes || getDefaultNote(selectedFood)}
              </Text>
              {/* Placeholder for future AI details */}
              <Text
                style={{
                  color: '#00c6fb',
                  fontSize: 13,
                  marginBottom: 8,
                  textAlign: 'center',
                }}
              >
                (AI-powered food analysis and alternatives coming soon)
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  marginTop: 18,
                  backgroundColor: colors.accent,
                  borderRadius: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 24,
                }}
              >
                <Text
                  style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}; 