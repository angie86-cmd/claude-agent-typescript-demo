"use strict";
//declare a variable of type Receipt and assign it a value
let receipt = {
    sender: "John Doe",
    amount: 100
};
//declare a variable of type User and assign it a value
let user = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com"
};
// create a function that takes a User type and returns a new object with only the firstName and lastName properties
function getUserName(user) {
    return {
        firstName: user.firstName,
        lastName: user.lastName
    };
}
//show in console the result of calling getUserName with the user variable
console.log(getUserName(user));
//declare a variable of type Book and assign it a value
let book = {
    title: "The Great Gatsby",
    options: {
        genre: "Fiction",
        publishedYear: "1925"
    }
};
//show in console the book variable
console.log(book);
