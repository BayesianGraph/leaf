﻿// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using Dapper;
using Model.Compiler;

namespace Services.Compiler
{
    static class HydratedConceptReader
    {
        public static IEnumerable<Concept> Read(SqlMapper.GridReader grid)
        {
            var concepts = grid.Read<ConceptRecord>();
            var groups = grid.Read<ConceptSpecializationGroupContext>();
            var specializations = grid.Read<ConceptSpecializationRecord>();

            var groupJoin = groups.GroupJoin(specializations,
                csgc => csgc.Id,
                csr => csr.SpecializationGroupId,
                (csgc, csr) => new { grp = csgc.Into(csr), conceptId = csgc.ConceptId });

            var conceptJoin = concepts.GroupJoin(groupJoin,
                c => c.Id,
                g => g.conceptId,
                (cr, gs) => cr.ToConcept(gs.Select(g => g.grp)));

            return conceptJoin;
        }
    }
}
