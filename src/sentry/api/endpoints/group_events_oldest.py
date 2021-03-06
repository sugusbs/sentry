from rest_framework.response import Response

from sentry.api import client
from sentry.api.bases.group import GroupEndpoint
from sentry.api.helpers.environments import get_environments


class GroupEventsOldestEndpoint(GroupEndpoint):
    def get(self, request, group):
        """
        Retrieve the Oldest Event for an Issue
        ``````````````````````````````````````

        Retrieves the details of the oldest event for an issue.

        :pparam string group_id: the ID of the issue
        """

        environments = [e.name for e in get_environments(request, group.project.organization)]

        event = group.get_oldest_event_for_environments(environments)

        if not event:
            return Response({"detail": "No events found for group"}, status=404)

        try:
            return client.get(
                "/projects/{}/{}/events/{}/".format(
                    event.organization.slug, event.project.slug, event.event_id
                ),
                request=request,
                data={"environment": environments},
            )
        except client.ApiError as e:
            return Response(e.body, status=e.status_code)
