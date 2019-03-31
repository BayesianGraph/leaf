/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Section } from './Section';
import { Input } from './Input';
import { TextArea } from './TextArea';
import { SectionProps } from '../Props';

interface Props {
    data: SectionProps;
}

export class Display extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { changeHandler, concept, togglePanelPreview } = this.props.data;
        return (
            <Section header='General Display'>
                <TextArea 
                    changeHandler={changeHandler} propName={'uiDisplayName'} value={concept!.uiDisplayName}
                    label='Name' subLabel='Text shown in Concept Tree' required={true}
                />
                <Input 
                    changeHandler={changeHandler} propName={'uiDisplaySubtext'} value={concept!.uiDisplaySubtext}
                    label='Subtext' subLabel='Addition information shown next to name in lighter, smaller text'
                />
                <TextArea 
                    changeHandler={changeHandler} propName={'uiDisplayText'} value={concept!.uiDisplayText}
                    focusToggle={togglePanelPreview} required={true}
                    label='Full Text' subLabel='Descriptive text shown when dragged in query'
                />
                <TextArea 
                    changeHandler={changeHandler} propName={'uiDisplayTooltip'} value={concept!.uiDisplayTooltip}
                    label='Tooltip' subLabel={`Displayed on the bottom when user clicks 'Learn More'`}
                />
                <Input 
                    changeHandler={changeHandler} propName={'uiDisplayPatientCount'} value={concept!.uiDisplayPatientCount}
                    label='Patient Count' type='number' subLabel='Total patient count displayed next to name'
                />
                <Input 
                    changeHandler={changeHandler} propName={'uiDisplayUnits'} value={concept!.uiDisplayUnits}
                    label='Units of measurement' subLabel='Shown after number if filtered numerically'
                />
                <TextArea 
                    changeHandler={changeHandler} propName={'uiNumericDefaultText'} value={concept!.uiNumericDefaultText}
                    focusToggle={togglePanelPreview}
                    label='Numeric default text' subLabel='Text shown if no numeric filter selected'
                />
            </Section>
        );
    }
};
