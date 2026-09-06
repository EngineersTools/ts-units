# ts-units API reference

This document describes the current implementation and runtime contracts of the `ts-units` package.

The library is registry-based: dimensions and units are registered once, then reused through typed helper objects and the `Q` quantity class. It ships with a default catalog of SI and common engineering dimensions, while also allowing custom domains to register their own dimensions and symbols.

## 1. Package boundary

The package entry point exports both runtime APIs and type helpers:

```typescript
import {
  Q,
  Quantity,
  defineDimension,
  defineComplexDimension,
  defineEquivalence,
  getAllDimensions,
  getDimensionDefinition,
  getUnitDefinition,
  type DimensionSignature,
  type SimpleDimensionSignature,
  type CombineDimensionSignatures,
  type DivideDimensionSignatures,
} from "@eng-tools/ts-units";
```

Importing the package does not leave the library empty: the entry point also re-exports the built-in predefined catalog (`Length`, `Mass`, `Time`, `Temperature`, `Velocity`, `Area`, etc.). Definitions are registered at module import time, and custom dimensions can still be added with `defineDimension` and related helpers.

## 2. Built-in dimensions and predefined units

A snapshot of the shipped catalog includes:

- `Length`: `m`, `km`, `cm`, `mm`, `µm`, `nm`, `pm`, `ft`, `in`, `yd`, `mi`, `nmi`, `au`, `ly`, `pc`
- `Mass`: `kg`, `g`, `mg`, `µg`, `t`, `lb`, `oz`, `st`, `ton`, `lton`
- `Time`: `s`, `ms`, `µs`, `ns`, `min`, `h`, `d`, `wk`, `yr`
- `ElectricCurrent`: `A`, `mA`, `kA`, `µA`
- `Temperature`: `K`, `degC`, `degF`, `degR`
- `AmountOfSubstance`: `mol`, `mmol`, `kmol`, `µmol`
- `LuminousIntensity`: `cd`, `mcd`, `kcd`
- Derived dimensions such as `Area`, `Velocity`, `Acceleration`, `Pressure`, `Torque`, `Frequency`, `ElectricPotential`, `ElectricEnergy`, etc.

Example:

```typescript
import { Length, Velocity, Temperature, m, km, s } from "@eng-tools/ts-units";

const distance = Length.quantity(1, "km");
console.log(distance.convertTo("m").value); // 1000

const speed = Velocity.quantity(36, "km/h");
console.log(speed.convertTo("m/s").value); // 10

const room = Temperature.quantity(20, "degC");
console.log(room.convertTo("K").value); // 293.15

console.log(m(12).convertTo("cm").value); // 1200
console.log(s(2).value); // 2
```

## 3. Simple dimension definitions

`defineDimension` registers a named dimension and its units. Each unit declares a positive numeric conversion factor, and optionally an affine `offset` for temperature-like systems.

```typescript
import { defineDimension } from "@eng-tools/ts-units";

const Length = defineDimension(
  {
    name: "Length",
    baseUnitSymbol: "m",
    units: {
      m: { factor: 1 },
      km: { factor: 1000 },
      cm: { factor: 0.01 },
      in: { factor: 0.0254 },
    },
  } as const,
);

const distance = Length.quantity(5, "km");
const inMeters = distance.convertTo("m");
const localMeters = Length.factory("m");

console.log(inMeters.value); // 5000
console.log(localMeters(12).unitSymbol); // "m"
```

The type structure is:

```typescript
type UnitSpec = {
  factor: number;
  offset?: number;
};

type UnitMap = Record<string, UnitSpec>;

type DimensionDefinition<Name extends string, Units extends UnitMap> = {
  name: Name;
  baseUnitSymbol: keyof Units & string;
  units: Units;
};
```

The returned object exposes:

- `name`
- `baseUnitSymbol`
- `units`
- `quantity(value, unit)`
- `factory(unit)`

`as const` is recommended when you want literal unit unions to flow through the helper types.

### Validation rules

`defineDimension` validates before mutating the registry:

- dimension names must be non-empty
- base unit symbol must be non-empty
- base unit symbol must be present in `units`
- base unit factor must equal `1` and offset must equal `0`
- every unit factor must be finite and greater than zero
- duplicate dimension names and unit symbols are rejected unless `overwrite: true` is used

