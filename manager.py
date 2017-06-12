#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os

from flask_script import Manager, Shell

from app import create_app

app = create_app(os.getenv('KYN-CONFIG') or 'default') 
manager = Manager(app)

@manager.command
def test():
    """ Run unit tests.
    """
    import unittest
    tests = unittest.TestLoader().discover('tests')
    unittest.TextTestRunner(verbosity=2).run(tests)

def make_shell_context():
    return dict(app=app)

manager.add_command('shell', Shell(make_context=make_shell_context))

manager.run()

