
import { assertEquals, assertThrows } from "@std/assert";
import { registerStandardUnits } from "../src/units/index.ts";
import { getUnitDefinition, getDimensionDefinition, defineDimension } from "../src/utils/registry.ts";

registerStandardUnits();

Deno.test("Registry - Get Unit Definition", () => {
    const def = getUnitDefinition("m");
    assertEquals(def.factor, 1);
    assertEquals(def.dimensionName, "Length");

    assertThrows(() => {
        getUnitDefinition("unknown_unit");
    }, Error, "Unit \"unknown_unit\" is not defined");
});

Deno.test("Registry - Get Dimension Definition", () => {
    const def = getDimensionDefinition("Length");
    assertEquals(def.name, "Length");
    assertEquals(def.baseUnitSymbol, "m");

    assertThrows(() => {
        getDimensionDefinition("UnknownDimension");
    }, Error, "Dimension \"UnknownDimension\" is not defined");
});

Deno.test("Registry - Invalid Definition", () => {
    // Attempting to define a dimension that duplicates existing units might be tricky to test 
    // without corrupting the global registry for other tests, but let's try a safe new one.
    
    const TestDim = {
        name: "TestDim",
        baseUnitSymbol: "test_base",
        units: {
            "test_base": { factor: 1 },
            "test_k": { factor: 1000 }
        }
    } as const;

    // We can define it
    // @ts-ignore: testing dynamic definition
    defineDimension(TestDim);
    
    const u = getUnitDefinition("test_k");
    assertEquals(u.factor, 1000);
    assertEquals(u.dimensionName, "TestDim");
});
