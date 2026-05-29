# AIRecommendation ORM model
# Table: ai_recommendations
# Fields: id, reading_id (FK), source_id (FK), risk_label (SAFE|USE_WITH_CAUTION|DO_NOT_USE),
#         summary (text), recommendations (JSON array), data_drivers (JSON array),
#         quality_score (0–100), quantity_score (0–100), generated_at
# Index: (source_id, generated_at DESC)
