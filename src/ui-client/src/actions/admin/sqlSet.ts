/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from "../../models/state/AppState";
import { ConceptSqlSet } from "../../models/admin/Concept";
import { getSqlSets, createSqlSet, deleteSqlSet, updateSqlSet } from "../../services/admin/sqlSetApi";
import { setNoClickModalState, showInfoModal } from "../generalUi";
import { NoClickModalStates, InformationModalState } from "../../models/state/GeneralUiState";
import { AdminPanelQueuedApiEvent, AdminPanelQueuedApiProcess } from "../../models/state/AdminState";

export const SET_ADMIN_SQL_SETS = 'SET_ADMIN_SQL_SETS';
export const SET_ADMIN_UNEDITED_SQL_SETS = 'SET_ADMIN_UNEDITED_SQL_SETS';
export const SET_ADMIN_SQL_SETS_UNCHANGED = 'SET_ADMIN_SQL_SETS_UNCHANGED';
export const UPSERT_ADMIN_QUEUED_API_EVENT = 'UPSERT_ADMIN_QUEUED_API_EVENT';
export const REMOVE_ADMIN_QUEUED_API_EVENT = 'REMOVE_ADMIN_QUEUED_API_EVENT';
export const REMOVE_ADMIN_SQL_SET = 'REMOVE_ADMIN_SQL_SET';
export const ADD_ADMIN_SQL_SET_QUEUE_EVENT = 'ADD_ADMIN_SQL_SET_QUEUE_EVENT';
export const REMOVE_ADMIN_SQL_SET_QUEUE_EVENT = 'REMOVE_ADMIN_SQL_SET_QUEUE_EVENT';
export const UNDO_ADMIN_SQL_SET_CHANGES = 'UNDO_ADMIN_SQL_SET_CHANGES';

export interface AdminSqlSetAction {
    changed?: boolean;
    id?: string | number;
    set?: ConceptSqlSet;
    sets?: ConceptSqlSet[];
    mappedSets?: Map<number,ConceptSqlSet>
    queuedApiEvent?: AdminPanelQueuedApiEvent;
    type: string;
}

// Asynchronous
/*
 * Process all queued Concept SQL Set/Specialization/Specialization Group
 * API operations sequentially.
 */
export const processApiUpdateQueue = () => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            dispatch(setNoClickModalState({ message: "Saving", state: NoClickModalStates.CallingServer }));
            const state = getState();
            const queue = state.admin!.sqlSets.updateQueue;
            for (const ev of queue) {
                const f = ev.event();
                if (f) {
                    await f(dispatch, getState);
                }
                dispatch(removeAdminApiQueuedEvent(ev.id));
            }
            dispatch(setAdminConceptSqlSetsUnchanged());
            dispatch(setNoClickModalState({ message: "Saved", state: NoClickModalStates.Complete }));
        } catch (err) {
            console.log(err);
            const info: InformationModalState = {
                body: "An error occurred while attempting update the Leaf database with your changes. Please see the Leaf error logs for details.",
                header: "Error Applying Changes",
                show: true
            };
            dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
            dispatch(showInfoModal(info));
        }
    };
};

/*
 * Save or update a Concept SQL Set, depending on
 * if it is preexisting or new.
 */
export const saveOrUpdateAdminConceptSqlSet = (set: ConceptSqlSet): AdminPanelQueuedApiProcess => {
    return async (dispatch: any, getState: () => AppState) => {
        if (set.unsaved) {
            const newSet = await createSqlSet(getState(), set);
            dispatch(removeAdminConceptSqlSet(set));
            dispatch(setAdminConceptSqlSet(newSet, false));
        } else {
            const newSet = await updateSqlSet(getState(), set);
            dispatch(setAdminConceptSqlSet(newSet, false));
        }
    };
};

/*
 * Fetch SQL Sets.
 */
export const getAdminConceptSqlSets = () => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            dispatch(setNoClickModalState({ message: "Loading", state: NoClickModalStates.CallingServer }));
            const state = getState();
            const sets = await getSqlSets(state);
            dispatch(setAdminConceptSqlSets(sets, false));
            dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Complete }));
        } catch (err) {
            const info: InformationModalState = {
                body: "An error occurred while attempting to load SQL Sets. Please see the Leaf error logs for details.",
                header: "Error Loading SQL Sets",
                show: true
            };
            dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
            dispatch(showInfoModal(info));
        }
    };
};

/*
 * Delete an existing SQL Set.
 */
export const deleteAdminSqlSet = (set: ConceptSqlSet) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Deleting", state: NoClickModalStates.CallingServer }));
            deleteSqlSet(state, set)
                .then(
                    response => {
                        dispatch(setNoClickModalState({ message: "Deleted", state: NoClickModalStates.Complete }));
                        dispatch(removeAdminConceptSqlSet(set));
                },  error => {
                        dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
                        const info: InformationModalState = {
                            body: "An error occurred while attempting to delete the SQL Set. Please see the Leaf error logs for details.",
                            header: "Error Deleting SQL Set",
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
export const setAdminConceptSqlSet = (set: ConceptSqlSet, changed: boolean): AdminSqlSetAction => {
    return {
        changed,
        sets: [ set ],
        type: SET_ADMIN_SQL_SETS
    };
};

export const setAdminConceptSqlSets = (sets: ConceptSqlSet[], changed: boolean): AdminSqlSetAction => {
    return {
        changed,
        sets,
        type: SET_ADMIN_SQL_SETS
    };
};

export const setAdminUneditedConceptSqlSets = (mappedSets: Map<number,ConceptSqlSet>): AdminSqlSetAction => {
    return {
        mappedSets,
        type: SET_ADMIN_UNEDITED_SQL_SETS
    };
};

export const removeAdminConceptSqlSet = (set: ConceptSqlSet): AdminSqlSetAction => {
    return {
        set,
        type: REMOVE_ADMIN_SQL_SET
    };
};

export const upsertAdminApiQueuedEvent = (queuedApiEvent: AdminPanelQueuedApiEvent): AdminSqlSetAction => {
    return {
        queuedApiEvent,
        type: UPSERT_ADMIN_QUEUED_API_EVENT
    };
};

export const removeAdminApiQueuedEvent = (id: string | number): AdminSqlSetAction => {
    return {
        id,
        type: REMOVE_ADMIN_QUEUED_API_EVENT
    };
};

export const undoAdminSqlSetChanges = (): AdminSqlSetAction => {
    return {
        type: UNDO_ADMIN_SQL_SET_CHANGES
    };
};

export const setAdminConceptSqlSetsUnchanged = (): AdminSqlSetAction => {
    return {
        type: SET_ADMIN_SQL_SETS_UNCHANGED
    };
};