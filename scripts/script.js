const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const btn1 = document.getElementById("btn1");
const btn2 = document.getElementById("btn2");
const btn3 = document.getElementById("btn3");
const btn4 = document.getElementById("btn4");

const btnsubmit = document.getElementById("submit")

const buttons = [btn1, btn2, btn3, btn4, btnsubmit];

// TODO - make it so that there can be a const n_plants

// Defaults
const defaultAngle = 28;
const defaultIter = 4;
const defaultStep = 6;
const defaultHue = 2;
const defaultPDF = [0.15, 0.45, 0.4]
const defaultLeafSize = 10;
const defaultFlowerSize = 8;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ----------------------------
// L-SYSTEM CONFIG
// ----------------------------

function generateLSystem(axiom, rules, iterations) {
  let current = axiom;

  for (let i = 0; i < iterations; i++) {
    let next = "";
    for (let char of current) {
      next += rules[char] || char;
    }
    current = next;
  }

  return current;
}

// ----------------------------
// DRAW FUNCTION
// ----------------------------

function drawLSystem({
  startX = canvas.width / 2,
  angle = defaultAngle,
  iterations = defaultIter,
  step = defaultStep,
  hue = defaultHue,
  bloomPDF = defaultPDF,
  leafSize = defaultLeafSize,
  flowerSize = defaultFlowerSize
}) {
  
  // Done outside of the function now.
  // ctx.clearRect(0, 0, canvas.width, canvas.height);

  const axiom = "X";
  const rules = {
    "X": "F-[[X]+X]+F[+FX]-X",
    "F": "FF"
  };

  const instructions = generateLSystem(axiom, rules, iterations);

  let stack = [];
  let x = startX // canvas.width / 2;
  let y = canvas.height - 60; // Plants up by 50px
  let currentAngle = -90 + (Math.random() - 0.5) * 10;
  let currentStep = step;

  ctx.lineCap = "round";

  let tips = []; // array para guardar extremos

  for (let char of instructions) {

    if (char === "F") {
      const newX = x + currentStep * Math.cos(currentAngle * Math.PI / 180);
      const newY = y + currentStep * Math.sin(currentAngle * Math.PI / 180);

      /* ctx.strokeStyle = `hsl(30, 60%, 45%)`; //ctx.strokeStyle = `hsl(${hue}, 60%, 45%)`;
      ctx.lineWidth = Math.max(1, iterations - 1); */
      ctx.lineWidth = Math.max(1, currentStep * 0.5); // más gruesas al inicio
      ctx.strokeStyle = `hsl(92, 98%, ${37 + Math.random() * 20}%)`; // ctx.strokeStyle = `hsl(120, 60%, ${50 + Math.random() * 20}%)`; // variación de luminosidad
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(newX, newY);
      ctx.stroke();

      x = newX;
      y = newY;

    } else if (char === "+") {
      currentAngle += angle + (Math.random() - 0.5) * 15;

    } else if (char === "-") {
      currentAngle -= angle + (Math.random() - 0.5) * 15;

    /*
    } else if (char === "[") {
      stack.push({ x, y, currentAngle, currentStep });

    } else if (char === "]") {
      const state = stack.pop();
      x = state.x;
      y = state.y;
      currentAngle = state.currentAngle;
      currentStep = state.currentStep;

      // Dibujar pétalo en extremos
      drawPetal(x, y, hue); */
    } else if (char === "[") {
      stack.push({ x, y, currentAngle, currentStep });
    } else if (char === "]") {
      let state = stack.pop();
      tips.push({x: state.x, y: state.y});
      x = state.x;
      y = state.y;

      currentAngle = state.currentAngle;
      currentStep = state.currentStep;
    }
  }

  for (let tip of tips) {

    let chance = Math.random()

    // PDF = bloomPDF
    if (chance < bloomPDF[0]) {
      drawLeaf(tip.x, tip.y, leafSize);
    } else if (chance < bloomPDF[0] + bloomPDF[1]) {
      continue
    } else {
      drawPetal(tip.x, tip.y, hue, flowerSize);
    }

    // drawPetal(tip.x, tip.y, hue);
  }

  return [angle,
          iterations,
          step,
          hue,
          bloomPDF,
          leafSize,
          flowerSize]
}

