#!/usr/bin/env python
# -*- coding: utf-8 -*-
import unittest

from flask import url_for, current_app

from app import create_app

class FlaskClientTest(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.client = self.app.test_client(use_cookies=True)

    def tearDown(self):
        self.app_context.pop()

    def test_app_exists(self):
        self.assertFalse(current_app is None)

    def test_app_is_testing(self):
        self.assertTrue(current_app.config['TESTING'])

    def test_filetree_page(self):
        " Make sure the file tree page can be returned correctly. "
        response = self.client.get(url_for('main.filetree'))

        self.assertTrue('app' in response.get_data(as_text=True))
        self.assertTrue('config.py' in response.get_data(as_text=True))
        self.assertTrue('manager.py' in response.get_data(as_text=True))

