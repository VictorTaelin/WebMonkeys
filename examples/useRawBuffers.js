// When you are absolutely concerned with performance, or need perfect
// precision on the uploaded/downloaded values, you can set the "useRawBuffers"
// flag. That will change the behavior of the language, so that, instead of
// dealing with arrays of JS numbers, you must use typed arrays (Uint32Array).
// Each 32-bit uint is interpreted as a vec4 on the shader, with each component
// ranging from 0 to 255. This avoids overhead from both Float packing and buffer
// allocation on the get/set ops.

var monkeys = require("./../src/WebMonkeys.js")({useRawBuffers: true});

// The example below uploads 4 Uint32 values, sums each component on the first,
// doubles the second and doesn't affect the others.

var buffer = new Uint32Array([0x01020304, 0x00000001, 0x00000007, 0x00000007]);
monkeys.set("a", buffer);
monkeys.work(1, `
  vec4 a0 = a(0);
  a(0) := vec4(a0.x + a0.y + a0.z + a0.w, vec3(0.0));
  a(1) := a(1) * 2.0;
`);
monkeys.get("a", buffer); 
console.log(buffer);

// Output: Uint32Array { '0': 10, '1': 2, '2': 7, '3': 7 }

// Notice that `get` can optionally receive a buffer object, so it downloads
// the data directly into it, avoiding the need for allocating another array.
// If you don't send a buffer to it, it will need to alloc.
