## WebMonkeys

Allows you to spawn thousands of parallel tasks on the GPU with the simplest, dumbest API possible. It works on the browser (with browserify) and on Node.js. It is ES5-compatible and doesn't require any WebGL extension.

### Usage

On the browser, add `<script src="WebMonkeys.js"><script>` to your HTML. On Node.js, install it from npm:

    npm install webmonkeys

The example below uses the GPU to square all numbers in an array in parallel:

```javascript
// Creates a WebMonkeys object
var monkeys = require("WebMonkeys")(); // on the browser, call WebMonkeys() instead

// Sends an array of numbers to the GPU
monkeys.set("nums", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

// Employs 16 monkeys to work in parallel on the task of squaring each number
monkeys.work(16, "nums(i) := nums(i) * nums(i);");

// Receives the result back
console.log(monkeys.get("nums"));

// output: [ 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256 ]
```

`set`/`get` allow you to send/receive data from the GPU, and `work` creates a number of parallel tasks (monkeys) that can read, process and rewrite that data. The language used is [GLSL 1.0](https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf), extended array access *(`foo(index)`, usable anywhere on the source)*, setters *(`foo(index) := value`, usable on the end only)*, and `int i`, a global variable with the index of the monkey. 

### More examples

More elaborate algorithms can be developed with GLSL.

- Vector multiplication:

    ```JavaScript
    monkeys.set("a", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    monkeys.set("b", [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4]);
    monkeys.set("c", 16); // use a number to just alloc an array

    monkeys.work(16, "c(i) := a(i) * b(i);");

    console.log(monkeys.get("c"));
    ```


- Crypto-currency mining:

    ```JavaScript
    monkeys.set("blockhash", [blockhash]);
    monkeys.set("monkeyNonce", monkeyNonce);
    monkeys.set("result", [0]);
    monkeys.work(totalMonkeys, `
      const float attempts = ${attemptsPerMonkey.toFixed(1)};
      float bhash = blockhash(0);
      float startNonce = monkeyNonce(i);
      float mined = 0.0;
      for (float nonce = startNonce; nonce < startNonce+attempts; ++nonce){
        // Yes, this hash function is stupid
        float hash = mod(bhash * (nonce+1.0), pow(2.0,31.0) - 1.0);
        if (hash >= 0.0 && hash <= 3000.0)
          mined = nonce;
      };
      result(mined > 0.0 ? 0 : 1) := mined;
    `);
    // Will be set if mined a block
    console.log(monkeys.get("result"));
    ```

You can also define libs, write to many indices in a single call, and work with raw Uint32 buffers if you wish to. For more details, please check the [`examples`](https://github.com/MaiaVictor/WebMonkeys/tree/master/examples) directory.

### vs WebGL

The only reliable way to access the GPU on the browser is by using WebGL. Since it wasn't designed for general programming, doing it is very tricky. For one, the only way to upload data is as 2D textures of pixels. Even worse, your shaders (programs) can't write directly to them; you need to, instead, render the result using geometrical primitives. You're, thus, in charge of converting JS numbers (IEEE 754 floats) to pixels, projecting them to/from 2D textures and using proper geometries to render the results on the right places. You must also deal with aliasing/blurring, rounding, and loss of precision. It is a very delicate job with many small details that could go wrong and no satisfactory way of debugging. WebMonkeys takes care of all that for you, abstracting the overcomplication away and making the power of the GPU as easily accessible as possible, with a very simple API based on array reads and writes.

### Performance and debugging tips

- A single monkey can write to multiple places. If you need to fill an array of 100 numbers, you could use 100 monkeys writing to 1 index each, or 10 monkeys writing to 10 indices each. What is faster will depend on your application.

- While CPU/GPU bandwidth is huge those days, it still takes time to communicate data between them. Whenever possible, reduce your calls to `set/get`, and keep things internal to the GPU. For example, if you need to move data between two arrays, this: `monkeys.work(16, "target(i) := source(i);")` - is much faster than this: `monkeys.set("target", monkeys.get("source"))`.

- The first call to `monkeys.work(count, someTask)` is slow due to program compilation, but every call after that is fast. That is for two reasons: 1. WebMonkeys caches shaders so that, when you call `task` with a repeated source code, it just recovers the previously compiled program; 2. JS engines keep strings hashed, which means that retrieval can be done in O(1). In other words, it is perfectly reasonable to call `monkeys.work(n, bigSourceCode)` inside your animation loop (as long as `bigSourceCode` doesn't change).

- Since WebMonkeys stores numbers as WebGL textures, writing/reading to/from arrays has an encode/decode overhead. If your application spends much more time doing arithmetics than writing/reading data, that is acceptable. If not, use [raw buffers](https://github.com/MaiaVictor/WebMonkeys/blob/master/examples/useRawBuffers.js) and do your own packing/unpacking.

- Remember you can't have setters (`foo(i) := v;`) in the middle of your program. They must be at the end. If you're having weird WebGL errors, it could be WebMonkeys's fault: its very simple parser sometimes fails to separate the program's body from the list of setters. Usually, just adding an extra line with a commented semicolon (`//;`) between your program and your setters solves it.

- Use `monkeys.fill("nums", 0)` rather than `monkeys.work(numsLength, "nums(i) := 0.0;")` (and `clear`, its equivalent for raw Uint32s).
