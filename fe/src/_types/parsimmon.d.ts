import type {Parser} from "parsimmon";
declare module "parsimmon" {
    function seq<V1, V2, V3, V4, V5, V6, V7, V8>(
        p1: Parser<V1>,
        p2: Parser<V2>,
        p3: Parser<V3>,
        p4: Parser<V4>,
        p5: Parser<V5>,
        p6: Parser<V6>,
        p7: Parser<V7>,
        p8: Parser<V8>
    ): Parser<[V1, V2, V3, V4, V5, V6, V7, V8]>;
    function seq<V1, V2, V3, V4, V5, V6, V7, V8, V9>(
        p1: Parser<V1>,
        p2: Parser<V2>,
        p3: Parser<V3>,
        p4: Parser<V4>,
        p5: Parser<V5>,
        p6: Parser<V6>,
        p7: Parser<V7>,
        p8: Parser<V8>,
        p9: Parser<V9>
    ): Parser<[V1, V2, V3, V4, V5, V6, V7, V8, V9]>;
}
