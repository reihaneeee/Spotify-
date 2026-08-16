from .models import Notification


def notify(*, recipient=None, target_role=None, text, link=None, work_type="", work_data=None):
    """Single choke point for creating notifications (spec 2.6). Any app can
    import and call this instead of writing to the Notification table
    directly -- e.g. accounts.signals (artist approval), catalog.signals
    (new release), or the tickets/admin app another teammate owns."""
    return Notification.objects.create(
        recipient=recipient,
        target_role=target_role,
        text=text,
        link=link or "",
        work_type=work_type or "",
        work_data=work_data,
    )


def notify_staff(text, link=None):
    return notify(target_role=Notification.TargetRole.STAFF, text=text, link=link)
