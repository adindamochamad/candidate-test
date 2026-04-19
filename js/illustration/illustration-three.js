import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// =========================================
// SETUP SCENE DASAR
// =========================================

// Scene dengan latar belakang hitam seperti referensi
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Kamera perspektif — posisi negatif X dan Z agar sumbu +X tampil ke kiri-bawah
// dan +Z tampil ke kanan-bawah (sesuai gambar referensi)
const kamera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
kamera.position.set(-5, 4, -5);
kamera.lookAt(1, 0, 1.5);

// Renderer utama dengan antialiasing dan shadow
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Renderer khusus untuk label CSS2D (dimensi teks)
const rendererLabel = new CSS2DRenderer();
rendererLabel.setSize(window.innerWidth, window.innerHeight);
rendererLabel.domElement.style.position = 'absolute';
rendererLabel.domElement.style.top = '0px';
rendererLabel.domElement.style.pointerEvents = 'none';
document.body.appendChild(rendererLabel.domElement);

// Kontrol orbit agar bisa diputar dan di-zoom
const kontrolOrbit = new OrbitControls(kamera, renderer.domElement);
kontrolOrbit.enableDamping = true;
kontrolOrbit.dampingFactor = 0.05;
kontrolOrbit.target.set(1, 0, 1.5);

// =========================================
// PENCAHAYAAN
// =========================================

// Cahaya ambient untuk pencahayaan dasar yang merata
const cahayaAmbient = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(cahayaAmbient);

// Cahaya utama dari sudut kiri-atas belakang (menghasilkan bayangan di kanan-bawah)
const cahayaUtama = new THREE.DirectionalLight(0xffffff, 1.4);
cahayaUtama.position.set(-4, 8, -3);
cahayaUtama.castShadow = true;
cahayaUtama.shadow.mapSize.set(2048, 2048);
cahayaUtama.shadow.camera.near = 0.5;
cahayaUtama.shadow.camera.far = 30;
cahayaUtama.shadow.camera.left = -6;
cahayaUtama.shadow.camera.right = 8;
cahayaUtama.shadow.camera.top = 6;
cahayaUtama.shadow.camera.bottom = -6;
scene.add(cahayaUtama);

// Cahaya isi dari depan-kanan agar bagian sisi tidak terlalu gelap
const cahayaIsi = new THREE.DirectionalLight(0xffffff, 0.35);
cahayaIsi.position.set(3, 2, 3);
scene.add(cahayaIsi);

// =========================================
// SUMBU KOORDINAT
// =========================================

// Menampilkan helper sumbu X (merah), Y (hijau), Z (biru) seperti pada referensi.
// Diletakkan di pojok kanan-jauh papan kanan (X=0.75, Z=4) agar tampak di sudut
// kanan-bawah gambar, persis seperti pada gambar referensi.
const sumbuHelper = new THREE.AxesHelper(1.5);
sumbuHelper.position.set(0.75, 0, 4);
scene.add(sumbuHelper);

// =========================================
// FUNGSI BANTU ANOTASI DIMENSI
// =========================================

// Membuat label teks dimensi yang mengambang di ruang 3D
function buatLabelDimensi(teks, posisi) {
    const div = document.createElement('div');
    div.textContent = teks;
    div.style.cssText = [
        'color: white',
        'font-size: 13px',
        'font-family: Arial, sans-serif',
        'font-weight: bold',
        'white-space: nowrap',
        'text-shadow: 1px 1px 3px rgba(0,0,0,0.9)',
        'pointer-events: none',
    ].join(';');

    const objLabel = new CSS2DObject(div);
    objLabel.position.copy(posisi);
    scene.add(objLabel);
}

// Membuat titik kecil putih di ujung garis dimensi
function buatTitikDimensi(posisi) {
    const geo = new THREE.BoxGeometry(0.04, 0.04, 0.04);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const titik = new THREE.Mesh(geo, mat);
    titik.position.copy(posisi);
    scene.add(titik);
}

// Membuat garis putih penghubung dua titik dimensi
function buatGarisDimensi(dari, ke) {
    const geo = new THREE.BufferGeometry().setFromPoints([dari, ke]);
    const mat = new THREE.LineBasicMaterial({ color: 0xffffff });
    const garis = new THREE.Line(geo, mat);
    scene.add(garis);
}

// Menggabungkan pembuatan titik, garis, dan label sekaligus
function buatAnotasiLengkap(teks, titik1, titik2, posisiLabel) {
    buatTitikDimensi(titik1);
    buatTitikDimensi(titik2);
    buatGarisDimensi(titik1, titik2);
    buatLabelDimensi(teks, posisiLabel);
}

