import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const kamera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
);
kamera.position.set(-5, 4, -5);
kamera.lookAt(1, 0.1, 1.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const rendererLabel = new CSS2DRenderer();
rendererLabel.setSize(window.innerWidth, window.innerHeight);
rendererLabel.domElement.style.position = 'absolute';
rendererLabel.domElement.style.top = '0px';
rendererLabel.domElement.style.pointerEvents = 'none';
document.body.appendChild(rendererLabel.domElement);

const kontrolOrbit = new OrbitControls(kamera, renderer.domElement);
kontrolOrbit.enableDamping = true;
kontrolOrbit.dampingFactor = 0.05;
kontrolOrbit.target.set(1, 0.1, 1.5);
kontrolOrbit.update();

const cahayaAmbient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(cahayaAmbient);

const cahayaUtama = new THREE.DirectionalLight(0xffffff, 1.5);
cahayaUtama.position.set(-5, 10, -3);
cahayaUtama.castShadow = true;
cahayaUtama.shadow.mapSize.set(2048, 2048);
cahayaUtama.shadow.camera.left = -8;
cahayaUtama.shadow.camera.right = 8;
cahayaUtama.shadow.camera.top = 8;
cahayaUtama.shadow.camera.bottom = -8;
cahayaUtama.shadow.camera.far = 30;
scene.add(cahayaUtama);

const cahayaIsi = new THREE.DirectionalLight(0xffffff, 0.25);
cahayaIsi.position.set(4, 3, 4);
scene.add(cahayaIsi);

const sumbuHelper = new THREE.AxesHelper(1.5);
sumbuHelper.position.set(0.75, 0, 4);
scene.add(sumbuHelper);

function buatLabel(teks, posisi) {
    const div = document.createElement('div');
    div.textContent = teks;
    div.style.cssText = 'color:white;font-size:13px;font-family:Arial,sans-serif;font-weight:bold;' +
        'white-space:nowrap;text-shadow:1px 1px 3px rgba(0,0,0,0.95);pointer-events:none;';
    const obj = new CSS2DObject(div);
    obj.position.copy(posisi);
    scene.add(obj);
}

function buatTitik(posisi) {
    const m = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.04, 0.04),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    m.position.copy(posisi);
    scene.add(m);
}

function buatGaris(a, b) {
    const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
    const mat = new THREE.LineBasicMaterial({ color: 0xffffff });
    scene.add(new THREE.Line(geo, mat));
}

function anotasi(teks, a, b, labelPos) {
    buatTitik(a);
    buatTitik(b);
    buatGaris(a, b);
    buatLabel(teks, labelPos);
}

const SKALA_UV = 0.2;

function buatMaterial(tekstur, uRepeat, vRepeat) {
    const t = tekstur.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(uRepeat, vRepeat);
    t.needsUpdate = true;
    return new THREE.MeshStandardMaterial({
        map: t,
        roughness: 0.85,
        metalness: 0.0,
    });
}

function buatMaterial6Muka(tekstur, w, h, d) {
    const matSampingXpos = buatMaterial(tekstur, d / SKALA_UV, h / SKALA_UV);
    const matSampingXneg = buatMaterial(tekstur, d / SKALA_UV, h / SKALA_UV);
    const matAtas = buatMaterial(tekstur, w / (SKALA_UV * 2), d / (SKALA_UV * 2));
    const matBawah = buatMaterial(tekstur, w / (SKALA_UV * 2), d / (SKALA_UV * 2));
    const matSampingZpos = buatMaterial(tekstur, w / SKALA_UV, h / SKALA_UV);
    const matSampingZneg = buatMaterial(tekstur, w / SKALA_UV, h / SKALA_UV);

    return [matSampingXpos, matSampingXneg, matAtas, matBawah, matSampingZpos, matSampingZneg];
}

const TINGGI = 0.2;

function buatStruktur(tekstur) {
    const mat6Kiri = buatMaterial6Muka(tekstur, 2, TINGGI, 2);
    const mat6Kanan = buatMaterial6Muka(tekstur, 0.5, TINGGI, 3);
    const mat6Step = buatMaterial6Muka(tekstur, 0.4, 0.02, 0.5);

    const meshKiri = new THREE.Mesh(new THREE.BoxGeometry(2, TINGGI, 2), mat6Kiri);
    meshKiri.position.set(1, TINGGI / 2, 0);
    meshKiri.castShadow = true;
    meshKiri.receiveShadow = true;
    scene.add(meshKiri);

    const meshKanan = new THREE.Mesh(new THREE.BoxGeometry(0.5, TINGGI, 3), mat6Kanan);
    meshKanan.position.set(1, TINGGI / 2, 2.5);
    meshKanan.castShadow = true;
    meshKanan.receiveShadow = true;
    scene.add(meshKanan);

    const meshStep = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.5), mat6Step);
    meshStep.position.set(1, TINGGI + 0.01, 1);
    meshStep.castShadow = true;
    meshStep.receiveShadow = true;
    scene.add(meshStep);

    tambahAnotasi();
}

