import { DimensionDefinition, UnitDefinition } from "../types/dimension.ts";

// Global registry for all defined dimensions
const DIMENSIONS_REGISTRY: Map<string, DimensionDefinition> = new Map();
// Global registry for all unit definitions, mapping symbol to full definition
const UNITS_REGISTRY: Map<string, UnitDefinition> = new Map();

/**
 * Registers a new dimension and its units.
 * @param definition The definition of the dimension.
 */
export function defineDimension(definition: DimensionDefinition): void {
  if (DIMENSIONS_REGISTRY.has(definition.name)) {
    console.warn(
      `Dimension "${definition.name}" is already defined. Overwriting.`
    );
  }

  DIMENSIONS_REGISTRY.set(definition.name, definition);

  // Register all units within this dimension
  for (const unitSymbol in definition.units) {
    if (UNITS_REGISTRY.has(unitSymbol)) {
        // Warning if overwriting, but allow it (could be useful for re-definitions)
        // Ideally we might want strictly unique symbols across all dimensions
        console.warn(
            `Unit symbol "${unitSymbol}" is already defined. Overwriting.`
        );
    }
    UNITS_REGISTRY.set(unitSymbol, {
      symbol: unitSymbol,
      factor: definition.units[unitSymbol].factor,
      offset: definition.units[unitSymbol].offset ?? 0,
      dimensionName: definition.name,
    });
  }

  // Ensure the base unit is also registered as a unit with factor 1
  if (!UNITS_REGISTRY.has(definition.baseUnitSymbol)) {
    UNITS_REGISTRY.set(definition.baseUnitSymbol, {
      symbol: definition.baseUnitSymbol,
      factor: 1,
      offset: 0,
      dimensionName: definition.name,
    });
  } else {
    // If base unit was already defined ensure its factor is 1
    const baseUnitDef = UNITS_REGISTRY.get(definition.baseUnitSymbol)!;
    if (baseUnitDef.factor !== 1 || baseUnitDef.offset !== 0) {
      throw new Error(
        `Base unit "${definition.baseUnitSymbol}" for dimension "${definition.name}" must have a conversion factor of 1 and offset of 0.`
      );
    }
    if (baseUnitDef.dimensionName !== definition.name) {
      throw new Error(
        `Base unit "${definition.baseUnitSymbol}" is registered to dimension "${baseUnitDef.dimensionName}" but defined as base for "${definition.name}".`
      );
    }
  }
}

export function getUnitDefinition(unitSymbol: string): UnitDefinition {
  const unitDef = UNITS_REGISTRY.get(unitSymbol);
  if (!unitDef) {
    throw new Error(`Unit "${unitSymbol}" is not defined.`);
  }
  return unitDef;
}

export function getDimensionDefinition(dimensionName: string): DimensionDefinition {
  const dimDef = DIMENSIONS_REGISTRY.get(dimensionName);
  if (!dimDef) {
    throw new Error(`Dimension "${dimensionName}" is not defined.`);
  }
  return dimDef;
}

// For accessing the registry deeply if needed (e.g. for listing all dimensions)
export function getAllDimensions(): DimensionDefinition[] {
    return Array.from(DIMENSIONS_REGISTRY.values());
}
