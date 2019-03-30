/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from "../../models/state/AppState";
import { Specialization } from "../../models/admin/Concept";
import { createSpecialization, updateSpecialization, deleteSpecialization } from "../../services/admin/specializationApi";
import { setNoClickModalState, showInfoModal } from "../generalUi";
import { NoClickModalStates, InformationModalState } from "../../models/state/GeneralUiState";
import { AdminPanelQueuedApiProcess } from "../../models/state/AdminState";

export const SET_ADMIN_SPECIALIZATIONS = 'SET_ADMIN_SPECIALIZATIONS';
export const REMOVE_ADMIN_SPECIALIZATION = 'REMOVE_ADMIN_SPECIALIZATION';

export interface AdminSpecializationAction {
    changed?: boolean;
    spc?: Specialization;
    spcs?: Specialization[];
    type: string;
}

// Asynchronous
/*
 * Save or update a Concept Specialization, depending on
 * if it is preexisting or new.
 */
export const saveOrUpdateAdminSpecialization = (spc: Specialization): AdminPanelQueuedApiProcess => {
    return async (dispatch: any, getState: () => AppState) => {
        if (spc.unsaved) {
            const newSpc = await createSpecialization(getState(), spc);
            dispatch(removeAdminConceptSpecialization(spc));
            dispatch(setAdminConceptSpecialization(newSpc, false));
        } else {
            const newSpc = await updateSpecialization(getState(), spc);
            dispatch(setAdminConceptSpecialization(newSpc, false));
        }
    }
};

/*
 * Delete a existing Concept Specialization.
 */
export const deleteAdminConceptSpecialization = (spc: Specialization) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Deleting", state: NoClickModalStates.CallingServer }));
            deleteSpecialization(state, spc)
                .then(
                    response => {
                        dispatch(setNoClickModalState({ message: "Deleted", state: NoClickModalStates.Complete }));
                        dispatch(removeAdminConceptSpecialization(spc));
                },  error => {
                        dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
                        const info: InformationModalState = {
                            body: "An error occurred while attempting to delete the Concept Specialization. Please see the Leaf error logs for details.",
                            header: "Error Deleting Concept Specialization",
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
export const setAdminConceptSpecialization = (spc: Specialization, changed: boolean): AdminSpecializationAction => {
    return {
        spcs: [ spc ],
        changed,
        type: SET_ADMIN_SPECIALIZATIONS
    };
};

export const setAdminConceptSpecializations = (spcs: Specialization[]): AdminSpecializationAction => {
    return {
        spcs,
        type: SET_ADMIN_SPECIALIZATIONS
    };
};

export const removeAdminConceptSpecialization = (spc: Specialization): AdminSpecializationAction => {
    return {
        spc,
        type: REMOVE_ADMIN_SPECIALIZATION
    };
};