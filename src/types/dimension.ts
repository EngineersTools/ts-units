export type DimensionName = "Length" | "Mass" | "Time" | "Temperature" | "ElectricCurrent" | "AmountOfSubstance" | "LuminousIntensity";

export type DimensionDefinition<TName extends DimensionName = DimensionName> = {
    name: TName;
    baseUnitSymbol: string;
    units: Record<string, { factor: number; offset?: number }>;
}

export type UnitDefinition = {
    symbol: string;
    factor: number;
    offset: number;
    dimensionName: DimensionName;
}
