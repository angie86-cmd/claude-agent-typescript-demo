"use strict";
// declare claass called Frog that implements the Animal interface
class Frog {
    name;
    constructor(name) {
        this.name = name;
    }
    sound() {
        return "Ribbit!";
    }
    eat() {
        return "Frog eats insects.";
    }
    sleep() {
        return "Frog sleeps on lily pad.";
    }
}
// Imagine that we need to create donations by using this type that we just created
let donation1 = {
    wallet: "my-wallet-address",
    amount: 100
};
//Modifiers: public, private, protected
class User {
    // Public variables or functions can be accessed outside or inside the class
    name;
    age2;
    // Protected variables or functions can be accessed in child and parent class
    additional_data;
    constructor(name = "", age2 = 0, additional_data = []) {
        this.name = name;
        this.age2 = age2;
        this.additional_data = additional_data;
    }
    getAge() {
        return this.age2;
    }
}
// Create a User instance: only `name` is given, so `age2` and `additional_data` use their default values (0 and [])
var user1 = new User("Alice");
console.log(user1.name); // this will work
console.log(user1.getAge()); // this will work because getAge is public, while age stays private  
//declare a parent class Admin that extends the User class and has a function called getAdditionalData that returns the additional_data property
class Admin extends User {
    constructor(name = "", age2 = 0, additional_data = []) {
        super(name, age2, additional_data);
    }
    getAdditionalData() {
        return this.additional_data;
    }
}
// Create an Admin instance (a child of User) with a name, an age and some additional data
var admin1 = new Admin("Bob", 30, ["data1", "data2"]);
// `name` is public in User, so it is inherited by Admin and can be read outside the class (prints "Bob")
console.log(admin1.name);