// =========================================
// PEMBANGUNAN STRUKTUR KAYU
// =========================================

// Ketinggian semua papan kayu = 0.2m
const tinggiPapan = 0.2;

// Koordinat struktur (berdasarkan gambar referensi):
//   Papan kiri   : X:0–2, Y:0–0.2, Z:-1–1   (2m × 0.2m × 2m)
//   Papan kanan  : X:0.75–1.25, Y:0–0.2, Z:1–4   (0.5m × 0.2m × 3m)
//   Step sambungan : X:0.8–1.2, Y:0.2–0.22, Z:0.75–1.25

function buatStrukturKayu(material) {
    // Papan kiri lebar: 2m(X) × 0.2m(Y) × 2m(Z)
    const geoPapanKiri = new THREE.BoxGeometry(2, tinggiPapan, 2);
    const meshPapanKiri = new THREE.Mesh(geoPapanKiri, material);
    meshPapanKiri.position.set(1, tinggiPapan / 2, 0);
    meshPapanKiri.castShadow = true;
    meshPapanKiri.receiveShadow = true;
    scene.add(meshPapanKiri);

    // Papan kanan sempit panjang: 0.5m(X) × 0.2m(Y) × 3m(Z)
    const geoPapanKanan = new THREE.BoxGeometry(0.5, tinggiPapan, 3);
    const meshPapanKanan = new THREE.Mesh(geoPapanKanan, material);
    meshPapanKanan.position.set(1, tinggiPapan / 2, 2.5);
    meshPapanKanan.castShadow = true;
    meshPapanKanan.receiveShadow = true;
    scene.add(meshPapanKanan);

    // Step kecil di titik sambungan antar papan: 0.4m(X) × 0.02m(Y) × 0.5m(Z)
    const geoStep = new THREE.BoxGeometry(0.4, 0.02, 0.5);
    const meshStep = new THREE.Mesh(geoStep, material);
    meshStep.position.set(1, tinggiPapan + 0.01, 1);
    meshStep.castShadow = true;
    meshStep.receiveShadow = true;
    scene.add(meshStep);

    // Tambahkan semua anotasi dimensi
    tambahSemuaAnotasi();
}

// =========================================
// ANOTASI DIMENSI SESUAI GAMBAR REFERENSI
// =========================================

function tambahSemuaAnotasi() {
    const t = tinggiPapan; // 0.2

    // --- Papan kiri ---

    // "2m" — lebar X papan kiri (edge atas, sisi Z = -1)
    buatAnotasiLengkap(
        '2m',
        new THREE.Vector3(0, t, -1),
        new THREE.Vector3(2, t, -1),
        new THREE.Vector3(1, t + 0.15, -1.25)
    );

    // "2m" — kedalaman Z papan kiri (edge kiri X = 0, atas)
    buatAnotasiLengkap(
        '2m',
        new THREE.Vector3(0, t, -1),
        new THREE.Vector3(0, t, 1),
        new THREE.Vector3(-0.35, t + 0.1, 0)
    );

    // "0.2m" — ketinggian papan kiri (edge depan-kanan X=2, Z=-1)
    buatAnotasiLengkap(
        '0.2m',
        new THREE.Vector3(2, 0, -1),
        new THREE.Vector3(2, t, -1),
        new THREE.Vector3(2.12, t / 2, -1.1)
    );

    // --- Papan kanan ---

    // "3m" — panjang Z papan kanan (edge atas, sisi X = 0.75)
    buatAnotasiLengkap(
        '3m',
        new THREE.Vector3(0.75, t, 1),
        new THREE.Vector3(0.75, t, 4),
        new THREE.Vector3(0.5, t + 0.15, 2.5)
    );

    // "0.5m" — lebar X papan kanan (edge ujung Z = 4, atas)
    buatAnotasiLengkap(
        '0.5m',
        new THREE.Vector3(0.75, t, 4),
        new THREE.Vector3(1.25, t, 4),
        new THREE.Vector3(1, t + 0.15, 4.2)
    );

    // "0.2m" — ketinggian papan kanan (edge kanan X = 1.25, Z = 4)
    buatAnotasiLengkap(
        '0.2m',
        new THREE.Vector3(1.25, 0, 4),
        new THREE.Vector3(1.25, t, 4),
        new THREE.Vector3(1.35, t / 2, 4.1)
    );

    // --- Step sambungan ---

    // "0.4m" — lebar X step (edge atas step, sisi Z = 0.75)
    buatAnotasiLengkap(
        '0.4m',
        new THREE.Vector3(0.8, t + 0.02, 0.75),
        new THREE.Vector3(1.2, t + 0.02, 0.75),
        new THREE.Vector3(1, t + 0.13, 0.65)
    );

    // "0.02m" — ketinggian step (edge kanan X = 1.2, Z = 0.75)
    buatAnotasiLengkap(
        '0.02m',
        new THREE.Vector3(1.2, t, 0.75),
        new THREE.Vector3(1.2, t + 0.02, 0.75),
        new THREE.Vector3(1.28, t + 0.01, 0.65)
    );

    // --- Dimensi bawah (bottom face) ---

    // "0.5m" — bagian kiri bawah (Z dari 1 ke 0.5, edge X = 0)
    buatAnotasiLengkap(
        '0.5m',
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, 0.5),
        new THREE.Vector3(-0.25, -0.05, 0.75)
    );

    // "0.54m" — bagian tengah bawah (Z dari 0.5 ke -0.04, edge X = 0)
    buatAnotasiLengkap(
        '0.54m',
        new THREE.Vector3(0, 0, 0.5),
        new THREE.Vector3(0, 0, -0.04),
        new THREE.Vector3(-0.28, -0.05, 0.23)
    );

    // "0.5m" — lebar X papan kanan dilihat dari bawah (X dari 0.75 ke 1.25, Z = 4)
    buatAnotasiLengkap(
        '0.5m',
        new THREE.Vector3(0.75, 0, 4),
        new THREE.Vector3(1.25, 0, 4),
        new THREE.Vector3(0.9, -0.1, 4.2)
    );
}

