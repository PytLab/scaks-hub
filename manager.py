#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os

from flask_script import Manager, Shell

from gevent import monkey
from gevent.pywsgi import WSGIServer
monkey.patch_all()

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

@manager.command
def runserver(host='127.0.0.1', port=5000):
    """ Run a gevent-based WSGIServer.
    """
    port = int(port)

    server = WSGIServer(listener=(host, port), application=app)

    def serve():
        print(' * Running on http://{}:{}'.format(host, port))
        server.serve_forever()

    serve()

def make_shell_context():
    return dict(app=app)

manager.add_command('shell', Shell(make_context=make_shell_context))

if __name__ == '__main__':
    manager.run()

