const TILE_W = 32;
const TILE_H = 16;
const CHUNK_SIZE = 8;

export class World {
    constructor(ctx) {
        this.ctx = ctx;
        this.chunks = new Map();
        this.camera = { x: 0, y: 0 };
        this.tiles = new Image();
        this.tiles.src = "data/graphics/tiles.png";
    }

    update(dt, keys, mouse) {
    }

    render() {
        const centerX = Math.floor(this.camera.x / CHUNK_SIZE);
        const centerY = Math.floor(this.camera.y / CHUNK_SIZE);

        const viewDist = 4;

        for (let cy = -viewDist; cy <= viewDist; cy++) {
            for (let cx = -viewDist; cx <= viewDist; cx++) {
                const chunkX = centerX + cx;
                const chunkY = centerY + cy;
                const key = `${chunkX},${chunkY}`;

                if (!this.chunks.has(key)) {
                    this.chunks.set(key, this.generateChunk(chunkX, chunkY));
                }

                this.renderChunk(chunkX, chunkY, this.chunks.get(key));
            }
        }
    }

    generateChunk(cx, cy) {
        const chunk = [];

        for (let y = 0; y < CHUNK_SIZE; y++) {
            const row = [];
            for (let x = 0; x < CHUNK_SIZE; x++) {
                const worldX = cx * CHUNK_SIZE + x;
                const worldY = cy * CHUNK_SIZE + y;

                const tile = Math.floor(Math.random()*4);
                row.push(tile);
            }
            chunk.push(row);
        }

        return chunk;
    }

    renderChunk(cx, cy, chunk) {
        const offsetX = this.ctx.canvas.width / 2 - this.camera.x * (TILE_W / 2) + this.camera.y * (TILE_W / 2);
        const offsetY = this.ctx.canvas.height / 2 - this.camera.x * (TILE_H / 2) - this.camera.y * (TILE_H / 2);

        for (let y = 0; y < CHUNK_SIZE; y++) {
            for (let x = 0; x < CHUNK_SIZE; x++) {
                const worldX = cx * CHUNK_SIZE + x;
                const worldY = cy * CHUNK_SIZE + y;

                const screenX = (worldX - worldY) * (TILE_W / 2) + offsetX;
                const screenY = (worldX + worldY) * (TILE_H / 2) + offsetY;

                const tile = chunk[y][x];

                this.ctx.drawImage(
                    this.tiles,
                    (tile%4)*32, Math.floor(tile/4)*32,
                    32, 16,
                    screenX, screenY,
                    32, 16
                );
            }
        }
    }
}
