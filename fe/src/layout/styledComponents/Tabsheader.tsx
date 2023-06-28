import React, {FC, useEffect, useMemo, useRef, CSSProperties} from "react";
import {
    IDragDataInput,
    IDragStart,
    ITabsHeaderProps,
} from "../_types/props/ITabsHeaderProps";
import {
    CommandButton,
    FontIcon,
    IButtonProps,
    IconButton,
    Pivot,
    PivotItem,
    getTheme,
    mergeStyles,
} from "@fluentui/react";
import {useDragStart} from "../../utils/useDragStart";
import {LayoutState} from "../LayoutState";
import {IPoint} from "../../utils/_types/IPoint";
import {Field, useDataHook} from "model-react";

export const TabsHeader: FC<ITabsHeaderProps> = ({
    onClose,
    tabs,
    dragging,
    onCloseTab,
    onDrop,
    onSelectTab,
    selectedTab,
    onDragStart,
}) => {
    const OverflowAndRemainder = useMemo(
        () => getOverflowAndRemainder(dragging, onDrop, tabs.length == 0),
        [dragging, tabs.length == 0]
    );

    return (
        <div className={`layout-tabs-header ${pivotStyle}`} style={{display: "flex"}}>
            <Pivot
                style={{flexGrow: 1}}
                focusZoneProps={{style: {display: "flex", minHeight: 44}}}
                overflowBehavior="menu"
                overflowAriaLabel="more items"
                selectedKey={selectedTab}
                headersOnly={true}
                overflowButtonAs={OverflowAndRemainder}
                onLinkClick={item =>
                    item?.props.itemKey && onSelectTab(item.props.itemKey)
                }>
                {tabs.map(({id, name}, i) => (
                    <PivotItem
                        key={id}
                        headerText={name}
                        itemKey={id}
                        onRenderItemLink={() => (
                            <Tab
                                first={i == 0}
                                name={name}
                                dragging={dragging}
                                onDrop={side =>
                                    onDrop(tabs[i + (side == "after" ? 1 : 0)]?.id)
                                }
                                onClose={() => onCloseTab(id)}
                                selected={id == selectedTab}
                                onDrag={data => onDragStart({...data, targetId: id})}
                            />
                        )}
                    />
                ))}
            </Pivot>
        </div>
    );
};
const pivotStyle = mergeStyles({
    "& span": {
        position: "initial !important",
    },
});

const getOverflowAndRemainder: (
    dragging: boolean,
    onDrop: () => void,
    empty: boolean
) => FC<IButtonProps> = (dragging, onDrop, empty) => props =>
    (
        <>
            <div style={{flexGrow: 1, position: "relative"}}>
                {dragging && (
                    <DropContainer
                        style={{
                            left: empty ? 0 : -dropOffset - dropWidth,
                            borderLeftWidth: dropWidth,
                        }}
                        onDrop={onDrop}
                    />
                )}
            </div>
            <CommandButton {...props} />
        </>
    );

export const Tab: FC<{
    first: boolean;
    onClose: () => void;
    name: string;
    selected: boolean;
    onDrag: (input: Omit<IDragDataInput, "targetId">) => void;
    dragging: boolean;
    onDrop: (side: "before" | "after") => void;
}> = props => {
    const {onClose, name, selected, onDrag, dragging, onDrop, first} = props;
    const ref = useDragStart((position, offset) => {
        onDrag({
            position,
            offset,
            preview: (
                <Pivot headersOnly style={{backgroundColor: theme.palette.neutralLight}}>
                    <PivotItem onRenderItemLink={() => <Tab {...props} />} />
                </Pivot>
            ),
        });
    });

    return (
        <>
            {name}
            {selected && (
                <>
                    <span style={{display: "inline-block", width: 20}} />
                    <div style={{position: "absolute", zIndex: 100, top: 5, right: 0}}>
                        <IconButton
                            styles={{
                                icon: {width: "auto"},
                                root: {width: "auto", padding: 0},
                            }}
                            iconProps={{iconName: "Cancel"}}
                            onClick={onClose}
                        />
                    </div>
                </>
            )}
            <div
                style={{position: "absolute", left: 0, top: 0, right: 0, bottom: 0}}
                ref={ref}>
                {dragging && (
                    <>
                        <DropContainer
                            style={{
                                left: first ? 0 : -dropOffset - dropWidth,
                                right: "50%",
                                borderLeftWidth: dropWidth,
                            }}
                            onDrop={() => onDrop("before")}
                        />
                        <DropContainer
                            style={{
                                left: "50%",
                                right: -dropOffset - dropWidth,
                                borderRightWidth: dropWidth,
                            }}
                            onDrop={() => onDrop("after")}
                        />
                    </>
                )}
            </div>
        </>
    );
};

// Drop target styling
const dropWidth = 4;
const dropOffset = 2;
const theme = getTheme();
const dropColor = theme.palette.neutralTertiary;
const DropContainer: FC<{style: CSSProperties; onDrop: () => void}> = ({
    style,
    onDrop,
}) => (
    <div
        className={hoverDropStyle}
        style={{
            zIndex: 100,
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            borderColor: dropColor,
            ...style,
        }}
        onMouseUp={onDrop}
    />
);
const hoverDropStyle = mergeStyles({
    borderWidth: 0,
    borderStyle: "none",
    "&:hover": {
        borderStyle: "solid",
    },
});
