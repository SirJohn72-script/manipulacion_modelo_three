import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

const Ring = () => {
  const mountRef = useRef(null);
  const controls = useRef(null);
  const [color, setColor] = useState(false);
  const [textures, setTextures] = useState({
    map: "",
    roughness: "",
    normal: "",
  });

  useEffect(() => {
    //Data from the canvas
    const currentRef = mountRef.current;
    const { clientWidth: width, clientHeight: height } = currentRef;

    //Scene, camera, renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x393939);
    const camera = new THREE.PerspectiveCamera(25, width / height, 0.1, 100);
    scene.add(camera);
    camera.position.set(5, 5, 5);
    camera.lookAt(new THREE.Vector3());

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    currentRef.appendChild(renderer.domElement);

    //OrbitControls
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;

    //Resize canvas
    const resize = () => {
      renderer.setSize(currentRef.clientWidth, currentRef.clientHeight);
      camera.aspect = currentRef.clientWidth / currentRef.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", resize);

    //env Map
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const evp = cubeTextureLoader.load([
      "./envMap/px.jpg",
      "./envMap/nx.jpg",
      "./envMap/py.jpg",
      "./envMap/ny.jpg",
      "./envMap/pz.jpg",
      "./envMap/nz.jpg",
    ]);

    //Loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("./draco/");

    //Grupo
    const ring = new THREE.Group();

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.load("./models/ring/dracoRing/dracoRing.gltf", (gltf) => {
      while (gltf.scene.children.length) {
        gltf.scene.children[0].material.envMap = evp;
        gltf.scene.children[0].scale.set(0.05, 0.05, 0.05);
        ring.add(gltf.scene.children[0]);
      }
      scene.add(ring);
    });

    //change Metal color
    const changeMetalColor = (color) => {
      for (let i = 0; i < ring.children.length; i++) {
        if (ring.children[i].name.includes("ring")) {
          if (color) {
            ring.children[i].material.color.set(0xd1b000);
          } else {
            ring.children[i].material.color.set(0xffffff);
          }
        }
      }
    };

    //change textures
    const changeTextures = (textures) => {
      for (let i = 0; i < ring.children.length; i++) {
        if (ring.children[i].name.includes("ring")) {
          ring.children[i].material.map = textures.map;
          ring.children[i].material.roughnessMap = textures.roughness;
          ring.children[i].material.normalMap = textures.normal;
          ring.children[i].material.needsUpdate = true;
        }
      }
    };

    controls.current = { changeMetalColor, changeTextures };

    const ambientalLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientalLight);

    const pointlight = new THREE.PointLight(0xffffff, 1);
    pointlight.position.set(6, 6, 6);
    scene.add(pointlight);

    //Animate the scene
    const animate = () => {
      orbitControls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      currentRef.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    controls.current.changeMetalColor(color);
  }, [color]);

  useEffect(() => {
    controls.current.changeTextures(textures);
  }, [textures]);

  //update textures
  const loadNewTextures = (folder) => {
    const textureLoader = new THREE.TextureLoader();
    setTextures({
      map: textureLoader.load(
        `./models/ring/textures/${folder}/DefaultMaterial_BaseColor.png`
      ),
      roughness: textureLoader.load(
        `./models/ring/textures/${folder}/DefaultMaterial_Metallic_png-DefaultMaterial_Roughness_png.png`
      ),
      normal: textureLoader.load(
        `./models/ring/textures/${folder}/DefaultMaterial_Normal.png`
      ),
    });
  };

  return (
    <>
      <div
        className='Contenedor3D'
        ref={mountRef}
        style={{ width: "100%", height: "80vh" }}
      ></div>
      <button onClick={() => setColor(!color)}>Change Color</button>
      <button onClick={() => loadNewTextures("1")}>Change Textures 1</button>
      <button onClick={() => loadNewTextures("2")}>Change Textures 2</button>
    </>
  );
};

export default Ring;
