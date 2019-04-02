/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Row, Col, Button } from 'reactstrap';
import AdminState, { AdminPanelLoadState } from '../../../../models/state/AdminState';
import LoaderIcon from '../../../Other/LoaderIcon/LoaderIcon';
import { Display } from '../Sections/Display';
import { Identifiers } from '../Sections/Identifiers';
import { Configuration } from '../Sections/Configuration';
import { Concept as AdminConcept } from '../../../../models/admin/Concept';
import { setAdminConcept, deleteAdminConceptFromServer, revertAdminAndUserConceptChanges, setAdminPanelCurrentUserConcept, removeUnsavedAdminConcept, saveAdminConcept } from '../../../../actions/admin/concept';
import { setConcept, createConcept, setSelectedConcept, removeConcept } from '../../../../actions/concepts';
import { SqlEditor } from '../Sections/SqlEditor';
import { EditorPaneProps as Props, SectionProps } from '../Props';
import { ConfirmationModalState } from '../../../../models/state/GeneralUiState';
import { showConfirmationModal } from '../../../../actions/generalUi';
import { Constraints } from '../Sections/Contraints';
import { SpecializationDropdowns } from '../Sections/SpecializationDropdowns';
import { Concept as UserConcept } from '../../../../models/concept/Concept';
import { generate as generateId } from 'shortid';
import { updateUserConceptFromAdminChange } from '../../../../utils/admin';

const showConceptStatus = new Set([ AdminPanelLoadState.LOADING, AdminPanelLoadState.LOADED ]);

export class MainEditor extends React.PureComponent<Props> {
    private className = 'concept-editor';
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { data, dispatch, togglePanelPreview, toggleSqlPreview, toggleOverlay } = this.props;
        const { configuration } = data;
        const { changed, currentAdminConcept, currentUserConcept, state } = data.concepts;
        const { sets } = data.sqlSets
        const c = this.className;
        const sectionProps: SectionProps = {
            adminConcept: currentAdminConcept,
            userConcept: currentUserConcept,
            changed,
            changeHandler: this.handleInputChange,
            dispatch,
            sqlSets: sets,
            sqlConfig: configuration.sql,
            toggleOverlay: toggleOverlay,
            togglePanelPreview: togglePanelPreview,
            toggleSqlPreview: toggleSqlPreview
        };

