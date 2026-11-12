"use strict";
//create a function that takes a string and a number and use the typeof operator to check the type of the variable
function checkVariableTypes(str, num) {
    console.log(typeof str); // "string"
    console.log(typeof num); // "number"
}
// Create a function function that will sum two variables or unite them if these variables have string type
function sumOrConcatenate(x, y) {
    if (typeof x === "number" && typeof y === "number") {
        return x + y;
    }
    else {
        return x.toString() + y.toString();
    }
}
// create a function that checks if a property exists in an object - you can use an operator that is named 'in'
function checkPropertyExists(obj, prop) {
    return prop in obj;
}
//create a function that use a call signature to check if a variable is a function 
function isFunction(variable) {
    return typeof variable === "function";
}
function callSomething(fn) {
    console.log('Comment: ', fn.comment);
}
checkVariableTypes("hola", 5);
console.log(sumOrConcatenate(2, 3));
console.log(sumOrConcatenate("a", 3));
console.log(checkPropertyExists({ name: "Ada" }, "name"));
console.log(isFunction(() => { }));
callSomething({ comment: "hola" });
class AdditionClass {
}
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
function lastElement(arr) {
    return arr.slice(-1).pop();
}
const numArr = [1, 5, 9, 20];
lastElement(numArr); // This will return number type
const stringArr = ["test", "check", "checkstr"];
lastElement(stringArr); // This will return string type