// =========================================
// MEMUAT MODEL FBX DAN MATERIAL KAYU
// =========================================

const pemuatFBX = new FBXLoader();

pemuatFBX.load(
    'model/wood/wood.fbx',
    function (objekFBX) {
        let materialKayu = null;

        // Menelusuri semua node dalam FBX untuk menemukan material kayu
        objekFBX.traverse(function (anak) {
            if (anak.isMesh && !materialKayu) {
                materialKayu = Array.isArray(anak.material)
                    ? anak.material[0]
                    : anak.material;
            }
        });

        if (materialKayu) {
            // Mengaktifkan pengulangan tekstur agar tampil lebih natural
            if (materialKayu.map) {
                materialKayu.map.wrapS = THREE.RepeatWrapping;
                materialKayu.map.wrapT = THREE.RepeatWrapping;
            }
            if (materialKayu.normalMap) {
                materialKayu.normalMap.wrapS = THREE.RepeatWrapping;
                materialKayu.normalMap.wrapT = THREE.RepeatWrapping;
            }
            buatStrukturKayu(materialKayu);
        } else {
            // Tidak ada material di FBX — pakai tekstur langsung
            buatDenganTeksturLangsung();
        }
    },
    undefined,
    function (kesalahan) {
        // Fallback jika FBX gagal dimuat
        console.warn('FBX gagal dimuat, mencoba tekstur langsung:', kesalahan);
        buatDenganTeksturLangsung();
    }
);

// Fallback: memuat tekstur kayu secara langsung tanpa FBX
function buatDenganTeksturLangsung() {
    const pemuatTekstur = new THREE.TextureLoader();

    const teksturWarna = pemuatTekstur.load('model/wood/wood.fbm/Color_A02.jpg');
    const teksturNormal = pemuatTekstur.load('model/wood/wood.fbm/NormalMap.png');

    teksturWarna.wrapS = THREE.RepeatWrapping;
    teksturWarna.wrapT = THREE.RepeatWrapping;
    teksturNormal.wrapS = THREE.RepeatWrapping;
    teksturNormal.wrapT = THREE.RepeatWrapping;

    const material = new THREE.MeshStandardMaterial({
        map: teksturWarna,
        normalMap: teksturNormal,
        roughness: 0.85,
        metalness: 0.0,
    });

    // Struktur langsung dibangun; tekstur akan otomatis teraplikasi saat selesai dimuat
    buatStrukturKayu(material);
}

// =========================================
// RESIZE HANDLER
// =========================================

window.addEventListener('resize', function () {
    kamera.aspect = window.innerWidth / window.innerHeight;
    kamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererLabel.setSize(window.innerWidth, window.innerHeight);
});

// =========================================
// LOOP ANIMASI
// =========================================

function animasi() {
    requestAnimationFrame(animasi);
    kontrolOrbit.update();
    renderer.render(scene, kamera);
    // Merender label CSS di atas canvas utama
    rendererLabel.render(scene, kamera);
}

animasi();