function tambahAnotasi() {
    const t = TINGGI;

    anotasi('2m',
        new THREE.Vector3(0, t, -1), new THREE.Vector3(2, t, -1),
        new THREE.Vector3(1, t + 0.15, -1.25));

    anotasi('2m',
        new THREE.Vector3(0, t, -1), new THREE.Vector3(0, t, 1),
        new THREE.Vector3(-0.35, t + 0.1, 0));

    anotasi('0.2m',
        new THREE.Vector3(2, 0, -1), new THREE.Vector3(2, t, -1),
        new THREE.Vector3(2.12, t / 2, -1.1));

    anotasi('3m',
        new THREE.Vector3(0.75, t, 1), new THREE.Vector3(0.75, t, 4),
        new THREE.Vector3(0.5, t + 0.15, 2.5));

    anotasi('0.5m',
        new THREE.Vector3(0.75, t, 4), new THREE.Vector3(1.25, t, 4),
        new THREE.Vector3(1, t + 0.15, 4.25));

    anotasi('0.2m',
        new THREE.Vector3(1.25, 0, 4), new THREE.Vector3(1.25, t, 4),
        new THREE.Vector3(1.35, t / 2, 4.12));

    anotasi('0.4m',
        new THREE.Vector3(0.8, t + 0.02, 0.75), new THREE.Vector3(1.2, t + 0.02, 0.75),
        new THREE.Vector3(1, t + 0.13, 0.62));

    anotasi('0.02m',
        new THREE.Vector3(1.2, t, 0.75), new THREE.Vector3(1.2, t + 0.02, 0.75),
        new THREE.Vector3(1.3, t + 0.01, 0.62));

    anotasi('0.5m',
        new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0.5),
        new THREE.Vector3(-0.28, -0.05, 0.75));

    anotasi('0.54m',
        new THREE.Vector3(0, 0, 0.5), new THREE.Vector3(0, 0, -0.04),
        new THREE.Vector3(-0.32, -0.05, 0.23));

    anotasi('0.5m',
        new THREE.Vector3(0.75, 0, 4), new THREE.Vector3(1.25, 0, 4),
        new THREE.Vector3(0.9, -0.1, 4.25));
}

const pemuatFBX = new FBXLoader();

pemuatFBX.load(
    'model/wood/wood.fbx',

    function onLoad(objekFBX) {
        const kotakBatas = new THREE.Box3().setFromObject(objekFBX);
        const ukuran = new THREE.Vector3();
        kotakBatas.getSize(ukuran);

        const perluKonversi = ukuran.x > 10 || ukuran.z > 10;
        if (perluKonversi) {
            objekFBX.scale.setScalar(0.01);
            kotakBatas.setFromObject(objekFBX);
            kotakBatas.getSize(ukuran);
        }

        const bentukTShape =
            ukuran.x >= 0.3 && ukuran.x <= 3.0 &&
            ukuran.y >= 0.1 && ukuran.y <= 0.35 &&
            ukuran.z >= 2.5 && ukuran.z <= 6.0;

        if (bentukTShape) {
            objekFBX.traverse(function (anak) {
                if (anak.isMesh) {
                    anak.castShadow = true;
                    anak.receiveShadow = true;
                }
            });

            const pusatBatas = new THREE.Vector3();
            kotakBatas.getCenter(pusatBatas);
            const pusatTarget = new THREE.Vector3(1, 0.1, 1.5);
            objekFBX.position.copy(pusatTarget.clone().sub(pusatBatas));

            scene.add(objekFBX);
            tambahAnotasi();

        } else {
            let teksturDifus = null;

            objekFBX.traverse(function (anak) {
                if (anak.isMesh && !teksturDifus) {
                    const mat = Array.isArray(anak.material)
                        ? anak.material[0]
                        : anak.material;
                    if (mat && mat.map) {
                        teksturDifus = mat.map;
                    }
                }
            });

            if (teksturDifus) {
                buatStruktur(teksturDifus);
            } else {
                muatTeksturLangsung();
            }
        }
    },

    undefined,

    function onError(err) {
        console.warn('FBX gagal dimuat, menggunakan tekstur langsung:', err);
        muatTeksturLangsung();
    }
);

function muatTeksturLangsung() {
    const loader = new THREE.TextureLoader();
    const teksturWarna = loader.load('model/wood/wood.fbm/Color_A02.jpg');
    teksturWarna.wrapS = teksturWarna.wrapT = THREE.RepeatWrapping;
    buatStruktur(teksturWarna);
}

window.addEventListener('resize', function () {
    kamera.aspect = window.innerWidth / window.innerHeight;
    kamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererLabel.setSize(window.innerWidth, window.innerHeight);
});

function animasi() {
    requestAnimationFrame(animasi);
    kontrolOrbit.update();
    renderer.render(scene, kamera);
    rendererLabel.render(scene, kamera);
}

animasi();
