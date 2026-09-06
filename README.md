# ts-units

Type-safe unit conversion and dimensional arithmetic for TypeScript.

`ts-units` provides a registry-backed system for dimensions, units, and quantities. It ships with a ready-made catalog of SI and engineering dimensions, while still allowing you to define your own application-specific dimensions when needed.

## Why use it?

- Prevent invalid math like adding a length to a time
- Convert between units with automatic base-unit normalization
- Compose new dimensions from expressions such as `Length / Time ^ 2`
- Support affine units such as Celsius and Fahrenheit
- Keep type safety for known dimensions and unit symbols

## Install

Deno:

```bash
deno add jsr:@eng-tools/ts-units
```

npm:

```bash
npm install @eng-tools/ts-units
```

## Built-in catalog

Importing the package gives you a working default catalog of common dimensions and units:

```typescript
import {
  Length,
  Mass,
  Time,
  Velocity,
  Area,
  Temperature,
  m,
  km,
  s,
} from "@eng-tools/ts-units";

const distance = Length.quantity(1, "km");
console.log(distance.convertTo("m").value); // 1000

const speed = Velocity.quantity(36, "km/h");
console.log(speed.convertTo("m/s").value); // 10

const room = Temperature.quantity(20, "degC");
console.log(room.convertTo("K").value); // 293.15

console.log(m(12).convertTo("cm").value); // 1200
console.log(s(2).value); // 2
```

The package includes common dimensions such as `Length`, `Mass`, `Time`, `ElectricCurrent`, `Temperature`, `AmountOfSubstance`, `LuminousIntensity`, plus derived dimensions like `Area`, `Velocity`, `Acceleration`, `Force`, `Pressure`, and more.

## Core API

```typescript
import {
  defineDimension,
  defineComplexDimension,
  defineEquivalence,
  getAllDimensions,
  getDimensionDefinition,
  getUnitDefinition,
  Q,
  type Quantity,
} from "@eng-tools/ts-units";
```

### Simple dimensions

```typescript
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
const meters = distance.convertTo("m");
console.log(meters.value); // 5000

const metersFactory = Length.factory("m");
console.log(metersFactory(12).value); // 12
```

`defineDimension` validates:

- non-empty dimension names and unit symbols
- a base unit declared in the `units` map
- base-unit factor exactly `1` and offset `0`
- positive finite unit conversion factors
- duplicate names and unit symbols unless `{ overwrite: true }` is used

### Derived dimensions

```typescript
const Velocity = defineComplexDimension("Velocity", () => "Length / Time");
const Area = defineComplexDimension("Area", () => "Length ^ 2");
const Acceleration = defineComplexDimension(
  "Acceleration",
  () => "Length / Time ^ 2",
);

const speed = Velocity.quantity(36, "km/h");
console.log(speed.convertTo("m/s").value); // 10

const area = Area.quantity(2, "m^2");
console.log(area.convertTo("cm^2").value); // 20000
```

Derived dimensions are built from existing dimension definitions and support expressions like:

```text
Length
Length * Time
Length / Time
Length / Time ^ 2
Mass * Length / Time ^ 2
```

The generated unit symbols are based on registered base units and emitted as composite strings such as `m/s`, `cm^2`, or `kg*m/s^2`.

### Dimension equivalence

```typescript
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

Once a dimension is registered as equivalent to another signature, comparisons and compatible arithmetic are resolved through canonicalized signatures instead of requiring the exact same dimension name.

## Quantity operations

```typescript
const oneMeter = Length.quantity(1, "m");
const oneHundredCentimeters = Length.quantity(100, "cm");

const sum = oneMeter.add(oneHundredCentimeters); // 2 m
const product = oneMeter.multiply(oneMeter); // 1 m^2
const ratio = oneMeter.divide(oneHundredCentimeters); // 1 dimensionless

console.log(sum.value, sum.unitSymbol);
console.log(product.unitSymbol);
console.log(ratio.unitSymbol);
```

Available operations include:

- `add(other)` / `subtract(other)`
- `multiply(other)` / `divide(other)`
- `pow(exponent)`
- `convertTo(targetUnit)`
- `equals(other)`
- `isLessThan(other)` / `isGreaterThan(other)`
- `toString()`, `toJSON()`, `valueOf()`

Addition and subtraction require the same dimension; multiplication and division combine or reduce dimension signatures. Division by zero throws an error.

## Affine units

Affine units are supported through an optional `offset` value, which is used for temperature scales:

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

Offset units are valid for conversions, but they cannot be used in complex dimensions because their offset changes the linear conversion model.

## Registry introspection

```typescript
const dimensions = getAllDimensions();
console.log(dimensions.map(({ name }) => name));

const lengthDef = getDimensionDefinition("Length");
console.log(lengthDef.baseUnitSymbol); // "m"
console.log(lengthDef.factory("cm")(25).convertTo("m").value); // 0.25

const centimeter = getUnitDefinition("cm");
console.log(centimeter);
```

`getAllDimensions()` returns all registered dimension definitions, `getDimensionDefinition(name)` exposes the registered helpers, and `getUnitDefinition(symbol)` exposes the raw unit metadata for a known symbol.

## Direct quantity construction

If you need a direct value plus unit constructor, the package exports `Q`:

```typescript
const q = new Q(12, "m");
console.log(q.value, q.unitSymbol);
```

Most application code should prefer the typed helpers returned by `defineDimension`, because they preserve literal unit unions and dimension-specific APIs.

## Project status

The current codebase includes:

- a default library catalog of common dimensions and units
- custom dimension creation and registration
- derived dimensions from expression strings
- dimension equivalence registration and canonical signature resolution
- affine unit conversions with offsets
- typed `Quantity`/`Q` APIs for arithmetic, conversion, and comparison

For detailed runtime rules, validation behavior, and type-level signature semantics, see [DOCUMENTATION.md](./DOCUMENTATION.md).
