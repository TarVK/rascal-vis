export type ISpecialConstrData = {
    name: string;
    type: ISpecialConstrType;
};
export type ISpecialConstrType =
    | "visualization"
    | "visualizationSupport"
    | "siteControls";
