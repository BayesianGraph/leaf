﻿// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Authorization;
using Model.Compiler;
using Model.Options;
using Model.Search;
using Services.Extensions;
using Services.Tables;

// NOTE(cspital) this service does too much, blow it up and reduce it to the 4 hydrator types as call sites.
// adding the context should happen at the inevitable model layer for this use case.

namespace Services.Search
{
    public class DatasetQueryService : IDatasetQueryService
    {
        readonly IUserContext user;
        readonly ILogger<DatasetQueryService> log;
        readonly AppDbOptions opts;

        public DatasetQueryService(
            IUserContext userContext,
            IOptions<AppDbOptions> dbOptions,
            ILogger<DatasetQueryService> logger)
        {
            user = userContext;
            log = logger;
            opts = dbOptions.Value;
        }

        public async Task<IEnumerable<DatasetQuery>> GetAsync()
        {
            log.LogInformation("Getting dataset queries.");
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    CRUDQuery.getDatasetQueries,
                    new { user = user.UUID, groups = GroupMembership.From(user) },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                var records = grid.Read<DatasetQueryRecord>();
                var map = records.ToDictionary(d => d.Id.Value, d => d.DatasetQuery());
                var tags = grid.Read<DatasetQueryTag>();
                foreach (var tag in tags)
                {
                    if (map.TryGetValue(tag.Id.Value, out var datasetQuery))
                    {
                        datasetQuery.Tags.Add(tag.Tag);
                    }
                }
                return map.Values;
            }
        }

        static class CRUDQuery
        {
            public const string getDatasetQueries = "app.sp_GetDatasetQueries";
        }
    }
}
