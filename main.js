import * as THREE from 'three';
import { randFloatSpread } from 'three/src/math/MathUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const afterimagePass = new AfterimagePass(0.8);
composer.addPass(afterimagePass);

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = 0;
bloomPass.strength = 0.3;
bloomPass.radius = 0;
composer.addPass( bloomPass );

const outputPass = new OutputPass();
composer.addPass(outputPass);

window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

// POINTS

/*const p_vertices = [];

for (let i = 0; i < 10000; i++) {
    const x = THREE.MathUtils.randFloatSpread(2000);
    const y = THREE.MathUtils.randFloatSpread(2000);
    const z = THREE.MathUtils.randFloatSpread(2000);

    p_vertices.push(x, y, z);
}*/

/*const p_geometry = new THREE.BufferGeometry();
p_geometry.setAttribute('position', new THREE.Float32BufferAttribute(p_vertices, 3));
const p_material = new THREE.PointsMaterial({ color: 0x888888, size: 0.25 });
const points = new THREE.Points(p_geometry, p_material);
scene.add(points);*/

// CUBES

const scale = 3;

const depth = 20;
const height = 40;

const halfheight = height / 2
const points_geometry = new THREE.BoxGeometry(2 * scale, scale, scale, 18, 9, 9);
const cube_geometry = new THREE.BoxGeometry(1.9 * scale, 0.9 * scale, 0.9 * scale);

function generateCubes(points_l, cubes_l, points_r, cubes_r, i) {
    points_l[i] = [];
    cubes_l[i] = [];
    points_r[i] = [];
    cubes_r[i] = [];

    const points_material = new THREE.PointsMaterial({ color: 0xff0000, size: 0.03, sizeAttenuation: true, transparent: true });
    const cube_material = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true });

    for (let j = 0; j < height; ++j) {
        { // right
            const pts = new THREE.Points(points_geometry, points_material);
            pts.position.x = 10 + scale + randFloatSpread(2 * scale);
            pts.position.y = (j - halfheight + 0.5) * scale;
            pts.position.z = i == 0 ? (3.5 - depth) * scale : points_r[i - 1][j].position.z + scale;
            points_r[i][j] = pts;
            scene.add(points_r[i][j]);

            const cube = new THREE.Mesh(cube_geometry, cube_material);
            cube.position.x = pts.position.x;
            cube.position.y = pts.position.y;
            cube.position.z = pts.position.z;
            cubes_r[i][j] = cube;
            scene.add(cubes_r[i][j]);
        }

        { // left
            const pts = new THREE.Points(points_geometry, points_material);
            pts.position.x = -10 - scale + randFloatSpread(2 * scale);
            pts.position.y = (j - halfheight - 0.5) * scale;
            pts.position.z = i == 0 ? (3.5 - depth) * scale : points_l[i - 1][j].position.z + scale;
            points_l[i][j] = pts;
            scene.add(points_l[i][j]);

            const cube = new THREE.Mesh(cube_geometry, cube_material);
            cube.position.x = pts.position.x;
            cube.position.y = pts.position.y;
            cube.position.z = pts.position.z;
            cubes_l[i][j] = cube;
            scene.add(cubes_l[i][j]);
        }
    }
}

let points_l = [];
let cubes_l = [];
let points_r = [];
let cubes_r = [];
for (let i = 0; i < depth; ++i) {
    generateCubes(points_l, cubes_l, points_r, cubes_r, i)
}
/*const cube2 = new THREE.Points(c_geometry, c_material);
cube2.position.y = 2.3;
cube2.position.x = 0.5;
scene.add(cube2);*/

// WALL

const wall_geometry = new THREE.PlaneGeometry(100, 150);
const wall_material = new THREE.MeshBasicMaterial({ color: 0x000000 });
const wall = new THREE.Mesh(wall_geometry, wall_material);
wall.position.z = (4.99 - depth)*scale;
scene.add(wall);

const wall_points_geometry = new THREE.PlaneGeometry(100, 200, 400 / scale, 600 / scale);
const wall_points_material = new THREE.PointsMaterial({ color: 0xff0000, size: 0.001 });
const wall_points = new THREE.Points(wall_points_geometry, wall_points_material);
wall_points.position.z = (5 - depth)*scale;

scene.add(wall_points);

// CAM

camera.position.z = 5;
/*camera.position.z = 50;
camera.position.x = 50;
camera.rotation.y = 0.5;*/

const moveby = 0.035;
const last = depth - 1;
function animate() {
    //renderer.render(scene, camera);
    composer.render(scene, camera);

    for (let i = 0; i < depth; ++i) {
        for (let j = 0; j < height; ++j) {
            points_l[i][j].position.z -= moveby;
            cubes_l[i][j].position.z -= moveby;
            points_r[i][j].position.z -= moveby;
            cubes_r[i][j].position.z -= moveby;
        }
        //points_l[i][j].material.opacity = points_l[i][j].position.z/100/scale + 0.5;
        points_r[i][0].material.opacity = points_r[i][0].position.z / 100 + 0.5;
    }

    const last_pos = points_l[last][0].position.z
    if (last_pos < 3.5) {
        let points_l_row = points_l.shift();
        let cube_l_row = cubes_l.shift();
        let points_r_row = points_r.shift();
        let cube_r_row = cubes_r.shift();
        for (let i = 0; i < height; ++i) {
            scene.remove(points_l_row[i])
            scene.remove(cube_l_row[i])
            scene.remove(points_r_row[i])
            scene.remove(cube_r_row[i])
        }
        generateCubes(points_l, cubes_l, points_r, cubes_r, last)
    } /*else if (last_pos < 4) {
        for (let i = 0; i < height; ++i) {
            points_l[0][i].material.opacity = last_pos - 3.5;
            points_r[0][i].material.opacity = last_pos - 3.5;
        }
    }*/
        camera.rotation.z += 0.0005;

    //bloomPass.strength = (Math.sin(new Date().getTime()/10000) + 1)/5;

    // wall_points.rotation.z += 0.001;
}
renderer.setAnimationLoop(animate);