﻿// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Options
{
    public static partial class Config
    {
        public static class Authentication
        {
            public const string Section = @"Authentication";
            public const string Mechanism = @"Authentication:Mechanism";
            public const string SessionTimeout = @"Authentication:SessionTimeoutMinutes";
            public const string InactivityTimeout = @"Authentication:InactivityTimeoutMinutes";
            public const string LogoutURI = @"Authentication:LogoutURI";

            public const string SAML2 = @"Authentication:SAML2";
            public const string ActiveDirectory = @"Authentication:ActiveDirectory";
            public const string DomainConnection = @"Authentication:ActiveDirectory:DomainConnection";
            public const string DomainServer = @"Authentication:ActiveDirectory:DomainConnection:Server";
            public const string DomainSSLPort = @"Authentication:ActiveDirectory:DomainConnection:SSLPort";
            public const string DomainUsername = @"Authentication:ActiveDirectory:DomainConnection:Username";
            public const string DomainPassword = @"Authentication:ActiveDirectory:DomainConnection:Password";
        }
    }
}
