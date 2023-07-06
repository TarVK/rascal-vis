import {INode} from "react-accessible-treeview";
import {IEntry, IVal} from "./IVal";
import {IContextualMenuItem} from "@fluentui/react";

/** Individual flat node data to represent a value layer */
export type IValNode = INode & {
    /** The full value that the node is for */
    value: IVal | IEntry;
    /** How many of the following nodes belong to this value's subtree (excluding this node) */
    range: number;
    /** The node's role in relation to its parent */
    role?: INodeRole | null;
    /** Additional controls to show */
    controls?: {
        context: IContextualMenuItem[];
        inline: JSX.Element;
    };
    /** Whether this is a special node and shouldn't be openable in a new tab */
    notOpenable?: boolean;
};

export type INodeRole =
    | {
          type: "key";
      }
    | {
          type: "value";
      }
    | {
          type: "index";
          index: number;
      }
    | {
          type: "name";
          name: string;
      };
