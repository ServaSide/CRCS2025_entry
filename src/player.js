export class Player {
    constructor(ctx) {
        this.ctx = ctx;
        this.sprite = new Image();
        this.sprite.src = "data/graphics/player.png";

        this.bar = new Image();
        this.bar.src = "data/graphics/bar.png";

        this.animCounter = 0;
        this.direction = 0;
        this.isRunning = false; 

        this.worldX = 8;
        this.worldY = 8;
        
        this.cx = 0;
        this.cy = 0;
        
        this.screenX = 0;
        this.screenY = 0;

        this.stamina = 100;
        this.maxStamina = 100;
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

    renderUI() {
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(
            4, 4,
            this.stamina, 6
        );
        this.ctx.fillStyle = 'lime';
        
        this.ctx.fillRect(
            4, 5,
            this.stamina, 2
        );
        
        this.ctx.drawImage(
            this.bar,
            4, 4
        );
    }

    update(dt, keys, mouse) {
        if(this.isRunning) {
            this.animCounter += dt * 8;
        }

        const moveSpeed = dt * 2;
        let moved = false;

        let lWorldX = this.worldX;
        let lWorldY = this.worldY;

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

        let dx = this.worldX-lWorldX;
        let dy = this.worldY-lWorldY;

        let dist = Math.sqrt(dx*dx + dy*dy);

        if(dist != 0) {
            this.worldX = lWorldX+(dx/dist)*dt*5;
            this.worldY = lWorldY+(dy/dist)*dt*5;
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