module examples::controlsShow

import Visualize;

data MyData = myConstr(int smth);

void main() {
    visualize(<"testing you know", VShow(32, highlight=true), (<"smth", true>: myConstr(34))>);
    // stopVisualize();
}