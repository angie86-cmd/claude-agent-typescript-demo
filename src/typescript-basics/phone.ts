// Abstract class called Phone with an abstract method `call`.
// An abstract class cannot be instantiated directly; child classes must implement `call`.
abstract class Phone {
    // Abstract method: only the signature is declared here, with no body
    abstract call(phoneNumber: string): void;
}

// Child class of Phone: it must implement `call`.
// It can declare fewer parameters than the abstract method (here, none) and still be valid.
class SmartPhone extends Phone {
    call(): void {
        console.log("I'm calling from the smartphone");
    }
}

// Another child class of Phone with its own implementation of `call`
class CellPhone extends Phone {
    call(): void {
        console.log("I'm calling from the cell phone");
    }
}

// Create one instance of each child class and call the method
// (`new Phone()` would be an error because Phone is abstract)
const smartPhone = new SmartPhone();
const cellPhone = new CellPhone();
smartPhone.call();
cellPhone.call();

// Makes this file a module, so its names do not clash with other files
export {};
