var dt = 1000 / 60;
var Game = (function () {
    function Game(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
    }
    Game.prototype.start = function () {
        this.prev_t = Date.now();
        this.loop();
    };
    Game.prototype.loop = function () {
        console.log("Im alive");
        var cur_t = Date.now();
        var delta = cur_t - this.prev_t;
        while (delta > dt) {
            delta -= dt;
            this.tick();
        }
        this.render();
        this.prev_t = Date.now();
        requestAnimationFrame(this.loop.bind(this));
    };
    Game.prototype.tick = function () { };
    Game.prototype.render = function () { };
    return Game;
}());
var canvas;
var ctx;
window.onload = function () {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    var game = new Game(canvas);
    game.start();
};
