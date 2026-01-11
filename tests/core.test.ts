import { assertEquals, assertThrows } from "@std/assert";
import { 
    m, km, cm, s, 
} from "../src/index.ts";
import { registerStandardUnits } from "../src/units/index.ts";

registerStandardUnits(); // Already called in index.ts

Deno.test("Quantity Creation", () => {
    const l1 = m(10);
    assertEquals(l1.value, 10);
    assertEquals(l1.unitSymbol, "m");
    assertEquals(l1.toString(), "10.0000 m");
});

Deno.test("Conversions", () => {
    const l1 = km(1);
    const l2 = m(1000);
    
    // Check internal base units are same
    // @ts-ignore: testing internal private property
    assertEquals(l1._valueInBaseUnits, l2._valueInBaseUnits);
    
    assertEquals(l1.equals(l2), true);
    
    // Test convertTo
    const l3 = l1.convertTo("m");
    assertEquals(l3.value, 1000);
    assertEquals(l3.unitSymbol, "m");
    assertEquals(l3.equals(l1), true);

    // Test invalid conversion
    assertThrows(() => {
        l1.convertTo("s");
    }, Error, "Cannot convert");
});

Deno.test("Arithmetic - Add", () => {
    const l1 = m(5);
    const l2 = cm(100); // 1m
    const l3 = l1.add(l2);
    
    assertEquals(l3.value, 6);
    assertEquals(l3.unitSymbol, "m");
});

Deno.test("Arithmetic - Multiply", () => {
    const l = m(5);
    const t = s(2);
    const speed = l.divide(t);
    
    // 5 m / 2 s = 2.5 m/s
    assertEquals(speed.value, 2.5);
    assertEquals(speed.unitSymbol, "m/s");
});

Deno.test("Arithmetic - Multiply Similar", () => {
    const l1 = m(2);
    const l2 = m(3);
    const area = l1.multiply(l2);
    
    assertEquals(area.value, 6);
    assertEquals(area.unitSymbol, "m^2");
});

Deno.test("Dimension Mismatch", () => {
    const l = m(1);
    const t = s(1);
    
    assertThrows(() => {
        // @ts-ignore: intentional type violation for runtime check
        l.add(t);
    });
});

Deno.test("ValueOf Interop", () => {
    const l = m(10);
    // TypeScript prevents direct arithmetic on objects even with valueOf, 
    // but we can force it or use it in loose contexts.
    // For strict TS test, we cast to any.
    // deno-lint-ignore no-explicit-any
    const double = (l as any) * 2; 
    assertEquals(double, 20);
    assertEquals(Number(l), 10);
});
