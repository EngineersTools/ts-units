import { assertEquals } from "@std/assert";
import { Q } from "../src/quantity.ts";
import { registerStandardUnits } from "../src/units/index.ts";

registerStandardUnits();

// Helper to create Quantity easily without strict type checking for tests
// deno-lint-ignore no-explicit-any
const qty = (val: number, unit: string) => new Q(val, unit as any) as any;

Deno.test("Temperature - Kelvin to Celsius", () => {
    const k = qty(0, "K");
    const c = k.convertTo("degC");
    assertEquals(c.value, -273.15);
    assertEquals(c.unitSymbol, "degC");
});

Deno.test("Temperature - Celsius to Kelvin", () => {
    const c = qty(0, "degC");
    const k = c.convertTo("K");
    assertEquals(k.value, 273.15);
    assertEquals(k.unitSymbol, "K");
});

Deno.test("Temperature - Fahrenheit to Celsius", () => {
    const f = qty(32, "degF");
    const c = f.convertTo("degC");
    
    // 32F -> 0C
    assertEquals(Math.abs(c.value) < 1e-9, true, `Expected 0 C, got ${c.value}`);
});

Deno.test("Temperature - Celsius to Fahrenheit", () => {
    const c = qty(100, "degC");
    const f = c.convertTo("degF");
    
    // 100C -> 212F
    assertEquals(Math.abs(f.value - 212) < 1e-9, true, `Expected 212 F, got ${f.value}`);
});

Deno.test("Temperature - Absolute Zero (Fahrenheit)", () => {
    // -459.67 F is 0 K
    const f = qty(-459.67, "degF");
    const k = f.convertTo("K");
    
    assertEquals(Math.abs(k.value) < 1e-3, true, `Expected ~0 K, got ${k.value}`);
});

Deno.test("Temperature - Rankine", () => {
    // 491.67 R = 273.15 K (Freezing water)
    const r = qty(491.67, "degR");
    const k = r.convertTo("K");
    
    assertEquals(Math.abs(k.value - 273.15) < 1e-3, true, `Expected 273.15 K, got ${k.value}`);
});
