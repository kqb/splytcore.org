var Canvas = document.getElementById('canvas-x-o');
var ctx = Canvas.getContext('2d');
var img =  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="128px" height="127px" viewBox="0 0 128 127" preserveAspectRatio="xMidYMid meet"><script xmlns=""/>
<g>
 <path d="M50.2 124.5 c-17.2 -3.8 -34.4 -17.4 -42 -33.5 -5 -10.6 -6.4 -16.7 -6.4 -27.5 0 -10.8 1.4 -16.9 6.4 -27.5 3.3 -6.9 5.6 -10 12.2 -16.5 15.8 -15.6 35.6 -21.5 57 -17 17.6 3.7 34.6 17.2 42.4 33.5 5 10.6 6.4 16.7 6.4 27.5 0 10.8 -1.4 16.9 -6.4 27.5 -7.8 16.3 -24.8 29.8 -42.4 33.5 -8.5 1.8 -18.9 1.8 -27.2 0z m31.8 -7.2 c17.5 -5.7 30.4 -18.8 36.6 -37.3 2.6 -7.7 2.6 -25.3 0 -33 -4.6 -13.5 -11.7 -23.2 -22.3 -30.3 -19.6 -13.3 -45 -13.3 -64.6 0 -10.6 7.1 -17.7 16.8 -22.3 30.3 -2.6 7.7 -2.6 25.3 0 33 10.7 31.4 41.8 47.4 72.6 37.3z"/>
 <path d="M65.1 102.4 c-1.2 -1.5 -2.1 -3.5 -2.1 -4.6 0 -2.6 5.3 -7.8 8 -7.8 6.4 0 11 -6.2 11 -15 0 -8.8 -4.6 -15 -11 -15 -2.7 0 -8 -5.2 -8 -7.8 0 -3.3 3.8 -7.2 7.1 -7.2 4.8 0 6.7 1.7 8.4 7.2 0.8 2.9 2.7 6.5 4.2 8 2.3 2.4 3.5 2.8 8.2 2.8 10.2 0 16.4 6.6 14.1 14.9 -1.6 6 -4.8 8.3 -12.9 9 -8.6 0.8 -11.4 3 -13.6 10.7 -1.7 5.7 -3.5 7.4 -8.4 7.4 -2 0 -3.6 -0.8 -5 -2.6z"/>
 <path d="M52.8 80.9 c-1 -0.5 -2.4 -3.3 -3.3 -6.1 -0.8 -2.9 -2.7 -6.5 -4.2 -8 -2.3 -2.4 -3.5 -2.8 -8.2 -2.8 -10.2 0 -16.4 -6.6 -14.1 -14.9 1.6 -6 4.8 -8.3 12.9 -9 8.6 -0.8 11.4 -3 13.6 -10.7 1.7 -5.7 3.5 -7.4 8.4 -7.4 3.3 0 7.1 3.9 7.1 7.2 0 2.6 -5.3 7.8 -8 7.8 -6.4 0 -11 6.2 -11 15 0 8.8 4.6 15 11 15 2.7 0 8 5.2 8 7.8 0 1.1 -0.9 3.1 -2.1 4.6 -2.2 2.8 -6.8 3.5 -10.1 1.5z"/>
