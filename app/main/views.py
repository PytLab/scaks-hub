#!/usr/bin/env python
# -*- coding: utf-8 -*-

# View functions for microkinetics model building.

from flask import render_template, url_for
from . import main

@main.route('/', methods=['GET', 'POST'])
def index():
    return render_template('filesystem.html')

