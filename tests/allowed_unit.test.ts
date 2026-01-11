import { assertEquals } from "@std/assert";
import { AllowedUnit } from "../src/types/signature.ts";

Deno.test("AllowedUnit Type Check", () => {
    // Determine types at compile time
    type TempCheck = AllowedUnit<{ Temperature: 1 }>;
    const t: TempCheck = "K"; // Should be assignable
    assertEquals(t, "K");

    type CurrentCheck = AllowedUnit<{ ElectricCurrent: 1 }>;
    const c: CurrentCheck = "A";
    assertEquals(c, "A");

    type AmountCheck = AllowedUnit<{ AmountOfSubstance: 1 }>;
    const a: AmountCheck = "mol";
    assertEquals(a, "mol");

    type LuminousCheck = AllowedUnit<{ LuminousIntensity: 1 }>;
    const l: LuminousCheck = "cd";
    assertEquals(l, "cd");
});
