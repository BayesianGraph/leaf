﻿// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace Model.Authentication
{
    public class LeafAuthenticationException : ApplicationException
    {
        public LeafAuthenticationException()
        {
        }

        public LeafAuthenticationException(string message) : base(message)
        {
        }

        public LeafAuthenticationException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
