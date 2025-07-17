class Game {
    constructor() {
        this.ctx = document.getElementById("gamePanel").getContext("2d");
        this.ctx.imageSmoothingEnabled = false;

        this.dt = 0;
        this.lf = 0;
        this.keys = {  };
        this.mouse = { x: 0, y: 0, btn: 0 };

        window.addEventListener('keydown', this.keydown.bind(this));
        window.addEventListener('keyup', this.keyup.bind(this));
    }

    mousedown(e) { this.mouse.btn = e.button; } 
    mouseup(e) { this.mouse.btn = -1; } 
    mousemove(e) { this.mouse.x = e.pageX; this.mouse.y = e.pageY; } 

    keydown(e) { keys[e.key] = true; }
    keyup(e) { keys[e.key] = false; }

    loop() {
        dt = (performance.now() - lf) / 1000.0;
        lf = performance.now();

        this.update();

        this.render();

        requestAnimationFrame(loop.bind(this));
    }

    update() {

    }

    render() {

    }
}

window.addEventListener('DOMContentLoaded', () => { new Game(); });