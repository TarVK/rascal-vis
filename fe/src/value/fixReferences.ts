import {
    IBool,
    IConstr,
    IEntry,
    IList,
    ILoc,
    IMap,
    INode,
    INum,
    ISet,
    IString,
    ITuple,
    IVal,
    IValPlain,
} from "../_types/IVal";

/**
 * Fixes all references within the value, making sure any duplication of data is replaced by references to the same objects
 * @param value The value for which to fix the references, and add ids
 * @param cache The value cache to use for deduping
 * @param IDer The ID counter to be used
 * @returns The value with data being deduplicated, and ids being added
 */
export function fixReferences(
    value: IValPlain,
    cache: IValCache = {
        constr: new Map(),
        node: new Map(),
        map: new Map(),
        list: new Map(),
        set: new Map(),
        tuple: new Map(),
        bool: new Map(),
        num: new Map(),
        string: new Map(),
        loc: new Map(),
        entry: new Map(),
    },
    IDer: {ID: number} = {ID: 0}
): IVal {
    const newID = IDer.ID++;
    let withID = {...value, id: newID};

    const rec = (value: IValPlain): IVal => fixReferences(value, cache, IDer);
    const find = <T, V>(
        map: Map<T, V[]>,
        key: T,
        predicate: (v: V) => boolean
    ): V | null => {
        const entries = map.get(key);
        if (!entries) return null;
        return entries.find(predicate) ?? null;
    };
    const add = <T, V>(map: Map<T, V[]>, key: T, value: V): void => {
        let entries = map.get(key);
        if (!entries) {
            entries = [];
            map.set(key, entries);
        }
        entries.push(value);
    };

    if (withID.type == "constr" || withID.type == "node") {
        const equals = (a: IConstr | INode, b: IConstr | INode) =>
            a.children.length == b.children.length &&
            a.namedChildren.length == b.namedChildren.length &&
            a.children.every((entry, i) => b.children[i] == entry) &&
            a.namedChildren.every(({name, value}) =>
                b.namedChildren.find(
                    ({name: nameO, value: valueO}) => name == nameO && value == valueO
                )
            );

        if (withID.type == "constr") {
            const out: IConstr = {
                ...withID,
                children: withID.children.map(rec),
                namedChildren: withID.namedChildren.map(({name, value}) => ({
                    name,
                    value: rec(value),
                })),
            };
            const eq = find(cache.constr, out.name, v => equals(v, out));
            if (eq) return eq;
            add(cache.constr, out.name, out);
            return out;
        } else if (withID.type == "node") {
            const out: INode = {
                ...withID,
                children: withID.children.map(rec),
                namedChildren: withID.namedChildren.map(({name, value}) => ({
                    name,
                    value: rec(value),
                })),
            };
            const eq = find(cache.node, out.name, v => equals(v, out));
            if (eq) return eq;
            add(cache.node, out.name, out);
            return out;
        }
    } else if (withID.type == "map") {
        const out: IMap = {
            ...withID,
            children: withID.children.map(({key, value}) => {
                const entry: IEntry = {
                    id: IDer.ID++,
                    key: rec(key),
                    value: rec(value),
                };
                const id = entry.key.id + "-" + entry.value.id;
                const eq = cache.entry.get(id);
                if (eq) return eq;
                cache.entry.set(id, entry);
                return entry;
            }),
        };
        const eq = find(cache.map, out.children.length, v =>
            v.children.every(child1 => out.children.includes(child1))
        );
        if (eq) return eq;
        add(cache.map, out.children.length, out);
        return out;
    } else if (withID.type == "list" || withID.type == "set" || withID.type == "tuple") {
        const equals = (a: IList | ISet | ITuple, b: IList | ISet | ITuple) =>
            a.children.every((v, i) => b.children[i] == v);
        if (withID.type == "list") {
            const out = {...withID, children: withID.children.map(rec)};
            const eq = find(cache.list, out.children.length, v => equals(v, out));
            if (eq) return eq;
            add(cache.list, out.children.length, out);
            return out;
        } else if (withID.type == "set") {
            const out = {...withID, children: withID.children.map(rec)};
            const eq = find(cache.set, out.children.length, v => equals(v, out));
            if (eq) return eq;
            add(cache.set, out.children.length, out);
            return out;
        } else if (withID.type == "tuple") {
            const out = {...withID, children: withID.children.map(rec)};
            const eq = find(cache.tuple, out.children.length, v => equals(v, out));
            if (eq) return eq;
            add(cache.tuple, out.children.length, out);
            return out;
        }
    } else if (withID.type == "boolean") {
        const eq = cache.bool.get(withID.value);
        if (eq) return eq;
        cache.bool.set(withID.value, withID);
        return withID;
    } else if (withID.type == "number") {
        const eq = cache.num.get(withID.value);
        if (eq) return eq;
        cache.num.set(withID.value, withID);
        return withID;
    } else if (withID.type == "string") {
        const out = withID;
        const eq = find(
            cache.string,
            out.value[0] ?? "",
            v =>
                v.value.length == out.value.length &&
                out.value.every((p, i) => {
                    const p2 = v.value[i];
                    return (
                        p == p2 ||
                        (typeof p == "object" &&
                            typeof p2 == "object" &&
                            p.text == p2.text)
                    );
                })
        );
        if (eq) return eq;
        add(cache.string, out.value[0] ?? "", out);
        return out;
    } else if (withID.type == "location") {
        const out = withID;
        const eq = find(
            cache.loc,
            out.uri,
            v =>
                !!v.position == !!out.position &&
                (!v.position ||
                    !out.position ||
                    (v.position.start.line == out.position.start.line &&
                        v.position.start.column == out.position.start.column &&
                        v.position.end.line == out.position.end.line &&
                        v.position.end.column == out.position.end.column &&
                        v.position.offset.start == out.position.offset.start &&
                        v.position.offset.end == out.position.offset.end))
        );
        if (eq) return eq;
        add(cache.loc, out.uri, out);
        return out;
    }

    return null as never;
}

type IValCache = {
    map: Map<number, IMap[]>;
    constr: Map<string, IConstr[]>;
    node: Map<string, INode[]>;
    list: Map<number, IList[]>;
    set: Map<number, ISet[]>;
    tuple: Map<number, ITuple[]>;
    num: Map<string, INum>;
    string: Map<string, IString[]>;
    bool: Map<boolean, IBool>;
    loc: Map<string, ILoc[]>;
    entry: Map<string, IEntry>;
};