```typescript
const RevisedLength = defineDimension(
  {
    name: "Length",
    baseUnitSymbol: "m",
    units: {
      m: { factor: 1 },
      mm: { factor: 0.001 },
    },
  } as const,
  { overwrite: true },
);

console.log(RevisedLength.quantity(1, "m").convertTo("mm").value); // 1000
```

## 4. Derived dimensions and expression grammar

`defineComplexDimension` builds a new dimension from existing registered dimensions via an expression string.

```typescript
const Speed = defineComplexDimension("Speed", () => "Length / Time");
const Area = defineComplexDimension("Area", () => "Length ^ 2");
const Acceleration = defineComplexDimension(
  "Acceleration",
  () => "Length / Time ^ 2",
);

console.log(Speed.quantity(10, "m/s").convertTo("km/h").value); // 36
console.log(Area.quantity(2, "m^2").convertTo("cm^2").value); // 20000
console.log(Acceleration.quantity(1, "m/s^2").convertTo("cm/min^2").value); // 360000
```

Supported expression forms include dimension names, multiplication, division, optional whitespace, and positive integer exponents:

```text
Length
Length * Time
Length / Time
Length / Time ^ 2
Mass * Length / Time ^ 2
```

Important runtime behavior:

- every generated combination of component units is included
- units with non-zero offsets cannot participate in complex dimensions
- expressions must resolve against known dimensions
- literal numeric coefficients are rejected in complex-dimension expressions
- zero or negative exponents are not valid in the public parser grammar

## 5. Dimension equivalence

`defineEquivalence` registers a canonical dimension relationship so different names can be treated as the same physical quantity.

```typescript
import { defineDimension, defineEquivalence } from "@eng-tools/ts-units";

const Force = defineDimension({
  name: "Force",
  baseUnitSymbol: "N",
  units: {
    N: { factor: 1 },
    kN: { factor: 1000 },
    lbf: { factor: 4.44822 },
  },
} as const);

defineEquivalence("Force", () => "Mass * Length / Time ^ 2");
```

Equivalences are resolved transitively and symmetrically. Once registered, signatures represented by different names can be compared and combined through a canonicalized dimension signature. This is used internally to simplify comparisons and operations that should treat equivalent dimensions as the same quantity family.

## 6. Quantity model and operations

The `Quantity` interface is the primary public behavior model:

```typescript
interface Quantity<DS extends DimensionSignature, Units extends string = string> {
  readonly _dimensionSignature: DS;
  readonly _valueInBaseUnits: number;
  value: number;
  unitSymbol: string;

  add<OtherUnits extends string>(other: Quantity<DS, OtherUnits>): Quantity<DS, Units>;
  subtract<OtherUnits extends string>(other: Quantity<DS, OtherUnits>): Quantity<DS, Units>;
  multiply<OtherDS extends DimensionSignature, OtherUnits extends string>(other: Quantity<OtherDS, OtherUnits>): Quantity<CombineDimensionSignatures<DS, OtherDS>, string>;
  divide<OtherDS extends DimensionSignature, OtherUnits extends string>(other: Quantity<OtherDS, OtherUnits>): Quantity<DivideDimensionSignatures<DS, OtherDS>, string>;
  pow<Exponent extends number>(exponent: Exponent): Quantity<ScaleDimensionSignature<DS, Exponent>, string>;
  convertTo<TargetUnit extends Units>(targetUnitSymbol: TargetUnit): Quantity<DS, TargetUnit>;
  equals(other: Quantity<DimensionSignature, string>): boolean;
  isLessThan(other: Quantity<DimensionSignature, string>): boolean;
  isGreaterThan(other: Quantity<DimensionSignature, string>): boolean;
  valueOf(): number;
  toString(): string;
  toJSON(): { value: number; unit: string };
}
```

### Arithmetic

```typescript
const oneMeter = Length.quantity(1, "m");
const oneHundredCentimeters = Length.quantity(100, "cm");

const sum = oneMeter.add(oneHundredCentimeters);
const difference = oneMeter.subtract(oneHundredCentimeters);
const product = oneMeter.multiply(oneMeter);
const ratio = oneMeter.divide(oneHundredCentimeters);

console.log(sum.value, sum.unitSymbol); // 2 "m"
console.log(difference.value); // 0
console.log(product.unitSymbol); // "m^2"
console.log(ratio.unitSymbol); // "dimensionless"
```

Rules:

- `add` and `subtract` require matching dimensions
- `multiply` combines signatures by adding exponents
- `divide` subtracts exponents and removes zero exponents
- `pow(exponent)` scales the signature by the integer power and raises the value
- division by zero throws `Division by zero`

