
import { assertEquals } from "@std/assert";
import { 
  CombineDimensionSignatures, 
  DivideDimensionSignatures 
} from "../src/types/signature.ts";

// We define some dummy signatures for testing type inference
type L1 = { Length: 1 };
type T1 = { Time: 1 };
type T_1 = { Time: -1 };
type L1T_1 = { Length: 1; Time: -1 }; // Speed
type M1 = { Mass: 1 };
type L1T_2 = { Length: 1; Time: -2 }; // Acceleration
type M1L1T_2 = { Mass: 1; Length: 1; Time: -2 }; // Force

Deno.test("Type Safety - Compile Time Check", () => {
    // This test primarily serves to ensure the types compile correctly.
    // We can assume if it compiles and the types align, it works.
    
    // Check Addition (Multiplication of Dimensions)
    type SpeedCheck = CombineDimensionSignatures<L1, T_1>;
    const speed: SpeedCheck = { Length: 1, Time: -1 };
    assertEquals(speed.Length, 1);
    assertEquals(speed.Time, -1);

    // Check Subtraction (Division of Dimensions)
    type AccCheck = DivideDimensionSignatures<L1T_1, T1>;
    const acc: AccCheck = { Length: 1, Time: -2 };
    assertEquals(acc.Length, 1);
    assertEquals(acc.Time, -2);
    
    // Force = Mass * Acc
    type ForceCheck = CombineDimensionSignatures<M1, L1T_2>;
    const force: ForceCheck = { Mass: 1, Length: 1, Time: -2 };
    assertEquals(force.Mass, 1);
    assertEquals(force.Length, 1);
    assertEquals(force.Time, -2);
});
