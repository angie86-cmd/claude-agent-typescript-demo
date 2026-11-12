//create class Product with properties name and price and a constructor that takes name and description as parameters
class Product {
    name: string;
    price: number;

    constructor(name: string, price: number) {
        this.name = name;
        this.price = price;
    }
}

//create interface Product with function buy , function getAllInfo and returns a string
interface Product {
    name: string;
    price: number;
    buy(): void;
    getAllInfo(): string;
}   

//create a class DigitalProduct that implements the Product interface
class DigitalProduct implements Product {
    name: string;
    price: number;
    constructor(name: string, price: number) {
        this.name = name;
        this.price = price;
    } 
    
    buy(): void {
        console.log(`Buying digital product: ${this.name} for $${this.price}`);
    }  
    
    getAllInfo(): string {
        return `Digital Product: ${this.name}, Price: $${this.price}`;
    }   
}

//create a class PhysicalProduct that implements the Product interface
class PhysicalProduct implements Product {
    name: string; 
    price: number;
    constructor(name: string, price: number) {
        this.name = name;
        this.price = price;
    }           
    buy(): void {
        console.log(`Buying physical product: ${this.name} for $${this.price}`);
    } 

    getAllInfo(): string {
        return `Physical Product: ${this.name}, Price: $${this.price}`;
    }   
}

// Create one product of each kind
const ebook = new DigitalProduct("TypeScript eBook", 15);
const keyboard = new PhysicalProduct("Keyboard", 50);

// buy() prints its own message; getAllInfo() returns a string, so we print it
ebook.buy();
console.log(ebook.getAllInfo());

keyboard.buy();
console.log(keyboard.getAllInfo());


export {};
