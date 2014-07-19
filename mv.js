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
var path = new kity.Path().fill(new kity.LinearGradientBrush().pipe(function() {
    this.addStop(0, kity.Color.createHSL(0, 80, 50));
    this.addStop(0.25, kity.Color.createHSL(90, 80, 50));
    this.addStop(0.5, kity.Color.createHSL(180, 80, 50));
    this.addStop(0.75, kity.Color.createHSL(270, 80, 50));
    paper.addResource(this);
}));
paper.addShape(path.setTranslate(0, 300));

var feqData;
function analysis() {
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.6;
    analyser.maxDecibels = 100;
    analyser.minDecibels = 0;
    feqData = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(feqData);
    path.setPathData(Array.prototype.map.call(feqData, function(value, index) {
        return ['M', index * 12, 0, 
            'v', -value, 'h', 8, 'v', value * 2, 'h', -8, 'v', -value];
    }));
    window.requestAnimationFrame(analysis, 0);
}


