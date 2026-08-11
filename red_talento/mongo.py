import os
from pymongo import MongoClient

_client = None


def get_mongo_client():
    global _client
    if _client is None:
        _client = MongoClient(os.getenv("MONGO_URI"))
    return _client


def get_feed_collection():
    client = get_mongo_client()
    db = client[os.getenv("MONGO_DB_NAME", "red_talento_feed")]
    return db["posts"]
