// Creates a WebMonkeys object; you can think it as an office of worker monkeys
var monkeys = require("./../src/WebMonkeys")();

// Sends a WebMonkey array of numbers to the monkey office (GPU)
monkeys.set("nums", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

// Employs 16 monkeys to work in parallel on the task of squaring each number
monkeys.work(16, "nums(i) := nums(i) * nums(i);");

// Receives the result back
console.log(monkeys.get("nums"));
