// Suppose you write a program on which several parallel monkeys
// write to the same index. Usually, only one will win the write
// race, in a non-deterministic way. You can, though, affect
// that race by setting a "write priority". For example:
var monkeys = require("./../src/WebMonkeys")();

// First, se upload an array with a single number.
monkeys.set("nums", [0]);

// Then, we create 16 monkeys. Every one of them will
// try to write at the same index, 0. We want monkey
// 7 to win, so we set its write priority to 1,
// while leaving the other's as 0.
monkeys.work(16, "nums(0, i==7 ? 1 : 0) := float(i);");

// The result is [7], showing the monkey 7 won.
console.log(monkeys.get("nums"));
