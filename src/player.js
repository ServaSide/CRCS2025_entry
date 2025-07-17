export class Player {
    constructor(ctx) {
        this.ctx = ctx;
        this.sprite = new Image();
        this.sprite.src = "data/graphics/player.png";

        this.animCounter = 0;
        this.direction = 0;
        this.isRunnning = false;

        this.x = 300;
        this.y = 225;
        this.cx = 0;
        this.cy = 0;
    }

    render() {
        this.ctx.drawImage(
            this.sprite,
            Math.floor(this.animCounter)%2*32, 
            this.direction*64, 
            32, 64,
            this.x, this.y,
            32, 64
        );
    }

    update(dt, keys, mouse) {
        if(this.isRunnning) {
            this.animCounter += dt * 4;
        }

        if(!keys['w'] && !keys['s'] && !keys['a'] && !keys['d']) {
            this.isRunnning = false;
        }
                
        if(keys['s']) {
            this.isRunnning = true;
            this.y += 120*dt;
            this.direction = 1;
        }

        if(keys['w']) {
            this.isRunnning = true;
            this.y -= 120*dt;
            this.direction = 0;
        }

        if(keys['a']) {
            this.isRunnning = true;
            this.x -= 120*dt;
            this.direction = 1;
        }
        
        if(keys['d']) {
            this.isRunnning = true;
            this.x += 120*dt;
            this.direction = 0;
        }
    }
}