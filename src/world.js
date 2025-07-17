import { Player } from './player.js';

const TILE_W = 32;
const TILE_H = 16;
const CHUNK_SIZE = 16;

export class World {
    constructor(ctx) {
        this.ctx = ctx;
        this.chunks = new Map();
        this.camera = { x: 0, y: 0 };
        this.cursor = { x: 0, y: 0 };

        this.tiles = new Image();
        this.tiles.src = "data/graphics/tiles.png";

        this.tree = new Image();
        this.tree.src = "data/graphics/tree.png";
                
        this.tree_hl = new Image();
        this.tree_hl.src = "data/graphics/tree_hl.png";

        this.para = new Image();
        this.para.src = "data/graphics/paraschute.png";

        this.player = new Player(this.ctx);

        this.snd = {
            fell: new Audio("data/fell.wav"),
            chop: new Audio("data/wood.wav"),
            walk: new Audio("data/walk.wav"),
        };

        this.snd.walk.volume = 0.5;
    }

    update(dt, keys, mouse) {
        // Store previous position for collision response
        this.player.lastPos = {
            x: this.player.worldX,
            y: this.player.worldY
        };

        if(keys['w'] || keys['s'] || keys['a'] || keys['d']) this.snd.walk.play();

        this.player.update(dt, keys, mouse);
        this.camera.x = this.player.cx;
        this.camera.y = this.player.cy;

        this.mouse = mouse;

        this.cursor = this.getWorldPositionFromScreen(mouse.x, mouse.y);
        
        // Handle tree breaking
        if (mouse.btn === 0) {
            const chunkX = Math.floor((this.cursor.x+2) / CHUNK_SIZE);
            const chunkY = Math.floor((this.cursor.y+1) / CHUNK_SIZE);
            const key = `${chunkX},${chunkY}`;
            
            if (this.chunks.has(key)) {
                let ch = this.chunks.get(key);
                // Calculate local tile coordinates within chunk
                const localX = (this.cursor.x % CHUNK_SIZE + CHUNK_SIZE + 2) % CHUNK_SIZE;
                const localY = (this.cursor.y % CHUNK_SIZE + CHUNK_SIZE + 1) % CHUNK_SIZE;
                
                if (ch[localY] && ch[localY][localX]) {  // Check if tile exists
                    let tile = ch[localY][localX];
                    
                    if (tile.tree) {
                        if (tile.hp > 0 && this.player.stamina > 0) {
                            tile.hp--;
                            this.snd.chop.play();
                            tile.shaking = 2;
                            this.player.stamina --;
                        } else {
                            tile.tree = false;
                            this.snd.fell.play();
                        }
                        mouse.btn = -1; // Reset mouse button after processing
                    }
                }
            }
        }
    }

    getWorldPositionFromScreen(screenX, screenY) {
        // Adjust for camera offset
        const adjX = screenX + this.camera.x - 16;
        const adjY = screenY + this.camera.y - 8;
        
        // Convert screen to isometric world coordinates
        const worldX = (adjY/TILE_H + adjX/TILE_W);
        const worldY = (adjY/TILE_H - adjX/TILE_W);
        
        return {
            x: Math.floor(worldX),
            y: Math.floor(worldY)
        };
    }

    render() {
        const isoX = this.camera.x / (TILE_W / 2);
        const isoY = this.camera.y / (TILE_H / 2);
        
        const worldX = (isoY + isoX) / 2;
        const worldY = (isoY - isoX) / 2;
        
        const centerX = Math.floor(worldX / CHUNK_SIZE);
        const centerY = Math.floor(worldY / CHUNK_SIZE);

        const viewDist = 3;
        const renderList = [];

        for (let cy = -viewDist; cy <= viewDist; cy++) {
            for (let cx = -viewDist; cx <= viewDist; cx++) {
                const chunkX = centerX + cx;
                const chunkY = centerY + cy;
                const key = `${chunkX},${chunkY}`;

                if (!this.chunks.has(key)) {
                    this.chunks.set(key, this.generateChunk(chunkX, chunkY));
                }

                this.renderChunkTiles(chunkX, chunkY, this.chunks.get(key));
                this.collectObjects(chunkX, chunkY, this.chunks.get(key), renderList);
            }
        }

        renderList.push({
            type: 'player',
            depth: this.player.worldX + this.player.worldY,
            instance: this.player
        });

        renderList.push({
            type: 'para',
            worldX: 0,
            worldY: 0,
            depth: 0,
        });

        renderList.sort((a, b) => a.depth - b.depth);

        this.objectSelected = false;
        renderList.forEach((obj) => {
            if (obj.type === 'tree') {
                const screenX = (obj.worldX - obj.worldY) * (TILE_W / 2) - this.camera.x;
                const screenY = (obj.worldX + obj.worldY) * (TILE_H / 2) - this.camera.y;
                
                const treeWidth = 128;
                const treeHeight = 128;
                const treeLeft = screenX - treeWidth/2;
                const treeTop = screenY - treeHeight;
                
                // Check if cursor is at this tree's position
                const isMouseOver = (
                    obj.worldX === this.cursor.x+2 && 
                    obj.worldY === this.cursor.y+1 && 
                    !this.objectSelected
                );

                if (isMouseOver) {
                    this.ctx.drawImage(this.tree_hl, obj.shaking ? screenX-64+Math.floor(Math.random()*2)-1 : screenX-64, obj.shaking ? screenY-128+Math.floor(Math.random()*2)-1 : screenY-128);
                    this.objectSelected = true;
                } else {
                    this.ctx.drawImage(this.tree, obj.shaking ? screenX-64+Math.floor(Math.random()*2)-1 : screenX-64, obj.shaking ? screenY-128+Math.floor(Math.random()*2)-1 : screenY-128);
                }
            } else if (obj.type === 'player') {
                obj.instance.render();
            } else if (obj.type == 'para') {
                const screenX = (obj.worldX - obj.worldY) * (TILE_W / 2) - this.camera.x;
                const screenY = (obj.worldX + obj.worldY) * (TILE_H / 2) - this.camera.y;
                this.ctx.drawImage(this.para, screenX-64, screenY-128);
            }
        });

        // Reset mouse button state after processing
        this.mouse.btn = -1;
        
        this.player.renderUI();
    }

