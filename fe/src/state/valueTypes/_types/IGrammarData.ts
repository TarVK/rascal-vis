import {IEscapedString} from "../../../_types/IEscapeString";
import {ISet, IVal} from "../../../_types/IVal";
import {IValNode} from "../../../_types/IValNode";

export type IGrammarData = {
    start: IGrammarSymbol[];
    rules: {key: IGrammarSymbol; value: IGrammarProduction; source: IValNode}[];
};

export type IGrammarSymbol = TSourced<
    // In case of incorrect formatting
    | {type: "unknown"}
    | {
          type: "start";
          expr: IGrammarSymbol;
      }
    | {
          type: "sort";
          name: IEscapedString;
      }
    | {
          type: "lex";
          name: IEscapedString;
      }
    | {
          type: "layouts";
          name: IEscapedString;
      }
    | {
          type: "keywords";
          name: IEscapedString;
      }
    | {
          type: "parameterized-sort";
          name: IEscapedString;
          parameters: IGrammarSymbol[];
      }
    | {
          type: "parameterized-lex";
          name: IEscapedString;
          parameters: IGrammarSymbol[];
      }
    | {
          type: "lit";
          text: IEscapedString;
      }
    | {
          type: "cilit";
          text: IEscapedString;
      }
    | {
          type: "char-class";
          ranges: ICharRange[];
      }
    | {
          type: "empty";
      }
    | {
          type: "opt";
          expr: IGrammarSymbol;
      }
    | {
          type: "iter";
          expr: IGrammarSymbol;
      }
    | {
          type: "iter-star";
          expr: IGrammarSymbol;
      }
    | {
          type: "iter-seps";
          expr: IGrammarSymbol;
          separators: IGrammarSymbol[];
      }
    | {
          type: "iter-star-seps";
          expr: IGrammarSymbol;
          separators: IGrammarSymbol[];
      }
    | {
          type: "alt";
          expr: IGrammarSymbol[];
      }
    | {
          type: "seq";
          expr: IGrammarSymbol[];
      }
    | {
          type: "conditional";
          expr: IGrammarSymbol;
          conditions: IGrammarCondition[];
      }
    | {
          type: "label";
          expr: IGrammarSymbol;
          name: IEscapedString;
      }
    | {
          type: "annotate";
          expr: IGrammarSymbol;
          annotations: ISet;
          textAnnotations: IEscapedString[];
      }
    | {
          type: "custom";
          typeName: IEscapedString;
          expr: IGrammarSymbol;
      }
>;

export type IGrammarCondition = TSourced<
    // In case of incorrect formatting
    | {type: "unknown"}
    | {
          type: "follow";
          expr: IGrammarSymbol;
      }
    | {
          type: "not-follow";
          expr: IGrammarSymbol;
      }
    | {
          type: "precede";
          expr: IGrammarSymbol;
      }
    | {
          type: "not-precede";
          expr: IGrammarSymbol;
      }
    | {
          type: "delete";
          expr: IGrammarSymbol;
      }
    | {
          type: "at-column";
          column: number;
      }
    | {
          type: "begin-of-line";
      }
    | {
          type: "end-of-line";
      }
    | {
          type: "except";
          except: string;
      }
>;

export type ICharRange = TSourced<{
    begin: number;
    end: number;
}>;

export type IGrammarProduction = TSourced<
    // In case of incorrect formatting
    | {type: "unknown"}
    | {
          type: "prod";
          definition: IGrammarSymbol;
          symbols: IGrammarSymbol[];
          attributes: IGrammarAttr[];
      }
    | {
          type: "regular";
          definition: IGrammarSymbol;
      }
    | {
          type: "priority";
          definition: IGrammarSymbol;
          alternatives: IGrammarProduction[];
      }
    | {
          type: "associativity";
          definition: IGrammarSymbol;
          associativity: IGrammarAssociativity;
          alternatives: IGrammarProduction[];
      }
    | {
          type: "reference";
          definition: IGrammarSymbol;
          reference: string;
      }
    | {
          type: "choice";
          definition: IGrammarSymbol;
          alternatives: IGrammarProduction[];
      }
>;

export type IGrammarAttr = TSourced<
    // In case of incorrect formatting
    | {type: "unknown"}
    | {
          type: "tag";
          value: IVal;
      }
    | {
          type: "bracket";
      }
    | {
          type: "assoc";
          associativity: IGrammarAssociativity;
      }
>;

export type IGrammarAssociativity = "left" | "right" | "assoc" | "non-assoc";

type TSourced<T> = T & {source: IValNode};
