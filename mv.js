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

function play () {
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


