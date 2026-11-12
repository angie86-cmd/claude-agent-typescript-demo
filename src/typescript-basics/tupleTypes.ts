//create a tuple called userAdmin with a string and a number
let userAdmin: [string, number] = ["admin", 1];

//create a tuple called userGuest with a string array and a number
let userGuest: [string[], number] = [["guest1", "guest2"], 2];  

//show how to access the elements of the tuple userAdmin and userGuest
console.log("userAdmin: " + userAdmin[0] + ", " + userAdmin[1]);
console.log("userGuest: " + userGuest[0][0] + ", " + userGuest[0][1] + ", " + userGuest[1]);    

// add new elements to the tuple userAdmin and userGuest
userAdmin.push("newAdmin");
userGuest.push(["newGuest1", "newGuest2"], 3);

// show the updated tuples
console.log("Updated userAdmin: " + JSON.stringify(userAdmin));
console.log("Updated userGuest: " + JSON.stringify(userGuest));