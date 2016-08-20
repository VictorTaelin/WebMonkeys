## WebMonkeys

The ELI5 of parallel programming. WebMonkeys allows you to spawn thousands of parallel tasks on the GPU with the simplest, dumbest API possible. It works on the browser (with browserify) and on Node.js. Is ES5-compatible and doesn't require any WebGL extension.

### Usage

Install

    npm install webmonkeys

The example below uses the GPU to square all numbers in an array in parallel:

```javascript
// Creates a WebMonkeys object
var monkeys = require("WebMonkeys")();

// Sends an array of numbers to the GPU
monkeys.set("nums", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

// Employs 16 monkeys to work in parallel on the task of squaring each number
monkeys.work(16, "nums(i) := nums(i) * nums(i);");

// Receives the result back
console.log(monkeys.get("nums"));

// output: [ 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256 ]
```

Both `set` and `get` are self explanatory. The most interesting call here is `work`. Its first argument determines how many parallel threads (monkeys) will work on given `task`, which is programmed on [OpenGL ES Shading Language 1.0](https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf), extended with array access *(`foo(index)`, usable anywhere on the source)*, setters *(`foo(index) := value`, usable on the end only)*, and `int i`, a global with the index of the monkey. Those extensions are necessary since WebGL has no means for directly writing to arbitrary indices on buffers.

More elaborate algorithms, such as [this prototypal crypto-currency mining scheme](https://github.com/MaiaVictor/WebMonkeys/blob/master/examples/minerMonkeys.js), can be developed with GLSL:

```JavaScript
monkeys.work(totalMonkeys, `
  const float attempts = ${attemptsPerMonkey.toFixed(1)};
  float bhash = blockhash(0);
  float startNonce = monkeyNonce(i);
  float mined = 0.0;
  for (float nonce = startNonce; nonce < startNonce+attempts; ++nonce){
    float hash = mod(bhash * (nonce+1.0), pow(2.0,31.0) - 1.0);
    if (hash >= 0.0 && hash <= 3000.0)
      mined = nonce;
  };
  result(mined > 0.0 ? 0 : 1) := mined;
`);
```

For more examples, please check the [`examples`](https://github.com/MaiaVictor/WebMonkeys/tree/master/examples) directory.

### Issues

This is fresh out of the oven and completely untested, so, there are probably tons of bugs. The parser is awful and some valid code won't work; ideally, a proper DSL should be created. Moreover, due to the limits of WebGL 1.0 (and of my own creativity in circumventing them), it is not as efficient as it could be. There are some layers of inefficiency such as packing float (which now can be avoided) and shuffling data between intermediate textures. Spawning a new task is slow, but shader compilation is cached, so it is quite fast if you reuse the same source. There are limitations imposed by WebGL itself, such as only static indices on loops. Finally, the implementation could be improved; partly because I am still such a noob on WebGL. I plan to clean it up, add comments explaining how it works, write some benchmarks and tests eventually; but you're more than encouraged to contribute.

Nether less, I think the core of the API is pretty solid, I really like it, and there is a lot of cool things going on under the hoods. I think it could maybe have some interesting applications already, and could get much better with some further work.
