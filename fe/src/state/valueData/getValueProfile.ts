import {IValNode} from "../../_types/IValNode";
import {merge} from "../../utils/deepMerge";
import {nonNullFilter} from "../../utils/nonNullFilter";
import {ISpecialConstrData} from "../../value/_types/ISpecialConstrData";
import {getSpecialConstrName} from "../../value/getSpecialConstrName";
import {specialConstructors} from "../../value/specialConstructors";
import {ISettings} from "../_types/ISettings";
import {TDeepPartial} from "../_types/TDeepPartial";
import {IProfileValueData} from "./_types/IProfileValueData";
import {getConstrField} from "./util/getConstrField";
import {getValNumber} from "./util/getValNumber";

/** Data about profile constructors */
export const profileConstrData = {
    name: getSpecialConstrName("profile"),
    type: "siteControls",
} satisfies ISpecialConstrData;

/** Data about settings constructors */
export const settingsConstrData = {
    name: getSpecialConstrName("settings"),
    type: "siteControls",
} satisfies ISpecialConstrData;

/**
 * Retrieves the settings/profile data to load according tot he input value
 * @param nodes The input nodes to extract the data from
 * @returns The profile data
 */
export function getValueProfile(nodes: IValNode[]): IProfileValueData {
    const profileInputs = nodes.map(getProfileInput).filter(nonNullFilter);

    let selected: string | undefined;
    let init: string | undefined;
    let update: TDeepPartial<ISettings> | undefined;
    for (let profileInput of profileInputs) {
        if (profileInput.selected) selected = profileInput.selected;
        if (profileInput.init) init = profileInput.init;
        if (profileInput.update)
            update = update ? merge(update, profileInput.update) : profileInput.update;
    }

    return {
        selected,
        init,
        update,
    };
}

function getProfileInput(node: IValNode): null | IProfileValueData {
    const value = node.value;
    if ("key" in value) return null;
    if (value.type != "constr") return null;
    if (value.name != profileConstrData.name) return null;

    const selected = getConstrField(value, "name", "string")?.valuePlain;
    const init = getConstrField(value, "init", "string")?.valuePlain;

    let update: TDeepPartial<ISettings> | undefined = undefined;
    const settings = getConstrField(value, "settings", "constr");
    if (settings?.name == settingsConstrData.name) {
        update = {
            layout: {
                deleteUnusedPanels: getConstrField(
                    settings,
                    "deleteUnusedPanels",
                    "boolean"
                )?.value,
            },
            graph: {
                sharpness: getValNumber(
                    getConstrField(settings, "graphSharpness", "number"),
                    {min: 0.5, max: 3}
                ),
            },
            text: {
                highlightIntensity: getValNumber(
                    getConstrField(settings, "highlightIntensity", "number"),
                    {min: 0, max: 1, decimals: 2}
                ),
                hoverHighlightIntensity: getValNumber(
                    getConstrField(settings, "hoverHighlightIntensity", "number"),
                    {min: 0, max: 1, decimals: 2}
                ),
                showCollectionSizes: {
                    list: getConstrField(settings, "showListSize", "boolean")?.value,
                    set: getConstrField(settings, "showSetSize", "boolean")?.value,
                    tuple: getConstrField(settings, "showTupleSize", "boolean")?.value,
                    map: getConstrField(settings, "showMapSize", "boolean")?.value,
                },
            },
            search: {
                initialLoadCount: getValNumber(
                    getConstrField(settings, "initialSearchLoadCount", "number"),
                    {min: 1}
                ),
                loadMoreCount: getValNumber(
                    getConstrField(settings, "expandSearchLoadCount", "number"),
                    {min: 1}
                ),
            },
        };
    }

    return {
        init,
        selected,
        update,
    };
}