// ----------------------------
// PETALS & LEAVES
// ----------------------------

const flowerImg = new Image();
flowerImg.src = "images/flower.png";

const leafImg = new Image();
leafImg.src = "images/leaf.png"

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

// Generate random angle for the leaf, since it starts at a weird angle
function randomAngle() {
  if (Math.random() < 0.5) {
    return randomBetween(-90, 0);
  } else {
    return randomBetween(90, 180);
  }
}

// Draw a leaf :)
function drawLeaf(x, y, leafSize) {
  let size = Math.max(0, leafSize + Math.floor((Math.random() - 0.5) * 4));
  let angleRads = randomAngle() * Math.PI / 180

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRads);
  ctx.drawImage(leafImg, 0 - size * 2, 0 - size * 2, size * 2, size * 2); 
  ctx.restore();
}

// Draw a flower. Used to just be a petal, hence the name. I just haven't changed the name yet
function drawPetal(x, y, hue, flowerSize) {
  let size = Math.max(0, flowerSize + Math.floor((Math.random() - 0.5) * 8)); // Sometimes range can go less than 0
  let radius = size / 1.5

  // Petals themselves
  ctx.fillStyle = `hsl(${hue}, 80%, 65%)`;
  ctx.beginPath();
  ctx.ellipse(x, y, radius, radius / 2, 0 + radius, 0, Math.PI * 2);
  ctx.ellipse(x, y, radius, radius / 2, 90 + radius, 0, Math.PI * 2);
  ctx.ellipse(x, y, radius, radius / 2, 180 + radius, 0, Math.PI * 2);
  ctx.fill();

  // Makes the yellow center of the flower
  ctx.fillStyle = `hsl(60, 80%, 65%)`;
  ctx.beginPath();
  ctx.arc(x, y, radius / 3, 0, Math.PI * 2);
  ctx.fill();
}

// ----------------------------
// START
// ----------------------------

function rangeExclusive(a, b, n) {
  const step = (b - a) / n;
  return Array.from({ length: n }, (_, i) => a + i * step);
}

let numFlowers = 4
let a = canvas.width / (numFlowers + 1);
let flowerSpots = rangeExclusive(a, canvas.width, numFlowers);

function randomPopulation() {
  let population = []
  for (let i = 0; i < 4; i++) {
      population.push([defaultAngle + (Math.random() - 0.5) * 20, // Angle
                       defaultIter + Math.round((Math.random() - 0.5) * 2), // Iter
                       defaultStep + Math.round(Math.random() - 0.5) * 2, // Step
                       Math.floor(Math.random() * 360), // Random color instead of default
                       defaultPDF, // PDF
                       defaultLeafSize, // Leaf Size
                       defaultFlowerSize]) // Flower Size
  };

  return population
};

function drawNewFlowers(population) {
  let garden = [];

  if (population.length != 4) {
    population = randomPopulation()
  };

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (i in flowerSpots) {
    let plant = drawLSystem({
      startX: flowerSpots[i],
      angle: population[i][0],// 28 + (Math.random() - 0.5) * 20,
      iterations: population[i][1], //5 + Math.floor((Math.random() - 0.5) * 2),
      step: population[i][2], //7 + (Math.random() - 0.5) * 4,
      hue: population[i][3], //Math.floor(Math.random() * 360)
      bloomPDF: population[i][4],
      leafSize: population[i][5],
      flowerSize: population[i][6]
    });

    garden.push(plant)
  }

  return garden
};

function handleClick(btn) {
  let img = btn.currentTarget.querySelector("img");

  btn.currentTarget.classList.toggle("selected");
  //btn.classList.toggle("selected");

  if (btn.currentTarget.classList.contains("selected")) {
    img.src = "images/selected.png";
  } else {
    img.src = "images/unselected.png";
  }
}

