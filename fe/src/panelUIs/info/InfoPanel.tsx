import React, {FC} from "react";
import {PanelContainer} from "../../components/PanelContainer";
import {InfoPanelState} from "../../state/InfoPanelState";
import {AppState} from "../../state/AppState";
import {Icon, Link, MessageBar, useTheme} from "@fluentui/react";
import grammarExample from "./grammarExample.txt";
import basicExample from "./basicExample.txt";
import controlsExample from "./controlsExample.txt";
import graphExample from "./graphExample.txt";
import {StyledMessageBar} from "../../components/StyledMessageBar";
import {css} from "@emotion/css";
import {PanelState} from "../../state/PanelState";

export const InfoPanel: FC<{panel: InfoPanelState; state: AppState}> = ({
    panel,
    state,
}) => {
    const theme = useTheme();
    const tabs = state.specialTabs;
    const loadValue = (textValue: string) => {
        const input = tabs.input;
        input.setInputText(textValue);
        input.setInputSourceType("manual");
        tabs.open(input);
        tabs.open(tabs.root);
    };
    const link = (text: string, panel: PanelState) => (
        <Link onClick={() => tabs.open(panel)}>{text}</Link>
    );

    return (
        <Container>
            <h1 style={{color: theme.palette.themePrimary, fontSize: 40, marginTop: 10}}>
                <Icon
                    iconName="BulletedTreeList"
                    styles={{
                        root: {marginRight: 10, fontSize: 45, verticalAlign: "bottom"},
                    }}
                />
                Rascal-Vis
            </h1>
            <P>
                Rascal-Vis is a tool created for inspecting and visualizing rascal values.
                It helps you explore large and complex values that can be difficult to
                understand. With its advanced features, it makes the exploration process
                easier and more accessible.
            </P>
            <P>
                This tool is designed for personal use, but it is fully open source and
                can be modified to suit your specific needs. If you wish to view or make
                changes to the source code, you can access the repository at
                <Link href={"https://github.com/TarVK/rascal-visualization"}>
                    github.com/TarVK/rascal-visualization
                </Link>
            </P>
            <H2>Example data</H2>
            Explore the tool's features by testing it with these example values:
            <ul>
                {[
                    {name: "basic", value: basicExample},
                    {name: "grammar", value: grammarExample},
                    {name: "graph", value: graphExample},
                    {name: "controls", value: controlsExample},
                ].map(({name, value}, i) => (
                    <li key={i}>
                        <Link onClick={() => loadValue(value)}>{name}</Link>
                    </li>
                ))}
            </ul>
            <StyledMessageBar>
                The controls example demonstrates profile selection, although it's
                important to note that this feature operates exclusively when the value is
                sourced from a server.
            </StyledMessageBar>
            <H2>Features</H2>
            <H3>Synchronization</H3>
            You have the option to provide values either manually or retrieve them from a
            server. Simply head to the {link("input panel", tabs.input)} to make your
            selection. To send values directly from Rascal, you can set the address to{" "}
            <Literal>http://localhost:10001/data</Literal> and use the{" "}
            <Literal>visualize(yourValue)</Literal> function in Rascal. To stop
            visualizing, simply call <Literal>stopVisualize()</Literal>.
            <H3>Visualizations</H3>
            The tool provides various methods for data exploration based on their data
            type. If there are multiple applicable visualizations, you'll find a
            visualization selector located in the top right corner. This allows you to
            choose the desired visualization option.
            <H4>Inspector</H4>
            The inspector is the fundamental visualization in the tool, similar to those
            found in other environments like JavaScript tools in web browsers. It is
            always available regardless of the data type and enables you to concentrate on
            specific sections of the data. You can drag values into new panels to compare
            them side by side, offering a convenient way to analyze different aspects.
            Additionally, right-clicking provides access to further options through the
            context menu.
            <H4>Grammars</H4>
            Grammars can be visualized in a manner closely resembling their definition in
            Rascal. This visualization offers a concise view that maintains the visibility
            of the relationships between various symbols within the grammar.
            <H4>Graphs</H4>
            While the tool currently supports node graph visualization, it is important to
            note that this feature is not yet fully optimized. However, there are plans to
            enhance node graph capabilities by introducing diagrams in the future. These
            additions will improve the visualization and understanding of node graphs
            within the tool.
            <H3>Panels</H3>
            <P>
                The tool offers a robust panel system that empowers you to arrange and
                organize components optimally based on your specific scenario. You have
                the flexibility to place panels side by side, resize them as needed, or
                group them in different tabs. This feature enables you to customize the
                layout of the tool to suit your preferences and efficiently work with your
                data.
            </P>
            <StyledMessageBar>
                The tool makes an effort to synchronize new values into existing panels
                whenever possible. However, there may be instances where it
                unintentionally assigns the wrong value to a panel or fails to display any
                value at all. While it strives to maintain synchronization, occasional
                discrepancies may occur.
            </StyledMessageBar>
            <H3>Highlighting</H3>
            Values in the tool can be highlighted in different ways to emphasize their
            connections. You have the option to hover over a value to see a temporary
            highlight, apply a permanent highlight to keep it visible, or focus on a
            specific value to emphasize its connections with other values. These
            highlighting features facilitate a better understanding of the relationships
            between values within the tool.
            <H3>Search</H3>
            <P>
                The tool provides a convenient search system to quickly locate specific
                elements. Simply head to the {link("search panel", tabs.search)} to
                perform a query. It offers two types of searches: plain text search and
                structured search.
            </P>
            <P>
                The plain text search allows you to search for strings, numbers, and
                constructor names using simple text queries.
            </P>
            <P>
                The structured search, on the other hand, enables you to utilize patterns
                similar to those in Rascal. For example, you can search for instances of a
                specific constructor with certain parameter values by using patterns like{" "}
                <Literal>myConstr(_, 4)</Literal>. You can also search through lists using
                patterns like <Literal>[_*, 4, _*, 4, _*]</Literal> to find a list with
                two copies of the value 4.
            </P>
            <P>
                Additionally, JavaScript regular expressions can be used within your
                search to match specific texts. For instance, you can search for an
                instance of your constructor where the first value is a string containing
                the word <Literal>some</Literal> by using{" "}
                <Literal>myConstr(/some/, _)</Literal>.
            </P>
            <P>
                These search features offer flexibility and versatility in locating
                desired elements within the tool.
            </P>
            <H3>Settings</H3>
            <P>
                The tool offers global settings that can be customized according to your
                preferences. All data, including the current panel layout and their
                internal data, is stored locally in local storage. Simply head to the{" "}
                {link("settings panel", tabs.settings)} to make changes to these settings.
            </P>
            <P>
                Furthermore, the tool supports the creation of multiple profiles, allowing
                you to set up and switch between different predetermined layouts
                effortlessly. This feature enables you to maintain multiple configurations
                tailored to specific needs or contexts, enhancing your overall user
                experience.
            </P>
            <H3>Value controls</H3>
            <P>
                In the tool, there are special value constructors that hold significant
                meaning and allow you to manipulate the layout and other application state
                using these values. This functionality is particularly useful when making
                changes directly from within Rascal, the source of the data.
            </P>
            <P>
                For example, you can utilize the <Literal>VTab</Literal> constructor
                within the value tree, as follows:{" "}
                <Literal>VTab(myValue("some value"), name="something")</Literal>. This
                will automatically open the corresponding value{" "}
                <Literal>myValue("something")</Literal> in a tab with the specified name,
                in this case, "something".
            </P>
            <P>
                By leveraging these special value constructors, you can efficiently
                control and customize the layout and application state, enhancing your
                workflow when working with data originating from Rascal.
            </P>
        </Container>
    );
};

const H2: FC = ({children}) => <h2>{children}</h2>;
const H3: FC = ({children}) => <h3>{children}</h3>;
const H4: FC = ({children}) => <h4>{children}</h4>;
const P: FC = ({children}) => <p>{children}</p>;

const Container: FC = ({children}) => (
    <PanelContainer className={css({display: "flex", justifyContent: "center"})}>
        <div style={{maxWidth: 800}}>{children}</div>
    </PanelContainer>
);
const Literal: FC = ({children}) => {
    const theme = useTheme();
    return (
        <span
            style={{
                fontFamily: "consolas",
                backgroundColor: theme.palette.neutralLight,
                color: theme.palette.themeDarker,
                padding: 2,
                paddingLeft: 5,
                paddingRight: 5,
            }}>
            {children}
        </span>
    );
};
