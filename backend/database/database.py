# from sqlalchemy import create_engine, event
# from sqlalchemy.orm import sessionmaker, declarative_base
# from sqlalchemy.pool import StaticPool
# import os
# from contextlib import contextmanager

# DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./project.db")

# engine = create_engine(
#     DATABASE_URL,
#     connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
#     poolclass=StaticPool if "sqlite" in DATABASE_URL else None,
#     echo=False,
# )

# @event.listens_for(engine, "connect")
# def set_sqlite_pragma(dbapi_connection, connection_record):
#     if "sqlite" in DATABASE_URL:
#         cursor = dbapi_connection.cursor()
#         cursor.execute("PRAGMA foreign_keys=ON")
#         cursor.execute("PRAGMA journal_mode=WAL")
#         cursor.close()

# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# @contextmanager
# def get_db_context():
#     db = SessionLocal()
#     try:
#         yield db
#         db.commit()
#     except Exception:
#         db.rollback()
#         raise
#     finally:
#         db.close()

# def init_db():
#     from backend.database.models import (
#         WBSActivity, Report, Extraction, Match, Review, ScheduleUpdate
#     )
#     Base.metadata.create_all(bind=engine)
    
#     schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
#     if os.path.exists(schema_path):
#         with open(schema_path, "r") as f:
#             schema = f.read()
#         with engine.connect() as conn:
#             for statement in schema.split(";"):
#                 stmt = statement.strip()
#                 if stmt:
#                     conn.execute(stmt)
#             conn.commit()









from sqlalchemy import create_engine, event, text

from sqlalchemy.orm import sessionmaker, declarative_base

from sqlalchemy.pool import StaticPool

import os

from contextlib import contextmanager


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./project.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    poolclass=StaticPool if "sqlite" in DATABASE_URL else None,
    echo=False,
)


@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):

    if "sqlite" in DATABASE_URL:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.close()


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context():

    db = SessionLocal()

    try:
        yield db
        db.commit()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def init_db():

    from backend.database.models import (
        WBSActivity,
        Report,
        Extraction,
        Match,
        Review,
        ScheduleUpdate
    )

    Base.metadata.create_all(bind=engine)

    schema_path = os.path.join(
        os.path.dirname(__file__),
        "schema.sql"
    )

    if os.path.exists(schema_path):

        with open(schema_path, "r") as f:
            schema = f.read()

        with engine.connect() as conn:

            for statement in schema.split(";"):

                stmt = statement.strip()

                if stmt:
                    conn.execute(text(stmt))

            conn.commit()