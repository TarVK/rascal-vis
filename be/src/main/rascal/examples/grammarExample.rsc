module examples::grammarExample

import Grammar;
// import lang::rascal::\syntax::Rascal;
import Visualize;

lexical Ident =  [a-zA-Z][a-zA-Z0-9]* !>> [a-zA-Z0-9];
lexical Natural = [0-9]+ !>> [0-9];
lexical LAYOUT = [\t-\n\r\ ];
layout LAYOUTLIST = LAYOUT*  !>> [\t-\n\r\ ] ;
start syntax Prog = prog: Func* ;
syntax Func = func: Ident name "(" {Ident ","}* ")" "=" Exp;
syntax Exp 
    = let: "let" {Binding ","}* "in" Exp "end"
    | cond: "if" Exp "then" Exp "else" Exp "end"
    | bracket "(" Exp ")"
    | var: Ident
    | nat: (Natural  | Ident)
    | call: Ident "(" {Exp ","}* ")"
    | address: "&" Ident
    > deref: "*" Exp 
    > non-assoc (
        left mul: Exp "*" Exp 
      | non-assoc div: Exp "/" Exp
    ) 
    > left (
        left add: Exp "+" Exp 
      | left sub: Exp "-" Exp
    )
    > non-assoc (
        non-assoc gt: Exp "\>" Exp
      | non-assoc lt:  Exp "\<" Exp
      | non-assoc geq:  Exp "\>=" Exp
      | non-assoc leq:  Exp "\<=" Exp
    )
    > right assign: Exp ":=" Exp
    > right seq: Exp ";" Exp; 
syntax Binding = binding: Ident "=" Exp;

void main() {
    visualize(grammar(#Prog));
    // visualize(grammar(#Module));
    // stopVisualize();
}