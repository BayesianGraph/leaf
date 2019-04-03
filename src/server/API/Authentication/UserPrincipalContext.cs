﻿// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System.DirectoryServices.AccountManagement;
using Model.Authentication;

namespace API.Authentication
{
    public class UserPrincipalContext
    {
        public IScopedIdentity ScopedIdentity { get; set; }

        public UserPrincipal User { get; set; }
        public string UserPrincipalName => User?.UserPrincipalName;
        public bool HasPrincipal => User != null;
    }
}
