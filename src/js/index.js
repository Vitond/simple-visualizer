const audioInputElement = document.getElementById('audioInput');
const toolbarElement = document.getElementById('toolbar');
let audioElement = null;
let audioContext = null;
const canvas = document.getElementById('canvas');

document.addEventListener('keydown', (e) => {
    if (e.key === "k") {
        toolbarElement.classList.toggle('hidden');
    }
})

audioInputElement.addEventListener('change', (e) => {
    if (audioContext) {
        audioContext.close();
    }
    if (audioElement) {
        toolbarElement.removeChild(audioElement);
    }
    audioContext = new AudioContext();
    audioElement = null;
    const urlObj = URL.createObjectURL(e.target.files[0]);
    audioElement = new Audio(urlObj)
    audioElement.addEventListener("canplaythrough", () => {
        onAudioLoad(urlObj);
    });
    toolbarElement.appendChild(audioElement);
    audioElement.controls = "true";
    audioElement.src = urlObj;
});

const onResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = `100%`
    canvas.style.height = `100%`
};
onResize();
window.addEventListener('resize', onResize);

//ANALYSIS
let analyser;
let source;
let barCount;
let dataArray;
const onAudioLoad = (urlObj) => {
    source = audioContext.createMediaElementSource(audioElement);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;
    barCount = analyser.frequencyBinCount;
    dataArray = new Uint8Array(barCount);

    source.connect(analyser);
    source.connect(audioContext.destination)
    URL.revokeObjectURL(urlObj);

    window.requestAnimationFrame(draw);
}

//DRAWING
const ctx = canvas.getContext('2d');

let i = 0;
const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    analyser.getByteFrequencyData(dataArray);
    if (i % 10 === 0) {
        console.log(dataArray);
    }
    ctx.fillStyle = "white";
    let barWidth = canvas.width / barCount;
    let x = 0;
    for (let j = 0; j < barCount; j++) {
        let barHeight = dataArray[j];
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth;
    }
    i++;
    window.requestAnimationFrame(draw);
}
