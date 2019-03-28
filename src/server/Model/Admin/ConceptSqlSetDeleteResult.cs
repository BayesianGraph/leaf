﻿// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;

namespace Model.Admin
{
    public class ConceptSqlSetDeleteResult
    {
        public bool Ok
        {
            get
            {
                return (!ConceptDependents?.Any() ?? true) && (!SpecializationGroupDependents?.Any() ?? true);
            }
        }
        public IEnumerable<ConceptDependent> ConceptDependents { get; set; }
        public IEnumerable<SpecializationGroupDependent> SpecializationGroupDependents { get; set; }
    }

    public class ConceptDependent
    {
        public Guid Id { get; set; }
        public string UniversalId { get; set; }
        public string UiDisplayName { get; set; }
    }
}
