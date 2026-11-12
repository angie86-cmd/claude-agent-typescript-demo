// Constructor overloads: a class can declare several constructor signatures
// and share a single implementation.
class Multiple {
    // Implementation signature: it must be compatible with all the overloads above.
    // `...args_arr` is a rest parameter that collects every argument into an array.
    constructor(...args_arr) {
        // Check how many arguments were received using the array length
        if (args_arr.length === 1) {
            console.log('There is only one argument in the class constructor');
        }
        if (args_arr.length === 2) {
            console.log('There are two arguments in the class constructor');
        }
    }
}
// Calls the first overload with one argument (prints "There is only one argument...")
let multi_obj = new Multiple(2);
// Calls the second overload with two arguments (prints "There are two arguments...")
let multi_obj2 = new Multiple(5, 6);
//show in console the type of multi_obj and multi_obj2
console.log(typeof multi_obj);
console.log(typeof multi_obj2);
//show in console the result of calling multi_obj and multi_obj2
console.log(multi_obj);
console.log(multi_obj2);
//show in console the result of calling multi_obj and multi_obj2 with JSON.stringify
console.log(JSON.stringify(multi_obj));
console.log(JSON.stringify(multi_obj2));
//show in console the result of calling multi_obj and multi_obj2 with JSON.stringify and null, 2
console.log(JSON.stringify(multi_obj, null, 2));
console.log(JSON.stringify(multi_obj2, null, 2));
//show in console the result of calling multi_obj and multi_obj2 with JSON.stringify and null, 4
console.log(JSON.stringify(multi_obj, null, 4));
console.log(JSON.stringify(multi_obj2, null, 4));
//create an static example class with a static property and a static method
class staticExample {
    // static property
    static staticProperty = "I am a static property";
    // static method
    static staticMethod() {
        return "I am a static method";
    }
}
//show in console the result of calling staticExample.staticProperty and staticExample.staticMethod
console.log(staticExample.staticProperty);
console.log(staticExample.staticMethod());
//show in console the result of calling staticExample.staticProperty and staticExample.staticMethod with JSON.stringify
console.log(JSON.stringify(staticExample.staticProperty));
console.log(JSON.stringify(staticExample.staticMethod()));
export {};