### Comparison and equality

```typescript
const first = Length.quantity(1, "m");
const second = Length.quantity(100, "cm");
const third = Length.quantity(2, "m");

console.log(first.equals(second)); // true
console.log(first.isLessThan(third)); // true
console.log(third.isGreaterThan(first)); // true
```

Equality compares base-unit values within a `1e-9` tolerance. `isLessThan` and `isGreaterThan` throw `Dimension mismatch` when the dimensions are not equivalent.

## 7. Affine units and offsets

Affine units use the stored base value:

```text
baseValue = value * factor + offset
```

This supports temperature scales like Celsius and Fahrenheit:

```typescript
const Temperature = defineDimension({
  name: "Temperature",
  baseUnitSymbol: "K",
  units: {
    K: { factor: 1 },
    degC: { factor: 1, offset: 273.15 },
    degF: { factor: 5 / 9, offset: 255.37222222222222 },
  },
} as const);

console.log(Temperature.quantity(20, "degC").convertTo("K").value); // 293.15
```

Important caveat: the library models affine conversion correctly, but it does not distinguish absolute temperatures from temperature differences. This means it is up to the caller to interpret the semantics of subtraction and addition for non-zero-offset units. These units also cannot participate in complex-dimension expressions.

## 8. Registry APIs

The registry is introspectable at runtime:

```typescript
import {
  getAllDimensions,
  getDimensionDefinition,
  getUnitDefinition,
} from "@eng-tools/ts-units";

console.log(getAllDimensions().map(({ name }) => name));

const lengthDefinition = getDimensionDefinition("Length");
console.log(lengthDefinition.baseUnitSymbol); // "m"
console.log(lengthDefinition.factory("cm")(25).convertTo("m").value); // 0.25

const centimeter = getUnitDefinition("cm");
console.log(centimeter);
// { symbol: "cm", factor: 0.01, offset: 0, dimensionName: "Length" }
```

`getAllDimensions()` returns all registered dimensions, `getDimensionDefinition(name)` returns the operational definition with `quantity` and `factory` APIs, and `getUnitDefinition(symbol)` returns the raw unit metadata for a registered symbol.

## 9. Low-level `Q` and type utilities

`Q` is the concrete quantity class and can be used directly when a custom path needs it:

```typescript
import { Q } from "@eng-tools/ts-units";

const q = new Q(12, "m");
console.log(q.value, q.unitSymbol);
```

Most application code should prefer the typed dimension helpers returned by `defineDimension`, because they preserve literal unit unions and dimension-specific APIs.

The package also exports the type-level dimension utilities:

```typescript
import type {
  CombineDimensionSignatures,
  DivideDimensionSignatures,
  DimensionSignature,
  SimpleDimensionSignature,
  DimensionUnitSymbols,
} from "@eng-tools/ts-units";

type LengthSignature = SimpleDimensionSignature<"Length">;
type AreaSignature = CombineDimensionSignatures<
  { Length: 1 },
  { Length: 1 }
>;
type SpeedSignature = DivideDimensionSignatures<
  { Length: 1 },
  { Time: 1 }
>;
```

These helpers are designed for the small whole-number exponent patterns used in dimensional analysis, not general symbolic algebra.

## 10. Error behavior and compatibility contracts

Validation and runtime behavior are intentionally strict:

```text
Dimension name must be non-empty.
Base unit "kg" is not declared for dimension "Mass".
Base unit "m" for dimension "Length" must have a conversion factor of 1 and offset of 0.
Unit "m" is not defined.
Dimension "Unknown" is not defined.
Unit symbol "m" is already registered to dimension "Length".
Division by zero
Dimension mismatch
```

Important compatibility notes:

- `convertTo` requires a unit in the same dimension signature
- `equals` returns `false` for different dimensions rather than throwing
- ordering methods throw `Dimension mismatch` when dimensions differ
- `defineComplexDimension` and `defineEquivalence` both validate their dimensional expressions before registration
- definitions are validated before registry mutation, so failed registrations do not leave partial state behind

## 11. Summary of project capabilities

The current project supports:

- built-in SI and engineering dimensions
- custom dimension registration
- affine unit conversion
- dimension expression composition
- dimension equivalence resolution
- value arithmetic and unit conversion
- runtime introspection via the registry
- static dimensional typing for common application code

This makes the package suitable for domain models, calculators, and engineering tooling that need safe and consistent dimensional behavior without hard-coding a single global unit system.

