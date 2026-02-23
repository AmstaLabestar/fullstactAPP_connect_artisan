import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


logger = logging.getLogger(__name__)


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        logger.exception("Unhandled API exception", exc_info=exc)
        return Response(
            {
                "error": "Une erreur interne est survenue.",
                "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if response.status_code >= 500:
        logger.exception("API server error", exc_info=exc)
        response.data = {
            "error": "Une erreur interne est survenue.",
            "status_code": response.status_code,
        }
        return response

    if isinstance(response.data, dict) and "detail" in response.data:
        response.data = {"error": response.data["detail"], "status_code": response.status_code}
    else:
        response.data = {"errors": response.data, "status_code": response.status_code}

    return response
