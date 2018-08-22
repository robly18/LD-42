var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Asteroid = (function () {
    function Asteroid(map) {
        this.lifetime = 0;
        this.map = map;
        this.entities = [];
        this.asteroids = [];
        this.player = new Entity(map.spawn.times(tile_size).plus(new Point(1, 1).times(tile_size / 2)), false);
        this.player.movement = new PlayerMovementComponent();
        this.player.graphics = new CreatureGraphicsComponent("assets/player.png");
    }
    Asteroid.prototype.tick = function (data, player_data, cam) {
        this.lifetime++;
        var center = new Point(this.map.width, this.map.height).times(tile_size / 2);
        var field_r = Math.sqrt(this.map.width * this.map.width + this.map.height * this.map.height) * tile_size / 2
            + Math.sqrt(data.width * data.width + data.height * data.height) / 2;
        if (this.lifetime % ASTEROID_INTERVAL == 0) {
            var theta = 2 * Math.random() * Math.PI;
            var p = center.plus(new Point(Math.sin(theta), Math.cos(theta)).times(field_r));
            var tgt = this.map.pick_target();
            var delta = tgt.minus(p);
            var v = delta.times(ASTEROID_VELOCITY / Math.sqrt(delta.dot(delta)));
            this.asteroids.push([p, v]);
        }
        for (var i = 0; i < this.asteroids.length;) {
            var a = this.asteroids[i];
            a[0] = a[0].plus(a[1].times(DT));
            var rvec = a[0].minus(center);
            var r = Math.sqrt(rvec.dot(rvec));
            if (!this.map.empty(a[0]) || r > field_r) {
                if (!this.map.empty(a[0]))
                    this.map.make_crater(a[0], this);
                this.asteroids[i] = this.asteroids[this.asteroids.length - 1];
                this.asteroids.length--;
            }
            else
                i++;
        }
        if (player_data.fuel <= 0)
            player_data.jetpack = false;
        this.player.floating = player_data.jetpack;
        if (player_data.jetpack) {
            player_data.fuel -= 1 / 16;
        }
        this.map.tick(this, player_data);
        for (var i = 0; i < this.entities.length;) {
            var e = this.entities[i];
            var stay = e.tick(data, this);
            if (stay)
                i++;
            else {
                this.entities[i] = this.entities[this.entities.length - 1];
                this.entities.length--;
            }
        }
        this.player.tick(data, this);
        if (data.mouse[0] && player_data.construction_parts > 0) {
            var mpos_in_space = data.mpos.plus(cam);
            var delta = mpos_in_space.minus(this.player.pos);
            if (delta.dot(delta) <= BUILDING_RANGE * BUILDING_RANGE) {
                if (this.map.build(data, mpos_in_space, player_data))
                    player_data.construction_parts--;
            }
        }
        if (data.mouse[2]) {
            var mpos_in_space = data.mpos.plus(cam);
            var delta = mpos_in_space.minus(this.player.pos);
            if (delta.dot(delta) <= BUILDING_RANGE * BUILDING_RANGE) {
                if (this.map.destroy_belt(new Point(Math.floor(mpos_in_space.x / tile_size), Math.floor(mpos_in_space.y / tile_size))))
                    player_data.construction_parts++;
            }
        }
    };
    Asteroid.prototype.render = function (data, player_data, cam) {
        var mpos_in_space = data.mpos.plus(cam);
        var delta = mpos_in_space.minus(this.player.pos);
        this.map.render_background(data, cam);
        if (delta.dot(delta) <= BUILDING_RANGE * BUILDING_RANGE)
            this.map.render_ghost(data, mpos_in_space, player_data, cam);
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var e = _a[_i];
            e.render(data, player_data, cam);
        }
        this.player.render(data, player_data, cam);
        this.map.render_foreground(data, cam);
        for (var _b = 0, _c = this.asteroids; _b < _c.length; _b++) {
            var a = _c[_b];
            var p = a[0];
            itemtileset.draw(data, 3, 0, Math.floor(p.x) - 4 - cam.x, Math.floor(p.y) - 4 - cam.y);
        }
    };
    Asteroid.prototype.deleteTileAt = function (pos) {
        this.map.ground[pos.x][pos.y] = null;
        if (pos.x in this.map.surface)
            delete this.map.surface[pos.x][pos.y];
    };
    return Asteroid;
}());
var Entity = (function () {
    function Entity(pos, floating) {
        if (floating === void 0) { floating = false; }
        this.item = null;
        this.movement = null;
        this.graphics = null;
        this.pos = pos;
        this.velocity = new Point(0, 0);
        this.floating = floating;
    }
    Entity.prototype.tick = function (data, asteroid) {
        if (this.movement != null)
            this.movement.tick(data, this);
        var pos = this.pos;
        var coordinate = new Point(Math.floor(pos.x / tile_size), Math.floor(pos.y / tile_size));
        if (!this.floating) {
            var belt_velocity = new Point(0, 0);
            var prop_here = asteroid.map.get_prop(coordinate);
            if (prop_here != null) {
                var d = prop_here.belt_dir();
                if (d != null) {
                    var et = dir_to_vector(d);
                    var en = new Point(et.y, -et.x);
                    var center = new Point((coordinate.x + 1 / 2) * tile_size, (coordinate.y + 1 / 2) * tile_size);
                    var delta = en.times(pos.minus(center).dot(en));
                    var deltanorm = Math.sqrt(delta.dot(delta));
                    if (deltanorm < tile_size / 10)
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
            this.pos = this.pos.plus(this.velocity.times(DT));
        }
        if (this.item != null)
            return !this.item.given(coordinate, asteroid);
        else
            return true;
    };
    Entity.prototype.render = function (data, player_data, cam) {
        if (this.graphics != null)
            this.graphics.render(data, this, player_data, cam);
    };
    return Entity;
}());
var ItemComponent = (function () {
    function ItemComponent(t) {
        this.t = t;
    }
    ItemComponent.prototype.given = function (coordinate, asteroid) {
        var p = asteroid.map.get_prop(coordinate);
        if (p == null)
            return false;
        else {
            var b = p.building;
            if (b == null)
                return false;
            else {
                return b.give(this.t);
            }
        }
    };
    return ItemComponent;
}());
var itemtileset;
function make_item(c, type) {
    var e = new Entity(new Point((c.x + Math.random()) * tile_size, (c.y + Math.random()) * tile_size));
    e.item = new ItemComponent(type);
    e.graphics = new StaticGraphicsComponent(itemtileset, type, 0);
    return e;
}
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
        this.mouse = [false, false, false];
        document.addEventListener("keydown", function (e) { _this.keys[e.keyCode] = true; });
        document.addEventListener("keyup", function (e) { delete _this.keys[e.keyCode]; });
        document.addEventListener("mousedown", function (e) { _this.mouse[e.button] = true; });
        document.addEventListener("mouseup", function (e) { _this.mouse[e.button] = false; });
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
var menu_state;
var navigation_state;
var Game = (function () {
    function Game(canvas) {
        this.data = new GameData(canvas);
        menu_state = new MenuState(this.data);
        navigation_state = new NavigationState(this.data);
        this.state = new PlayState(this.data);
        this.state.set_player_data(new PlayerData());
        this.state.set_map(navigation_state.map.matrix[0][0]);
    }
    Game.prototype.start = function () {
        var _this = this;
        this.data.canvas.addEventListener("click", function (e) {
            _this.state.click = true;
            for (var _i = 0, _a = _this.state.UI; _i < _a.length; _i++) {
                var E = _a[_i];
                if ((E instanceof SelectionButton || E instanceof LauchButton) && E.is_inside(_this.data.mpos)) {
                    E.on_click();
                    for (var _b = 0, _c = _this.state.UI; _b < _c.length; _b++) {
                        var A = _c[_b];
                        if (A != E && A instanceof SelectionButton && A.pressed)
                            A.on_click();
                    }
                }
            }
        });
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
    CreatureGraphicsComponent.prototype.render = function (data, entity, player_data, cam) {
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
        if (!player_data.jetpack)
            tileset.draw(data, tx, this.facing, data.width / 2 - tileset.tile_width / 2, data.height / 2 - tileset.tile_height);
        else
            tileset.draw(data, 4, this.facing, data.width / 2 - tileset.tile_width / 2, data.height / 2 - tileset.tile_height);
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
var StaticGraphicsComponent = (function () {
    function StaticGraphicsComponent(ts, tx, ty) {
        this.ts = ts;
        this.tx = tx;
        this.ty = ty;
    }
    StaticGraphicsComponent.prototype.render = function (data, entity, player_data, cam) {
        this.ts.draw(data, this.tx, this.ty, entity.pos.x - cam.x - this.ts.tile_width / 2, entity.pos.y - cam.y - this.ts.tile_height);
    };
    return StaticGraphicsComponent;
}());
var DT = 1000 / 60;
var BELT_SPEED_PXPERSEC = 32;
var BUILDING_RANGE = 100;
var TICKS_PER_MINE = 60;
var GROUND_MAX_VALUE = 32;
var CONSTRUCTION_PARTS_RECIPE = [5, 0, 1 / 16];
var CONSTRUCTION_PARTS_TIME = 100;
var FUEL_RECIPE = [0, 1, 1 / 256];
var FUEL_TIME = 420;
var ASTEROID_VELOCITY = 400 / 1000;
var ASTEROID_INTERVAL = 60;
window.onload = function () {
    itemtileset = new Tileset("assets/items.png", 8, 8);
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
        data.ctx.globalAlpha = this.quantity / GROUND_MAX_VALUE;
        ts.draw(data, tx, ty, x, y);
        data.ctx.globalAlpha = 1;
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
        this.spawn = this.generate([100, 0, 30]);
    };
    Map.prototype.tick = function (asteroid, player_data) {
        var surface = this.surface;
        for (var i in surface) {
            for (var j in surface[i]) {
                var b = surface[i][j].building;
                if (b != null)
                    b.tick(surface[i][j].pos, asteroid, player_data);
            }
        }
    };
    Map.prototype.render_background = function (data, cam) {
        var img = new Image();
        img.src = 'assets/menu_background.png';
        data.ctx.drawImage(img, -cam.x / 10, -cam.y / 10);
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
        if (this.emptyTile(coordinates))
            return false;
        switch (player_data.selected_building) {
            case BuildingType.BELT: {
                var g = new Belt(player_data.selected_direction);
                g.render(data, this.tileset, coordinates.x * tile_size - cam.x, coordinates.y * tile_size - cam.y, true);
                break;
            }
            case BuildingType.MINE: {
                var g = new Mine();
                g.render(data, this.tileset, coordinates.x * tile_size - cam.x, coordinates.y * tile_size - cam.y, true);
                break;
            }
            case BuildingType.CONSTRUCTION_PARTS_FACTORY: {
                var g = make_construction_parts_factory();
                g.render(data, this.tileset, coordinates.x * tile_size - cam.x, coordinates.y * tile_size - cam.y, true);
                break;
            }
            case BuildingType.FUEL_FACTORY: {
                var g = make_fuel_factory();
                g.render(data, this.tileset, coordinates.x * tile_size - cam.x, coordinates.y * tile_size - cam.y, true);
                break;
            }
            default: break;
        }
    };
    Map.prototype.build = function (data, pos, player_data) {
        var coordinates = new Point(Math.floor(pos.x / tile_size), Math.floor(pos.y / tile_size));
        if (coordinates.x < 0 || coordinates.x >= this.width)
            return false;
        if (coordinates.y < 0 || coordinates.y >= this.height)
            return false;
        switch (player_data.selected_building) {
            case BuildingType.BELT:
                return this.add_belt(new Point(coordinates.x, coordinates.y), player_data.selected_direction);
            case BuildingType.MINE:
                return this.add_building(new Point(coordinates.x, coordinates.y), new Mine());
            case BuildingType.CONSTRUCTION_PARTS_FACTORY:
                return this.add_building(new Point(coordinates.x, coordinates.y), make_construction_parts_factory());
            case BuildingType.FUEL_FACTORY:
                return this.add_building(new Point(coordinates.x, coordinates.y), make_fuel_factory());
            default: return false;
        }
    };
    Map.prototype.generate = function (req) {
        var queue = [];
        var seed = new Point(rand_int(this.width), rand_int(this.height));
        var ret = seed;
        for (var k = 0; k < 3; k++) {
            for (var i = 0; i < req[k]; i++) {
                while (this.ground[seed.x][seed.y])
                    seed = new Point(rand_int(this.width), rand_int(this.height));
                this.ground[seed.x][seed.y] = new Tile(k, GROUND_MAX_VALUE);
                var to_fill = [];
                for (var j = 0; j < 8; j++)
                    to_fill.push([rand_int(3) - 1, rand_int(3) - 1]);
                for (var _i = 0, to_fill_1 = to_fill; _i < to_fill_1.length; _i++) {
                    var idx = to_fill_1[_i];
                    var new_pos = seed;
                    new_pos.x += idx[0];
                    new_pos.y += idx[1];
                    if (i < req[k] && new_pos.is_valid(this.width, this.height) && !this.ground[new_pos.x][new_pos.y]) {
                        this.ground[new_pos.x][new_pos.y] = new Tile(k, GROUND_MAX_VALUE);
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
                    this.ground[new_pos.x][new_pos.y] = new Tile(Resource.ICE, GROUND_MAX_VALUE);
                    queue.push([new_pos, cur_gen + 1]);
                }
            }
        }
        console.log(ret);
        return ret;
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
    Map.prototype.emptyTile = function (p) {
        var i = p.x;
        var j = p.y;
        if (i < 0 || i >= this.width)
            return true;
        if (j < 0 || j >= this.width)
            return true;
        return (this.ground[i][j] == null);
    };
    Map.prototype.add_belt = function (pos, dir) {
        if (this.emptyTile(pos))
            return false;
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
                this.surface[i][j].belt = new Belt(dir);
                return true;
            }
        }
        else {
            this.surface[i] = {};
            this.surface[i][j] = new Prop(pos);
            this.surface[i][j].belt = new Belt(dir);
            return true;
        }
    };
    Map.prototype.destroy_belt = function (pos) {
        if (this.emptyTile(pos))
            return false;
        var i = pos.x;
        var j = pos.y;
        if (i in this.surface) {
            if (j in this.surface[i]) {
                var p = this.surface[i][j];
                if (p.belt != null) {
                    p.belt = null;
                    if (p.building == null)
                        delete this.surface[i][j];
                    return true;
                }
            }
        }
        return false;
    };
    Map.prototype.add_building = function (pos, b) {
        if (this.emptyTile(pos))
            return false;
        var i = pos.x;
        var j = pos.y;
        if (i in this.surface) {
            if (j in this.surface[i]) {
                var p = this.surface[i][j];
                if (p.building == null) {
                    p.building = b;
                    return true;
                }
                else
                    return false;
            }
            else {
                this.surface[i][j] = new Prop(pos);
                this.surface[i][j].building = b;
                return true;
            }
        }
        else {
            this.surface[i] = {};
            this.surface[i][j] = new Prop(pos);
            this.surface[i][j].building = b;
            return true;
        }
    };
    Map.prototype.get_prop = function (p) {
        if (p.x in this.surface)
            if (p.y in this.surface[p.x])
                return this.surface[p.x][p.y];
        return null;
    };
    Map.prototype.make_crater = function (p, asteroid) {
        var coords = new Point(Math.floor(p.x / tile_size), Math.floor(p.y / tile_size));
        for (var dx = -2; dx <= 2; dx++)
            for (var dy = -2; dy <= 2; dy++) {
                var cc = coords.plus(new Point(dx, dy));
                if (!this.emptyTile(cc)) {
                    var tile = this.ground[cc.x][cc.y];
                    tile.quantity -= Math.floor((9 - dx * dx - dy * dy) * (-Math.log(Math.random())));
                    if (tile.quantity <= 0)
                        asteroid.deleteTileAt(cc);
                }
            }
    };
    Map.prototype.pick_target = function () {
        var likelihoods = [];
        var total = 0;
        for (var i_1 = 0; i_1 != this.width; i_1++) {
            for (var j = 0; j != this.height; j++) {
                if (this.ground[i_1][j] == null)
                    continue;
                else {
                    var likelihood = 1;
                    if (i_1 in this.surface && j in this.surface[i_1])
                        likelihood *= 2;
                    total += likelihood;
                    likelihoods.push([total, new Point(i_1 + Math.random(), j + Math.random()).times(tile_size)]);
                }
            }
        }
        likelihoods.push([total * 0.01 + 1, new Point(Math.random() * this.width, Math.random() * this.height)]);
        var p = Math.random() * total;
        var i = 0;
        while (likelihoods[i][0] <= p)
            i++;
        return likelihoods[i][1];
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
        if (ghost)
            data.ctx.globalAlpha = 0.5;
        ts.draw(data, tx, ty, x, y);
        data.ctx.globalAlpha = 1;
    };
    Building.prototype.give = function (t) { return false; };
    return Building;
}());
var Mine = (function (_super) {
    __extends(Mine, _super);
    function Mine() {
        var _this = _super.call(this) || this;
        _this.ticks_since_mined = 0;
        _this.ticks_between_mine = TICKS_PER_MINE;
        return _this;
    }
    Mine.prototype.tick = function (coords, asteroid, player_data) {
        this.ticks_since_mined++;
        if (this.ticks_since_mined >= this.ticks_between_mine) {
            this.ticks_since_mined = 0;
            this.mine(coords, asteroid);
        }
    };
    Mine.prototype.mine = function (coords, asteroid) {
        var likelihood = [];
        var total = 0;
        for (var dx = -2; dx <= 2; dx++) {
            for (var dy = -2; dy <= 2; dy++) {
                var nc_1 = coords.plus(new Point(dx, dy));
                if (!asteroid.map.emptyTile(nc_1)) {
                    var this_likelihood = 3 - Math.sqrt(dx * dx + dy * dy);
                    if (asteroid.map.get_prop(nc_1) != null)
                        this_likelihood /= 5;
                    total += this_likelihood;
                    likelihood.push([total, nc_1]);
                }
            }
        }
        var n = Math.random() * total;
        var i = 0;
        while (n >= likelihood[i][0])
            i++;
        var nc = likelihood[i][1];
        var g = asteroid.map.ground[nc.x][nc.y];
        g.quantity--;
        asteroid.entities.push(make_item(coords, g.type));
        if (g.quantity == 0)
            asteroid.deleteTileAt(nc);
    };
    Mine.prototype.tile_pos = function (data) {
        return [0, 2];
    };
    return Mine;
}(Building));
var FactoryType;
(function (FactoryType) {
    FactoryType[FactoryType["FUEL"] = 0] = "FUEL";
    FactoryType[FactoryType["CONSTRUCTION_PARTS"] = 1] = "CONSTRUCTION_PARTS";
})(FactoryType || (FactoryType = {}));
var Factory = (function (_super) {
    __extends(Factory, _super);
    function Factory(recipe, ticks_to_build, type) {
        var _this = _super.call(this) || this;
        _this.have = [0, 0, 0];
        _this.ticks_til_build = -1;
        _this.recipe = recipe;
        _this.ticks_to_build = ticks_to_build;
        _this.type = type;
        return _this;
    }
    Factory.prototype.tick = function (coords, asteroid, player_data) {
        if (this.ticks_til_build == 0) {
            switch (this.type) {
                case FactoryType.FUEL:
                    player_data.fuel++;
                    break;
                case FactoryType.CONSTRUCTION_PARTS:
                    player_data.construction_parts++;
                    break;
            }
        }
        if (this.ticks_til_build >= 0) {
            this.ticks_til_build--;
        }
        if (this.ticks_til_build == -1) {
            var can = true;
            for (var i in this.have)
                if (this.have[i] < this.recipe[i])
                    can = false;
            if (can) {
                this.ticks_til_build = this.ticks_to_build;
                for (var i in this.have)
                    this.have[i] -= this.recipe[i];
            }
        }
    };
    Factory.prototype.render = function (data, ts, x, y, ghost) {
        if (ghost === void 0) { ghost = false; }
        _super.prototype.render.call(this, data, ts, x, y, ghost);
        if (this.ticks_til_build != -1) {
            var ctx = data.ctx;
            var barp = new Point(x + 2, y + tile_size - 6);
            var w = tile_size - 4;
            var h = 4;
            ctx.fillStyle = "black";
            ctx.fillRect(barp.x, barp.y, w, h);
            ctx.fillStyle = "green";
            ctx.fillRect(barp.x, barp.y, Math.floor(w * this.ticks_til_build / this.ticks_to_build), h);
        }
    };
    Factory.prototype.give = function (t) {
        if (this.have[t] < this.recipe[t]) {
            this.have[t]++;
            return true;
        }
        else
            return false;
    };
    Factory.prototype.tile_pos = function (data) {
        if (this.ticks_til_build == -1)
            switch (this.type) {
                case FactoryType.FUEL: return [0, 4];
                case FactoryType.CONSTRUCTION_PARTS: return [1, 4];
            }
        else
            switch (this.type) {
                case FactoryType.FUEL: return [0, 5];
                case FactoryType.CONSTRUCTION_PARTS: return [1, 5];
            }
        return [0, 0];
    };
    return Factory;
}(Building));
function make_construction_parts_factory() {
    return new Factory(CONSTRUCTION_PARTS_RECIPE, CONSTRUCTION_PARTS_TIME, FactoryType.CONSTRUCTION_PARTS);
}
function make_fuel_factory() {
    return new Factory(FUEL_RECIPE, FUEL_TIME, FactoryType.FUEL);
}
var Belt = (function () {
    function Belt(facing) {
        this.facing = facing;
    }
    Belt.prototype.render = function (data, ts, x, y, ghost) {
        if (ghost === void 0) { ghost = false; }
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
        this.UI = [];
        this.click = false;
    }
    State.prototype.set_map = function (map) { };
    State.prototype.set_player_data = function (player_data) { };
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
    BuildingType[BuildingType["MINE"] = 2] = "MINE";
    BuildingType[BuildingType["FUEL_FACTORY"] = 3] = "FUEL_FACTORY";
    BuildingType[BuildingType["CONSTRUCTION_PARTS_FACTORY"] = 4] = "CONSTRUCTION_PARTS_FACTORY";
})(BuildingType || (BuildingType = {}));
var PlayerData = (function () {
    function PlayerData() {
        var _this = this;
        this.selected_building = BuildingType.NONE;
        this.selected_direction = Facing.UP;
        function next(dir) {
            switch (dir) {
                case Facing.UP: return Facing.RIGHT;
                case Facing.RIGHT: return Facing.DOWN;
                case Facing.DOWN: return Facing.LEFT;
                case Facing.LEFT: return Facing.UP;
            }
        }
        document.addEventListener("keydown", function (e) {
            if (e.keyCode == 82)
                _this.selected_direction = next(_this.selected_direction);
            if (e.keyCode == 81)
                _this.selected_building = BuildingType.NONE;
            if (e.keyCode == 66)
                _this.selected_building = BuildingType.BELT;
            if (e.keyCode == 77)
                _this.selected_building = BuildingType.MINE;
            if (e.keyCode == 70)
                _this.selected_building = BuildingType.FUEL_FACTORY;
            if (e.keyCode == 67)
                _this.selected_building = BuildingType.CONSTRUCTION_PARTS_FACTORY;
            if (e.keyCode == 74) {
                if (_this.fuel > 0)
                    _this.jetpack = !_this.jetpack;
            }
        });
        this.construction_parts = 10;
        this.fuel = 100;
        this.jetpack = false;
    }
    return PlayerData;
}());
var PlayState = (function (_super) {
    __extends(PlayState, _super);
    function PlayState(data) {
        var _this = _super.call(this, data) || this;
        _this.player_data = new PlayerData();
        _this.map = new Map(30, 30, 25);
        _this.asteroid = new Asteroid(_this.map);
        _this.cam = new Point(0, 0);
        _this.leftover_t = 0;
        _this.init_UI();
        return _this;
    }
    PlayState.prototype.set_player_data = function (player_data) {
        this.player_data = player_data;
    };
    PlayState.prototype.set_map = function (map) {
        this.map = map;
        this.asteroid = new Asteroid(map);
    };
    PlayState.prototype.init_UI = function () {
        this.UI = [];
        var buttons_tileset = new Tileset('assets/button.png', 32);
        this.UI.push(new SelectionButton(buttons_tileset, new Point(10, 44), new Point(0, 1), BuildingType.MINE));
        this.UI.push(new SelectionButton(buttons_tileset, new Point(10, 10), new Point(0, 0), BuildingType.BELT));
        this.UI.push(new SelectionButton(buttons_tileset, new Point(10, 78), new Point(0, 2), BuildingType.FUEL_FACTORY));
        this.UI.push(new SelectionButton(buttons_tileset, new Point(10, 112), new Point(0, 3), BuildingType.CONSTRUCTION_PARTS_FACTORY));
        this.UI.push(new LauchButton(buttons_tileset, new Point(10, 146), new Point(2, 1)));
        this.UI.push(new MineralCounter(0, 0, new Point(10, 590)));
        this.UI.push(new FuelInfo(0, 0, new Point(10, 570)));
    };
    PlayState.prototype.tick = function () {
        this.leftover_t += this.data.dt();
        while (this.leftover_t >= DT) {
            this.leftover_t -= DT;
            this.asteroid.tick(this.data, this.player_data, this.cam);
            var player_pos = this.asteroid.player.pos;
            this.cam.x = Math.floor(player_pos.x - this.data.width / 2);
            this.cam.y = Math.floor(player_pos.y - this.data.height / 2);
            for (var _i = 0, _a = this.UI; _i < _a.length; _i++) {
                var E = _a[_i];
                if (E instanceof LauchButton && E.pressed) {
                    var p = navigation_state.map.cur_pos;
                    navigation_state.map.matrix[p.x][p.y] = null;
                    this.player_data.construction_parts = 10;
                    this.player_data.jetpack = false;
                    navigation_state.set_player_data(this.player_data);
                    return navigation_state;
                }
                E.tick(this.player_data);
            }
        }
        return this;
    };
    PlayState.prototype.render = function () {
        this.data.ctx.fillStyle = "black";
        this.data.ctx.clearRect(0, 0, this.data.width, this.data.height);
        this.asteroid.render(this.data, this.player_data, this.cam);
        for (var _i = 0, _a = this.UI; _i < _a.length; _i++) {
            var E = _a[_i];
            E.render(this.data);
        }
    };
    return PlayState;
}(State));
var NavigationState = (function (_super) {
    __extends(NavigationState, _super);
    function NavigationState(data) {
        var _this = _super.call(this, data) || this;
        _this.UI = [];
        _this.map = new SuperDuperAwesomeGalacticSpaceStarMap(17, 12);
        return _this;
    }
    NavigationState.prototype.set_player_data = function (player_data) {
        this.player_data = player_data;
    };
    NavigationState.prototype.tick = function () {
        if (this.click) {
            this.click = false;
            var p = new Point(Math.floor(this.data.mpos.x / 47), Math.floor(this.data.mpos.y / 50));
            if (!this.map.is_empty(p) && COST_PER_UNIT * this.map.dist(this.map.cur_pos, p) <= this.player_data.fuel) {
                this.player_data.fuel -= COST_PER_UNIT * this.map.dist(this.map.cur_pos, p);
                var new_state = new PlayState(this.data);
                new_state.set_map(this.map.matrix[p.x][p.y]);
                new_state.set_player_data(this.player_data);
                this.map.cur_pos = p;
                return new_state;
            }
        }
        return this;
    };
    NavigationState.prototype.render = function () {
        var img = new Image();
        img.src = 'assets/menu_background.png';
        this.data.ctx.drawImage(img, 0, 0);
        var width = Math.floor(800 / this.map.width);
        var height = Math.floor(600 / this.map.height);
        this.data.ctx.fillStyle = "white";
        for (var i = 0; i < this.map.width; i++)
            this.data.ctx.fillRect(i * width, 0, 1, 600);
        this.data.ctx.fillRect(799, 0, 1, 600);
        for (var i = 0; i < this.map.height; i++)
            this.data.ctx.fillRect(0, i * height, 800, 1);
        this.data.ctx.fillRect(0, 599, 800, 1);
        var ast = new Image();
        ast.src = 'assets/asteroid.png';
        for (var i = 0; i < this.map.width; i++)
            for (var j = 0; j < this.map.height; j++)
                if (!this.map.is_empty(new Point(i, j)) && !(i == 16 && j == 11))
                    this.data.ctx.drawImage(ast, i * width, j * height);
        var plr = new Image();
        plr.src = 'assets/player.png';
        this.data.ctx.drawImage(plr, 0, 0, 8, 16, this.map.cur_pos.x * width + 16, this.map.cur_pos.y * height + 10, 16, 32);
        this.data.ctx.fillStyle = 'white';
        var p = new Point(Math.floor(this.data.mpos.x / 47), Math.floor(this.data.mpos.y / 50));
        var cost = this.map.dist(this.map.cur_pos, p) * COST_PER_UNIT;
        if (cost > this.player_data.fuel)
            this.data.ctx.fillStyle = 'red';
        this.data.ctx.font = "13px Arial";
        this.data.ctx.fillText("Fuel: " + cost, this.data.mpos.x, this.data.mpos.y);
    };
    return NavigationState;
}(State));
var COST_PER_UNIT = 50;
var SuperDuperAwesomeGalacticSpaceStarMap = (function () {
    function SuperDuperAwesomeGalacticSpaceStarMap(width, height) {
        this.width = width;
        this.height = height;
        this.cur_pos = new Point(0, 0);
        this.matrix = [];
        this.init();
    }
    SuperDuperAwesomeGalacticSpaceStarMap.prototype.init = function () {
        for (var i = 0; i < this.width; i++) {
            this.matrix[i] = [];
            for (var j = 0; j < this.height; j++)
                this.matrix[i][j] = null;
        }
        this.generate();
    };
    SuperDuperAwesomeGalacticSpaceStarMap.prototype.generate = function () {
        this.matrix[0][0] = new Map(30, 30, 25);
        for (var i = 0; i < this.width; i++)
            for (var j = 0; j < this.height; j++)
                if (rand_int(100) < 20)
                    this.matrix[i][j] = new Map(30, 30, 25);
    };
    SuperDuperAwesomeGalacticSpaceStarMap.prototype.is_empty = function (p) {
        return this.matrix[p.x][p.y] == null;
    };
    SuperDuperAwesomeGalacticSpaceStarMap.prototype.dist = function (p1, p2) {
        return Math.max(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
    };
    return SuperDuperAwesomeGalacticSpaceStarMap;
}());
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
var SelectionButton = (function () {
    function SelectionButton(tileset, screen_pos, tileset_pos, switch_to) {
        this.pressed = false;
        this.tileset = tileset;
        this.screen_pos = screen_pos;
        this.tileset_pos = tileset_pos;
        this.switch_to = switch_to;
        this.width = tileset.tile_width;
        this.height = tileset.tile_height;
    }
    SelectionButton.prototype.render = function (data) {
        var _a = [this.tileset_pos.x, this.tileset_pos.y], tx = _a[0], ty = _a[1];
        if (this.pressed) {
            tx += 1;
        }
        this.tileset.draw(data, tx, ty, this.screen_pos.x, this.screen_pos.y);
    };
    SelectionButton.prototype.tick = function (player_data) {
        if (this.pressed)
            player_data.selected_building = this.switch_to;
    };
    SelectionButton.prototype.is_inside = function (p) {
        if (p.x >= this.screen_pos.x && p.x <= this.screen_pos.x + this.width)
            if (p.y >= this.screen_pos.y && p.y <= this.screen_pos.y + this.height)
                return true;
        return false;
    };
    SelectionButton.prototype.on_click = function () {
        this.pressed = !this.pressed;
    };
    return SelectionButton;
}());
var LauchButton = (function () {
    function LauchButton(tileset, screen_pos, tileset_pos) {
        this.tileset = tileset;
        this.screen_pos = screen_pos;
        this.tileset_pos = tileset_pos;
        this.width = tileset.tile_width;
        this.height = tileset.tile_height;
    }
    LauchButton.prototype.render = function (data) {
        var _a = [this.tileset_pos.x, this.tileset_pos.y], tx = _a[0], ty = _a[1];
        if (this.pressed) {
            tx += 1;
        }
        this.tileset.draw(data, tx, ty, this.screen_pos.x, this.screen_pos.y);
    };
    LauchButton.prototype.tick = function () { };
    LauchButton.prototype.is_inside = function (p) {
        if (p.x >= this.screen_pos.x && p.x <= this.screen_pos.x + this.width)
            if (p.y >= this.screen_pos.y && p.y <= this.screen_pos.y + this.height)
                return true;
        return false;
    };
    LauchButton.prototype.on_click = function () {
        this.pressed = !this.pressed;
    };
    return LauchButton;
}());
var MineralCounter = (function () {
    function MineralCounter(width, height, screen_pos) {
        this.width = width;
        this.height = height;
        this.screen_pos = screen_pos;
        this.construction_parts = 0;
    }
    MineralCounter.prototype.tick = function (player_data) {
        this.construction_parts = player_data.construction_parts;
    };
    MineralCounter.prototype.render = function (data) {
        data.ctx.fillStyle = 'white';
        data.ctx.font = "13px Arial";
        data.ctx.fillText("CP: " + this.construction_parts, this.screen_pos.x, this.screen_pos.y);
    };
    MineralCounter.prototype.on_click = function (data) { };
    return MineralCounter;
}());
var FuelInfo = (function () {
    function FuelInfo(width, height, screen_pos) {
        this.width = width;
        this.height = height;
        this.screen_pos = screen_pos;
        this.fuel = 0;
    }
    FuelInfo.prototype.tick = function (player_data) {
        this.fuel = player_data.fuel;
    };
    FuelInfo.prototype.render = function (data) {
        data.ctx.fillStyle = 'white';
        data.ctx.font = "13px Arial";
        data.ctx.fillText("Fuel: " + Math.floor(this.fuel), this.screen_pos.x, this.screen_pos.y);
    };
    FuelInfo.prototype.on_click = function (data) { };
    return FuelInfo;
}());
