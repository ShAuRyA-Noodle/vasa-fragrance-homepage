export class RippleEmitter {
  constructor({spacing = 15, clickStrength = 2} = {}) {
    this.spacing = spacing;
    this.clickStrength = clickStrength;
    this.last = null;
  }

  move(x, y, time) {
    if (this.last && Math.hypot(x - this.last.x, y - this.last.y) < this.spacing) return null;
    this.last = {x, y};
    return {x, y, time, strength: 1};
  }

  click(x, y, time) {
    this.last = {x, y};
    return {x, y, time, strength: this.clickStrength};
  }

  reset() { this.last = null; }
}
