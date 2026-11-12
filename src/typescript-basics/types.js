"use strict";
// declare variables
var num1 = 55;
var str1 = "I'm a string!";
var some_array = ['I', 'am', 'an', 'array'];
var anything = 5;
//declare a function
function addNumbers(num1, num2) {
    return num1 + num2;
}
// If we add the '?' symbol after the variable name - that will mean that we make this variable not required to use
function addNumbersOptional(num1, num2) {
    if (num2) {
        return num1 + num2;
    }
    else {
        return num1;
    }
}
// Just add the default value of the variable after the type definition
function add(x = 0, y = 0, z) {
    if (z) {
        return x + y + z;
    }
    return x + y;
}
// This is quite a simple function, but it good demonstrates how you can also create variables that will have arrays that have only one type inside
function saveToJsonFile(data) {
    return JSON.stringify(data);
}
// Imagine that we need to get the first name and the last name from the user's object
function getUserNames(user) {
    return {
        firstName: user.firstName,
        lastName: user.lastName
    };
}
// this function will accept an object that implements the UserWithReadonly interface and return an object with the first name and last name of the user
function getUserWithReadonly(user) {
    return {
        firstName: user.firstName,
        lastName: user.lastName
    };
}
// how do declare union types in TypeScript use the add function that accepts a number or a string and returns a string
function addUnionTypes(x, y) {
    return x.toString() + y.toString();
}
