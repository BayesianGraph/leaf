/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Concept, ResourceRef, ConceptSpecialization, ExtensionConcept } from '../concept/Concept';
import { NumericFilter, NumericFilterType, NumericFilterDTO } from './NumericFilter';
import { RecencyFilterType } from './RecencyFilter';
import { isEmbeddedQuery } from '../../utils/panelUtils';

export interface BasePanelItem {
    hidden?: boolean;
    index: number;
    numericFilter: NumericFilter;
    recencyFilter: RecencyFilterType;
    subPanelIndex: number;
    panelIndex: number;
    specializations: ConceptSpecialization[];
}

export interface PanelItemDTO {
    resource: ResourceRef;
    id: string;
    index: number;
    numericFilter: NumericFilter;
    recencyFilter: RecencyFilterType;
    specializations: ConceptSpecialization[];
}

export interface PanelItem extends BasePanelItem {
    concept: Concept;
    id: string;
}

export const panelItemToDto = (panelItem: PanelItem): PanelItemDTO => {
    return {
        resource: {
            id: isEmbeddedQuery(panelItem.concept.universalId) 
                ? (panelItem.concept as ExtensionConcept).extensionId
                : panelItem.concept.id,
            universalId: panelItem.concept.universalId!,
            uiDisplayName: panelItem.concept.uiDisplayName
        },
        id: panelItem.id,
        index: panelItem.index,
        numericFilter: panelItemNumericFilterToDto(panelItem.numericFilter),
        recencyFilter: panelItem.recencyFilter,
        specializations: panelItem.specializations
    }
};

const panelItemNumericFilterToDto = (numFilter: NumericFilter): NumericFilterDTO => {
    const [ val1, val2 ] = numFilter.filter;
    if (numFilter.filterType === NumericFilterType.None) { 
        return {
            filterType: numFilter.filterType,
            filter: []
        };
    }
    if (numFilter.filterType === NumericFilterType.Between) {
        return {
            filterType: numFilter.filterType,
            filter: [ 
                val1 === null ? 0 : val1, 
                val2 === null ? 0 : val2
            ]
        };
    }
    return {
        filterType: numFilter.filterType,
        filter: [ val1 === null ? 0 : val1 ]
    };
};
