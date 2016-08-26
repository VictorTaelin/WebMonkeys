if (typeof window === 'object') {
  var monkeys = WebMonkeys;
}
else {
  var monkeys = require("./../src/WebMonkeys");
}

// Since (due to floating-point modulus issues) I couldn't test the power of
// WebMonkeys with the mining example, here is a program that merely tests
// all numbers until it finds 123456789. On my Macbook 12", it takes approx.
// 0.18 seconds to find it on the GPU, and 5.7 seconds to find it on the CPU.
// This suggests that, at least on the useless task of brute-force counting,
// WebMonkeys beats the CPU by a far margin (30x).

// Sequential search
console.log("Searching for 987654321 on the CPU.");
var t = Date.now();
var found = false;
for (var i=0; i<1000000000; ++i)
  if (i === 987654321)
    found = true;
console.log("Found on the CPU? "+found+" (time: "+(Date.now()-t)/1000+"s)");

// Parallel search
console.log("Searching for 987654321 on the GPU.");
var t = Date.now();
var totalMonkeys = 20000;
var attemptsPerMonkey = 60000;
var monkeyStartingNumber = [];
for (var i=0; i<totalMonkeys; ++i)
  monkeyStartingNumber.push(i * attemptsPerMonkey);
monkeys.set("found", [0]);
monkeys.set("monkeyStartingNumber", monkeyStartingNumber);
monkeys.work(totalMonkeys, `
  int startingNumber = int(monkeyStartingNumber(i));
  bool gotIt = false;
  for (int i = 0; i < ${attemptsPerMonkey}; ++i)
    if (startingNumber + i == 987654321)
      gotIt = true;
  found(gotIt ? 0 : 1) := 1.0;
`);
console.log("Found on the GPU? "+(!!monkeys.get("found")[0])+" (time: "+(Date.now()-t)/1000+"s)");


