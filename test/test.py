#!/Library/Frameworks/Python.framework/Versions/2.7/bin/python
# -*- coding: utf-8 -*-

from parse_rest.datatypes import Object
from parse_rest.connection import register

APP_ID = "qb9AlvfEwVJkZSVCfXOKmxOytM4mHjP8qiuTgamD"
REST_API_KEY = "MTfw3ouWamMhsgBzLf3wOofRDt1TFUs4Wup1fN9v"


class User(Object):
    pass


class Event(Object):
    pass


class EventAttendee(Object):
    pass


class UserContacts(Object):
    pass


class Comment(Object):
    pass


if __name__ == "__main__":
    register(APP_ID, REST_API_KEY)












