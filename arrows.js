let arrowSize = document.getElementById("arrowSize").value;
let arrowAmount = document.getElementById("arrowAmount").value;
let circleRadius = document.getElementById("circleRadius").value;

document
  .getElementById("arrowSize")
  .addEventListener("input", function (event) {
    arrowSize = event.target.value;
  });

document
  .getElementById("circleRadius")
  .addEventListener("input", function (event) {
    circleRadius = event.target.value;
  });

document
  .getElementById("arrowAmount")
  .addEventListener("input", function (event) {
    arrowAmount = event.target.value;
    generateArrows();
  });

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  animate();
});

let arrows = [];
generateArrows();

function generateArrows() {
  arrows = [];
  for (let i = 0; i < arrowAmount; i++) {
    arrows.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 0,
      maxSpeed: 0.5, // Slower speed
      angle: 0,
      targetX: Math.random() * canvas.width,
      targetY: Math.random() * canvas.height,
    });
  }
}

canvas.addEventListener("mousemove", function (event) {
  let rect = canvas.getBoundingClientRect();
  let mouseX = event.clientX - rect.left;
  let mouseY = event.clientY - rect.top;
  let radius = circleRadius;

  let totalArrows = arrows.length;
  let angleStep = (Math.PI * 2) / totalArrows;
  let availablePoints = Array.from({ length: totalArrows }, (_, i) => {
    let angle = i * angleStep;
    return {
      x: mouseX + radius * Math.cos(angle),
      y: mouseY + radius * Math.sin(angle),
    };
  });

  for (let arrow of arrows) {
    let closestPoint = availablePoints.reduce(
      (closest, point) => {
        let dx = arrow.x - point.x;
        let dy = arrow.y - point.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        return distance < closest.distance
          ? { distance, point }
          : closest;
      },
      { distance: Infinity }
    ).point;

    arrow.targetX = closestPoint.x;
    arrow.targetY = closestPoint.y;

    availablePoints = availablePoints.filter(
      (point) => point !== closestPoint
    );
  }
});

function drawArrow(arrow) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-arrowSize, -arrowSize * 2);
  ctx.lineTo(arrowSize, -arrowSize * 2);
  ctx.closePath();

  let hue = (arrow.y / canvas.height) * 360;
  ctx.fillStyle = `hsl(${hue}, 70%, 70%)`;
  ctx.fill();
}

function createGradientBackground() {
  let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#ffffcc");
  gradient.addColorStop(0.5, "#ffebcc");
  gradient.addColorStop(1, "#e6f2ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function repelArrows() {
  let repulsionThreshold = arrowSize * 5;
  for (let i = 0; i < arrows.length; i++) {
    for (let j = i + 1; j < arrows.length; j++) {
      let dx = arrows[i].x - arrows[j].x;
      let dy = arrows[i].y - arrows[j].y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < repulsionThreshold) {
        let angle = Math.atan2(dy, dx);
        let force = (repulsionThreshold - distance) / repulsionThreshold;
        let repulsionX = Math.cos(angle) * force;
        let repulsionY = Math.sin(angle) * force;

        arrows[i].xspeed += repulsionX;
        arrows[i].yspeed += repulsionY;
        arrows[j].xspeed -= repulsionX;
        arrows[j].yspeed -= repulsionY;
      }
    }
  }
}

function animate() {
  repelArrows();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  createGradientBackground();

  let maxProximity = 5;
  let accelerationFactor = 0.02; // Slower acceleration

  for (let arrow of arrows) {
    let dx = arrow.targetX - arrow.x;
    let dy = arrow.targetY - arrow.y;
    let distanceToCenter = Math.sqrt(dx * dx + dy * dy);

    let speedMultiplier = 1 + (1 - distanceToCenter / canvas.width) * 2;
    let desiredSpeed = arrow.maxSpeed * speedMultiplier;
    arrow.speed += (desiredSpeed - arrow.speed) * accelerationFactor;

    if (distanceToCenter < maxProximity) {
      arrow.speed *= distanceToCenter / maxProximity;
      if (distanceToCenter < 1) {
        arrow.speed = 0;
      }
    }

    let moveX = Math.cos(arrow.angle) * arrow.speed;
    let moveY = Math.sin(arrow.angle) * arrow.speed;

    let moveDistance = Math.sqrt(moveX * moveX + moveY * moveY);

    if (moveDistance > distanceToCenter) {
      arrow.x = arrow.targetX;
      arrow.y = arrow.targetY;
    } else {
      arrow.x += moveX;
      arrow.y += moveY;
    }

    arrow.angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(arrow.angle);
    drawArrow(arrow);
    ctx.restore();
  }

  requestAnimationFrame(animate);
}

animate();
