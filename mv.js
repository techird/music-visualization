/*jshint browser: true*/

var AudioContext = window.AudioContext || window.webkitAudioContext;

var appleZone = document.getElementById('apple-zone');
var audio = document.getElementById('apple-src');
var timing = document.getElementById('apple-timing');
var playButton = document.getElementById('play-button');
var pauseButton = document.getElementById('pause-button');

var ctx = new AudioContext();
var src = ctx.createMediaElementSource(audio);
var analyser = ctx.createAnalyser();

src.connect(analyser);
analyser.connect(ctx.destination);

function enable(element, yes) {
    if (yes !== false) {
        element.removeAttribute('disabled');
    } else {
        element.setAttribute('disabled', 'disabled');
    }
}

function play() {
    audio.currentTime = timing.value;
    audio.play();
    enable(playButton, false);
    enable(pauseButton);
}


function pause() {
    audio.pause();
    enable(playButton);
    enable(pauseButton, false);
}

playButton.onclick = play;
pauseButton.onclick = pause;

audio.oncanplay = function() {
    enable(appleZone);
    analysis();
    Animate3d();
    timing.max = audio.duration;
};

audio.ontimeupdate = function() {
    timing.value = audio.currentTime;
};

timing.oninput = function() {
    audio.currentTime = timing.value;
};

var paper = new kity.Paper(document.getElementById('visualization'));
var path = new kity.Path().stroke('red', 2);
paper.addShape(path);

function analysis() {
    var feqData = new Uint8Array(1024);
    analyser.fftSize = 2048;
    analyser.getByteTimeDomainData(feqData);
    path.setPathData(['M', Array.prototype.map.call(feqData, function(value, index) {
        return [index + 10, value];
    })]);
    window.requestAnimationFrame(analysis, 0);
}


//旋转的枪
var Animate3d = function() {

};
var WIDTH = document.documentElement.offsetWidth || 800,
    HEIGHT = document.documentElement.clientHeight || 600;
var scene = new THREE.Scene();
/* 摄像头 */
var VIEW_ANGLE = 75,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 2000;
var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
camera.position.set(0, 0, 100);
scene.add(camera);
/* 渲染器 */
var renderer = new THREE.WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);
document.body.appendChild(renderer.domElement);
var loader = new THREE.JSONLoader(true);
loader.load("weapon.js", function(geometry) {
    var imgloader = new THREE.TextureLoader();
    imgloader.load('weapon.png', function(texture) {
        /* 显示对象 */
        var material = new THREE.MeshBasicMaterial({
                color: '#fbf279',
                map: texture
            }),
            obj;
        obj = new THREE.Mesh(geometry, material);
        obj.position.set(0, 0, 0);
        scene.add(obj);
        var dir = 1;
        Animate3d = function() {
            var feqData = new Uint8Array(1);
            analyser.fftSize = 32;
            analyser.getByteTimeDomainData(feqData);
            obj.rotation.y += dir * feqData[0] / 10000;
            if (obj.rotation.y >= Math.PI) {
                obj.rotation.y = Math.PI;
                dir = -1;
            } else if (obj.rotation.y <= 0) {
                obj.rotation.y = 0;
                dir = 1;
            }
            obj.position.y = (feqData[0] - 128) * 2;
            window.setTimeout(Animate3d, 0);
            var ballgeo = new THREE.SphereGeometry(10);
            var ballmaterial = new THREE.MeshBasicMaterial({
                color: '#fbf279',
                map: texture
            });
            var bullet = new THREE.Mesh(ballgeo, ballmaterial);
            var bulletAnimate = function() {
                bullet.CR += 5;
                bullet.position.set(bullet.CR * Math.cos(bullet.CRotation), bullet.position.y, -bullet.CR * Math.sin(bullet.CRotation));
                window.requestAnimationFrame(bulletAnimate);
            }
            bullet.CR = 50;
            bullet.CRotation = obj.rotation.y;
            bullet.position.set(100 * Math.cos(obj.rotation.y), obj.position.y + 15, -100 * Math.sin(obj.rotation.y));
            scene.add(bullet);
            window.requestAnimationFrame(bulletAnimate);
            renderer.render(scene, camera);
        }
    });
});