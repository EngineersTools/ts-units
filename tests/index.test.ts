
import { assertEquals } from "@std/assert";
import { 
    m, km, kg, s, A, K, mol, cd,
    Length, Mass, Time, Speed, Force, Energy,
    Voltage, Frequency
} from "../src/index.ts";

Deno.test("Factory - Basic Creation", () => {
    const l: Length = m(10);
    assertEquals(l.value, 10);
    assertEquals(l.unitSymbol, "m");

    const mass: Mass = kg(5);
    assertEquals(mass.value, 5);
    assertEquals(mass.unitSymbol, "kg");
});

Deno.test("Factory - New Dimensions", () => {
    const current = A(2);
    assertEquals(current.unitSymbol, "A");
    
    const temp = K(300);
    assertEquals(temp.unitSymbol, "K");
    
    const substance = mol(1);
    assertEquals(substance.unitSymbol, "mol");
    
    const intensity = cd(100);
    assertEquals(intensity.unitSymbol, "cd");
});

Deno.test("Complex Types - Speed", () => {
    const d = m(100);
    const t = s(10);
    const v: Speed = d.divide(t); // Should compile and run
    
    assertEquals(v.value, 10);
});

Deno.test("Complex Types - Force", () => {
    // F = ma
    const m1 = kg(10);
    const d = m(50);
    const t = s(5);
    const v = d.divide(t); // 10 m/s
    const a = v.divide(t); // 2 m/s^2
    
    const f: Force = m1.multiply(a);
    assertEquals(f.value, 20); // 10 kg * 2 m/s^2 = 20 N (though unit symbol will be composite)
});

Deno.test("Complex Types - Energy", () => {
    // E = F * d
    const f = kg(1).multiply(m(1)).divide(s(1)).divide(s(1)); // 1 N
    const d = m(10);
    const e: Energy = f.multiply(d);
    
    assertEquals(e.value, 10);
});
