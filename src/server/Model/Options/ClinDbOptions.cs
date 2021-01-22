// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;

namespace Model.Options
{
    public class ClinDbOptions : IConnectionString
    {
        public const string CTE = "CTE";
        public const string CTEOR = "CTEOR";  //CTE Override flag to bypass the Leaf query and use a hosted stored procedure on the Clin DB 
        public const string Parallel = "PARALLEL";


        string connectionString;
        public string ConnectionString
        {
            get { return connectionString; }
            set
            {
                if (connectionString != null)
                {
                    throw new InvalidOperationException($"{nameof(ClinDbOptions)}.{nameof(ConnectionString)} is immutable");
                }
                connectionString = value;
            }
        }

        int defaultTimeout;
        public int DefaultTimeout
        {
            get { return defaultTimeout; }
            set
            {
                if (defaultTimeout != default)
                {
                    throw new InvalidOperationException($"{nameof(ClinDbOptions)}.{nameof(DefaultTimeout)} is immutable");
                }
                defaultTimeout = value;
            }
        }

        public ClinDbCohortOptions Cohort = new ClinDbCohortOptions();

        public class ClinDbCohortOptions
        {
            public QueryStrategyOptions QueryStrategy { get; set; }
            //ensure this array matches enum at bottom of this class
            public static readonly IEnumerable<string> ValidQueryStrategies = new string[] { CTE, Parallel, CTEOR };

            static bool ValidQueryStrategy(string value) => ValidQueryStrategies.Contains(value);

            public void WithQueryStrategy(string value)
            {
                var tmp = value.ToUpper();
                if (!ValidQueryStrategy(tmp))
                {
                    throw new LeafConfigurationException($"{value} is not a supported a cohort query strategy");
                }

                switch (tmp)
                {
                    case CTE:
                        QueryStrategy = QueryStrategyOptions.CTE;
                        break;
                    case Parallel:
                        QueryStrategy = QueryStrategyOptions.Parallel;
                        break;
                    case CTEOR:
                        QueryStrategy = QueryStrategyOptions.CTEOR;
                        break;
                }
            }

            int defaultMaxParallelThreads;
            public int MaxParallelThreads
            {
                get { return defaultMaxParallelThreads; }
                set
                {
                    if (defaultMaxParallelThreads != default)
                    {
                        throw new InvalidOperationException($"{nameof(ClinDbCohortOptions)}.{nameof(MaxParallelThreads)} is immutable");
                    }
                    defaultMaxParallelThreads = value;
                }
            }
            string overrideprocedure;
            public string OverrideProcedure
            {
                get { return overrideprocedure; }
                set { overrideprocedure = value; }
            }

            public enum QueryStrategyOptions : ushort
            {
                CTE = 1,
                Parallel = 2,
                CTEOR = 3
            }
        }
    }
}
