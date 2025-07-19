export class Hog {
    constructor(worldX, worldY) {
        this.x = worldX;
        this.y = worldY;
        this.hp = 10;
        this.speed = 200;

        this.sprite = new Image();
        this.sprite.src = "data/graphics/hog.png";

        this.animCounter = 0;
        this.direction = 0;
        this.isRunning = false; 
    }

    render(x, y) {
        this.ctx.drawImage(
            this.sprite,
            Math.floor(this.animCounter)%2*32, 
            this.direction*32, 
            32, 32,
            x - 16, y - 16,
            32, 32
        );
    }

    update(dt, keys, mouse) {

        if(this.isRunning) {
            this.animCounter += dt * 8;
        }
    }
}