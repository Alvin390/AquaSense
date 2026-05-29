# AlertLog ORM model
# Table: alert_log
# Fields: id, source_id (FK), alert_type (ph_critical|flood_high|water_scarce),
#         triggered_at, last_notified_at
# Used to throttle repeat push notifications within a 6-hour window
