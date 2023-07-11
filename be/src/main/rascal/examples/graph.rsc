module examples::graph

import Visualize;

data MyData = myConstr(int smth);

void main() {
    visualize(
        VGraph(
            {
                VNode(0, name="p0", color="green"),
                VNode(1, name="p1"),
                VNode(2, name="p2"),
                VNode(3, name="p3"),
                VNode(4, name="p4", color="red")
            },
            {
                VEdge(0, 2, name="*:{}"),
                VEdge(2, 2, name="*:{}"),
                VEdge(0, 1, name="matchStart()"),
                VEdge(2, 1, name="matchStart()"),
                VEdge(1, 1, name="![h]:{h}"),
                VEdge(1, 1, name="[h]:{h}"),
                VEdge(1, 3, name="[h]:{h}"),
                VEdge(3, 3, name="*:{t}"),
                VEdge(3, 4, name="matchEnd()"),
                VEdge(4, 4, name="*:{}")
            }
        )
    );
    // stopVisualize();
}