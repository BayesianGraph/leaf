﻿// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Model.Compiler;
using Model.Validation;
using Microsoft.Extensions.Logging;

namespace Model.Search
{
    /// <summary>
    /// Encapsulates Leaf's concept tree searching and browsing use cases.
    /// </summary>
    /// <remarks>
    /// Required services throw exceptions that bubble up.
    /// </remarks>
    public class ConceptTreeSearcher
    {
        readonly IConceptTreeReader reader;
        readonly ILogger<ConceptTreeSearcher> log;

        public ConceptTreeSearcher(IConceptTreeReader reader, ILogger<ConceptTreeSearcher> logger)
        {
            this.reader = reader;
            log = logger;
        }

        /// <summary>
        /// Provides concept and complete ancestry for concepts matching the search term.
        /// </summary>
        /// <returns>Matching concepts and ancestry.</returns>
        /// <param name="root">Optional root id to search within.</param>
        /// <param name="term">Search term to match on.</param>
        /// <exception cref="ArgumentNullException"/>
        public async Task<IEnumerable<Concept>> GetAncestryBySearchTermAsync(Guid? root, string term)
        {
            Ensure.NotNull(term, nameof(term));

            log.LogInformation("Getting concept with ancestry by search. Term:{Term}", term);
            var terms = term.Split(' ');
            return await reader.GetWithParentsBySearchTermAsync(root, terms);
        }

        /// <summary>
        /// Provides concept and complete ancestry for concepts identified in the set.
        /// </summary>
        /// <returns>Identified concepts and ancestry.</returns>
        /// <param name="ids">Concept Ids.</param>
        /// <exception cref="ArgumentNullException"/>
        public async Task<IEnumerable<Concept>> GetAncestryAsync(HashSet<Guid> ids)
        {
            Ensure.NotNull(ids, nameof(ids));

            log.LogInformation("Getting parent concepts for Ids:{Ids}", ids);
            return await reader.GetWithParentsAsync(ids);
        }

        /// <summary>
        /// Provides the children of the specified parent concept.
        /// </summary>
        /// <returns>Child concepts.</returns>
        /// <param name="parent">Parent concept id.</param>
        /// <exception cref="LeafDbException"/>
        public async Task<IEnumerable<Concept>> GetChildrenAsync(Guid parent)
        {
            log.LogInformation("Getting child concepts. Parent:{Parent}", parent);

            return await reader.GetChildrenAsync(parent);
        }

        /// <summary>
        /// Provides a concept tree, containing the root concepts and panel filters.
        /// </summary>
        /// <returns>The root concept tree.</returns>
        public async Task<ConceptTree> GetTreetopAsync() => await reader.GetTreetopAsync();

        /// <summary>
        /// Provides a concept by id.
        /// </summary>
        /// <returns>The concept if found, else null.</returns>
        /// <param name="id">Concept id.</param>
        /// <exception cref="LeafDbException"/>
        public async Task<Concept> GetAsync(Guid id)
        {
            log.LogInformation("Getting Concept. Id:{Id}", id);

            return await reader.GetAsync(id);
        }

        /// <summary>
        /// Provides concepts by id. Restricted concepts are filtered out.
        /// </summary>
        /// <returns>The allowed concepts.</returns>
        /// <param name="ids">Concept ids.</param>
        public async Task<IEnumerable<Concept>> GetAsync(HashSet<Guid> ids)
        {
            log.LogInformation("Getting Concepts. Ids:{Ids}", ids);

            return await reader.GetAsync(ids);
        }

        /// <summary>
        /// Provides concepts by universal id. Restricted concepts are filtered out.
        /// </summary>
        /// <returns>The allowed concepts.</returns>
        /// <param name="uids">Concept universal ids.</param>
        public async Task<IEnumerable<Concept>> GetAsync(HashSet<string> uids)
        {
            log.LogInformation("Getting Universal Concepts. UIds:{UIds}", uids);

            return await reader.GetAsync(uids);
        }
    }
}