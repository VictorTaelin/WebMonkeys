// Using the good old map reduce to sum numbers in parallel.  First we set and
// fill an initial array.  Then, on each pass, each monkey is responsible for
// summing a bunch of numbers and storing the result on the same array. For the
// case where each monkey sums just 2 numbers, we get this:
// [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]   (initial array, 32 numbers)
// [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]   (16 monkeys, each adds 2 numbers of the 32)
// [4,4,4,4,4,4,4,4,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]   ( 8 monkeys, each adds 2 numbers of the remaining 16)
// [8,8,8,8,4,4,4,4,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]   ( 4 monkeys, each adds 2 numbers of the remaining 8)
// [16,16,8,8,4,4,4,4,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] ( 2 monkeys, each adds 2 numbers of the remaining 4)
// [32,16,8,8,4,4,4,4,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] ( 1 monkey, which adds the remaining 2)
// The last monkey then sums the leftover nums and put it on the result array.
// Note: this example is only about 4x faster than the CPU because it finishes
// quickly (~0.2s), so most of the time is spent on the compilation. If you
// call the same task again, it returns much faster (as it is already compiled).

if (typeof window === 'object')
  var monkeys = WebMonkeys();
else
  var monkeys = require("./../src/WebMonkeys")();

// :::::::::: On the GPU :::::::::: 

var visualize = false; // toggle for visualization (use small totalNumbers!)
var sumsPerMonkey = visualize ? 2 : 128;
var totalNumbers = visualize ? 4*8 : 4096*4096;
var begin = Date.now();

// Initial array
monkeys.set("nums", totalNumbers);
monkeys.set("result", [0]);
monkeys.fill("nums", 1.0);

// MapReduce
var remainingNumbers = totalNumbers;
if (visualize) console.log(JSON.stringify(monkeys.get("nums")));
for (var count=totalNumbers/sumsPerMonkey; count>=1; count/=sumsPerMonkey){
  monkeys.work(count, `
    float sum = 0.0;
    for (int k=0; k<${sumsPerMonkey}; ++k)
      sum += nums(i*${sumsPerMonkey}+k);
    nums(i) := sum;
  `);
  if (visualize) console.log(JSON.stringify(monkeys.get("nums")));
};

// Sum leftovers, get result
monkeys.work(1, `
  float sum = 0.0;
  for (int k=0; k<${(count*sumsPerMonkey).toFixed(0)}; ++k)
    sum += nums(k);
  result(0) := sum;
`);

// Print it
console.log(
  "Added "+totalNumbers+" nums on the GPU "+
  "in "+(Date.now()-begin)/1000+" seconds "+
  "(result: "+monkeys.get("result")[0]+").");

// :::::::::: On the CPU :::::::::: 

var begin = Date.now();

var arr = [];
for (var i=0; i<totalNumbers; ++i)
  arr[i] = 1;

var sum = 0;
for (var i=0; i<totalNumbers; ++i)
  sum += arr[i];

console.log(
  "Added "+totalNumbers+" nums on the CPU "+
  "in "+(Date.now()-begin)/1000+" seconds "+
  "(result: "+sum+").");

