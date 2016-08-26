if (typeof window === 'object') {
  var monkeys = WebMonkeys;
}
else {
  var monkeys = require("./../src/WebMonkeys");
}

// You can set a lib of GLSL functions using the .lib call
monkeys.lib(`
  float hypothenuse(float a, float b){
    return sqrt(a * a + b * b);
  }`);

monkeys.set("a", [2, 3, 9, 10]);
monkeys.set("b", [2, 4, 12, 10]);
monkeys.set("c", 4);

// Workers are able to use functions defined on the lib
monkeys.work(4, "c(i) := hypothenuse(a(i), b(i));");

console.log(monkeys.get("c"));