</g>
</svg>`;


var resize = function() {
    Canvas.width = Canvas.clientWidth;
    Canvas.height = Canvas.clientHeight;
};
window.addEventListener('resize', resize);
resize();

var elements = [];
var presets = {};

presets.o = function (x, y, s, dx, dy, ts) {
    return {
        x: x,
        y: y,
        r: 12 * s,
        w: 5 * s,
        dx: dx,
        dy: dy,
        ts,
        draw: function(ctx, t) {
            this.x += this.dx;
            this.y += this.dy;
            
            ctx.beginPath();
            ctx.arc(this.x + + Math.sin((50 + x + (t / 10)) / 100) * 3, this.y + + Math.sin((45 + x + (t / 10)) / 100) * 20, this.r, 0, 2 * Math.PI, false);
            ctx.lineWidth = this.w;
            ctx.strokeStyle = `rgba(167, 0, 126, ${this.ts})`;
            ctx.fillStyle = `rgba(167, 0, 126, ${this.ts})`;
            ctx.fill();
            ctx.restore();
        }
    }
};

presets.x = function (x, y, s, dx, dy, dr, r, ts) {
    r = r || 0;
    let pth = "M65.1 102.4 c-1.2 -1.5 -2.1 -3.5 -2.1 -4.6 0 -2.6 5.3 -7.8 8 -7.8 6.4 0 11 -6.2 11 -15 0 -8.8 -4.6 -15 -11 -15 -2.7 0 -8 -5.2 -8 -7.8 0 -3.3 3.8 -7.2 7.1 -7.2 4.8 0 6.7 1.7 8.4 7.2 0.8 2.9 2.7 6.5 4.2 8 2.3 2.4 3.5 2.8 8.2 2.8 10.2 0 16.4 6.6 14.1 14.9 -1.6 6 -4.8 8.3 -12.9 9 -8.6 0.8 -11.4 3 -13.6 10.7 -1.7 5.7 -3.5 7.4 -8.4 7.4 -2 0 -3.6 -0.8 -5 -2.6z";
// let pth = `M44.9,90.9c-1.2-1.5-2.1-3.5-2.1-4.6c0-2.6,5.3-7.8,8-7.8c6.4,0,11-6.2,11-15s-4.6-15-11-15c-2.7,0-8-5.2-8-7.8
// c0-3.3,3.8-7.2,7.1-7.2c4.8,0,6.7,1.7,8.4,7.2c0.8,2.9,2.7,6.5,4.2,8c2.3,2.4,3.5,2.8,8.2,2.8c10.2,0,16.4,6.6,14.1,14.9
// c-1.6,6-4.8,8.3-12.9,9c-8.6,0.8-11.4,3-13.6,10.7c-1.7,5.7-3.5,7.4-8.4,7.4C47.9,93.5,46.3,92.7,44.9,90.9z`;
return {
        x: x,
        y: y,
        s: 20 * s,
        w: 5 * s,
        r: r,
        dx: dx,
        dy: dy,
        dr: dr,
        pth,
        ts,
        draw: function(ctx, t) {
            this.x += this.dx;
            this.y += this.dy;
            this.r += this.dr;
            
            var _this = this;
            var line = function(x, y, tx, ty, c, o) {
                o = o || 0;
                // ctx.setTransform(1, 1, 1, 1, 0, 0);

                // ctx.beginPath();
                // ctx.moveTo(-o + ((_this.s / 2) * x), o + ((_this.s / 2) * y));
                // ctx.lineTo(-o + ((_this.s / 2) * tx), o + ((_this.s / 2) * ty));
                p = new Path2D();

                var m = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
                // m.a = 1/(_this.s/2); m.b = 0;
                // m.c = 0; m.d = 1/(_this.s/2);
                // m.e = -_this.w; m.f = 0;
                m.a = 1/(_this.s/2);
                m.b = 0;
                m.c = 0;
                m.d = 1/(_this.s/2);
                m.e = -102.4/(_this.s/2);
                m.f = -70/(_this.s/2);
                // add the second path to the first path
                p.addPath(new Path2D(_this.pth), m);
                ctx.lineWidth = _this.w;
                ctx.strokeStyle = c;
                ctx.fillStyle = c;

                // ctx.stroke();
                // p = new Path2D(_this.pth);

                // pth = new Path2D(_this.pth.split(" ").map((e,i, a)=>{let l = e.match(/[a-zA-Z]/); return i!==a.length-1?`${l?l:""}${parseFloat(e.match(/[0-9\.-]+/))/(_this.s / 2)}`:`${parseFloat(e.match(/[0-9\.-]+/))/(_this.s / 2)}${l?l:""}`}).join());
                ctx.fill(p);

            };
     
            // let p1 = new Path2D("M50.2 124.5 c-17.2 -3.8 -34.4 -17.4 -42 -33.5 -5 -10.6 -6.4 -16.7 -6.4 -27.5 0 -10.8 1.4 -16.9 6.4 -27.5 3.3 -6.9 5.6 -10 12.2 -16.5 15.8 -15.6 35.6 -21.5 57 -17 17.6 3.7 34.6 17.2 42.4 33.5 5 10.6 6.4 16.7 6.4 27.5 0 10.8 -1.4 16.9 -6.4 27.5 -7.8 16.3 -24.8 29.8 -42.4 33.5 -8.5 1.8 -18.9 1.8 -27.2 0z m31.8 -7.2 c17.5 -5.7 30.4 -18.8 36.6 -37.3 2.6 -7.7 2.6 -25.3 0 -33 -4.6 -13.5 -11.7 -23.2 -22.3 -30.3 -19.6 -13.3 -45 -13.3 -64.6 0 -10.6 7.1 -17.7 16.8 -22.3 30.3 -2.6 7.7 -2.6 25.3 0 33 10.7 31.4 41.8 47.4 72.6 37.3z");
            // let p2 = new Path2D("M65.1 102.4 c-1.2 -1.5 -2.1 -3.5 -2.1 -4.6 0 -2.6 5.3 -7.8 8 -7.8 6.4 0 11 -6.2 11 -15 0 -8.8 -4.6 -15 -11 -15 -2.7 0 -8 -5.2 -8 -7.8 0 -3.3 3.8 -7.2 7.1 -7.2 4.8 0 6.7 1.7 8.4 7.2 0.8 2.9 2.7 6.5 4.2 8 2.3 2.4 3.5 2.8 8.2 2.8 10.2 0 16.4 6.6 14.1 14.9 -1.6 6 -4.8 8.3 -12.9 9 -8.6 0.8 -11.4 3 -13.6 10.7 -1.7 5.7 -3.5 7.4 -8.4 7.4 -2 0 -3.6 -0.8 -5 -2.6z");
            // let p3 = new Path2D("M52.8 80.9 c-1 -0.5 -2.4 -3.3 -3.3 -6.1 -0.8 -2.9 -2.7 -6.5 -4.2 -8 -2.3 -2.4 -3.5 -2.8 -8.2 -2.8 -10.2 0 -16.4 -6.6 -14.1 -14.9 1.6 -6 4.8 -8.3 12.9 -9 8.6 -0.8 11.4 -3 13.6 -10.7 1.7 -5.7 3.5 -7.4 8.4 -7.4 3.3 0 7.1 3.9 7.1 7.2 0 2.6 -5.3 7.8 -8 7.8 -6.4 0 -11 6.2 -11 15 0 8.8 4.6 15 11 15 2.7 0 8 5.2 8 7.8 0 1.1 -0.9 3.1 -2.1 4.6 -2.2 2.8 -6.8 3.5 -10.1 1.5z");
            
            ctx.save();

            ctx.translate(this.x + Math.sin((x + (t / 10)) / 100) * 5, this.y + Math.sin((10 + x + (t / 10)) / 100) * 20);
            ctx.rotate(this.r * Math.PI / 180);

            // line(-1, -1, 1, 1, '#fff');
            line(1, -1, -1, 1, `rgba(0, 0, 0, ${this.ts})`);
            // ctx.fill(p1);
            ctx.fillStyle = `rgba(167, 0, 126, ${this.ts})`;
            ctx.fill();
            // ctx.fill(p3);

            
            ctx.restore();
        }
    }
};

for(var x = 0; x < Canvas.width; x++) {
    for(var y = 0; y < Canvas.height; y++) {
        if(Math.round(Math.random() * 8000) == 1) {
            var s = ((Math.random() * 5) + 1) / 10;
            var ts = Math.random();
            if(Math.round(Math.random()) == 1)
                elements.push(presets.o(x, y, s, 0, 0, ts));
            else
                elements.push(presets.x(x, y, s, 0, 0, ((Math.random() * 1.5) - 1) / 1, (Math.random() * 180), ts));
        }
    }
}

setInterval(function() {
    ctx.clearRect(0, 0, Canvas.width, Canvas.height);

    var time = new Date().getTime();
    for (var e in elements)
		elements[e].draw(ctx, time);
}, 10);