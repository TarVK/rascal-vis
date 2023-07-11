module examples::controlsProfile

import Visualize;

data MyData = myConstr(int smth);

void main() {
    visualize(
        VProfile("my cool value", 
            name="My settings profile", 
            settings=VSettings(
                hoverHighlightIntensity=1.0
            )
        )
    );
    // stopVisualize();
}