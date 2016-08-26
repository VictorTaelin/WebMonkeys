// This example shows how monkeys.render can be used to display the contents of
// an array as a canvas on the screen. You must browserify it and include it in
// a html file.

if (typeof window === 'object')
  var monkeys = WebMonkeys();
else
  var monkeys = require("./../src/WebMonkeys")();

var width = height = 256;
monkeys.set("screen", new Uint32Array(width * height));
monkeys.set("screenSize", [width, height]);

var startTime = Date.now();
setInterval(function(){
  monkeys.set("time", [(Date.now()-startTime)/1000]);
  monkeys.work(width*height, `
    vec2 size = vec2(screenSize(0), screenSize(1));
    vec2 pos = vec2(mod(float(i),size.x), floor(float(i)/size.x));
    float dist = length((pos-size*0.5)/(size*0.5));
    float brightness = 0.7 + sin(70.0*dist + 9.0*time(0))*0.3;
    screen(i) := vec4(brightness, 1.0, 1.0, 1.0)*255.0;
  `);
  document.body.appendChild(monkeys.render("screen", width, height));
}, 1000/30);

