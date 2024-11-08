const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const particleConfig = {
  count: 2000,
  life: { min: 3, max: 8 },
  speed: { min: 0.1, max: 1 },
  size: { min: 1, max: 3 },
  colors: ["#ffffff", "#ffe0b2", "#ffc107", "#ff9800"],
  attractDistance: 75,
  repelDistance: 5,
  mouseForce: 2,
  mouseRadius: 150,
  twinkle: true,
  twinkleSpeed: 0.05,
};

let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
let particles = [];

canvas.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

function createParticle(spawnAtMouse = false) {
  return {
    x: spawnAtMouse
      ? mouse.x + (Math.random() - 0.5) * 20
      : Math.random() * canvas.width,
    y: spawnAtMouse
      ? mouse.y + (Math.random() - 0.5) * 20
      : Math.random() * canvas.height,
    speed:
      Math.random() *
        (particleConfig.speed.max - particleConfig.speed.min) +
      particleConfig.speed.min,
    angle: Math.random() * 2 * Math.PI,
    life:
      Math.random() *
        (particleConfig.life.max - particleConfig.life.min) +
      particleConfig.life.min,
    size:
      Math.random() *
        (particleConfig.size.max - particleConfig.size.min) +
      particleConfig.size.min,
    color:
      particleConfig.colors[
        Math.floor(Math.random() * particleConfig.colors.length)
      ],
    opacity: 1,
    twinklePhase: Math.random() * 2 * Math.PI,
  };
}

for (let i = 0; i < particleConfig.count; i++) {
  particles.push(createParticle());
}

function drawParticles() {
  particles.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.opacity;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function updateParticles() {
  particles.forEach((p, index) => {
    let vx = Math.cos(p.angle) * p.speed;
    let vy = Math.sin(p.angle) * p.speed;

    let dx = p.x - mouse.x;
    let dy = p.y - mouse.y;
    let distanceToMouse = Math.sqrt(dx * dx + dy * dy);
    if (distanceToMouse < particleConfig.mouseRadius) {
      let forceDirectionX = dx / distanceToMouse;
      let forceDirectionY = dy / distanceToMouse;
      vx -= forceDirectionX * particleConfig.mouseForce;
      vy -= forceDirectionY * particleConfig.mouseForce;
    }

    particles.forEach((other, otherIndex) => {
      if (index !== otherIndex) {
        let dx = other.x - p.x;
        let dy = other.y - p.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (
          distance < particleConfig.attractDistance &&
          distance > particleConfig.repelDistance
        ) {
          vx += dx * 0.001;
          vy += dy * 0.001;
        } else if (distance <= particleConfig.repelDistance) {
          vx -= dx * 0.05;
          vy -= dy * 0.05;
        }
      }
    });

    p.x += vx;
    p.y += vy;

    if (p.x < 0 || p.x > canvas.width) p.angle = Math.PI - p.angle;
    if (p.y < 0 || p.y > canvas.height) p.angle = -p.angle;

    if (particleConfig.twinkle) {
      p.twinklePhase += particleConfig.twinkleSpeed;
      p.opacity = 0.5 + 0.5 * Math.sin(p.twinklePhase);
    }

    p.life -= 0.01;
    if (p.life <= 0) {
      particles[index] = createParticle(Math.random() < 0.5);
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawParticles();
}

function update() {
  updateParticles();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
