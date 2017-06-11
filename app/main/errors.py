#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import render_template

from . import main

# User-defined exception classes.
class PathError(Exception):
    pass


# View functions for error handling.
@main.errorhandler(PathError)
def path_not_found(error):
    msg, = error.args
    return render_template('404.html', msg=msg)

