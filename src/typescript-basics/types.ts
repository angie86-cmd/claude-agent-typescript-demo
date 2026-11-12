// declare variables
var num1: number = 55;
var str1: string = "I'm a string!";
var some_array: string[] = ['I', 'am', 'an', 'array'];
var anything: any = 5;

//declare a function
function addNumbers(num1: number, num2: number): number {
    return num1 + num2;
}

// If we add the '?' symbol after the variable name - that will mean that we make this variable not required to use
function addNumbersOptional(num1: number, num2?: number): number {
    if (num2) {
        return num1 + num2;
    } else {
        return num1;
    }
}

// Just add the default value of the variable after the type definition
function add(x: number = 0, y: number = 0, z?: number): number {
    if ( z ) {
        return x + y + z;
        }
return x + y;
}

// This is quite a simple function, but it good demonstrates how you can also create variables that will have arrays that have only one type inside
function saveToJsonFile(data: string[]): string {
    return JSON.stringify(data);
}

// Imagine that we need to get the first name and the last name from the user's object
function getUserNames(user: { firstName: string; lastName: string }): { firstName: string; lastName: string } {
    return {
        firstName: user.firstName,
        lastName: user.lastName
    };
}

//declare a simple interface
interface User {
    firstName: string;
    lastName: string;
    age: number;
}   

// how to use the readonly modifier in the interface
interface UserWithReadonly {
    readonly firstName: string;
    readonly lastName: string;
    age: number;
}   

// this function will accept an object that implements the UserWithReadonly interface and return an object with the first name and last name of the user
function getUserWithReadonly(user: UserWithReadonly): { firstName: string; lastName: string } {
    return {
        firstName: user.firstName,
        lastName: user.lastName
    };
}   

// how do declare union types in TypeScript use the add function that accepts a number or a string and returns a string
function addUnionTypes(x: number | string, y: number | string): string {
    return x.toString() + y.toString();
}   
