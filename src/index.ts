import { registerStandardUnits } from "./units/index.ts";
import { Q, Quantity } from "./quantity.ts";

registerStandardUnits();

export * from "./types/signature.ts";
export { Q } from "./quantity.ts";
export type { Quantity } from "./quantity.ts";

// --- Dimension Types ---

export type Length = Quantity<{ Length: 1 }>;
export type Mass = Quantity<{ Mass: 1 }>;
export type Time = Quantity<{ Time: 1 }>;
export type ElectricCurrent = Quantity<{ ElectricCurrent: 1 }>;
export type Temperature = Quantity<{ Temperature: 1 }>;
export type AmountOfSubstance = Quantity<{ AmountOfSubstance: 1 }>;
export type LuminousIntensity = Quantity<{ LuminousIntensity: 1 }>;

// --- Derived Types ---

export type Area = Quantity<{ Length: 2 }>;
export type Volume = Quantity<{ Length: 3 }>;
export type Frequency = Quantity<{ Time: -1 }>;
export type Speed = Quantity<{ Length: 1; Time: -1 }>;
export type Acceleration = Quantity<{ Length: 1; Time: -2 }>;
export type Force = Quantity<{ Mass: 1; Length: 1; Time: -2 }>;
export type Pressure = Quantity<{ Mass: 1; Length: -1; Time: -2 }>;
export type Energy = Quantity<{ Mass: 1; Length: 2; Time: -2 }>;
export type Power = Quantity<{ Mass: 1; Length: 2; Time: -3 }>;
export type ElectricCharge = Quantity<{ ElectricCurrent: 1; Time: 1 }>;
export type Voltage = Quantity<{ Mass: 1; Length: 2; Time: -3; ElectricCurrent: -1 }>;


// --- Factory Functions ---

// Length
export const m = (val: number) => new Q(val, "m") as Length;
export const km = (val: number) => new Q(val, "km") as Length;
export const cm = (val: number) => new Q(val, "cm") as Length;
export const mm = (val: number) => new Q(val, "mm") as Length;
export const µm = (val: number) => new Q(val, "µm") as Length;
export const nm = (val: number) => new Q(val, "nm") as Length;
export const pm = (val: number) => new Q(val, "pm") as Length;
export const ft = (val: number) => new Q(val, "ft") as Length;
export const inch = (val: number) => new Q(val, "in") as Length; // 'in' is a keyword
export const yd = (val: number) => new Q(val, "yd") as Length;
export const mi = (val: number) => new Q(val, "mi") as Length;
export const nmi = (val: number) => new Q(val, "nmi") as Length;
export const au = (val: number) => new Q(val, "au") as Length;
export const ly = (val: number) => new Q(val, "ly") as Length;
export const pc = (val: number) => new Q(val, "pc") as Length;

// Mass
export const kg = (val: number) => new Q(val, "kg") as Mass;
export const g = (val: number) => new Q(val, "g") as Mass;
export const mg = (val: number) => new Q(val, "mg") as Mass;
export const µg = (val: number) => new Q(val, "µg") as Mass;
export const t = (val: number) => new Q(val, "t") as Mass;
export const lb = (val: number) => new Q(val, "lb") as Mass;
export const oz = (val: number) => new Q(val, "oz") as Mass;
export const st = (val: number) => new Q(val, "st") as Mass;
export const ton = (val: number) => new Q(val, "ton") as Mass;
export const lton = (val: number) => new Q(val, "lton") as Mass;

// Time
export const s = (val: number) => new Q(val, "s") as Time;
export const ms = (val: number) => new Q(val, "ms") as Time;
export const µs = (val: number) => new Q(val, "µs") as Time;
export const ns = (val: number) => new Q(val, "ns") as Time;
export const min = (val: number) => new Q(val, "min") as Time;
export const h = (val: number) => new Q(val, "h") as Time;
export const d = (val: number) => new Q(val, "d") as Time;
export const wk = (val: number) => new Q(val, "wk") as Time;
export const yr = (val: number) => new Q(val, "yr") as Time;

// Electric Current
export const A = (val: number) => new Q(val, "A") as ElectricCurrent;
export const mA = (val: number) => new Q(val, "mA") as ElectricCurrent;
export const kA = (val: number) => new Q(val, "kA") as ElectricCurrent;
export const µA = (val: number) => new Q(val, "µA") as ElectricCurrent;

// Temperature
export const K = (val: number) => new Q(val, "K") as Temperature;
export const degC = (val: number) => new Q(val, "degC") as Temperature;
export const degF = (val: number) => new Q(val, "degF") as Temperature;
export const degR = (val: number) => new Q(val, "degR") as Temperature;

// Amount of Substance
export const mol = (val: number) => new Q(val, "mol") as AmountOfSubstance;
export const mmol = (val: number) => new Q(val, "mmol") as AmountOfSubstance;
export const kmol = (val: number) => new Q(val, "kmol") as AmountOfSubstance;
export const µmol = (val: number) => new Q(val, "µmol") as AmountOfSubstance;

// Luminous Intensity
export const cd = (val: number) => new Q(val, "cd") as LuminousIntensity;
export const mcd = (val: number) => new Q(val, "mcd") as LuminousIntensity;
export const kcd = (val: number) => new Q(val, "kcd") as LuminousIntensity;
