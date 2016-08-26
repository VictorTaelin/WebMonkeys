// Creates a WebMonkeys object; you can think it as an office of worker monkeys
if (typeof window === 'object') {
  var monkeys = WebMonkeys();
}
else {
  var monkeys = require("./../src/WebMonkeys")();
}

// Sends some WebMonkey arrays to the monkey office (GPU)
monkeys.set("a", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
monkeys.set("b", [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4]);
monkeys.set("c", 16); // use a number to just alloc an array

// Employs 16 monkeys to work in parallel on the task of squaring each number
monkeys.work(16, "c(i) := a(i) * b(i);");

// Receives the result back
console.log(monkeys.get("c"));




// You can use fewer monkeys with more writes per monkey

// Reset C
monkeys.work(16, `c(i) := 0.0;`);
console.log(monkeys.get("c"));

// Do the same work with less monkeys
monkeys.work(8, `
  c(i*2+0) := a(i*2+0) * b(i*2+0);
  c(i*2+1) := a(i*2+1) * b(i*2+1);
`);

// Receives the result back
console.log(monkeys.get("c"));
