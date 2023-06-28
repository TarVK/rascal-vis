import ReactDOM from "react-dom";
import React from "react";
import {App} from "./App";
import {ThemeProvider} from "@devtools-ds/themes";
import {initializeIcons, ThemeProvider as FluentThemeProvider} from "@fluentui/react";
import {darkTheme} from "./theme";

initializeIcons();

ReactDOM.render(
    <FluentThemeProvider theme={darkTheme}>
        <ThemeProvider theme={"chrome"} colorScheme={"dark"}>
            <App />
        </ThemeProvider>
    </FluentThemeProvider>,
    document.getElementById("root")
);
