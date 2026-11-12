// Narrowing with `typeof`: this function takes a string and a number and prints the type of each one at runtime
function checkVariableTypes(str: string, num: number) {
    console.log(typeof str); // "string"
    console.log(typeof num); // "number"
}

// Narrowing a union type: sums x and y if both are numbers, otherwise converts both to strings and concatenates them.
// Inside the `if`, TypeScript knows x and y are `number`.
function sumOrConcatenate(x: number | string, y: number | string): number | string {
    if (typeof x === "number" && typeof y === "number") { 
        return x + y;
    } else {
        return x.toString() + y.toString();
    }
}

// Narrowing with `in`: returns true if the property `prop` exists in the object `obj`
function checkPropertyExists(obj: any, prop: string) {
    return prop in obj;
}

// Type predicate (`variable is Function`): returns true if the variable is a function.
// When it returns true, TypeScript narrows the variable's type to `Function` in the calling code.
function isFunction(variable: any): variable is Function {
    return typeof variable === "function";
}

// Custom type: an object type with a `comment` property, used as the parameter type of `callSomething`

type additionFunction = {
    comment: string;
};

// Receives an object of type `additionFunction` and prints its comment
function callSomething(fn: additionFunction) {
    console.log('Comment: ', fn.comment);
}


// Calling the functions above to see their output when running `node narrowFunctions.js`
checkVariableTypes("hola", 5);
console.log(sumOrConcatenate(2, 3));
console.log(sumOrConcatenate("a", 3));
console.log(checkPropertyExists({ name: "Ada" }, "name"));
console.log(isFunction(() => {}));
callSomething({ comment: "hola" });


// An empty class, used below as the type that the constructor signature creates
class AdditionClass {
}

// Construct signature: describes something that can be called with `new` and returns an `AdditionClass`
type AdditionFactory = {
    new (): AdditionClass;
};

// Receives a constructor (matching AdditionFactory) and returns a new instance created with `new`
function addService(addService: AdditionFactory) {
    return new addService();
}

// create generic function that takes an array of any type and returns the first element of the array
function getFirstElement<T>(arr: T[]): T | undefined {
    return arr[0];
}

//create a generic function that will have correspondence between two types of function
function createCorrespondence<T, U>(fn: (x: T) => U): (x: T) => U {
    return fn;
}

// Generic function: takes an array of any type `Type` and returns its last element (or undefined if the array is empty)
function lastElement<Type>(arr: Type[]): Type | undefined {
    return arr.slice(-1).pop();
}

// Array of numbers: `lastElement` will infer `Type` as `number`
const numArr = [1, 5, 9, 20];
lastElement(numArr); // This will return number type

// Array of strings: `lastElement` will infer `Type` as `string`
const stringArr = ["test", "check", "checkstr"];
lastElement(stringArr); // This will return string type
