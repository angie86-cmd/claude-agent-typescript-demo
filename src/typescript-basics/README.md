# typescript-basics

My exercises for the Udemy course **TypeScript Crash Course**.

## Files

- `app.ts` – first example (variables and `alert`, runs in the browser via `index.html`)
- `types.ts` – basic types, optional/default parameters, interfaces, `readonly`, union types
- `tupleTypes.ts` – tuples with mixed element types, accessing elements, and adding values
- `narrowFunctions.ts` – type narrowing (`typeof`, `in`, type predicates, construct signatures, generics)
- `interfaceCreation.ts` – interfaces (`Animal`, `Donations`, `Product`), a class that `implements` an interface (`Frog`), access modifiers (`public`, `private`, `protected`) and inheritance with `extends` (`User` and `Admin`)
- `customTypes.ts` – custom types with `type` aliases (`Receipt`), mapped types (`User3`), a function that picks properties from a type, and index signatures (`Book`)
- `product.ts` – a `Product` interface implemented by two classes (`DigitalProduct` and `PhysicalProduct`), each with its own `buy()` and `getAllInfo()`; ends with `export {};` so the file is a module and its `Product` does not clash with the one in `interfaceCreation.ts`
- `multiple.ts` – constructor overloads with a rest parameter (`Multiple`), `JSON.stringify` output, and a class with `static` members (`staticExample`)
- `phone.ts` – an `abstract` class (`Phone`) with an abstract method, extended by `SmartPhone` and `CellPhone`, each with its own `call()`
- `index.html` – loads `app.js` in the browser

## Compile and run

From this folder:

```powershell
npx tsc              # compiles every .ts file using tsconfig.json (strict mode)
node types.js        # run a file in the terminal
```

`app.js` uses `alert`, so open `index.html` in a browser instead and check the
console with F12.

To only type-check without generating `.js` files, run `npm run check:basics`
from the repo root.
