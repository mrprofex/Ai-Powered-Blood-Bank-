import '@testing-library/jest-dom';
import { vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: [] })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({ data: [] })),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
});

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,');

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('three', () => ({
  Scene: vi.fn(),
  PerspectiveCamera: vi.fn(),
  WebGLRenderer: vi.fn().mockImplementation(() => ({
    setSize: vi.fn(),
    setPixelRatio: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
    domElement: document.createElement('canvas'),
  })),
  OrbitControls: vi.fn(),
  AmbientLight: vi.fn(),
  DirectionalLight: vi.fn(),
  PointLight: vi.fn(),
  Mesh: vi.fn(),
  Group: vi.fn(),
  GridHelper: vi.fn(),
  RingGeometry: vi.fn(),
  MeshBasicMaterial: vi.fn(),
  CylinderGeometry: vi.fn(),
  MeshStandardMaterial: vi.fn(),
  SphereGeometry: vi.fn(),
  TorusGeometry: vi.fn(),
  CylinderGeometry: vi.fn(),
  MeshBasicMaterial: vi.fn(),
  QuadraticBezierCurve3: vi.fn(),
  BufferGeometry: vi.fn(),
  LineBasicMaterial: vi.fn(),
  Line: vi.fn(),
  Vector3: vi.fn().mockImplementation((x, y, z) => ({ x, y, z, clone: () => ({ x, y, z }), add: vi.fn(), multiplyScalar: vi.fn(), distanceTo: vi.fn(() => 1) })),
  Vector2: vi.fn(),
  Raycaster: vi.fn().mockImplementation(() => ({ setFromCamera: vi.fn(), intersectObjects: vi.fn(() => []) })),
  Clock: vi.fn().mockImplementation(() => ({ getElapsedTime: vi.fn(() => 0) })),
  FogExp2: vi.fn(),
  ACESFilmicToneMapping: 1,
  DoubleSide: 2,
  Color: vi.fn(),
}));

vi.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
  OrbitControls: vi.fn().mockImplementation(() => ({
    enableDamping: true,
    dampingFactor: 0.06,
    enablePan: false,
    minDistance: 3.1,
    maxDistance: 6.8,
    maxPolarAngle: Math.PI / 2.15,
    minPolarAngle: Math.PI / 6,
    autoRotate: false,
    autoRotateSpeed: 0.55,
    update: vi.fn(),
    dispose: vi.fn(),
  })),
}));

vi.mock('ogl', () => ({
  Renderer: vi.fn(),
  Camera: vi.fn(),
  Transform: vi.fn(),
  Geometry: vi.fn(),
  Program: vi.fn(),
  Mesh: vi.fn(),
  Vec3: vi.fn(),
  Vec2: vi.fn(),
  Mat4: vi.fn(),
  Quat: vi.fn(),
  Polyline: vi.fn(),
}));

window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.focus = vi.fn();
window.HTMLElement.prototype.blur = vi.fn();