module examples::controlsProfile

import Visualize;

void main() {
    visualize(
        VProfile("my cool value", 
            name="My settings profile", 
            settings=VSettings(
                textHoverHighlightIntensity=1.0
            )
        )
    );
    // stopVisualize();
}