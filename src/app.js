/**
 * @author Davide Spano
 */
import {Event} from "./event";
import {EventTypes} from "./event";
import {Bounds} from "./layout/bounds";

function App(canvas, tree){
    this.canvas = canvas;
    this.g = canvas.getContext('2d');
    // create a secondary canvas for emulating the double buffering here
    this.canvas2 = canvas.cloneNode(true)
    this.g2 = this.canvas2.getContext('2d');
    this.tree = tree;
    if(this.tree){
        this.tree.parent = this;
    }
    this.q = [];
}

Object.assign( App.prototype, {
    start : function(){
        let self = this;
        if(this.tree != null){
            this.tree.paint(this.g2);
            // simulating flickering
            window.setTimeout(function(){
                self.tree.paint(self.g2);
            }, 500);

            window.setTimeout(function(){
                // switch the two buffers here
                self.g.drawImage(self.canvas2, 0,0);
            }, 700);

        }
    },

    invalidate: function(r, source){
        let evt = new Event(source, EventTypes.paint, {bounds: r});
        this.q.push(evt);
    },

    flushQueue: function(){
        let damagedArea = new Bounds(0,0,-1,-1);

        while(this.q.length > 0){
            let evt = this.q.shift();
            switch(evt.type){
                case EventTypes.paint:
                    damagedArea = damagedArea.union(evt.args.bounds);
                    break;
            }
        }

        let self = this;
        if(damagedArea.w > 0 && damagedArea.h > 0){
            this.tree.paint(this.g2, damagedArea);
            // simulating flickering
            window.setTimeout(function(){
                self.tree.paint(self.g2, damagedArea);
            }, 500);

            window.setTimeout(function(){
                // switch the two buffers here
                self.g.drawImage(self.canvas2, 0,0);
            }, 700);
        }
    }

});



export {App};