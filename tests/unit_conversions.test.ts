
import { assertEquals, assertAlmostEquals, assertThrows } from "@std/assert";
import { Q } from "../src/quantity.ts";
import { 
    registerStandardUnits,
    LENGTH_CONFIG,
    MASS_CONFIG,
    TIME_CONFIG,
    ELECTRIC_CURRENT_CONFIG,
    TEMPERATURE_CONFIG,
    AMOUNT_OF_SUBSTANCE_CONFIG,
    LUMINOUS_INTENSITY_CONFIG
} from "../src/units/index.ts";

// Ensure units are registered before running tests
registerStandardUnits();

const DIMENSIONS = [
    LENGTH_CONFIG,
    MASS_CONFIG,
    TIME_CONFIG,
    ELECTRIC_CURRENT_CONFIG,
    TEMPERATURE_CONFIG,
    AMOUNT_OF_SUBSTANCE_CONFIG,
    LUMINOUS_INTENSITY_CONFIG
];

Deno.test("Unit Conversions (Valid)", async (t) => {
    for (const dimConfig of DIMENSIONS) {
        await t.step(dimConfig.name, async (tDim) => {
            const units = Object.entries(dimConfig.units);
            
            for (const [fromUnit, fromDef] of units) {
                for (const [toUnit, toDef] of units) {
                     // Optimization: Grouping checks or just running all O(N^2) checks. 
                     // N is small (<20) so N^2 is fine per dimension.
                    await tDim.step(`${fromUnit} -> ${toUnit}`, () => {
                        const val = 100;
                        // @ts-ignore: dynamic unit string instantiation
                        const q = new Q(val, fromUnit);
                         // @ts-ignore: dynamic unit string conversion
                        const converted = q.convertTo(toUnit);
                        
                        // Expected calculation:
                        // base = (val * fromFactor) + fromOffset
                        // target = (base - toOffset) / toFactor
                        const fromFactor = fromDef.factor;
                        const fromOffset = fromDef.offset ?? 0;
                        const toFactor = toDef.factor;
                        const toOffset = toDef.offset ?? 0;
                        
                        const baseVal = val * fromFactor + fromOffset;
                        const expectedVal = (baseVal - toOffset) / toFactor;
                        
                        assertAlmostEquals(
                            converted.value, 
                            expectedVal, 
                            1e-6, 
                            `Failed conversion ${val} ${fromUnit} -> ${toUnit}. Expected ${expectedVal}, got ${converted.value}`
                        );
                        assertEquals(converted.unitSymbol, toUnit);
                    });
                }
            }
        });
    }
});

Deno.test("Invalid Conversions (Cross-Dimension)", () => {
    const qLen = new Q(1, "m");
    assertThrows(() => {
        // @ts-ignore: Intentionally passing invalid unit for runtime check
        qLen.convertTo("kg");
    }, Error, "Cannot convert quantity"); 
    
    // Check strict dimension mismatch message logic if possible, 
    // but just ensuring it throws is the requirement.
    
    const qMass = new Q(1, "kg");
    assertThrows(() => {
        // @ts-ignore: Intentionally passing invalid unit for runtime check
        qMass.convertTo("s");
    }, Error);

    const qTemp = new Q(100, "degF");
    assertThrows(() => {
        // @ts-ignore: Intentionally passing invalid unit for runtime check
        qTemp.convertTo("m");
    }, Error);
});
