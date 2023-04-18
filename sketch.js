let blueCircle, greenCircle;
let blackCircles = [];
let isGameOver = false;
let isGameWon = false;
let port;
let data_x, data_y;
let accumulatedData = "";
let sword;


function setup() {
  createCanvas(1000, 600);
  blueCircle = new Circle(20, 20, 20, "blue");
  greenCircle = new Circle(width - 20, height - 20, 20, "green");
  sword = new Sword(blueCircle.x, blueCircle.y, 30, 0);



  for (let i = 0; i < 15; i++) {
    blackCircles.push(
      new Circle(random(width), random(height), 20, "black")
    );
  }

  let startButton = createButton("Start");
  startButton.mousePressed(() => {
    isGameOver = false;
    isGameWon = false;
    blueCircle.x = 20;
    blueCircle.y = 20;
  });

  //openSerialPort();
  let connectButton = createButton("Connect");
connectButton.mousePressed(openSerialPort);

}









async function openSerialPort() {
  if (port) {
    console.log("Serial port is already open.");
    return;
  }

  try {
    port = await navigator.serial.requestPort({});
    await port.open({ baudRate: 9600 });

    while (port.readable) {
      const reader = port.readable.getReader();

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const decodedData = new TextDecoder().decode(value);

          accumulatedData += decodedData;

          if (accumulatedData.includes("\n")) {
            const [validData] = accumulatedData.split("\n");
            const [x, y] = validData.split(",").map(Number);

            if (!isNaN(x) && !isNaN(y)) {
              data_x = x;
              data_y = y;
              console.log("Received data_x:", data_x, "data_y:", data_y);
            } else {
              console.log("Invalid data received:", validData);
            }

            accumulatedData = accumulatedData.substring(validData.length + 1);
          }
        }
      } catch (error) {
        console.error("Error reading data:", error);
      } finally {
        reader.releaseLock();
      }
    }
  } catch (error) {
    console.error("Error opening serial port:", error);
  }
}










function draw() {
  background(255);

  sword.updatePosition(blueCircle.x, blueCircle.y);
sword.show();

if (keyIsDown(90)) { // Add this block
  sword.rotateAround(radians(6)); // 6 is an arbitrary value, adjust it to control the rotation speed
}
if (keyIsDown(88)) { // Add this block
  sword.rotateAround(radians(-6)); // 6 is an arbitrary value, adjust it to control the rotation speed
}
  
  if (!isGameOver && !isGameWon) {
  // blueCircle.moveWithJoystick();
    blueCircle.moveWithArrowKeys();
  }

  blueCircle.show();
  greenCircle.show();

  for (let i = 0; i < blackCircles.length; i++) {
    blackCircles[i].show();
    if (!isGameOver && blueCircle.collidesWith(blackCircles[i])) {
      isGameOver = true;
    }
  }

  if (!isGameOver && blueCircle.collidesWith(greenCircle)) {
    isGameWon = true;
  }

  if (isGameOver) {
    textSize(32);
    textAlign(CENTER, CENTER);
    fill("red");
    text("Game Over! Press Start to try again", width / 2, height / 2);
  }

  if (isGameWon) {
    textSize(32);
    textAlign(CENTER, CENTER);
    fill("green");
    text("You Win! Press Start to play again", width / 2, height / 2);
  }

  for (let i = blackCircles.length - 1; i >= 0; i--) {
    const blackCircle = blackCircles[i];
    if (swordIntersectsCircle(sword, blackCircle)) {
      blackCircles.splice(i, 1);
    }
  }
}













class Circle {
  constructor(x, y, diameter, color) {
    this.x = x;
    this.y = y;
     this.vx = 0; // Add this line
    this.vy = 0; // Add this line
    this.diameter = diameter;
    this.color = color;
  }

  show() {
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.diameter);
  }



  moveWithJoystick() {
    if (data_x !== undefined && data_y !== undefined) {
      const acceleration = 0.3;
      const friction = 0.98;
      const gravity = 0;
  
      const joystickScale = 2;
  
      let mappedX = map(data_x, 0, 1023, -joystickScale, joystickScale);
      let mappedY = map(data_y, 0, 1023, -joystickScale, joystickScale);
  
      this.vx += mappedX * acceleration;
      this.vy += mappedY * acceleration;
  
      this.vx *= friction;
      this.vy *= friction;
      this.vy += gravity;
      this.x += this.vx;
      this.y += this.vy;
  
      // Boundaries
      if (this.x - this.diameter / 2 < 0) {
        this.x = this.diameter / 2;
        this.vx = 0;
      }
      if (this.x + this.diameter / 2 > width) {
        this.x = width - this.diameter / 2;
        this.vx = 0;
      }
      if (this.y - this.diameter / 2 < 0) {
        this.y = this.diameter / 2;
        this.vy = 0;
      }
      if (this.y + this.diameter / 2 > height) {
        this.y = height - this.diameter / 2;
        this.vy = 0;
      }
    }
  }
  
  
  
  
  
  
  
  


 moveWithArrowKeys() {
  const acceleration = 0.3;
  const friction = 0.98;
  const gravity = 0;

  if (keyIsDown(LEFT_ARROW)) {
    this.vx -= acceleration;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    this.vx += acceleration;
  }
  if (keyIsDown(UP_ARROW)) {
    this.vy -= acceleration;
  }
  if (keyIsDown(DOWN_ARROW)) {
    this.vy += acceleration;
  }

  this.vx *= friction;
  this.vy *= friction;
  this.vy += gravity;
  this.x += this.vx;
  this.y += this.vy;

  // Boundaries
  if (this.x - this.diameter / 2 < 0) {
    this.x = this.diameter / 2;
    this.vx = 0;
  }
  if (this.x + this.diameter / 2 > width) {
    this.x = width - this.diameter / 2;
    this.vx = 0;
  }
  if (this.y - this.diameter / 2 < 0) {
    this.y = this.diameter / 2;
    this.vy = 0;
  }
  if (this.y + this.diameter / 2 > height) {
    this.y = height - this.diameter / 2;
    this.vy = 0;
  }
}


  collidesWith(otherCircle) {
    let distanceBetween = dist(this.x, this.y, otherCircle.x, otherCircle.y);
    return distanceBetween < (this.diameter + otherCircle.diameter) / 2;
  }
}






class Sword {
  constructor(x, y, length, angle) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.angle = angle;
  }

  show() {
    strokeWeight(2);
    stroke(0);
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    line(0, 0, this.length, 0);
    pop();
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }

  rotateAround(angle) {
    this.angle += angle;
  }
}


function swordIntersectsCircle(sword, circle) {
  const x2 = sword.x + sword.length * cos(sword.angle);
  const y2 = sword.y + sword.length * sin(sword.angle);

  const d = dist(sword.x, sword.y, circle.x, circle.y);
  const d2 = dist(x2, y2, circle.x, circle.y);

  return (d < circle.diameter / 2) || (d2 < circle.diameter / 2);
}
