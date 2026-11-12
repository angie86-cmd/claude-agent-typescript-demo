"use strict";
// Narrowing with `typeof`: this function takes a string and a number and prints the type of each one at runtime
function checkVariableTypes(str, num) {
    console.log(typeof str); // "string"
    console.log(typeof num); // "number"
}
// Narrowing a union type: sums x and y if both are numbers, otherwise converts both to strings and concatenates them.
// Inside the `if`, TypeScript knows x and y are `number`.
function sumOrConcatenate(x, y) {
    if (typeof x === "number" && typeof y === "number") {
        return x + y;
    }
    else {
        return x.toString() + y.toString();
    }
}
// Narrowing with `in`: returns true if the property `prop` exists in the object `obj`
function checkPropertyExists(obj, prop) {
    return prop in obj;
}
// Type predicate (`variable is Function`): returns true if the variable is a function.
// When it returns true, TypeScript narrows the variable's type to `Function` in the calling code.
function isFunction(variable) {
    return typeof variable === "function";
}
// Receives an object of type `additionFunction` and prints its comment
function callSomething(fn) {
    console.log('Comment: ', fn.comment);
}
// Calling the functions above to see their output when running `node narrowFunctions.js`
checkVariableTypes("hola", 5);
console.log(sumOrConcatenate(2, 3));
console.log(sumOrConcatenate("a", 3));
console.log(checkPropertyExists({ name: "Ada" }, "name"));
console.log(isFunction(() => { }));
callSomething({ comment: "hola" });
// An empty class, used below as the type that the constructor signature creates
class AdditionClass {
}
// Receives a constructor (matching AdditionFactory) and returns a new instance created with `new`
function addService(addService) {
    return new addService();
}
// create generic function that takes an array of any type and returns the first element of the array
function getFirstElement(arr) {
    return arr[0];
}
//create a generic function that will have correspondence between two types of function
function createCorrespondence(fn) {
    return fn;
}
// Generic function: takes an array of any type `Type` and returns its last element (or undefined if the array is empty)
function lastElement(arr) {
    return arr.slice(-1).pop();
}
// Array of numbers: `lastElement` will infer `Type` as `number`
const numArr = [1, 5, 9, 20];
lastElement(numArr); // This will return number type
// Array of strings: `lastElement` will infer `Type` as `string`
const stringArr = ["test", "check", "checkstr"];
lastElement(stringArr); // This will return string type
