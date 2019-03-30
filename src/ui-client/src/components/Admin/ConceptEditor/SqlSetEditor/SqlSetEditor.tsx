/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { ConceptSqlSet, SpecializationGroup, Specialization } from '../../../../models/admin/Concept';
import { Button, Container, Row, Col } from 'reactstrap';
import { setAdminPanelConceptEditorPane, setAdminConceptExampleSql } from '../../../../actions/admin/concept';
import { AdminPanelConceptEditorPane } from '../../../../models/state/AdminState';
import { setAdminConceptSqlSet, setAdminUneditedConceptSqlSets, undoAdminSqlSetChanges, processApiUpdateQueue } from '../../../../actions/admin/sqlSet';
import { EditorPaneProps as Props } from '../Props';
import { generateSampleSql } from '../../../../utils/admin';
import { SqlSetRow } from './SqlSetRow';
import './SqlSetEditor.css';

export class SqlSetEditor extends React.PureComponent<Props> {
    private className = 'sqlset-editor';
    constructor(props: Props) {
        super(props);
    }

    public componentDidMount() {
        const { dispatch, data } = this.props;
        dispatch(setAdminUneditedConceptSqlSets(data.sqlSets.sets));
    }

    public render() {
        const { data, dispatch } = this.props;
        const c = this.className;
        const sets: ConceptSqlSet[] = [];
        data.sqlSets.sets.forEach((s) => sets.push(s));

        return (
            <div className={`${c}-container`}>
                <div className={`${c}-toprow`}>
                    <Button className='leaf-button leaf-button-primary' id={`${c}-add-sqlset`} onClick={this.handleAddSqlSetClick}>Create New SQL Set</Button>
                    <Button className='leaf-button leaf-button-secondary mr-auto' disabled={!data.sqlSets.changed} onClick={this.handleUndoChangesClick}>Undo Changes</Button>
                    <Button className='leaf-button leaf-button-primary' disabled={!data.sqlSets.changed} onClick={this.handleSaveChangesClick}>Save</Button>
                    <Button className='leaf-button leaf-button-primary back-to-editor' onClick={this.handleBackToConceptEditorClick}>Back to Concept Editor</Button>
                </div>
                <Container className={`${c}-table`}>
                    <Row className={`${c}-table-header`}>
                        <Col md={2}>Is Longitudinal</Col>
                        <Col md={5}>SQL FROM</Col>
                        <Col md={5}>SQL Date Field</Col>
                    </Row>
                    {sets.map((s) => <SqlSetRow changeHandler={this.handleSqlSetChange(s)} set={s} dispatch={dispatch} key={s.id} state={data} />)}
                </Container>
            </div>
        );
    }

    private handleSqlSetChange = (set: ConceptSqlSet) => {
        return (val: any, propName: string) => {
            const { data, dispatch } = this.props;
            const { concepts, sqlSets, configuration } = data;
            const newSet = Object.assign({}, sqlSets.sets.get(set.id), { [propName]: val });
            const sql = generateSampleSql(concepts.currentConcept!, newSet, configuration.sql);
    
            dispatch(setAdminConceptSqlSet(newSet, true));
            dispatch(setAdminConceptExampleSql(sql));
        }
    }

    private generateRandomIntegerId = () => {
        const min = 1;
        const max = 100000;
        return Math.ceil(Math.random() * (max - min) + min);
    }

    /*
     * Create a new Concept SQL Set, updating 
     * the store and preparing a later API save event.
     */
    private handleAddSqlSetClick = () => {
        const { dispatch } = this.props;
        let apiSaveEvent = null;
        const newSet: ConceptSqlSet = {
            id: this.generateRandomIntegerId(),
            isEncounterBased: false,
            isEventBased: false,
            sqlFieldDate: '',
            sqlSetFrom: '',
            specializationGroups: new Map(),
            unsaved: true
        }
        dispatch(setAdminConceptSqlSet(newSet, true));
    }

    private handleUndoChangesClick = () => {
        const { dispatch } = this.props;
        dispatch(undoAdminSqlSetChanges());
    }

    private handleSaveChangesClick = () => {
        const { dispatch } = this.props;
        dispatch(processApiUpdateQueue());
    }

    private handleBackToConceptEditorClick = () => {
        const { dispatch } = this.props;
        dispatch(setAdminPanelConceptEditorPane(AdminPanelConceptEditorPane.MAIN))
    }
};
