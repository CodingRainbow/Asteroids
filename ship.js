// Daniel Shiffman
// http://codingrainbow.com
// http://patreon.com/codingrainbow
// Code for: https://youtu.be/hacZU523FyM

function Ship(pos, r) {
  Entity.call(this, width / 2, height / 2, 20);
  this.isDestroyed = false;
  this.destroyFrames = 600;
  this.invincible = true;
  this.flash = true;
  this.flashCount = 0;

  var scope = this;
  input.registerAsListener(" ".charCodeAt(0), function(char, code, press) {
      if (!press) {
        return;
      }

      var laser = new Laser(scope.pos, scope.heading);
      laser.playSoundEffect(laserSoundEffect);
      lasers.push(laser);
  });
  input.registerAsListener(RIGHT_ARROW, function(char, code, press) { scope.setRotation(press ? 0.08 : 0); });
  input.registerAsListener(LEFT_ARROW, function(char, code, press) { scope.setRotation(press ? -0.08 : 0); });
  input.registerAsListener(UP_ARROW, function(char, code, press) { scope.setAccel(press ? 0.1 : 0); });

  this.update = function() {
    Entity.prototype.update.call(this);
    this.vel.mult(0.99);
    if(this.isDestroyed) {
      for(var i = 0; i < this.brokenParts.length; i++) {
        this.brokenParts[i].pos.add(this.brokenParts[i].vel);
        this.brokenParts[i].heading += this.brokenParts[i].rot;
      }
    } else {
      this.vel.mult(0.99);
    }
  }

  this.brokenParts = [];
  this.destroy = function() {
    this.isDestroyed = true;
    for(var i = 0; i < 4; i++)
      this.brokenParts[i] = {
        pos: this.pos.copy(),
        vel: p5.Vector.random2D(),
        heading: random(0, 360),
        rot: random(-0.07, 0.07)
      };
  }

  this.hits = function(asteroid) {
    if (this.invincible) return false;
    var vertices = [
      createVector(this.pos.x - this.r, this.pos.y - this.r),
      createVector(this.pos.x - this.r, this.pos.y + this.r),
      createVector(this.pos.x + this.r, this.pos.y + 0)
    ];
    var asteroid_vertices = asteroid.vertices();
    for(var i = 0; i < asteroid_vertices.length; i++) {
      for(var j = 0; j < vertices.length; j++) {
        var opposite = vertices.slice(0);
        opposite.splice(j, 1);
        if(lineIntersect(opposite[0], opposite[1], asteroid_vertices[i], asteroid_vertices[(i + 1) % asteroid_vertices.length])) {
          return true;
        }
      }
    }
    return false;
  }

  this.render = function() {
    if(this.isDestroyed) {
      for(var i = 0; i < this.brokenParts.length; i++) {
        push();
        stroke(floor(255 * ((this.destroyFrames--) / 600)));
        var bp = this.brokenParts[i];
        translate(bp.pos.x, bp.pos.y);
        rotate(bp.heading);
        line(-this.r / 2, -this.r / 2, this.r / 2, this.r / 2);
        pop();
      }
    } else {
      push();
      translate(this.pos.x, this.pos.y);
      rotate(this.heading);
      fill(0);
      if (this.invincible && this.flashCount <= 5){
        //Ship is currently invincible
        if(frameCount% 20== 0) {
          if(this.flash){
            stroke(255);
            this.flashCount++;
            console.log(this.flashCount);
          }else{
            stroke(0);
            this.flash = !this.flash;
          }
        }
      }else{
        stroke(255);
        this.invincible = false;
        this.flashCount = 0;
      }
      triangle(-this.r, -this.r, -this.r, this.r, this.r, 0);

      if(this.accelMagnitude != 0) {
        translate(-this.r, 0);
        rotate(random(PI / 4, 3 * PI / 4));
        line(0, 0, 0, 10);
      }

      pop();
    }
  }
}

Ship.prototype = Object.create(Entity.prototype);
