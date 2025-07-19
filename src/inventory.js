export class Inventory {
    constructor(ctx, w, h) {
        this.ctx = ctx;
        this.w = w;
        this.h = h;
        
        this.slots = new Array(9).fill(null).map(() => {
            return { id: 0, amt: 0 }; // 0 = empty
        });
        
        this.slotSize = 16;
        this.padding = 5;
        this.selectedSlot = 0;
        
        this.itemsTexture = new Image();
        this.itemsTexture.src = 'data/graphics/items.png';
        
        this.x = (this.w - (this.slotSize * 9 + this.padding * 8)) / 2;
        this.y = this.h - this.slotSize - 20;
    }

    render() {
        this.ctx.save();
        
        this.ctx.fillStyle = 'rgba(100, 100, 100, 0.7)';
        for (let i = 0; i < 9; i++) {
            const x = this.x + i * (this.slotSize + this.padding);
            this.ctx.fillRect(x, this.y, this.slotSize, this.slotSize);
            
            this.ctx.strokeStyle = i === this.selectedSlot ? 'gold' : 'black';
            this.ctx.lineWidth = i === this.selectedSlot ? 2 : 1;
            this.ctx.strokeRect(x, this.y, this.slotSize, this.slotSize);
        }
        
        for (let i = 0; i < 9; i++) {
            const slot = this.slots[i];
            if (slot.id > 0 && slot.amt > 0) {
                const x = this.x + i * (this.slotSize + this.padding);
                
                const texX = ((slot.id - 1) % 16) * 16;
                const texY = Math.floor((slot.id - 1) / 16) * 16;
                
                this.ctx.drawImage(
                    this.itemsTexture,
                    texX, texY, 16, 16,
                    x + 2, this.y + 2, this.slotSize - 4, this.slotSize - 4
                );
                
                if (slot.amt > 1) {
                    this.ctx.fillStyle = 'white';
                    this.ctx.font = '8px Arial';
                    this.ctx.fillText(
                        slot.amt.toString(),
                        x + this.slotSize - 16,
                        this.y + this.slotSize - 8
                    );
                }
            }
        }
        
        this.ctx.restore();
    }

    update(dt, keys, mouse) {
        for (let i = 0; i < 9; i++) {
            if (keys[(i+1).toString()]) { // 49 = '1'
                this.selectedSlot = i;
            }
        }
        
        if (mouse.wheelDelta) {
            this.selectedSlot += mouse.wheelDelta > 0 ? -1 : 1;
            if (this.selectedSlot < 0) this.selectedSlot = 8;
            if (this.selectedSlot > 8) this.selectedSlot = 0;
            mouse.wheelDelta = 0; // Reset
        }
    }
    
    addItem(id, amount = 1) {
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i].id === id) {
                this.slots[i].amt += amount;
                return true;
            }
        }
        
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i].id === 0) {
                this.slots[i].id = id;
                this.slots[i].amt = amount;
                return true;
            }
        }
        
        return false; // No space
    }
    
    removeItem(id, amount = 1) {
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i].id === id) {
                if (this.slots[i].amt > amount) {
                    this.slots[i].amt -= amount;
                    return true;
                } else if (this.slots[i].amt === amount) {
                    this.slots[i].id = 0;
                    this.slots[i].amt = 0;
                    return true;
                }
            }
        }
        return false;
    }
    
    removeFromSelected(amount = 1) {
        const slot = this.slots[this.selectedSlot];
        if (slot.id === 0 || slot.amt === 0) return false;
        
        if (slot.amt > amount) {
            slot.amt -= amount;
            return true;
        } else {
            const id = slot.id;
            slot.id = 0;
            slot.amt = 0;
            return id;
        }
    }
    
    hasItem(id, amount = 1) {
        let total = 0;
        for (const slot of this.slots) {
            if (slot.id === id) {
                total += slot.amt;
                if (total >= amount) return true;
            }
        }
        return false;
    }
    
    getItemCount(id) {
        let count = 0;
        for (const slot of this.slots) {
            if (slot.id === id) {
                count += slot.amt;
            }
        }
        return count;
    }
    
    getSelectedItem() {
        return this.slots[this.selectedSlot];
    }
    
    isFull() {
        for (const slot of this.slots) {
            if (slot.id === 0) return false;
        }
        return true;
    }
}