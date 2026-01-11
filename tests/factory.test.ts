
import { assertEquals } from "@std/assert";
import * as Factory from "../src/index.ts";

// Helper to check if a property is a function
// deno-lint-ignore no-explicit-any
function isFunction(val: any): val is Function {
    return typeof val === "function";
}

Deno.test("Factory Functions", async (t) => {
    // We'll iterate over all exports from index.ts
    // If it looks like a factory function (name matches a unit), we test it.
    
    // List of known factories to strictly check
    const factories: Record<string, string> = {
        // Length
        "m": "m", "km": "km", "cm": "cm", "mm": "mm", "µm": "µm", "nm": "nm", "pm": "pm",
        "ft": "ft", "inch": "in", "yd": "yd", "mi": "mi", "nmi": "nmi", "au": "au", "ly": "ly", "pc": "pc",
        
        // Mass
        "kg": "kg", "g": "g", "mg": "mg", "µg": "µg", "t": "t", 
        "lb": "lb", "oz": "oz", "st": "st", "ton": "ton", "lton": "lton",
        
        // Time
        "s": "s", "ms": "ms", "µs": "µs", "ns": "ns", 
        "min": "min", "h": "h", "d": "d", "wk": "wk", "yr": "yr",

        // ElectricCurrent
        "A": "A", "mA": "mA", "kA": "kA", "µA": "µA",

        // Temperature
        "K": "K", "degC": "degC", "degF": "degF", "degR": "degR",

        // AmountOfSubstance
        "mol": "mol", "mmol": "mmol", "kmol": "kmol", "µmol": "µmol",

        // LuminousIntensity
        "cd": "cd", "mcd": "mcd", "kcd": "kcd"
    };

    for (const [funcName, expectedUnit] of Object.entries(factories)) {
        await t.step(funcName, () => {
            // @ts-ignore: dynamic access
            const func = Factory[funcName];
            if (!isFunction(func)) {
                throw new Error(`${funcName} is not a function`);
            }
            
            const val = 123.456;
            const q = func(val);
            
            assertEquals(q.value, val);
            assertEquals(q.unitSymbol, expectedUnit);
        });
    }
});
