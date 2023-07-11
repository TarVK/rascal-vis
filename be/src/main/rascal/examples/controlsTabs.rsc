module examples::controlsTabs

import Visualize;

data MyData = myConstr(int smth);

void main() {
    visualize(
        {
            <1, <3, 4>>,
            <2, <4, 5>>,
            VTab(<1, <3, 4>>, name="third item")
        }
    );
    // stopVisualize();
}