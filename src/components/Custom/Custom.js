import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const Custom = () => {
  const mountRef = useRef(null);
  const controls = useRef(null);
  const [color, setColor] = useState(false);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    //Data from the canvas
    const currentRef = mountRef.current;
    const { clientWidth: width, clientHeight: height } = currentRef;

    //Scene, camera, renderer
    const scene = new THREE.Scene();
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

    //Animate the scene
    const animate = () => {
      orbitControls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    //cube
    const cube = new THREE.Mesh(
      new THREE.BoxBufferGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: "red" })
    );
    scene.add(cube);

    //chahge color
    const changeColor = (color) => {
      if (color) {
        cube.material.color.set(0x0000ff);
      } else {
        cube.material.color.set(0xff0000);
      }
    };

    //add / hide cube
    const addHideCube = (hide) => {
      if (hide) {
        scene.remove(cube);
      } else {
        scene.add(cube);
      }
    };
    controls.current = { changeColor, addHideCube };

    return () => {
      window.removeEventListener("resize", resize);
      currentRef.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    controls.current.changeColor(color);
    controls.current.addHideCube(hide);
  }, [color, hide]);

  return (
    <>
      <div
        className='Contenedor3D'
        ref={mountRef}
        style={{ width: "100%", height: "80vh" }}
      ></div>
      <button onClick={() => setColor(!color)}>Change Color</button>
      <button onClick={() => setHide(!hide)}>Add / Hide</button>
    </>
  );
};

export default Custom;
