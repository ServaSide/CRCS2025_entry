import { Player } from './player.js';
import { Hog } from './hog.js';
import { Inventory } from './inventory.js';

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
        this.tree0 = new Image();
        this.tree0.src = "data/graphics/tree0.png";
        this.tree1 = new Image();
        this.tree1.src = "data/graphics/tree1.png";

        this.tree_hl = new Image();
        this.tree_hl.src = "data/graphics/tree_hl.png";

        this.para = new Image();
        this.para.src = "data/graphics/paraschute.png";

        this.player = new Player(this.ctx);
        this.inventory = new Inventory(ctx, 600, 450);

        this.inventory.addItem(3, 1);
        this.inventory.addItem(4, 1);
        this.inventory.addItem(6, 1);

        this.snd = {
            fell: new Audio("data/fell.wav"),
            chop: new Audio("data/wood.wav"),
            walk: new Audio("data/walk.wav"),
            pick: new Audio("data/pick.wav"),
        };

        this.snd.walk.volume = 0.1;

        this.time = 0;

        this.entities = [
            new Hog(0, 0)
        ];
    }

    getBlock(x, y) {
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkY = Math.floor(y / CHUNK_SIZE);

        const key = `${chunkX},${chunkY}`;
        if (this.chunks.has(key)) {
            let ch = this.chunks.get(key);
            // More precise local coordinate calculation
            const localX = (x % CHUNK_SIZE + CHUNK_SIZE) % CHUNK_SIZE;
            const localY = (y % CHUNK_SIZE + CHUNK_SIZE) % CHUNK_SIZE;
            if (ch[localY])
                return ch[localY][localX];
        }

        return null;
    }

    getBlockWithOffset(x, y) {
        const chunkX = Math.floor((x + 2) / CHUNK_SIZE);
        const chunkY = Math.floor((y + 1) / CHUNK_SIZE);

        const key = `${chunkX},${chunkY}`;
        if (this.chunks.has(key)) {
            let ch = this.chunks.get(key);
            // More precise local coordinate calculation
            const localX = (x % CHUNK_SIZE + CHUNK_SIZE + 2) % CHUNK_SIZE;
            const localY = (y % CHUNK_SIZE + CHUNK_SIZE + 1) % CHUNK_SIZE;
            if (ch[localY])
                return ch[localY][localX];
        }

        return null;
    }

    update(dt, keys, mouse) {
        this.time += dt;

        this.player.lastPos = {
            x: this.player.worldX,
            y: this.player.worldY
        };

        if (keys['w'] || keys['s'] || keys['a'] || keys['d']) this.snd.walk.play();

        this.player.update(dt, keys, mouse);

        const block = this.getBlock(Math.floor(this.player.worldX), Math.floor(this.player.worldY + 1));
        const blockOffset = this.getBlock(Math.floor(this.player.worldX + 1), Math.floor(this.player.worldY + 1));

        if (block != null && block.depth) {
            this.player.worldX = this.player.lastPos.x;
            this.player.worldY = this.player.lastPos.y;
        }

        if (blockOffset != null && blockOffset.tree) {
            this.player.worldX = this.player.lastPos.x;
            this.player.worldY = this.player.lastPos.y;
        }

        this.camera.x = this.player.cx;
        this.camera.y = this.player.cy;


        this.mouse = mouse;

        this.cursor = this.getWorldPositionFromScreen(mouse.x, mouse.y);

        const selectedItem = this.inventory.getSelectedItem();

        // Left click actions
        if (mouse.btn === 0 && this.player.stats.stamina > 0) {
            switch (selectedItem.id) {
                case 3: {// Axe
                    let tile = this.getBlockWithOffset(this.cursor.x - 1, this.cursor.y - 1);
                    if (tile && tile.tree) {
                        if (tile.hp > 0) {
                            tile.hp--;
                            this.snd.chop.play();
                            tile.shaking = 2;
                            this.player.stats.stamina--;
                        } else {
                            tile.tree = false;
                            tile.hp = 5;
                            this.snd.fell.play();
                            this.inventory.addItem(1, Math.floor(Math.random() * 2) + tile.stage);
                            this.inventory.addItem(8, Math.floor(Math.random() * 2));
                        }
                    }
                    break;
                }

                case 4: {// Hoe
                    let tile = this.getBlock(this.cursor.x, this.cursor.y);
                    if (tile && !tile.tree && tile.id !== 7) {
                        tile.hp -= 2;
                        if (tile.id == 9) {
                            this.inventory.addItem(2, 1);
                            tile.id = 1;
                        }
                        this.player.stats.stamina -= 0.5;
                        if (tile.hp <= 0) {
                            tile.id = 7;
                            tile.hp = 10;
                            this.snd.walk.play();
                        }
                    }
                    break;
                }

                case 6: {// Pikax
                    let tile = this.getBlock(this.cursor.x, this.cursor.y);
                    if (tile && !tile.tree && tile.id == 12) {
                        tile.hp--;
                        this.snd.pick.play();
                        this.player.stats.stamina -= 1.5;
                        if (tile.hp <= 0) {
                            tile.id = 1;
                            tile.hp = 10;
                            this.inventory.addItem(5, Math.floor(Math.random() * 4) + 1);
                        }
                    }
                    break;
                }
            }
        } else if (mouse.btn === 2) {
            switch (selectedItem.id) {
                case 1: {
                    let tile = this.getBlock(this.cursor.x, this.cursor.y);
                    if (selectedItem.amt >= 4) {
                        selectedItem.amt -= 4;
                        tile.id = 10;
                        tile.light = 10;
                        tile.depth = true;
                    }
                    break;
                }
                case 5: {
                    let tile = this.getBlock(this.cursor.x, this.cursor.y);
                    if (selectedItem.amt > 0 && tile.id != 14) {
                        selectedItem.amt--;
                        tile.id = 14;
                        tile.depth = true;
                    }
                    break;
                }
                case 8: {
                    let tile = this.getBlock(this.cursor.x + 1, this.cursor.y);
                    if (selectedItem.amt > 0 && !tile.tree) {
                        selectedItem.amt--;
                        tile.tree = true;
                        tile.stage = 0;
                        tile.growStamp = performance.now() / 1000.0;
                    }
                    break;
                }
            }
        }

        this.inventory.update(dt, keys, mouse);
    }

    getWorldPositionFromScreen(screenX, screenY) {
        // Adjust for camera offset
        const adjX = screenX + this.camera.x - 16;
        const adjY = screenY + this.camera.y - 8;

        // Convert screen to isometric world coordinates
        const worldX = (adjY / TILE_H + adjX / TILE_W);
        const worldY = (adjY / TILE_H - adjX / TILE_W);

        return {
            x: Math.floor(worldX),
            y: Math.floor(worldY)
        };
    }

    render(dt) {
        const isoX = this.camera.x / (TILE_W / 2);
        const isoY = this.camera.y / (TILE_H / 2);

        const worldX = (isoY + isoX) / 2;
        const worldY = (isoY - isoX) / 2;

        const centerX = Math.floor(worldX / CHUNK_SIZE);
        const centerY = Math.floor(worldY / CHUNK_SIZE);

        const viewDist = 3;
        const renderList = [];

        this.lights = [];

        for (let cy = -viewDist; cy <= viewDist; cy++) {
            for (let cx = -viewDist; cx <= viewDist; cx++) {
                const chunkX = centerX + cx;
                const chunkY = centerY + cy;
                const key = `${chunkX},${chunkY}`;

                if (!this.chunks.has(key)) {
                    this.chunks.set(key, this.generateChunk(chunkX, chunkY));
                }

                this.renderChunkTiles(chunkX, chunkY, this.chunks.get(key), dt);
                this.collectObjects(chunkX, chunkY, this.chunks.get(key), renderList);
            }
        }

        const playerDepth = Math.floor(this.player.worldX) + Math.floor(this.player.worldY);
        renderList.push({
            type: 'player',
            depth: playerDepth,
            instance: this.player,
            worldX: this.player.worldX,
            worldY: this.player.worldY
        });

        // Add parachute (if still needed)
        renderList.push({
            type: 'para',
            worldX: 0,
            worldY: 0,
            depth: 0,
        });

        // Sort all objects by depth
        renderList.sort((a, b) => a.depth - b.depth);

        this.objectSelected = false;
        renderList.forEach((obj) => {
            const screenX = (obj.worldX - obj.worldY) * (TILE_W / 2) - this.camera.x;
            const screenY = (obj.worldX + obj.worldY) * (TILE_H / 2) - this.camera.y;

            if (obj.type === 'tree') {
                const treeWidth = 128;
                const treeHeight = 128;

                // Check if cursor is at this tree's position
                const isMouseOver = (
                    obj.worldX === this.cursor.x + 2 &&
                    obj.worldY === this.cursor.y + 1 &&
                    !this.objectSelected
                );

                if (isMouseOver && obj.stage == 2) {
                    this.ctx.drawImage(this.tree_hl,
                        obj.shaking ? screenX - 64 + Math.floor(Math.random() * 2) - 1 : screenX - 64,
                        obj.shaking ? screenY - 128 + Math.floor(Math.random() * 2) - 1 : screenY - 128);
                    this.objectSelected = true;
                } else if (obj.stage == 2) {
                    this.ctx.drawImage(this.tree,
                        obj.shaking ? screenX - 64 + Math.floor(Math.random() * 2) - 1 : screenX - 64,
                        obj.shaking ? screenY - 128 + Math.floor(Math.random() * 2) - 1 : screenY - 128);
                } else if (obj.stage == 1) {
                    this.ctx.drawImage(this.tree1,
                        obj.shaking ? screenX - 64 + Math.floor(Math.random() * 2) - 1 : screenX - 64,
                        obj.shaking ? screenY - 128 + Math.floor(Math.random() * 2) - 1 : screenY - 128);
                } else if (obj.stage == 0) {
                    this.ctx.drawImage(this.tree0,
                        obj.shaking ? screenX - 64 + Math.floor(Math.random() * 2) - 1 : screenX - 64,
                        obj.shaking ? screenY - 128 + Math.floor(Math.random() * 2) - 1 : screenY - 128);
                }
            } else if (obj.type === 'player') {
                // Render player at their precise position
                obj.instance.renderAtPosition(screenX, screenY);
            } else if (obj.type === 'para') {
                this.ctx.drawImage(this.para, screenX - 64, screenY - 128);
            } else if (obj.type === 'depthObj') {
                this.ctx.drawImage(
                    this.tiles,
                    (obj.src % 4) * 32, Math.floor(obj.src / 4) * 32,
                    32, 32,
                    screenX, screenY,
                    32, 32
                );
            }
        });

        // Reset mouse button state after processing
        this.mouse.btn = -1;

        let dayTime = Math.sin(this.time / 120);
        if (dayTime > 0.8) dayTime = 0.8;
        this.ctx.fillStyle = `rgba(0,0,0,${dayTime})`;
        this.ctx.fillRect(0, 0, 600, 450);

        this.lights.forEach((l) => {
            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(255, 255, 190, 0.2)`;
            this.ctx.ellipse(l.x + 16, l.y + 8, 128, 64, 0, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(255, 255, 190, 0.24)`;
            this.ctx.ellipse(l.x + 16, l.y + 8, 128 - 32, 64 - 16, 0, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(255, 255, 190, 0.3)`;
            this.ctx.ellipse(l.x + 16, l.y + 8, 64, 32, 0, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.player.renderUI();
        this.inventory.render();
    }

    renderChunkTiles(cx, cy, chunk, dt) {
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
                    screenY + TILE_H * 2 < 0 || screenY > this.ctx.canvas.height) {
                    continue;
                }

                let tile = chunk[y][x];

                if (tile.shaking > 0) tile.shaking -= dt * 5;

                if (performance.now() / 1000.0 - tile.growStamp > 40 && tile.stage < 2) {
                    tile.growStamp = performance.now() / 1000.0;
                    tile.stage++;
                }


                if (tile.id == 11 && Math.random() > 0.5) tile.id = 10;
                if (tile.id == 10 && Math.random() > 0.5) tile.id = 11;

                if (tile.id == 10 || tile.id == 11) {
                    this.lights.push({ x: screenX, y: screenY });
                    tile.light -= 8 * dt;
                    if (tile.light <= 0) {
                        tile.idx = 0;
                    }
                }

                this.ctx.drawImage(
                    this.tiles,
                    (tile.id % 4) * 32, Math.floor(tile.id / 4) * 32,
                    32, 32,
                    screenX, screenY,
                    32, 32
                );

                if (worldX == this.cursor.x && worldY == this.cursor.y) {
                    this.ctx.drawImage(
                        this.tiles,
                        0, 2 * 32,
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
                        depth: worldX + worldY - 1,
                        worldX: worldX + 1,
                        worldY: worldY + 1,
                        shaking: tile.shaking > 0,
                        stage: tile.stage
                    });
                }
                if (tile.depth) {
                    const worldX = cx * CHUNK_SIZE + x;
                    const worldY = cy * CHUNK_SIZE + y;
                    renderList.push({
                        type: 'depthObj',
                        depth: worldX + worldY,
                        worldX: worldX,
                        worldY: worldY,
                        shaking: tile.shaking > 0,
                        src: tile.id
                    });
                }
            }
        }
    }

    generateChunk(cx, cy) {
        const seed = (cx * 1789619 + cy * 31337 + Math.random() * 3528964) % 65536;
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
                if (random.next() < 0.008) {
                    tile = 12;
                }

                let hasTree = false;
                if (canHaveTrees) {
                    const localDensity = adjustedDensity +
                        (random.next() * 0.2 - 0.1); // ±10% variation

                    if (y > 0 && x > 0 && chunk[y - 1][x - 1].tree) {
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
                    light: 10,
                    depth: hasTree,
                    stage: hasTree ? 2 : 0,
                    growStamp: performance.now() / 1000.0
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
