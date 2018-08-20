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
        this.entities = [];
        this.player = new Entity(new Point(100, 100), false);
        this.player.movement = new PlayerMovementComponent();
        this.player.graphics = new CreatureGraphicsComponent("assets/player.png");
    }
    Asteroid.prototype.tick = function (data) {
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var e = _a[_i];
            e.tick(data, this);
        }
        this.player.tick(data, this);
    };
    Asteroid.prototype.render = function (data, player_data, cam) {
        var mpos_in_space = data.mpos.plus(cam);
        var delta = mpos_in_space.minus(this.player.pos);
        this.map.render_background(data, cam);
        if (delta.dot(delta) <= BUILDING_RANGE * BUILDING_RANGE) {
            this.map.render_ghost(data, mpos_in_space, player_data, cam);
        }
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var e = _a[_i];
            e.render(data, cam);
        }
        this.player.render(data, cam);
        this.map.render_foreground(data, cam);
    };
    return Asteroid;
}());
var Entity = (function () {
    function Entity(pos, floating) {
        if (floating === void 0) { floating = false; }
        this.movement = null;
        this.graphics = null;
        this.pos = pos;
        this.velocity = new Point(0, 0);
        this.floating = floating;
    }
    Entity.prototype.tick = function (data, asteroid) {
        if (this.movement != null)
            this.movement.tick(data, this);
        if (!this.floating) {
            var pos = this.pos;
            var belt_velocity = new Point(0, 0);
            var coordinate = new Point(Math.floor(pos.x / tile_size), Math.floor(pos.y / tile_size));
            var prop_here = asteroid.map.get_prop(coordinate);
            if (prop_here != null) {
                var d = prop_here.belt_dir();
                if (d != null) {
                    var et = dir_to_vector(d);
                    var en = new Point(et.y, -et.x);
                    var center = new Point((coordinate.x + 1 / 2) * tile_size, (coordinate.y + 1 / 2) * tile_size);
                    var delta = en.times(pos.minus(center).dot(en));
                    var deltanorm = Math.sqrt(delta.dot(delta));
                    if (deltanorm < tile_size / 4)
                        belt_velocity = belt_velocity.plus(et.times(BELT_SPEED_PXPERSEC / 1000));
                    else
                        belt_velocity = belt_velocity.plus(delta.times(-BELT_SPEED_PXPERSEC / 1000 / deltanorm));
                }
            }
            this.velocity = this.velocity.plus(belt_velocity);
            var newposx = new Point(pos.x + this.velocity.x * DT, pos.y);
            if (!asteroid.map.empty(newposx))
                pos = newposx;
            var newposy = new Point(pos.x, pos.y + this.velocity.y * DT);
            if (!asteroid.map.empty(newposy))
                pos = newposy;
            this.pos = pos;
            this.velocity = this.velocity.minus(belt_velocity);
        }
        else {
            this.pos = this.pos.plus(this.velocity);
        }
    };
    Entity.prototype.render = function (data, cam) {
        if (this.graphics != null)
            this.graphics.render(data, this);
    };
    return Entity;
}());
var GameData = (function () {
    function GameData(canvas) {
        var _this = this;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.prev_t = Date.now();
        this.new_t = Date.now();
        this.keys = {};
        document.addEventListener("keydown", function (e) { _this.keys[e.keyCode] = true; });
        document.addEventListener("keyup", function (e) { delete _this.keys[e.keyCode]; });
        this.mpos = new Point(0, 0);
        this.canvas.addEventListener("mousemove", function (e) {
            var mpos = _this.mpos;
            mpos.x = e.clientX - _this.canvas.offsetLeft;
            mpos.y = e.clientY - _this.canvas.offsetTop;
        });
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
var GraphicsComponent = (function () {
    function GraphicsComponent() {
    }
    return GraphicsComponent;
}());
var Facing;
(function (Facing) {
    Facing[Facing["DOWN"] = 0] = "DOWN";
    Facing[Facing["RIGHT"] = 1] = "RIGHT";
    Facing[Facing["LEFT"] = 2] = "LEFT";
    Facing[Facing["UP"] = 3] = "UP";
})(Facing || (Facing = {}));
var CreatureGraphicsComponent = (function () {
    function CreatureGraphicsComponent(src, timePerFrame) {
        if (timePerFrame === void 0) { timePerFrame = 100; }
        this.facing = Facing.DOWN;
        this.timeInThisState = 0;
        this.tileset = new Tileset(src, 8, 16);
        this.timePerFrame = timePerFrame;
    }
    CreatureGraphicsComponent.prototype.render = function (data, entity) {
        if (entity.velocity.x == 0 && entity.velocity.y == 0) {
            this.timeInThisState = 0;
        }
        else {
            var oldFacing = this.facing;
            var newFacing = this.facingDirection(entity);
            if (oldFacing == newFacing) {
                this.timeInThisState += data.dt();
            }
            else {
                this.timeInThisState = 0;
                this.facing = newFacing;
            }
        }
        var tx = Math.floor(this.timeInThisState / this.timePerFrame) % 4;
        var tileset = this.tileset;
        tileset.draw(data, tx, this.facing, data.width / 2 - tileset.tile_width / 2, data.height / 2 - tileset.tile_height);
    };
    CreatureGraphicsComponent.prototype.facingDirection = function (entity) {
        var v = entity.velocity;
        if (v.y > 0)
            return Facing.DOWN;
        if (v.y < 0)
            return Facing.UP;
        if (v.x < 0)
            return Facing.LEFT;
        if (v.x > 0)
            return Facing.RIGHT;
        return Facing.DOWN;
    };
    return CreatureGraphicsComponent;
}());
var DT = 1000 / 60;
var BELT_SPEED_PXPERSEC = 32;
var BUILDING_RANGE = 100;
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
var Map = (function () {
    function Map(width, height, max_gen) {
        this.tileset = new Tileset("assets/tile.png", tile_size);
        this.width = width;
        this.height = height;
        this.max_gen = max_gen;
        this.ground = [];
        this.surface = {};
        this.init();
    }
    Map.prototype.init = function () {
        for (var i = 0; i < this.width; i++) {
            this.ground[i] = [];
            for (var j = 0; j < this.height; j++) {
                this.ground[i][j] = null;
            }
        }
        this.generate([500, 100, 100]);
    };
    Map.prototype.render_background = function (data, cam) {
        var img = new Image();
        img.src = 'assets/background.png';
        data.ctx.drawImage(img, -100 - cam.x / 10, -100 - cam.y / 10);
        var nwx = Math.max(Math.floor(cam.x / tile_size), 0);
        var nwy = Math.max(Math.floor(cam.y / tile_size), 0);
        var sex = Math.min(Math.ceil((cam.x + data.width) / tile_size), this.width - 1);
        var sey = Math.min(Math.ceil((cam.y + data.height) / tile_size), this.height - 1);
        for (var i = nwx; i <= sex; i++) {
            for (var j = nwy; j <= sey; j++) {
                var g = this.ground[i][j];
                if (g != null) {
                    g.render(data, this.tileset, i * tile_size - cam.x, j * tile_size - cam.y);
                }
            }
        }
        for (var i in this.surface) {
            var col = this.surface[i];
            for (var j in col) {
                var p = col[j];
                p.render_background(data, this.tileset, p.pos.x * tile_size - cam.x, p.pos.y * tile_size - cam.y);
            }
        }
    };
    Map.prototype.render_foreground = function (data, cam) {
        for (var i in this.surface) {
            var col = this.surface[i];
            for (var j in col) {
                var p = col[j];
                p.render_foreground(data, this.tileset, p.pos.x * tile_size - cam.x, p.pos.y * tile_size - cam.y);
            }
        }
    };
    Map.prototype.render_ghost = function (data, pos, player_data, cam) {
        var coordinates = new Point(Math.floor(pos.x / tile_size), Math.floor(pos.y / tile_size));
        if (coordinates.x < 0 || coordinates.x >= this.width)
            return;
        if (coordinates.y < 0 || coordinates.y >= this.height)
            return;
        switch (player_data.selected_building) {
            case BuildingType.BELT:
                console.log("blah");
                var g = new Belt(player_data.selected_direction);
                g.render(data, this.tileset, coordinates.x * tile_size - cam.x, coordinates.y * tile_size - cam.y, true);
                break;
            default: break;
        }
    };
    Map.prototype.generate = function (req) {
        var queue = [];
        var seed = new Point(rand_int(this.width), rand_int(this.height));
        for (var k = 0; k < 3; k++) {
            for (var i = 0; i < req[k]; i++) {
                while (this.ground[seed.x][seed.y])
                    seed = new Point(rand_int(this.width), rand_int(this.height));
                this.ground[seed.x][seed.y] = new Tile(k, 100);
                var to_fill = [];
                for (var j = 0; j < 8; j++)
                    to_fill.push([rand_int(3) - 1, rand_int(3) - 1]);
                for (var _i = 0, to_fill_1 = to_fill; _i < to_fill_1.length; _i++) {
                    var idx = to_fill_1[_i];
                    var new_pos = seed;
                    new_pos.x += idx[0];
                    new_pos.y += idx[1];
                    if (i < req[k] && new_pos.is_valid(this.width, this.height) && !this.ground[new_pos.x][new_pos.y]) {
                        this.ground[new_pos.x][new_pos.y] = new Tile(k, 100);
                        queue.push([new_pos, 0]);
                        i++;
                    }
                }
                queue.push([seed, 0]);
                seed = new Point(rand_int(this.width), rand_int(this.height));
            }
        }
        while (queue.length > 0) {
            var _a = queue[0], cur_pos = _a[0], cur_gen = _a[1];
            queue.shift();
            var to_fill = [];
            for (var j = 0; j < 4; j++)
                to_fill.push(rand_int(4));
            for (var _b = 0, to_fill_2 = to_fill; _b < to_fill_2.length; _b++) {
                var idx = to_fill_2[_b];
                var new_pos = cur_pos;
                if (idx == 0)
                    new_pos.x += 1;
                if (idx == 1)
                    new_pos.x -= 1;
                if (idx == 2)
                    new_pos.y += 1;
                if (idx == 3)
                    new_pos.y -= 1;
                if (cur_gen < this.max_gen && new_pos.is_valid(this.width, this.height) && !this.ground[new_pos.x][new_pos.y]) {
                    this.ground[new_pos.x][new_pos.y] = new Tile(Resource.ICE, 100);
                    queue.push([new_pos, cur_gen + 1]);
                }
            }
        }
    };
    Map.prototype.empty = function (p) {
        var i = Math.floor(p.x / tile_size);
        var j = Math.floor(p.y / tile_size);
        if (i < 0 || i >= this.width)
            return true;
        if (j < 0 || j >= this.width)
            return true;
        return (this.ground[i][j] == null);
    };
    Map.prototype.add_belt = function (pos, dir) {
        var i = pos.x;
        var j = pos.y;
        if (i in this.surface) {
            if (j in this.surface[i]) {
                var p = this.surface[i][j];
                if (p.belt == null) {
                    p.belt = new Belt(dir);
                    return true;
                }
                else
                    return false;
            }
            else {
                this.surface[i][j] = new Prop(pos);
                this.surface[j][j].belt = new Belt(dir);
                return true;
            }
        }
        else {
            this.surface[i] = {};
            this.surface[i][j] = new Prop(pos);
            this.surface[j][j].belt = new Belt(dir);
            return true;
        }
    };
    Map.prototype.get_prop = function (p) {
        if (p.x in this.surface)
            if (p.y in this.surface[p.x])
                return this.surface[p.x][p.y];
        return null;
    };
    return Map;
}());
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.is_valid = function (width, height) {
        return this.x >= 0 && this.y >= 0 && this.x < width && this.y < height;
    };
    Point.prototype.plus = function (other) {
        return new Point(this.x + other.x, this.y + other.y);
    };
    Point.prototype.minus = function (other) {
        return new Point(this.x - other.x, this.y - other.y);
    };
    Point.prototype.times = function (other) {
        return new Point(this.x * other, this.y * other);
    };
    Point.prototype.dot = function (other) {
        return this.x * other.x + this.y * other.y;
    };
    return Point;
}());
function rand_int(b) {
    return Math.floor(Math.random() * b);
}
function dir_to_vector(d) {
    switch (d) {
        case Facing.UP: return new Point(0, -1);
        case Facing.DOWN: return new Point(0, 1);
        case Facing.RIGHT: return new Point(1, 0);
        case Facing.LEFT: return new Point(-1, 0);
    }
}
var MovementComponent = (function () {
    function MovementComponent() {
    }
    return MovementComponent;
}());
var PlayerMovementComponent = (function () {
    function PlayerMovementComponent() {
    }
    PlayerMovementComponent.prototype.tick = function (data, entity) {
        entity.velocity = new Point(0, 0);
        if (68 in data.keys)
            entity.velocity.x += 1;
        if (65 in data.keys)
            entity.velocity.x -= 1;
        if (83 in data.keys)
            entity.velocity.y += 1;
        if (87 in data.keys)
            entity.velocity.y -= 1;
        if (entity.velocity.x != 0 || entity.velocity.y != 0) {
            var sf = 0.2 / ((function (v) { return Math.sqrt(v.x * v.x + v.y * v.y); })(entity.velocity));
            entity.velocity.x *= sf;
            entity.velocity.y *= sf;
        }
    };
    return PlayerMovementComponent;
}());
var Prop = (function () {
    function Prop(pos) {
        this.belt = null;
        this.building = null;
        this.pos = pos;
    }
    Prop.prototype.render_background = function (data, ts, x, y) {
        if (this.belt != null)
            this.belt.render(data, ts, x, y);
    };
    Prop.prototype.render_foreground = function (data, ts, x, y) {
        if (this.building != null)
            this.building.render(data, ts, x, y);
    };
    Prop.prototype.belt_dir = function () {
        if (this.belt == null)
            return null;
        else
            return this.belt.facing;
    };
    return Prop;
}());
var Building = (function () {
    function Building() {
    }
    ;
    Building.prototype.render = function (data, ts, x, y, ghost) {
        if (ghost === void 0) { ghost = false; }
        var _a = this.tile_pos(data), tx = _a[0], ty = _a[1];
        ts.draw(data, tx, ty, x, y);
    };
    return Building;
}());
var Mine = (function (_super) {
    __extends(Mine, _super);
    function Mine() {
        return _super.call(this) || this;
    }
    Mine.prototype.tile_pos = function (data) {
        return [0, 1];
    };
    return Mine;
}(Building));
var Belt = (function () {
    function Belt(facing) {
        this.facing = facing;
    }
    Belt.prototype.render = function (data, ts, x, y, ghost) {
        if (ghost === void 0) { ghost = false; }
        console.log(x, y);
        var _a = this.tile_pos(data), tx = _a[0], ty = _a[1];
        if (ghost)
            data.ctx.globalAlpha = 0.5;
        ts.draw(data, tx, ty, x, y);
        data.ctx.globalAlpha = 1;
    };
    Belt.prototype.tile_pos = function (data) {
        var ty = this.facing;
        var tx = 4 + Math.floor(data.curr_t() / 1000 * BELT_SPEED_PXPERSEC) % 4;
        return [tx, ty];
    };
    return Belt;
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
        _this.x = 0;
        return _this;
    }
    MenuState.prototype.tick = function () {
        this.x += this.data.dt() / 20;
        this.x %= 800;
        return this;
    };
    MenuState.prototype.render = function () {
        var background = new Image();
        background.src = 'assets/menu_background.png';
        var ctx = this.data.ctx;
        ctx.drawImage(background, this.x, 0);
        ctx.drawImage(background, this.x - background.width, 0);
    };
    return MenuState;
}(State));
var BuildingType;
(function (BuildingType) {
    BuildingType[BuildingType["NONE"] = 0] = "NONE";
    BuildingType[BuildingType["BELT"] = 1] = "BELT";
})(BuildingType || (BuildingType = {}));
var PlayerData = (function () {
    function PlayerData() {
        var _this = this;
        this.selected_building = BuildingType.BELT;
        this.selected_direction = Facing.UP;
        function next(dir) {
            switch (dir) {
                case Facing.UP: return Facing.RIGHT;
                case Facing.RIGHT: return Facing.DOWN;
                case Facing.DOWN: return Facing.LEFT;
                case Facing.LEFT: return Facing.UP;
            }
        }
        document.addEventListener("keydown", function (e) { if (e.keyCode == 82)
            _this.selected_direction = next(_this.selected_direction); });
    }
    return PlayerData;
}());
var PlayState = (function (_super) {
    __extends(PlayState, _super);
    function PlayState(data) {
        var _this = _super.call(this, data) || this;
        _this.player_data = new PlayerData();
        _this.asteroid = new Asteroid(new Map(100, 100, 25));
        _this.cam = new Point(0, 0);
        _this.leftover_t = 0;
        return _this;
    }
    PlayState.prototype.tick = function () {
        this.leftover_t += this.data.dt();
        while (this.leftover_t >= DT) {
            this.leftover_t -= DT;
            this.asteroid.tick(this.data);
            var player_pos = this.asteroid.player.pos;
            this.cam.x = player_pos.x - this.data.width / 2;
            this.cam.y = player_pos.y - this.data.height / 2;
        }
        return this;
    };
    PlayState.prototype.render = function () {
        this.data.ctx.fillStyle = "black";
        this.data.ctx.clearRect(0, 0, this.data.width, this.data.height);
        this.asteroid.render(this.data, this.player_data, this.cam);
    };
    return PlayState;
}(State));
var Tileset = (function () {
    function Tileset(src, tile_width, tile_height) {
        if (tile_height === void 0) { tile_height = tile_width; }
        this.img = new Image();
        this.img.src = src;
        this.tile_width = tile_width;
        this.tile_height = tile_height;
    }
    Tileset.prototype.draw = function (data, tx, ty, x, y) {
        var tile_width = this.tile_width;
        var tile_height = this.tile_height;
        data.ctx.drawImage(this.img, tx * tile_width, ty * tile_height, tile_width, tile_height, x, y, tile_width, tile_height);
    };
    return Tileset;
}());
