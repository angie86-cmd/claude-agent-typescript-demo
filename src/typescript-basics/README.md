# typescript-basics

My exercises for the Udemy course **TypeScript Crash Course**.

## Files

- `app.ts` – first example (variables and `alert`, runs in the browser via `index.html`)
- `types.ts` – basic types, optional/default parameters, interfaces, `readonly`, union types
- `narrowFunctions.ts` – type narrowing (`typeof`, `in`, type predicates, construct signatures, generics)
- `interfaceCreation.ts` – interfaces (`Animal`, `Donations`, `Product`), a class that `implements` an interface (`Frog`), access modifiers (`public`, `private`, `protected`) and inheritance with `extends` (`User` and `Admin`)
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
