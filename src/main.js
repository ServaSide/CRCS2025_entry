import { World } from './world.js';

class Game {
    constructor() {
        this.ctx = document.getElementById("gamePanel").getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.scale(2,2);

        this.dt = 0;
        this.lf = 0;
        this.keys = {  };
        this.mouse = { x: 0, y: 0, btn: 0 };

        window.addEventListener('keydown', this.keydown.bind(this));
        window.addEventListener('keyup', this.keyup.bind(this));

        window.addEventListener('mousedown', this.mousedown.bind(this));
        window.addEventListener('mouseup', this.mouseup.bind(this));
        window.addEventListener('mousemove', this.mousemove.bind(this));


        this.world = new World(this.ctx);

        this.loop();
    }

    mousedown(e) { this.mouse.btn = e.button; } 
    mouseup(e) { this.mouse.btn = -1; } 
    mousemove(e) { this.mouse.x = e.pageX/2; this.mouse.y = e.pageY/2; } 

    keydown(e) { this.keys[e.key.toLowerCase()] = true; }
    keyup(e) { this.keys[e.key.toLowerCase()] = false; }

    loop() {
        this.dt = (performance.now() - this.lf) / 1000.0;
        this.lf = performance.now();

        this.update();

        this.ctx.fillStyle = 'rgb(255,255,255)';
        this.ctx.fillRect(0,0,1200,900);
        this.render();

        requestAnimationFrame(this.loop.bind(this));
    }

    update() {
        this.world.update(this.dt, this.keys, this.mouse);
    }

    render() {
        this.world.render(this.dt);
    }
}

window.addEventListener('DOMContentLoaded', () => { new Game(); });