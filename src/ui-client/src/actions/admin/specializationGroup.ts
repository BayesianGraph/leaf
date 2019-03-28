/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from "../../models/state/AppState";
import { SpecializationGroup } from "../../models/admin/Concept";
import { getSpecializationGroups, updateSpecializationGroup, deleteSpecializationGroup, createSpecializationGroup } from "../../services/admin/specializationGroupApi";
import { setNoClickModalState, showInfoModal } from "../generalUi";
import { NoClickModalStates, InformationModalState } from "../../models/state/GeneralUiState";

export const SET_ADMIN_SPECIALIZATION_GROUPS = 'SET_ADMIN_SPECIALIZATION_GROUPS';
export const REMOVE_ADMIN_SPECIALIZATION_GROUP = 'REMOVE_ADMIN_SPECIALIZATION_GROUP';

export interface AdminSpecializationGroupAction {
    group?: SpecializationGroup;
    groups?: SpecializationGroup[];
    type: string;
}

// Asynchronous
export const saveOrUpdateAdminConceptSpecializationGroup = (grp: SpecializationGroup) => {
    return async (dispatch: any, getState: () => AppState) => {
        if (grp.unsaved) {
            dispatch(saveNewAdminConceptSpecializationGroup(grp));
        } else {
            dispatch(updateAdminConceptSpecializationGroup(grp));
        }
    }
};

/*
 * Fetch Specialization Groups.
 */
export const getAdminConceptSpecializationGroups = () => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            dispatch(setNoClickModalState({ message: "Loading", state: NoClickModalStates.CallingServer }));
            const state = getState();
            const sets = await getSpecializationGroups(state);
            dispatch(setAdminConceptSpecializationGroups(sets));
            dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Complete }));
        } catch (err) {
            dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
            const info: InformationModalState = {
                body: "An error occurred while attempting to load Concept Specialization Groups. Please see the Leaf error logs for details.",
                header: "Error Loading Concept Specialization Groups",
                show: true
            };
            dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
            dispatch(showInfoModal(info));
        }
    };
};

/*
 * Save a new Concept Specialization Groups.
 */
export const saveNewAdminConceptSpecializationGroup = (group: SpecializationGroup) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            createSpecializationGroup(state, group)
                .then(
                    response => dispatch(setAdminConceptSpecializationGroup(group))
                ,   error => console.log(error)
                );
        } catch (err) {
            console.log(err);
        }
    }
};

/*
 * Save a new Concept Specialization Group.
 */
export const updateAdminConceptSpecializationGroup = (group: SpecializationGroup) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            updateSpecializationGroup(state, group)
                .then(
                    response => {
                        dispatch(setAdminConceptSpecializationGroup(group));
                },  error => {
                        dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
                        const info: InformationModalState = {
                            body: "An error occurred while attempting to update the Concept Specialization Groups. Please see the Leaf error logs for details.",
                            header: "Error Updating Concept Specialization Groups",
                            show: true
                        };
                        dispatch(showInfoModal(info));
                });
        } catch (err) {
            console.log(err);
        }
    }
};

/*
 * Delete a existing Concept Specialization Group.
 */
export const deleteAdminConceptSpecializationGroup = (group: SpecializationGroup) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Deleting", state: NoClickModalStates.CallingServer }));
            deleteSpecializationGroup(state, group)
                .then(
                    response => {
                        dispatch(setNoClickModalState({ message: "Deleted", state: NoClickModalStates.Complete }));
                        dispatch(removeAdminConceptSpecializationGroup(group));
                },  error => {
                        dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
                        const info: InformationModalState = {
                            body: "An error occurred while attempting to delete the Concept Specialization Group. Please see the Leaf error logs for details.",
                            header: "Error Deleting Concept Specialization Group",
                            show: true
                        };
                        dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
                        dispatch(showInfoModal(info));
                });
        } catch (err) {
            console.log(err);
        }
    }
};

// Synchronous
export const setAdminConceptSpecializationGroup = (group: SpecializationGroup): AdminSpecializationGroupAction => {
    return {
        groups: [ group ],
        type: SET_ADMIN_SPECIALIZATION_GROUPS
    };
};

export const setAdminConceptSpecializationGroups = (groups: SpecializationGroup[]): AdminSpecializationGroupAction => {
    return {
        groups,
        type: SET_ADMIN_SPECIALIZATION_GROUPS
    };
};

export const removeAdminConceptSpecializationGroup = (group: SpecializationGroup): AdminSpecializationGroupAction => {
    return {
        group,
        type: REMOVE_ADMIN_SPECIALIZATION_GROUP
    };
};