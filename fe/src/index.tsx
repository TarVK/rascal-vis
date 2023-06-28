import ReactDOM from "react-dom";
import React from "react";
import {App} from "./App";
import {ThemeProvider} from "@devtools-ds/themes";
import {initializeIcons} from "@fluentui/react";

initializeIcons();

ReactDOM.render(
    <ThemeProvider theme={"chrome"} colorScheme={"dark"}>
        <App />
    </ThemeProvider>,
    document.getElementById("root")
);