function chooseParents(currentPopulation) {

  let parents = [];

  canvas.classList.add("disabled");
  buttons.forEach(btn => btn.hidden = false);

  btn1.style.left = flowerSpots[0] - 20 + "px";
  btn2.style.left = flowerSpots[1] - 20 + "px";
  btn3.style.left = flowerSpots[2] - 20 + "px";
  btn4.style.left = flowerSpots[3] - 20 + "px";

  buttons.slice(0, -1).forEach(btn => btn.addEventListener("click", handleClick));

  btnsubmit.onclick = () => {
    
    
  };

  return new Promise(resolve => {
    btnsubmit.onclick = () => {
      let buttonsPressed = []
      buttons.slice(0, -1).forEach(btn => {
        if (btn.classList.value == "selected") {
          buttonsPressed.push(1)
        } else {
          buttonsPressed.push(0)
        }
      });

      buttons.forEach(btn => btn.hidden = true);
      buttons.forEach(btn => btn.classList.remove("selected"));
      buttons.slice(0, -1).forEach(btn => btn.querySelector("img").src = "images/unselected.png");

      canvas.classList.remove("disabled");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      buttons.forEach(btn => btn.removeEventListener("click", handleClick));

      for (i in currentPopulation) {
        if (buttonsPressed[i] == 1) {
          parents.push(currentPopulation[i])
        }
      }

      resolve(makeBabies(parents));
    }, { once: true };
  });

};

function makeBabies(parents) {
  let babies = [];

  if (parents.length == 0) {
    return randomPopulation()
  }

  while (parents.length + babies.length < 4) {
    let randomParent = parents[Math.floor(Math.random() * parents.length)];
    let babyGenome = [];

    // TODO - DONT add guidelines so kids can get out of hand :)

    // First element is angle. Inherited plus a little randomness
    babyGenome.push(randomParent[0] + (Math.random() - 0.5) * 20)

    // Second is iterations. Can't have too many. Just gonna keep this constant for now
    // Lemme try changing this one
    // babyGenome.push(5 + Math.floor((Math.random() - 0.5) * 2))
    babyGenome.push(Math.max(1, randomParent[1] + Math.round((Math.random() - 0.5) * 2)))

    // Third is steps. Don't want too many here either, keep it constant for testing for now.
    // Lemme try changing this one too
    // babyGenome.push(7 + (Math.random() - 0.5) * 4)
    babyGenome.push(Math.max(1, randomParent[2] + Math.round((Math.random() - 0.5) * 2)))

    // Fourth is hue. If more than one parent, then randomly choose a second parent and avg their color
    // Could choose the same parent again, or could have a central color...
    // Still randomize afterwards
    if (parents.length > 1) {
      let randomParent2 = parents[Math.floor(Math.random() * parents.length)];
      let avgColor = (randomParent[3] + randomParent2[3]) / 2
      babyGenome.push(avgColor + (Math.random() - 0.5) * 40)
    } else {
      babyGenome.push(randomParent[3] + (Math.random() - 0.5) * 40)
    }

    // Fifth is the PDF of nothing, leaf, flower (in that order).
    let babyPDF = randomParent[4].slice();
    let multiplier = 1.5;
    let randomChance = Math.random() * 2;
    if (randomChance < 0.6) {
      if (randomChance < 0.2) {
        babyPDF[0] = babyPDF[0] * multiplier;
      } else if (randomChance < 0.4) {
        babyPDF[1] = babyPDF[1] * multiplier;
      } else {
        babyPDF[2] = babyPDF[2] * multiplier;
      }
    }
    let sum = babyPDF.reduce((acc, val) => acc + val, 0);
    babyPDF = babyPDF.map(val => val / sum);
    babyGenome.push(babyPDF)

    // Sixth is leaf size. Plus or minus 2 of parent, not gonna add a limit for fun.
    babyGenome.push(Math.max(0, randomParent[5] + (Math.random() - 0.5) * 4))

    // Seventh is flower size. Same as leaf size
    babyGenome.push(Math.max(0, randomParent[6] + (Math.random() - 0.5) * 4))


    // That's it
    babies.push(babyGenome)
  }

  let newPopulation = parents.concat(babies)
  return newPopulation
};

let currentPopulation = randomPopulation()

// On click, grow and choose parents again
canvas.addEventListener("click", async () => {
  console.log(currentPopulation)
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawNewFlowers(currentPopulation);

  currentPopulation = await chooseParents(currentPopulation)
});