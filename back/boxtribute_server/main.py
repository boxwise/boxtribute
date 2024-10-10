"""Main entry point for web application"""

import os

from .utils import in_staging_environment

if in_staging_environment():
    import googlecloudprofiler as profiler  # type: ignore

    profiler.start(verbose=2, project_id=os.environ["GOOGLE_PROJECT_ID"])

from .app import main
from .routes import app_bp

app = main(app_bp)
