import { assertEquals, assertAlmostEquals } from "@std/assert";
import { Q } from "../src/quantity.ts";
import { 
    LENGTH_CONFIG, 
    MASS_CONFIG, 
    TIME_CONFIG, 
    ELECTRIC_CURRENT_CONFIG, 
    TEMPERATURE_CONFIG, 
    AMOUNT_OF_SUBSTANCE_CONFIG, 
    LUMINOUS_INTENSITY_CONFIG,
    registerStandardUnits
} from "../src/units/index.ts";

registerStandardUnits();

const ALL_CONFIGS = [
    LENGTH_CONFIG,
    MASS_CONFIG,
    TIME_CONFIG,
    ELECTRIC_CURRENT_CONFIG,
    TEMPERATURE_CONFIG,
    AMOUNT_OF_SUBSTANCE_CONFIG,
    LUMINOUS_INTENSITY_CONFIG
];

for (const config of ALL_CONFIGS) {
    Deno.test(`Unit Coverage: ${config.name}`, async (t) => {
        for (const [unitSymbol, def] of Object.entries(config.units)) {
            await t.step(`Unit: ${unitSymbol}`, () => {
                // creating a quantity with 1 of this unit
                // deno-lint-ignore no-explicit-any
                const q = new Q(1, unitSymbol as any);
                
                assertEquals(q.value, 1);
                assertEquals(q.unitSymbol, unitSymbol);
                
                // Verify conversion to base unit matches factor/offset
                // Accessing private _valueInBaseUnits via cast
                // deno-lint-ignore no-explicit-any
                const valInBase = (q as any)._valueInBaseUnits;
                
                const expected = 1 * def.factor + (def.offset ?? 0);
                assertAlmostEquals(valInBase, expected, 1e-9);
            });
        }
    });
}