    renderChunkTiles(cx, cy, chunk) {
        const offsetX = -this.camera.x;
        const offsetY = -this.camera.y;

        for (let y = 0; y < CHUNK_SIZE; y++) {
            for (let x = 0; x < CHUNK_SIZE; x++) {
                const worldX = cx * CHUNK_SIZE + x;
                const worldY = cy * CHUNK_SIZE + y;

                const screenX = (worldX - worldY) * (TILE_W / 2) + offsetX;
                const screenY = (worldX + worldY) * (TILE_H / 2) + offsetY;

                // Skip off-screen tiles
                if (screenX + TILE_W < 0 || screenX > this.ctx.canvas.width ||
                    screenY + TILE_H*2 < 0 || screenY > this.ctx.canvas.height) {
                    continue;
                }

                let tile = chunk[y][x];

                if(tile.shaking > 0) tile.shaking -= 0.1;

                this.ctx.drawImage(
                    this.tiles,
                    (tile.id%4)*32, Math.floor(tile.id/4)*32,
                    32, 32,
                    screenX, screenY,
                    32, 32
                );

                if(worldX == this.cursor.x && worldY == this.cursor.y) {
                    this.ctx.drawImage(
                        this.tiles,
                        0, 2*32,
                        32, 32,
                        screenX, screenY,
                        32, 32
                    );
                }
            }
        }
    }

    collectObjects(cx, cy, chunk, renderList) {
        for (let y = 0; y < CHUNK_SIZE; y++) {
            for (let x = 0; x < CHUNK_SIZE; x++) {
                const tile = chunk[y][x];
                if (tile.tree) {
                    const worldX = cx * CHUNK_SIZE + x;
                    const worldY = cy * CHUNK_SIZE + y;
                    renderList.push({
                        type: 'tree',
                        depth: worldX + worldY,
                        worldX: worldX,
                        worldY: worldY,
                        shaking: tile.shaking > 0
                    });
                }
            }
        }
    }

    generateChunk(cx, cy) {
        const seed = (cx * 1789619 + cy * 31337 + Math.random()*3528964) % 65536;
        const random = new Random(seed);
        
        const canHaveTrees = !(cx == 0 && cy == 0);
        const chunk = [];

        const baseTreeDensity = random.next() * 0.5; // 0% to 50% base chance
        const treeDensity = canHaveTrees ? baseTreeDensity : 0;
        
        const densityVariation = random.next();
        let adjustedDensity = treeDensity;
        if (densityVariation > 0.6) {
            adjustedDensity = treeDensity * 0.8; 
        } else if (densityVariation < 0.4) {
            adjustedDensity = treeDensity * 0.3; 
        }

        for (let y = 0; y < CHUNK_SIZE; y++) {
            const row = [];
            for (let x = 0; x < CHUNK_SIZE; x++) {
                // Tile type selection
                let tile = Math.floor(random.next() * 4);
                if (random.next() < 0.3) {
                    tile = 5;
                }
                if (random.next() < 0.01) {
                    tile = 6;
                }
                if (random.next() < 0.002) {
                    tile = 9;
                }

                let hasTree = false;
                if (canHaveTrees) {
                    const localDensity = adjustedDensity + 
                        (random.next() * 0.2 - 0.1); // ±10% variation

                    if (y > 0 && x > 0 && chunk[y-1][x-1].tree) {
                        hasTree = random.next() < localDensity * 1.5;
                    } else {
                        hasTree = random.next() < localDensity;
                    }
                }

                row.push({
                    id: tile,
                    tree: hasTree,
                    hp: 10,
                    shaking: 0,
                });
            }
            chunk.push(row);
        }
        return chunk;
    }
}

class Random {
    constructor(seed) {
        this.seed = seed % 2147483647;
        if (this.seed <= 0) this.seed += 2147483646;
    }

    next() {
        this.seed = (this.seed * 16807) % 2147483647;
        return (this.seed - 1) / 2147483646;
    }
}
