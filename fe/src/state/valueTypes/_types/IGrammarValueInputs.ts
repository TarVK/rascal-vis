import {IConstr, IEntry, IMap, ISet, IString, IVal} from "../../../_types/IVal";

export type IGrammarValueInput = Omit<IConstr, "namedChildren" | "children"> & {
    name: "grammar";
    children: [
        Omit<ISet, "children"> & {children: IGrammarSymbol[]},
        Omit<IMap, "children"> & {
            children: {id: number; key: IGrammarSymbol; value: IGrammarProd}[];
        }
    ];
    namedChildren: [];
};

// TODO:
type IGrammarSymbol = IVal;
type IGrammarProd = IVal;
