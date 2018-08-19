var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Asteroid = (function () {
    function Asteroid(map) {
        this.map = map;
    }
    Asteroid.prototype.tick = function () {
    };
    Asteroid.prototype.render = function (data) {
        var ctx = data.ctx;
        this.map.render(data);
    };
    return Asteroid;
}());
var Entity = (function () {
    function Entity(pos) {
        this.pos = pos;
    }
    return Entity;
}());
var GameData = (function () {
    function GameData(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.prev_t = Date.now();
        this.new_t = Date.now();
    }
    GameData.prototype.tick = function () {
        this.prev_t = this.new_t;
        this.new_t = Date.now();
    };
    GameData.prototype.dt = function () {
        return this.new_t - this.prev_t;
    };
    GameData.prototype.curr_t = function () {
        return this.new_t;
    };
    return GameData;
}());
var Game = (function () {
    function Game(canvas) {
        this.data = new GameData(canvas);
        this.state = new PlayState(this.data);
    }
    Game.prototype.start = function () {
        this.data.tick();
        this.data.tick();
        this.loop();
    };
    Game.prototype.loop = function () {
        this.data.tick();
        this.state = this.state.tick();
        this.state.render();
        requestAnimationFrame(this.loop.bind(this));
    };
    return Game;
}());
window.onload = function () {
    var game = new Game(document.getElementById('canvas'));
    game.start();
};
var tile_size = 32;
var Resource;
(function (Resource) {
    Resource[Resource["MATTER"] = 0] = "MATTER";
    Resource[Resource["ICE"] = 1] = "ICE";
    Resource[Resource["URANIUM"] = 2] = "URANIUM";
})(Resource || (Resource = {}));
var Tile = (function () {
    function Tile(type, qt) {
        this.type = type;
        this.quantity = qt;
    }
    Tile.prototype.render = function (data, ts, x, y) {
        var _a = this.tilePos(), tx = _a[0], ty = _a[1];
        ts.draw(data, tx, ty, x, y);
    };
    Tile.prototype.tilePos = function () {
        switch (this.type) {
            case Resource.MATTER: return [1, 0];
            case Resource.ICE: return [2, 0];
            case Resource.URANIUM: return [3, 0];
            default: return [0, 0];
        }
    };
    return Tile;
}());
var Tileset = (function () {
    function Tileset(src) {
        this.img = new Image();
        this.img.src = src;
    }
    Tileset.prototype.draw = function (data, tx, ty, x, y) {
        data.ctx.drawImage(this.img, tx * tile_size, ty * tile_size, tile_size, tile_size, x, y, tile_size, tile_size);
    };
    return Tileset;
}());
var Map = (function () {
    function Map(width, height) {
        this.tileset = new Tileset("tile.png");
        this.width = width;
        this.height = height;
        this.ground = [];
        this.surface = [];
        for (var i = 0; i < width; i++) {
            this.ground[i] = [];
            this.surface[i] = [];
            for (var j = 0; j < height; j++) {
                this.ground[i][j] = new Tile(Resource.MATTER, 100);
                this.surface[i][j] = null;
            }
        }
    }
    Map.prototype.render = function (data) {
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                var g = this.ground[i][j];
                if (g != null) {
                    g.render(data, this.tileset, i * tile_size, j * tile_size);
                }
            }
        }
    };
    return Map;
}());
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
var Prop = (function () {
    function Prop(pos) {
        this.pos = pos;
    }
    return Prop;
}());
var State = (function () {
    function State(data) {
        this.data = data;
    }
    State.prototype.tick = function () { return this; };
    State.prototype.render = function () { };
    return State;
}());
var MenuState = (function (_super) {
    __extends(MenuState, _super);
    function MenuState(data) {
        var _this = _super.call(this, data) || this;
        _this.carry_t = 0;
        _this.secno = 0;
        return _this;
    }
    MenuState.prototype.tick = function () {
        this.carry_t += this.data.dt();
        while (this.carry_t > 1000) {
            this.carry_t -= 1000;
            this.secno += 1;
        }
        return this;
    };
    MenuState.prototype.render = function () {
        var ctx = this.data.ctx;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, this.data.width, this.data.height);
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.fillText("It has been " + String(this.secno) + (this.secno == 1 ? " second." : " seconds."), 10, 50);
    };
    return MenuState;
}(State));
var PlayState = (function (_super) {
    __extends(PlayState, _super);
    function PlayState(data) {
        var _this = _super.call(this, data) || this;
        _this.asteroid = new Asteroid(new Map(10, 10));
        return _this;
    }
    PlayState.prototype.tick = function () {
        this.asteroid.tick();
        return this;
    };
    PlayState.prototype.render = function () {
        this.asteroid.render(this.data);
    };
    return PlayState;
}(State));
