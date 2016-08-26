// When you are absolutely concerned with performance, or need perfect
// precision on the uploaded/downloaded values, you can pass an Uint32Array
// to the get and set functions. That way, each value is accessed as a vec4
// on the shader, with each component ranging from 0 to 255. This avoids
// overhead from both Float packing and buffer allocation on the get/set ops.
// Be warned the get function will **modify the original buffer**!

if (typeof window === 'object') {
  var monkeys = WebMonkeys;
}
else {
  var monkeys = require("./../src/WebMonkeys");
}

// The example below uploads 4 Uint32 values, sums each component on the first,
// doubles the second and doesn't affect the others.

var buffer = new Uint32Array([0x01020304, 0x00000001, 0x00000007, 0x00000007]);
monkeys.set("a", buffer);
monkeys.work(1, `
  vec4 a0 = a(0);
  a(0) := vec4(a0.x + a0.y + a0.z + a0.w, vec3(0.0));
  a(1) := a(1) * 2.0;
`);
monkeys.get("a"); // original buffer is modified!

console.log(buffer);

// Output: Uint32Array [10, 2, 7, 7]
