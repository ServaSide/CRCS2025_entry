export class PlayerStats {
    constructor(ctx, maxAmt) {
        this.ctx = ctx;
        this.maxAmt = maxAmt;

        this.stamina = 100;
        this.thirst = 100;
        this.hunger = 100;
        this.hp = 100;

        this.bar = new Image();
        this.bar.src = "data/graphics/bar.png";
    }
    
    render() {
        this.drawBar(this.stamina, 'green', 'lime', 0);
        this.drawBar(this.hp, 'red', 'magenta', 8);
        this.drawBar(this.hunger, 'brown', 'red', 16);
        this.drawBar(this.thirst, 'blue', 'cyan', 24);
    }

    drawBar(val, col, col2, y) {
        this.ctx.fillStyle = col;
        this.ctx.fillRect(
            4, 4+y,
            val, 7
        );
        this.ctx.fillStyle = col2;
        
        this.ctx.fillRect(
            4, 5+y,
            val, 2
        );
        
        this.ctx.drawImage(
            this.bar,
            4, 4+y
        );
    }
};