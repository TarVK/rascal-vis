import {useEffect} from "react";
import {useTheme} from "@fluentui/react";
import {Diagram, Node, TextBlock, Link, Shape, Binding} from "gojs";

export function useGraphTemplates(diagram: Diagram | null) {
    const theme = useTheme();
    useEffect(() => {
        if (!diagram) return;

        diagram.nodeTemplate = new Node({background: theme.palette.themeSecondary}).add(
            new TextBlock("", {margin: 12, stroke: theme.palette.black}).bind(
                "text",
                "label"
            )
        );

        diagram.linkTemplate = new Link({routing: Link.Orthogonal, corner: 5}).add(
            new Shape({strokeWidth: 3, stroke: theme.palette.themeTertiary})
        );
    }, [diagram]);
}
