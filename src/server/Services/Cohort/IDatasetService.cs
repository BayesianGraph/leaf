﻿// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading;
using System.Threading.Tasks;
using Model.Cohort;
using Model.Compiler;

namespace Services.Cohort
{
    public interface IDatasetService
    {
        Task<Dataset> GetDatasetAsync(DatasetCompilerContext context, CancellationToken token);
    }
}
