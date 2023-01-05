from django.db import models


class TopRanking(models.Model):

    TIME_PERIOD_24H = 0
    TIME_PERIOD_7D = 1
    TIME_PERIOD_30D = 2
    TIME_PERIOD_ALLTIME = 3

    TIME_PERIODS = (
        (TIME_PERIOD_24H, '24 Hour'),
        (TIME_PERIOD_7D, '7 Days'),
        (TIME_PERIOD_30D, '30 Days'),
        (TIME_PERIOD_ALLTIME, 'All time')
    )

    time_period = models.IntegerField(blank=False, null=False, choices=TIME_PERIODS)
    calculated_at = models.DateTimeField(auto_now_add=True)

    stats = models.JSONField(blank=True, null=True, default=None)

    # stats is a JSON array that looks like this:
    # [
    #   {
    #     'user': '0x123',
    #     'volume_usd': '',
    #     '24h_delta': 0.0,
    #     '7d_delta': 0.0,
    #     'floor_price': 0.0,
    #     'assets': 58500    
    #   }
    # ]
