//create a function that takes a string and a number and use the typeof operator to check the type of the variable
function checkVariableTypes(str: string, num: number) {
    console.log(typeof str); // "string"
    console.log(typeof num); // "number"
}

// Create a function function that will sum two variables or unite them if these variables have string type
function sumOrConcatenate(x: number | string, y: number | string): number | string {
    if (typeof x === "number" && typeof y === "number") { 
        return x + y;
    } else {
        return x.toString() + y.toString();
    }
}

// create a function that checks if a property exists in an object - you can use an operator that is named 'in'
function checkPropertyExists(obj: any, prop: string) {
    return prop in obj;
}

//create a function that use a call signature to check if a variable is a function 
function isFunction(variable: any): variable is Function {
    return typeof variable === "function";
}

//create a function that use a call signature call something

type additionFunction = {
    comment: string;
};

function callSomething(fn: additionFunction) {
    console.log('Comment: ', fn.comment);
}


checkVariableTypes("hola", 5);
console.log(sumOrConcatenate(2, 3));
console.log(sumOrConcatenate("a", 3));
console.log(checkPropertyExists({ name: "Ada" }, "name"));
console.log(isFunction(() => {}));
callSomething({ comment: "hola" });


class AdditionClass {
}

type AdditionFactory = {
    new (): AdditionClass;
};

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

function lastElement<Type>(arr: Type[]): Type | undefined {
    return arr.slice(-1).pop();
}

const numArr = [1, 5, 9, 20];
lastElement(numArr); // This will return number type

const stringArr = ["test", "check", "checkstr"];
lastElement(stringArr); // This will return string type
