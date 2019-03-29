﻿// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Data.SqlClient;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Options;
using Model.Network;

// NOTE(cspital) this does not support clustered deployments yet....Redis impl incoming soon

namespace Services.Network
{
    public class BackgroundCertificateSynchronizer : BackgroundService
    {
        readonly INetworkEndpointRefresher refresher;
        readonly NetworkEndpointCache cache;
        readonly INetworkEndpointService endpointService;
        readonly NetworkEndpointConcurrentQueueSet queue;
        readonly ILogger<BackgroundCertificateSynchronizer> log;

        public BackgroundCertificateSynchronizer(
            INetworkEndpointRefresher refresher,
            NetworkEndpointCache cache,
            INetworkEndpointService endpointService,
            NetworkEndpointConcurrentQueueSet queue,
            ILogger<BackgroundCertificateSynchronizer> logger)
        {
            this.refresher = refresher;
            this.cache = cache;
            this.endpointService = endpointService;
            this.queue = queue;
            log = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            log.LogInformation("BackgroundCertificateSynchronizer is starting");
            stoppingToken.Register(() =>
            {
                log.LogInformation("BackgroundCertificateSynchronizer is stopping");
            });

            while (!stoppingToken.IsCancellationRequested)
            {
                if (!queue.IsEmpty)
                {
                    var stales = queue.Drain();
                    log.LogInformation("Refreshing interrogators. Count:{Count}", stales.Count());

                    await RefreshStaleEndpoints(stales);
                }

                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }

            log.LogInformation("BackgroundCertificateSynchronizer is stopped.");
        }

        async Task<IEnumerable<NetworkEndpoint>> RefreshStaleEndpoints(IEnumerable<NetworkEndpoint> stale)
        {
            var refreshing = stale.Select(async (NetworkEndpoint oldState) =>
            {
                var newState = oldState;
                try
                {
                    newState = await refresher.Refresh(oldState);
                    log.LogInformation("Refreshed NetworkEndpoint. Endpoint:{@Endpoint}", newState);

                    cache.Put(newState);
                    await endpointService.UpdateAsync(newState);
                    log.LogInformation("Updated NetworkEndpoint. Old:{@{Old} New:{@New}", oldState, newState);
                }
                catch (HttpRequestException hre)
                {
                    log.LogError("Could not refresh NetworkEndpoint. Endpoint:{@Endpoint} Error:{Error}", oldState, hre.Message);
                }
                catch (SqlException se)
                {
                    log.LogError("Could not update NetworkEndpoint. Old:{@Old} New:{@New} Error:{Error}", oldState, newState, se.Message);
                }
                return newState;
            });

            return await Task.WhenAll(refreshing);
        }
    }
}
