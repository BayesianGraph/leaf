﻿// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace API.Controllers
{
    [Authorize(Policy = TokenType.Access)]
    [Route("api/help")]
    public class HelpController : Controller
    {
        readonly ILogger<HelpController> log;     
        public HelpController(ILogger<HelpController> logger)
        {
            log = logger;
        }

        [HttpGet("pages")]
        public async Task<ActionResult<HelpPages>> GetHelpPages(
            string queryid,
            [FromServices] HelpPages helpPage)
        {
            try
            {
                var pages = await helpPage.GetAllPagesAsync();
                return Ok(pages);
            }
            catch (Exception e)
            {
                log.LogError("Failed to fetch help pages. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("{pageid}/content")]
        public async Task<ActionResult<HelpPageContent>> GetHelpPageContent(
            [FromServices] HelpPages helpPage)
        {
            try
            {
                var content = await helpPage.GetPageContentAsync();
                return Ok(content);
            }
            catch (Exception e)
            {
                log.LogError("Failed to fetch help page content. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        // 1. HelpController - get pages, get page content
        // 2. adminhelpcontroller - create, read, update, delete
        // 3. service - which will run the SP
        //      write sp for each call- admin update call; payload of page id, content
    }
}