        return (
            <div className={`${c}-main`}>
                <div className={`${c}-column-right-header`}>
                    <Button className='leaf-button leaf-button-addnew' disabled={changed} onClick={this.handleAddConceptClick}>+ Create New Concept</Button>
                    <Button className='leaf-button leaf-button-secondary' disabled={!changed} onClick={this.handleUndoChanges}>Undo Changes</Button>
                    <Button className='leaf-button leaf-button-primary' disabled={!changed} onClick={this.handleSaveChanges}>Save</Button>
                    <Button className='leaf-button leaf-button-warning' disabled={!currentAdminConcept} onClick={this.handleDeleteConceptClick}>Delete Concept</Button>
                </div>
                {!currentAdminConcept &&
                    <div className={`${c}-na`}>
                    <p>Click on a Concept to the left to edit.</p>
                </div>
                }
                {currentAdminConcept && 
                <div>
                    {this.getStatusDependentContent(state, c)}
                    {showConceptStatus.has(state) &&
                    <Row>
                        <Col md={6} className={`${c}-inner-column-left`}>
                            <Display data={sectionProps}/>
                            <Configuration data={sectionProps}/>
                            <SpecializationDropdowns data={sectionProps} set={sets.get(currentAdminConcept.sqlSetId!)}/>
                        </Col>
                        <Col md={6} className={`${c}-inner-column-right`}>
                            <SqlEditor data={sectionProps} />
                            <Identifiers data={sectionProps} />
                            <Constraints data={sectionProps}/>
                        </Col>
                    </Row>
                    }
                </div>
                }
            </div>
        );
    }

    private getStatusDependentContent = (state: AdminPanelLoadState, c: string) => {
        if (state === AdminPanelLoadState.LOADING) {
            return (
                <div>
                    <div className={`${c}-loading`}>
                        <LoaderIcon size={100} />
                    </div>
                    <div className={`${c}-loading-overlay`}/>
                </div>
            );
        } else if (state === AdminPanelLoadState.NOT_APPLICABLE) {
            return (
                <div className={`${c}-na`}>
                    <p>Saved queries cannot be edited. Please select a normal Leaf concept.</p>
                </div>
            );
        } else if (state === AdminPanelLoadState.ERROR) {
            return (
                <div className={`${c}-error`}>
                    <p>Leaf encountered an error while trying to fetch this concept.</p>
                </div>
            );
        }
        return null;
    }

    private handleInputChange = (val: any, propName: string) => {
        const { sets } = this.props.data.sqlSets;
        const { currentAdminConcept, currentUserConcept } = this.props.data.concepts;
        const { dispatch } = this.props;
        const newVal = val === '' ? null : val;

        const newConcept = Object.assign({}, currentAdminConcept, { [propName]: newVal }) as AdminConcept;
        const newUserConcept = updateUserConceptFromAdminChange(currentUserConcept!, propName, newVal, sets.get(newConcept!.sqlSetId!));

        dispatch(setAdminConcept(newConcept, true));
        dispatch(setAdminPanelCurrentUserConcept(newUserConcept));
        dispatch(setConcept(newUserConcept));
    }

    private handleUndoChanges = () => {
        const { currentAdminConcept, currentUserConcept } = this.props.data.concepts;
        const { dispatch } = this.props;

        if (currentAdminConcept!.unsaved) {
            this.removeUnsavedAdminConcept();
        } else {
            dispatch(revertAdminAndUserConceptChanges(currentAdminConcept!, currentUserConcept!));
        }
    }

    private removeUnsavedAdminConcept = () => {
        const { currentUserConcept } = this.props.data.concepts;
        const { dispatch } = this.props;
        dispatch(removeConcept(currentUserConcept!));
        dispatch(removeUnsavedAdminConcept());
    }

    private handleSaveChanges = () => {
        const { currentAdminConcept, currentUserConcept } = this.props.data.concepts;
        const { dispatch } = this.props;
        dispatch(saveAdminConcept(currentAdminConcept!, currentUserConcept!));
    }

    // TODO: move this to a util or clean up.
    private handleAddConceptClick = () => {
        const { dispatch } = this.props;
        const { sets } = this.props.data.sqlSets;
        const defaultSet = sets.size ? sets.get(sets.keys[0]) : undefined;
        const id = generateId();

        const baseProps = {
            id,
            rootId: id,
            isNumeric: false,
            isParent: false,
            isRoot: true,
            isPatientCountAutoCalculated: true,
            isSpecializable: false,
            uiDisplayName: 'New Concept',
            uiDisplayText: '',
            uiDisplaySubtext: '',
            uiDisplayTooltip: '',
            universalId: '',
            unsaved: true
        };
        const newAdminConcept: AdminConcept = {
            ...baseProps,
            constraints: [],
            specializationGroups: []
        };
        const newUserConcept: UserConcept = {
            ...baseProps,
            childrenLoaded: false,
            isEncounterBased: false,
            isEventBased: false,
            isFetching: false,
            isOpen: false
        };

        if (defaultSet) {
            newAdminConcept.sqlSetId = defaultSet.id;
            newUserConcept.isEncounterBased = defaultSet.isEncounterBased;
            newUserConcept.isEventBased = defaultSet.isEventBased;
        }

        dispatch(createConcept(newUserConcept));
        dispatch(setSelectedConcept(newUserConcept));
        dispatch(setAdminPanelCurrentUserConcept(newUserConcept));
        dispatch(setAdminConcept(newAdminConcept, true));
    }

    private handleDeleteConceptClick = () => {
        const { currentAdminConcept, currentUserConcept } = this.props.data.concepts;
        const { dispatch } = this.props;

        if (currentAdminConcept!.unsaved) {
            this.removeUnsavedAdminConcept();
        } else {
            const confirm: ConfirmationModalState = {
                body: `Are you sure you want to delete the Concept, "${currentAdminConcept!.uiDisplayName}"? This can't be undone.`,
                header: 'Delete Concept',
                onClickNo: () => null,
                onClickYes: () => { dispatch(deleteAdminConceptFromServer(currentAdminConcept!, currentUserConcept!)) },
                show: true,
                noButtonText: `No`,
                yesButtonText: `Yes, Delete Concept`
            };
            dispatch(showConfirmationModal(confirm));
        }
    }
}