let blueCircle, greenCircle;
let blackCircles = [];
let isGameOver = false;
let isGameWon = false;
let port;
let data_x, data_y;
let accumulatedData = "";
let sword;
let playerImage;
let greenProjectiles = [];
let greenCircleImg, blackCircleImg;

function preload() {
  playerImage = loadImage("player.png");
  greenCircleImg = loadImage("npc1.png");
  //blackCircleImg = loadImage("path/to/black_circle_pixel_art.png");
}

function setup() {
  createCanvas(900, 500);
  blueCircle = new Circle(20, 20, 20, "blue");
  greenCircle = new CircleSprite(width - 20, height - 20, 20, "green", greenCircleImg);
  sword = new Sword(blueCircle.x, blueCircle.y, 35, -1);



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

  
  //let connectButton = createButton("Connect");
//connectButton.mousePressed(openSerialPort);

}





//async function for joystick

/*

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

*/








function draw() {
  background(255);
 // Draw the player
 image(playerImage, blueCircle.x-20, blueCircle.y-15);

  sword.updatePosition(blueCircle.x+12, blueCircle.y+5);
  sword.show();
 // blueCircle.updateSpritePosition();
greenCircle.updateSpritePosition();
  blueCircle.show();
  greenCircle.show();

  for (let i = 0; i < greenProjectiles.length; i++) {
    greenProjectiles[i].show();
    greenProjectiles[i].move();
  }
if (kb.pressing('x')) { 
  sword.rotateAround(radians(200)); // 6 is an arbitrary value, adjust it to control the rotation speed
}
if (kb.pressing('z')) { 
  sword.rotateAround(radians(-200)); // 6 is an arbitrary value, adjust it to control the rotation speed
}
  
  if (!isGameOver && !isGameWon) {
  // blueCircle.moveWithJoystick();
    blueCircle.moveWithArrowKeys();
  }

 

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
    text("Game Over! Press Space to try again", width / 2, height / 2);
  }

  if (isGameWon) {
    textSize(32);
    textAlign(CENTER, CENTER);
    fill("green");
    text("You Win! Press Space to play again", width / 2, height / 2);
  }

  for (let i = blackCircles.length - 1; i >= 0; i--) {
    const blackCircle = blackCircles[i];
    if (swordIntersectsCircle(sword, blackCircle)) {
      blackCircles.splice(i, 1);
    }
  }

  for (let i = greenProjectiles.length - 1; i >= 0; i--) {
    const greenProjectile = greenProjectiles[i];
    for (let j = blackCircles.length - 1; j >= 0; j--) {
      const blackCircle = blackCircles[j];
      if (greenProjectile.collidesWith(blackCircle)) {
        greenProjectiles.splice(i, 1);
        blackCircles.splice(j, 1);
        break; // Break the inner lo
      }}}



}






class Projectile {
  constructor(x, y, diameter, color, dx, dy) {
    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.color = color;
    this.dx = dx;
    this.dy = dy;
  }

  show() {
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.diameter);
  }

  move() {
    this.x += this.dx;
    this.y += this.dy;
  }

 
  collidesWith(otherCircle) {
    let distanceBetween = dist(this.x, this.y, otherCircle.x, otherCircle.y);
    return distanceBetween < (this.diameter + otherCircle.diameter) / 2;
  }
}




class CircleSprite {
  constructor(x, y, diameter, color, img) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.diameter = diameter;
    this.color = color;
    this.sprite = createSprite(this.x, this.y);
    this.sprite.addImage(img);
    this.sprite.scale = diameter / img.width; // Adjust scale based on diameter
  }

  show() {
    drawSprites();
  }

  // Add this method to update the sprite position
  updateSpritePosition() {
    this.sprite.position.x = this.x;
    this.sprite.position.y = this.y;
  }

  // Other methods remain the same
  // ...
  show() {
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.diameter);
  }

  shootProjectile() {
    const projectileSize = 10;
    const projectileSpeed = 5;

    // Calculate the position of the tip of the sword
    const tipX = sword.x + sword.length * cos(sword.angle);
    const tipY = sword.y + sword.length * sin(sword.angle);

    // Calculate the direction of the projectile based on the sword's angle
    const dx = cos(sword.angle) * projectileSpeed;
    const dy = sin(sword.angle) * projectileSpeed;

    // Create a new green projectile and add it to the array
    greenProjectiles.push(
      new Projectile(tipX, tipY, projectileSize, "green", dx, dy)
    );
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

  if (kb.pressing(LEFT_ARROW)) {
    this.vx -= acceleration;
  }
  if (kb.pressing(RIGHT_ARROW)) {
    this.vx += acceleration;
  }
  if (kb.pressing(UP_ARROW)) {
    this.vy -= acceleration;
  }
  if (kb.pressing(DOWN_ARROW)) {
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


class Circle {
  constructor(x, y, diameter, color) {
    this.x = x;
    this.y = y;
     this.vx = 0; 
    this.vy = 0; 
    this.diameter = diameter;
    this.color = color;
  }

  show() {
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.diameter);
  }

  shootProjectile() {
    const projectileSize = 10;
    const projectileSpeed = 5;

    // Calculate the position of the tip of the sword
    const tipX = sword.x + sword.length * cos(sword.angle);
    const tipY = sword.y + sword.length * sin(sword.angle);

    // Calculate the direction of the projectile based on the sword's angle
    const dx = cos(sword.angle) * projectileSpeed;
    const dy = sin(sword.angle) * projectileSpeed;

    // Create a new green projectile and add it to the array
    greenProjectiles.push(
      new Projectile(tipX, tipY, projectileSize, "green", dx, dy)
    );
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

  if (kb.pressing(LEFT_ARROW)) {
    this.vx -= acceleration;
  }
  if (kb.pressing(RIGHT_ARROW)) {
    this.vx += acceleration;
  }
  if (kb.pressing(UP_ARROW)) {
    this.vy -= acceleration;
  }
  if (kb.pressing(DOWN_ARROW)) {
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
    strokeWeight(5);
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

  const dx = x2 - sword.x;
  const dy = y2 - sword.y;
  const t = ((circle.x - sword.x) * dx + (circle.y - sword.y) * dy) / (dx * dx + dy * dy);

  const closestT = constrain(t, 0, 1);
  const closestX = sword.x + closestT * dx;
  const closestY = sword.y + closestT * dy;

  const distance = dist(closestX, closestY, circle.x, circle.y);
  return distance < circle.diameter / 2;
}

function keyPressed() {
  if (keyCode === 32) { // 32 is the keyCode for the spacebar
    isGameOver = false;
    isGameWon = false;
    blueCircle.x = 20;
    blueCircle.y = 20;
  }

  if (key == 'c') {
    blueCircle.shootProjectile();
  }
}