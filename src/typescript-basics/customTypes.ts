//create a new type called Receipt with properties sender, amount 
type Receipt = {
    sender: string;
    amount: number;
};

//declare a variable of type Receipt and assign it a value
let receipt: Receipt = {
    sender: "John Doe",
    amount: 100
};  

//create a mapped type called User with properties firstName, lastName and email
type User3 = {
    [key in "firstName" | "lastName" | "email"]: string;
};  

//declare a variable of type User and assign it a value
let user: User3 = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com"
};

// create a function that takes a User type and returns a new object with only the firstName and lastName properties
function getUserName(user: User3): { firstName: string; lastName: string } {
    return {
        firstName: user.firstName,
        lastName: user.lastName
    }; 
} 

//show in console the result of calling getUserName with the user variable
console.log(getUserName(user));


//how to declare Index Signatures in TypeScript in the mapped types Book title string and options key string and value string    
type Book = {
    title: string;
    options: {
        [key: string]: string;
    };
}

//declare a variable of type Book and assign it a value
let book: Book = {
    title: "The Great Gatsby",
    options: {
        genre: "Fiction",
        publishedYear: "1925"
    }
};

//show in console the book variable
console.log(book);  
