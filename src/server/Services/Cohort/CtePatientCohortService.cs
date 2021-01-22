// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System.Linq;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Cohort;
using Model.Compiler;
using Model.Options;
using Newtonsoft.Json;

namespace Services.Cohort
{
    public class CtePatientCohortService : PatientCohortService
    {
        public CtePatientCohortService(
            ISqlCompiler compiler,
            IOptions<ClinDbOptions> clinOpts,
            ILogger<PatientCohortService> logger) : base(compiler, clinOpts, logger)
        {
        }

        protected override async Task<PatientCohort> GetCohortAsync(PatientCountQuery query, CancellationToken token)
        {

            //If the Cohort Service is set for CohortOptions = CTE | CTEOR then it will be in this class, if its not CTE then its CTEOR and will execute the override. 
            return new PatientCohort
            {
                QueryId = query.QueryId,
                PatientIds = await GetPatientSetAsync(query, token),
                SqlStatements = new string[] { GetCteQuery(query.Panels).SqlStatement },
                Panels = query.Panels.Where(p => p.Domain == PanelDomain.Panel)
            };
        }

        //get rid of the second method and build the query based on if its CTE or CTEOR
        async Task<HashSet<string>> GetPatientSetAsync(PatientCountQuery query, CancellationToken token)
        {
            var cteQuery = GetCteQuery(query.Panels);
            string leafquery = JsonConvert.SerializeObject(query);
            string panels = JsonConvert.SerializeObject(query.Panels);
            string sqlstatement = "";

            var patientIds = new HashSet<string>();
            using (var cn = new SqlConnection(clinDbOptions.ConnectionString))
            {
                await cn.OpenAsync();

                if (clinDbOptions.Cohort.QueryStrategy == ClinDbOptions.ClinDbCohortOptions.QueryStrategyOptions.CTE)
                    sqlstatement = cteQuery.SqlStatement;
                else
                    sqlstatement = clinDbOptions.Cohort.OverrideProcedure;

                using (var cmd = new SqlCommand(sqlstatement, cn))
                {
                    if (clinDbOptions.Cohort.QueryStrategy == ClinDbOptions.ClinDbCohortOptions.QueryStrategyOptions.CTEOR)
                    {//make this dynamic comma list from the appsettings.json under the OverrideProcedure node
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;
                        cmd.Parameters.Add(new SqlParameter("@leafquery", leafquery));
                        cmd.Parameters.Add(new SqlParameter("@panels", panels));
                        cmd.Parameters.Add(new SqlParameter("@sql", cteQuery.SqlStatement));
                    }
                    cmd.CommandTimeout = clinDbOptions.DefaultTimeout;
                    try
                    {
                        using (var reader = await cmd.ExecuteReaderAsync(token))
                        {
                            while (reader.Read())
                            {
                                patientIds.Add(reader[0].ToString());
                            }
                        }
                    }
                    catch (System.Exception ex)
                    {
                        log.LogError(ex.Message);
                    }
                }






            }
            return patientIds;
        }




        ISqlStatement GetCteQuery(IEnumerable<Panel> panels)
        {
            var query = compiler.BuildCteSql(panels);
            log.LogInformation("CTE SqlStatement:{Sql}", query.SqlStatement);
            return query;
        }
    }
}
