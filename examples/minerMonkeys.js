if (typeof window === 'object')
  var monkeys = WebMonkeys();
else
  var monkeys = require("./../src/WebMonkeys")();

// Crypto-currency mining is one of the best use-cases for
// WebMonkeys, since it involves many parallel tasks with
// low write/read throughput. This is a very rough example,
// though.

// This mines a block on the CPU. It sequentially looks
// for a `nonce` such that hash(blockhash, nonce) is
// less than the given difficulty (3000). This is a
// remarkably stupid hash function, yes.
function mineSequential(blockhash){
  for (var nonce=0; nonce<1000000000; ++nonce){
    var hash = (blockhash * (nonce+1)) % (Math.pow(2,31)-1);
    if (hash < 3000) // mined!
      return nonce;
  };
  return 0;
};

// To do that in parallel, we just spawn tons of monkeys
// and make them try different nonces at the same time.
function mineParallel(totalMonkeys, attemptsPerMonkey, blockhash){

  // First, we send the blockhash to the GPU
  monkeys.set("blockhash", [blockhash]);

  // We also alloc an array for the monkey that
  // mines the block to write the correct nonce.
  monkeys.set("result", [0]);

  // Each monkey attempts a a different set of
  // nonces, so we upload an array determining
  // the start nonce of each monkey.
  var monkeyNonce = [];
  for (var i = 0; i < totalMonkeys; ++i)
    monkeyNonce.push(i * attemptsPerMonkey);
  monkeys.set("monkeyNonce", monkeyNonce);

  // Spawn many miner monkeys
  monkeys.work(totalMonkeys, `

    // Read the array values to local variables
    const float attempts = ${attemptsPerMonkey.toFixed(1)};
    float bhash = blockhash(0);
    float startNonce = monkeyNonce(i);

    // Do the actual mining work, restricted to the subset
    // of nonces this monkey is responsible for
    float mined = 0.0;
    for (float nonce0 = 0.0; nonce0 < attempts; ++nonce0){
      float nonce = nonce0 + startNonce;
      float hash = mod(bhash * (nonce+1.0), pow(2.0,31.0) - 1.0);
      if (hash >= 0.0 && hash <= 3000.0)
        mined = nonce;
    };

    // If the monkey mined a block, write it to the result
    // array. If not, write to an unexisting index
    // it doesn't alter the result;

    result(mined > 0.0 ? 0 : 1) := mined;

  `);

  // Download the result array back from the GPU;
  // if it contains a number different from 0, we
  // mined the block. If not, we could re-schedule
  // the task with a different set of nonces.
  return monkeys.get("result");
};

// Mine the block on the CPU
var t = Date.now();
console.log("Mined a block on the CPU, nonce: " + mineSequential(12345, 5) +
            " (time: " + (Date.now() - t) / 1000 + "s)");

// Mine the block on the GPU, with 128 monkeys,
// each one attempting 6000 different nonces,
// starting at nonce 0.
t = Date.now();
console.log("Mined a block on the GPU, nonce: " +
            mineParallel(128, 6000, 12345) + " (time: " +
            (Date.now() - t) / 1000 + "s)");

// Note: on the GPU, mod(a*b, c) fails when `a`
// and `b` are big. I couldn't test harder examples
// due to that issue. To implement such a thing
// correctly, you'd need to implement a safe mod
// function.

// Also note the semicolon before the setter on
// the end of the task is required because the
// parser is very stupid.
