export class Player {
    constructor(ctx) {
        this.ctx = ctx;
        this.sprite = new Image();
        this.sprite.src = "data/graphics/player.png";

        this.animCounter = 0;
        this.direction = 0;
        this.isRunning = false; 

        this.worldX = 8;
        this.worldY = 8;
        
        this.cx = 0;
        this.cy = 0;
        
        this.screenX = 0;
        this.screenY = 0;
    }

    render() {
        this.screenX = (this.worldX - this.worldY) * (32 / 2) - this.cx;
        this.screenY = (this.worldX + this.worldY) * (16 / 2) - this.cy;

        this.ctx.drawImage(
            this.sprite,
            Math.floor(this.animCounter)%2*32, 
            this.direction*64, 
            32, 64,
            this.screenX, this.screenY - 48,
            32, 64
        );
    }

    update(dt, keys, mouse) {
        if(this.isRunning) {
            this.animCounter += dt * 8;
        }

        const moveSpeed = dt * 2;
        let moved = false;

        if(keys['s']) {
            this.worldY += moveSpeed;
            this.worldX += moveSpeed;
            this.direction = 1;
            moved = true;
        }
        if(keys['w']) {
            this.worldY -= moveSpeed;
            this.worldX -= moveSpeed;
            this.direction = 0;
            moved = true;
        }
        if(keys['a']) {
            this.worldX -= moveSpeed;
            this.worldY += moveSpeed;
            this.direction = 1;
            moved = true;
        }
        if(keys['d']) {
            this.worldX += moveSpeed;
            this.worldY -= moveSpeed;
            this.direction = 0;
            moved = true;
        }

        this.isRunning = moved;

        this.screenX = (this.worldX - this.worldY) * (32 / 2) - this.cx;
        this.screenY = (this.worldX + this.worldY) * (16 / 2) - this.cy;

        const centerX = this.ctx.canvas.width / 4;
        const centerY = this.ctx.canvas.height / 4;
        const margin = 100;

        const desiredCX = (this.worldX - this.worldY) * (32 / 2) - centerX;
        const desiredCY = (this.worldX + this.worldY) * (16 / 2) - centerY;

        const cameraSpeed = dt * 5;
        this.cx += (desiredCX - this.cx) * cameraSpeed;
        this.cy += (desiredCY - this.cy) * cameraSpeed;
    }
}