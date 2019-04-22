﻿// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using API.DTO.Cohort;
using API.DTO.Compiler;
using Services;
using Model.Cohort;
using Model.Authorization;
using Model.Compiler;

namespace API.Controllers
{
    [Authorize(Policy = TokenType.Access)]
    [Route("api/cohort")]
    public class CohortController : Controller
    {
        readonly ILogger<CohortController> log;

        public CohortController(ILogger<CohortController> logger)
        {
            log = logger;
        }

        [HttpPost("count")]
        public async Task<ActionResult<CohortCountDTO>> Count(
            [FromBody] PatientCountQueryDTO patientCountQuery,
            [FromServices] CohortCounter counter,
            CancellationToken cancelToken
        )
        {
            try
            {
                var cohort = await counter.Count(patientCountQuery, cancelToken);
                var resp = new CohortCountDTO(cohort);
                if (!cohort.ValidationContext.PreflightPassed)
                {
                    return BadRequest(resp);
                }

                return Ok(resp);
            }
            catch (OperationCanceledException)
            {
                log.LogInformation("Request cancelled.");
                return NoContent();
            }
            catch (InvalidOperationException ie)
            {
                log.LogError("Unrecoverable validation error in query. Error:{Error}", ie.Message);
                return BadRequest();
            }
            catch (Exception ex)
            {
                log.LogError("Could not execute query. Error:{Error}", ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("{queryid}/demographics")]
        public async Task<ActionResult<Demographic>> Demographics(
            string queryid,
            [FromServices] DemographicProvider provider,
            CancellationToken cancelToken)
        {
            try
            {
                var queryRef = new QueryRef(queryid);
                var result = await provider.Demographics(queryRef, cancelToken);
                if (result.ValidationContext.State != CompilerContextState.Ok)
                {
                    return NotFound(new CompilerErrorDTO(result.ValidationContext.State));
                }

                return Ok(result.Demographics);
            }
            catch (FormatException fe)
            {
                log.LogWarning("Malformed query identifiers. QueryId:{QueryID} Error:{Error}", queryid, fe.Message);
                return BadRequest("QueryID is malformed.");
            }
            catch (OperationCanceledException)
            {
                log.LogInformation("Request cancelled. QueryID:{QueryID}", queryid);
                return NoContent();
            }
            catch (LeafDbException lde)
            {
                return StatusCode(lde.StatusCode);
            }
            catch (LeafCompilerException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
            catch (Exception ex)
            {
                log.LogError("Could not fetch demographics. QueryID:{QueryID} Error:{Error}", queryid, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("{queryid}/dataset")]
        public async Task<ActionResult<DatasetDTO>> Dataset(
            string queryid,
            [FromQuery] string datasetid,
            [FromQuery] Shape shape,
            [FromQuery] long? early,
            [FromQuery] long? late,
            [FromServices] IDatasetQueryService queryService,
            [FromServices] IDatasetService datasetService,
            CancellationToken cancelToken
        )
        {
            try
            {
                var queryref = new QueryRef(queryid);
                var datasetref = new DatasetQueryRef(datasetid, shape);
                var request = new DatasetExecutionRequest(queryref, datasetref, early, late);

                var validationContext = await queryService.GetQueryCompilerContext(request);

                if (validationContext.State != CompilerContextState.Ok)
                {
                    if (validationContext.State == CompilerContextState.DatasetShapeMismatch)
                    {
                        return BadRequest(new CompilerErrorDTO(validationContext.State));
                    }
                    return NotFound(new CompilerErrorDTO(validationContext.State));
                }

                cancelToken.ThrowIfCancellationRequested();

                var result = await datasetService.GetDatasetAsync(validationContext.Context, cancelToken);
                return Ok(new DatasetDTO(result));
            }
            catch (FormatException fe)
            {
                log.LogWarning("Malformed dataset identifiers. Error:{Error}", fe.Message);
                return StatusCode(StatusCodes.Status400BadRequest);
            }
            catch (LeafPreflightException lpe)
            {
                log.LogInformation("Dataset query failed preflight check. Error:{Error}", lpe.Message);
                return BadRequest();
            }
            catch (OperationCanceledException)
            {
                log.LogInformation("Request cancelled. QueryID:{QueryID} DatasetId:{DatasetId}", queryid, datasetid);
                return NoContent();
            }
            catch (LeafDbException lde)
            {
                return StatusCode(lde.StatusCode);
            }
            catch (LeafCompilerException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
            catch (Exception ex)
            {
                log.LogError("Could not fetch dataset. QueryID:{QueryID} DatasetID:{DatasetID} Error:{Error}", queryid, datasetid, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}