
import { assertEquals, assertThrows, assertAlmostEquals } from "@std/assert";
import { Q } from "../src/quantity.ts";
import { registerStandardUnits } from "../src/units/index.ts";

registerStandardUnits();

// Helper to create quantities
const q = (val: number, unit: string) => new Q(val, unit);

Deno.test("Quantity Methods - Arithmetic", async (t) => {
    
    await t.step("add", () => {
        const l1 = q(10, "m");
        const l2 = q(200, "cm"); // 2m
        const res = l1.add(l2);
        assertEquals(res.value, 12);
        assertEquals(res.unitSymbol, "m");
    });

    await t.step("subtract", () => {
        const m1 = q(5, "kg");
        const m2 = q(500, "g"); // 0.5kg
        const res = m1.subtract(m2);
        assertEquals(res.value, 4.5);
        assertEquals(res.unitSymbol, "kg");
    });

    await t.step("multiply", () => {
        const l = q(10, "m");
        const time = q(2, "s");
        const res = l.multiply(time); // m*s
        
        // Value: 10 * 2 = 20
        // Base value: 20
        // Result unit: m.s
        // Q.multiply returns a generic signature, 
        // to check specific values we might need to inspect internals or string
        assertAlmostEquals((res)._valueInBaseUnits, 20);
        // Signature should be Length:1, Time:1
    });

    await t.step("divide", () => {
        const l = q(100, "m");
        const time = q(9.58, "s");
        const speed = l.divide(time);
        
        assertAlmostEquals(speed.value, 100/9.58);
        // Unit should be m/s
    });

    await t.step("divide by zero", () => {
        const n = q(10, "m");
        const z = q(0, "s");
        assertThrows(() => {
            n.divide(z);
        }, Error, "Division by zero");
    });

});

Deno.test("Quantity Methods - Comparison", async (t) => {
    const a = q(1, "km");
    const b = q(1000, "m");
    const c = q(999, "m");

    await t.step("equals", () => {
        assertEquals(a.equals(b), true);
        assertEquals(a.equals(c), false);
    });

    await t.step("isLessThan", () => {
        assertEquals(c.isLessThan(b), true);
        assertEquals(b.isLessThan(c), false);
    });

    await t.step("isGreaterThan", () => {
        assertEquals(b.isGreaterThan(c), true);
        assertEquals(c.isGreaterThan(b), false);
    });

    await t.step("Dimension mismatch", () => {
        const l = q(1, "m");
        const time = q(1, "s");
        assertEquals(l.equals(time), false);
        // Let's check implementation behavior:
        // equals: "if (!Q.areDimensionSignaturesEqual...) return false;" --> OK, equals returns false safely
        assertEquals(l.equals(time), false);

        assertThrows(() => l.isLessThan(time), Error, "Dimension mismatch");
        assertThrows(() => l.isGreaterThan(time), Error, "Dimension mismatch");
    });
});

Deno.test("Quantity Methods - Formatting/Interop", async (t) => {
    const val = 12.3456789;
    const item = q(val, "m");

    await t.step("toString", () => {
        // Implementation: `${this.value.toPrecision(6)} ${this.unitSymbol}`
        assertEquals(item.toString(), "12.3457 m"); 
    });

    await t.step("toJSON", () => {
        assertEquals(item.toJSON(), { value: val, unit: "m" });
    });

    await t.step("valueOf", () => {
        assertEquals(item.valueOf(), val);
        // implicit conversion
        assertEquals(+item, val);
    });
});
