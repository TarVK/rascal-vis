import {Field, IDataHook} from "model-react";
import {IPanelData} from "../layout/_types/IPanelData";
import {PanelState} from "./PanelState";
import {IBasePanelSerialization} from "./_types/IBasePanelSerialization";
import {AppState} from "./AppState";
import {ISearchPanelSerialization} from "./_types/ISearchPanelSerialization";
import {ISettingsPanelSerialization} from "./_types/ISettingsPanelSerialization";
import {IValuePanelSerialization} from "./_types/IValuePanelSerialization";
import {ITextPanelSerialization} from "./_types/ITextPanelSerialization";
import {ValuePanelState} from "./ValuePanelState";
import {ISettings} from "./_types/ISettings";
import {TDeepPartial} from "./_types/TDeepPartial";
import {v4 as uuid} from "uuid";
import {merge} from "../utils/deepMerge";

/**
 * The settings for the application
 */
export class SettingsState extends PanelState {
    public stateType = "settings";
    protected appState: AppState;

    protected profiles = new Field<Map<string, IProfile>>(new Map());

    protected profileId = new Field<string>("default");
    protected profileName = new Field<string>("default");

    protected settings = new Field<ISettings>({
        layout: {
            deleteUnusedPanels: false,
        },
        search: {
            initialLoadCount: 50,
            loadMoreCount: 50,
        },
        graph: {
            sharpness: 1.5,
        },
        text: {
            highlightIntensity: 1,
            hoverHighlightIntensity: 0.3,
            showCollectionSizes: {
                list: true,
                map: false,
                set: true,
                tuple: true,
            },
        },
        grammar: {
            showLayout: false,
            alignWidth: 150,
            showHandle: "hover",
        },
    });

    public constructor(state: AppState) {
        super("settings");
        this.appState = state;
    }

    /**
     * Retrieves the name of the loaded profile
     * @param hook The hook to subscribe to changes
     * @returns The name fo the loaded profile
     */
    public getProfileName(hook?: IDataHook): string {
        return this.profileName.get(hook);
    }

    /**
     * Sets the new name of the loaded profile
     * @param name The new name of the profile
     */
    public setProfileName(name: string): void {
        this.profileName.set(name);

        const id = this.profileId.get();
        const profiles = new Map(this.profiles.get());
        profiles.set(id, {...profiles.get(id)!, name});
        this.profiles.set(profiles);
    }

    /**
     * Retrieves all the available profiles
     * @param hook The hook to subscribe to changes
     */
    public getProfiles(hook?: IDataHook): IProfile[] {
        return [...this.profiles.get(hook).values()];
    }

    /**
     * Retrieves the currently selected profile
     * @param hook The hook to subscribe to changes
     * @returns The currently selected profile
     */
    public getSelectedProfileID(hook?: IDataHook): string {
        return this.profileId.get(hook);
    }

    /**
     * Deletes the profile with the given id
     * @param id The id of the profile to delete
     * @returns Whether the profile got be deleted
     */
    public deleteProfile(id: string): boolean {
        if (this.profileId.get() == id) {
            const nextProfile = [...this.profiles.get().values()].filter(
                ({id: pid}) => pid != id
            )[0];
            if (!nextProfile) return false;
            this.loadProfile(nextProfile);
        }

        const profiles = new Map(this.profiles.get());
        profiles.delete(id);
        this.profiles.set(profiles);
        return true;
    }

    /**
     * Adds and selects a new profile
     * @param name The name of the profile
     * @param id The id of the profile  to create
     */
    public addAndSelectProfile(name: string, id: string = uuid()): void {
        this.profileName.set(name);
        this.profileId.set(id);
        this.saveProfile();
    }

    // Settings
    /**
     * Retrieves the settings
     * @param hook The hook to subscribe to changes
     * @returns The current settings
     */
    public getSettings(hook?: IDataHook): ISettings {
        return this.settings.get(hook);
    }

    /**
     * Updates the settings of the application
     * @param settings The settings of the application
     */
    public updateSettings(settings: TDeepPartial<ISettings>): void {
        const current = this.settings.get();
        this.settings.set(merge(current, settings) as ISettings);
    }

    /** @override */
    public serialize(): ISettingsPanelSerialization {
        return {
            ...super.serialize(),
            type: "settings",
            settings: this.settings.get(),
        };
    }

    /** @override */
    public deserialize(data: ISettingsPanelSerialization): void {
        super.deserialize(data);
        this.updateSettings(data.settings);
    }

    // Profile loading and saving
    /**
     * Loads the given profile into the application
     * @param profile The profile to be loaded
     */
    public loadProfile(profile: IProfile): void {
        this.profileName.set(profile.name);
        this.profileId.set(profile.id);

        const tabs = this.appState.specialTabs.tabs;
        this.appState.getPanels().forEach(panel => {
            const specialTab = tabs.find(({panel: p}) => p == panel);
            if (!specialTab) this.appState.removePanel(panel);
        });

        const layout = this.appState.getLayoutState();
        layout.loadLayout(profile.layout);

        // Create all other panels before initializing the special ones
        profile.panels.forEach(data => {
            const specialTab = tabs.find(({panel}) => panel.getID() == data.id);
            if (!specialTab) {
                const panelState = createPanel(data as any);
                if (panelState) this.appState.addPanel(panelState, false);
            }
        });
        profile.panels.forEach(data => {
            const specialTab = tabs.find(({panel}) => panel.getID() == data.id);
            if (specialTab) specialTab.panel.deserialize(data);
        });
    }

    /**
     * Retrieves the data representing the current profile
     */
    protected getProfileData(): IProfile {
        const layout = this.appState.getLayoutState();
        return {
            name: this.profileName.get(),
            id: this.profileId.get(),
            layout: layout.getLayout(),
            panels: this.appState.getPanels().map(panel => panel.serialize()),
        };
    }

    /**
     * Saves the current profile
     */
    public saveProfile(): void {
        const profiles = this.profiles.get();
        const newProfiles = new Map(profiles);
        const profileData = this.getProfileData();
        newProfiles.set(profileData.id, profileData);
        this.profiles.set(newProfiles);
        this.saveProfilesData();
    }

    /** Saves the profiles to disk */
    protected saveProfilesData() {
        const profiles = [...this.profiles.get().values()];
        localStorage.setItem(
            "rascal-vis",
            JSON.stringify({selected: this.profileId.get(), profiles})
        );
    }

    /** Loads the profiles from disk */
    public loadProfilesData() {
        try {
            const dataText = localStorage.getItem("rascal-vis");
            if (!dataText) {
                // Open the info tab by default, and make sure the polling starts going
                const specialTabs = this.appState.specialTabs;
                specialTabs.open(specialTabs.info);
                specialTabs.input.setInputSourceType("server");
                return;
            }

            const data = JSON.parse(dataText);
            const map = new Map<string, IProfile>();
            data.profiles.forEach((profile: IProfile) => map.set(profile.id, profile));
            this.profiles.set(map);
            const selectedProfile = data.profiles.find(
                (profile: IProfile) => profile.id == data.selected
            );
            if (selectedProfile) this.loadProfile(selectedProfile);
        } catch (e) {
            console.error(e);
        }
    }
}

function createPanel(data: ITextPanelSerialization): PanelState | null {
    if (data.type == "value") {
        const panel = new ValuePanelState([]);
        panel.deserialize(data);
        return panel;
    }
    return null;
}

type IProfile = {
    id: string;
    name: string;
    layout: IPanelData;
    panels: IBasePanelSerialization[];
};
