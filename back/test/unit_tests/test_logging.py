import logging

from boxtribute_server.logging import RequestLogger


def test_request_logger_forwards_structured_entries(mocker):
    handler = mocker.MagicMock()
    handler.level = logging.NOTSET
    request_logger = RequestLogger("test-context", handler)

    content = {"query": "query { bases { id } }", "execution_time": 0.1}
    request_logger.log_struct(content, severity="INFO")

    handler.handle.assert_called_once()
    record = handler.handle.call_args.args[0]
    assert record.msg == content
    assert record.levelno == logging.INFO

    # Unknown severities fall back to INFO
    handler.reset_mock()
    request_logger.log_struct({"a": 1}, severity="NOTALEVEL")
    record = handler.handle.call_args.args[0]
    assert record.levelno == logging.INFO

    # Entries are not propagated to ancestor loggers
    assert request_logger._logger.propagate is False
