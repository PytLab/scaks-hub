#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os

from manager import create_app
import datetime

app = create_app(os.getenv('KYN-CONFIG') or 'default')

@app.context_processor
def template_extras():
    return {'enumerate': enumerate, 'len': len, 'datetime': datetime}

