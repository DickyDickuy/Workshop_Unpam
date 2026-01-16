const canvas = document.getElementById('ditherCanvas');
const ctx = canvas.getContext('2d');

const config = {
    waveColor: [36, 255, 80], 
    pixelSize: 2,
    waveAmplitude: 0.3,
    waveFrequency: 3,
    waveSpeed: 0.05,
    mouseRadius: 150, 
    colorNum: 4,
    vignetteStrength: 1.5 
};

let time = 0;
let mouse = { x: -1000, y: -1000 };

function resize() {
    canvas.width = window.innerWidth / config.pixelSize;
    canvas.height = window.innerHeight / config.pixelSize;
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX / config.pixelSize;
    mouse.y = e.clientY / config.pixelSize;
});

resize();

function animate() {
    time += config.waveSpeed;
    
    // Clear background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            // Calculate Wave Logic
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Interaction influence
            const mouseInfluence = Math.exp(-dist / (config.mouseRadius / config.pixelSize));
            
            // Sine wave pattern
            const wave = Math.sin(x * 0.05 * config.waveFrequency + time) * Math.cos(y * 0.05 * config.waveFrequency + time) * config.waveAmplitude;

            // Combine and Quantize (Dithering effect)
            let brightness = (wave + mouseInfluence);
            brightness = Math.floor(brightness * config.colorNum) / config.colorNum;

            // Vignette effect - distance from center
            const vignetteDx = x - centerX;
            const vignetteDy = y - centerY;
            const vignetteDist = Math.sqrt(vignetteDx * vignetteDx + vignetteDy * vignetteDy);
            const vignetteRatio = vignetteDist / maxDist;
            
            // Stronger vignette at corners (power of 2.5 for more aggressive falloff)
            const vignette = 1 - Math.pow(vignetteRatio, 2.5) * config.vignetteStrength;
            const vignetteFactor = Math.max(0, Math.min(1, vignette));
            
            // Apply vignette to brightness
            brightness *= vignetteFactor;

            const index = (y * canvas.width + x) * 4;
            data[index] = config.waveColor[0] * brightness;     // R
            data[index + 1] = config.waveColor[1] * brightness; // G
            data[index + 2] = config.waveColor[2] * brightness; // B
            data[index + 3] = 255;                              // A
        }
    }

    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(animate);
}

animate();
