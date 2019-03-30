/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FormGroup, Label, FormText, DropdownToggle } from 'reactstrap';
import { PropertyProps } from '../Props';
import { ConceptSqlSet, Concept } from '../../../../models/admin/Concept';
import { Concept as UiConcept } from '../../../../models/concept/Concept';
import { FaChevronDown } from 'react-icons/fa';
import { Dropdown as BSDropdown, DropdownMenu, DropdownItem } from 'reactstrap'
import { setAdminPanelConceptEditorPane, saveAdminConcept, revertAdminConceptToOriginal } from '../../../../actions/admin/concept';
import { AdminPanelConceptEditorPane } from '../../../../models/state/AdminState';
import { ConfirmationModalState } from '../../../../models/state/GeneralUiState';
import { showConfirmationModal } from '../../../../actions/generalUi';
import { setConcept } from '../../../../actions/concepts';

interface Props extends PropertyProps {
    changed: boolean;
    dispatch: any;
    handleSave: () => any;
    handleUndoChanges: () => any;
    sqlSets: Map<number,ConceptSqlSet>;
    toggleSqlPreview: (show: boolean) => any;
    toggleOverlay: (show: boolean) => any;
}

interface State {
    isOpen: boolean;
    ref: any;
}

let divFocused = false;

export class SqlSetDropdown extends React.PureComponent<Props,State> {
    private className = 'concept-editor';
    constructor(props: Props) {
        super(props);
        this.state = {
            isOpen: false,
            ref: React.createRef()
        }
    }

    public render() {
        const { label, value, subLabel, sqlSets } = this.props;
        const { isOpen } = this.state;
        const selected = sqlSets.get((value));
        const c = this.className;
        const sets: ConceptSqlSet[] = [];
        sqlSets.forEach((s) => sets.push(s));

        return (
            <FormGroup>
                <Label>
                    {label}
                    {subLabel &&
                    <FormText color="muted">{subLabel}</FormText>
                    }
                </Label>
                <div className={`${c}-dropdown`} ref={this.state.ref} onBlur={this.handleBlur} tabIndex={0}>
                    <BSDropdown isOpen={isOpen} toggle={this.toggle} className={c} onFocus={this.handleFocus}>
                        <DropdownToggle>
                            {selected &&
                                <div>{selected.sqlSetFrom} <FaChevronDown className={`${c}-dropdown-chevron`}/></div>
                            }
                        </DropdownToggle>
                        <DropdownMenu>
                            {sets.map((s) => {
                                return (
                                    <DropdownItem 
                                        key={s.id}
                                        onClick={this.handleChange.bind(null, s.id)}>
                                        <div className={`${c}-sqlset`}>
                                            <span className={`${c}-sqlset-set`}>{s.sqlSetFrom}</span>
                                            {s.sqlFieldDate &&
                                            <span className={`${c}-sqlset-date`}>{s.sqlFieldDate}</span>
                                            }
                                        </div>
                                    </DropdownItem>
                                );
                            })}
                            <DropdownItem divider={true} />
                            <DropdownItem onClick={this.handleManageSqlSetsClick}>Manage SQL Sets</DropdownItem>
                        </DropdownMenu>
                    </BSDropdown>
                </div>
            </FormGroup>
        );
    }

    private handleManageSqlSetsClick = () => {
        const { dispatch, changed, handleSave, handleUndoChanges } = this.props;

        if (changed) {
            const confirm: ConfirmationModalState = {
                body: `Do you want to save your current changes to this Concept?"`,
                header: 'Save Changes',
                onClickNo: () => { handleUndoChanges(); dispatch(setAdminPanelConceptEditorPane(AdminPanelConceptEditorPane.SQL_SET)); },
                onClickYes: () => { handleSave(); dispatch(setAdminPanelConceptEditorPane(AdminPanelConceptEditorPane.SQL_SET)); },
                show: true,
                noButtonText: `No`,
                yesButtonText: `Yes, I'll Save Changes`
            };
            dispatch(showConfirmationModal(confirm));
        } else {
            dispatch(setAdminPanelConceptEditorPane(AdminPanelConceptEditorPane.SQL_SET));
        }
    }

    private toggle = () => {
        this.setState({ isOpen: !this.state.isOpen });
    }

    private handleBlur = (e: any) => {
        const { focusToggle } = this.props;
        if (focusToggle) { 
            if (e.currentTarget.className === "concept-editor-dropdown" && divFocused) {
                divFocused = false;
                focusToggle(false); 
            }
        }
    }

    private handleFocus = (e: any) => {
        const { focusToggle } = this.props;
        if (focusToggle) { 
            divFocused = true;
            focusToggle(true); 
        }
    }

    private handleChange = (setId: number) => {
        const { changeHandler, propName, locked } = this.props;
        if (locked) { return; }
        changeHandler(setId, propName);

        // Focus on div to maintain SQL window
        const node = this.state.ref;
        if (node && node.current && node.current.focus) {
            setTimeout(() => {
                divFocused = true;
                node.current.focus();
            }, 50);
        }
    }
};
