module examples::simple

import Visualize;

data MyData = myConstr(int smth);

void main() {
    visualize(<"testing you know", 32, (<"smth", true>: myConstr(34))>);
    // stopVisualize();
}