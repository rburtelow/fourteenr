-- Seed all 27 badge definitions
INSERT INTO badge_definitions (slug, name, description, category, icon_name, sort_order, unlock_criteria)
VALUES
  -- Milestone Badges (6)
  ('first-summit', 'First Summit', 'Conquer your first Colorado 14er', 'milestone', 'mountain-sunrise', 1,
   '{"type": "peak_count", "count": 1}'),
  ('high-five', 'High Five', 'Summit 5 Colorado 14ers', 'milestone', 'high-five', 2,
   '{"type": "peak_count", "count": 5}'),
  ('double-digits', 'Double Digits', 'Reach 10 summited peaks', 'milestone', 'double-digits', 3,
   '{"type": "peak_count", "count": 10}'),
  ('quarter-pounder', 'Quarter Pounder', 'Complete 15 of Colorado''s 14ers', 'milestone', 'quarter-chart', 4,
   '{"type": "peak_count", "count": 15}'),
  ('halfway-there', 'Halfway There', 'Summit 29 peaks - halfway to completion', 'milestone', 'split-mountain', 5,
   '{"type": "peak_count", "count": 29}'),
  ('fourteener-finisher', 'Fourteener Finisher', 'Complete all 58 Colorado 14ers', 'milestone', 'crown-58', 6,
   '{"type": "peak_count", "count": 58}'),

  -- Range Completion Badges (9)
  ('sawatch-master', 'Sawatch Master', 'Complete all 15 Sawatch Range peaks', 'range', 'range-complete', 10,
   '{"type": "range_complete", "range": "Sawatch Range"}'),
  ('mosquito-master', 'Mosquito Master', 'Complete all 5 Mosquito Range peaks', 'range', 'range-complete', 11,
   '{"type": "range_complete", "range": "Mosquito Range"}'),
  ('front-range-master', 'Front Range Master', 'Complete all 6 Front Range peaks', 'range', 'range-complete', 12,
   '{"type": "range_complete", "range": "Front Range"}'),
  ('sangre-de-cristo-master', 'Sangre de Cristo Master', 'Complete all 10 Sangre de Cristo peaks', 'range', 'range-complete', 13,
   '{"type": "range_complete", "range": "Sangre de Cristo Range"}'),
  ('elk-range-master', 'Elk Range Master', 'Complete all 7 Elk Range peaks', 'range', 'range-complete', 14,
   '{"type": "range_complete", "range": "Elk Range"}'),
  ('san-juan-master', 'San Juan Master', 'Complete all 13 San Juan peaks', 'range', 'range-complete', 15,
   '{"type": "range_complete", "range": "San Juan Mountains"}'),
  ('tenmile-pioneer', 'Tenmile Pioneer', 'Summit Quandary Peak in the Tenmile Range', 'range', 'range-complete', 16,
   '{"type": "range_complete", "range": "Tenmile Range"}'),
  ('collegiate-scholar', 'Collegiate Scholar', 'Complete all 6 Collegiate Peaks', 'range', 'graduation-cap', 17,
   '{"type": "peak_list", "peaks": ["mt-harvard", "mt-columbia", "mt-yale", "mt-princeton", "mt-oxford", "mt-belford"]}'),
  ('crestone-conqueror', 'Crestone Conqueror', 'Summit all 4 Crestone group peaks', 'range', 'crestone-peaks', 18,
   '{"type": "peak_list", "peaks": ["crestone-peak", "crestone-needle", "kit-carson-peak", "challenger-point"]}'),

  -- Difficulty Badges (4)
  ('trail-blazer', 'Trail Blazer', 'Complete all Class 1 peaks', 'difficulty', 'boot-print', 20,
   '{"type": "difficulty_complete", "difficulty": "Class 1"}'),
  ('scrambler', 'Scrambler', 'Complete all Class 2 peaks', 'difficulty', 'hands-rock', 21,
   '{"type": "difficulty_complete", "difficulty": "Class 2"}'),
  ('technical-climber', 'Technical Climber', 'Summit any Class 3 peak', 'difficulty', 'rope-carabiner', 22,
   '{"type": "difficulty_any", "difficulty": "Class 3"}'),
  ('expert-mountaineer', 'Expert Mountaineer', 'Summit any Class 4 peak', 'difficulty', 'climbing-helmet', 23,
   '{"type": "difficulty_any", "difficulty": "Class 4"}'),

  -- Special Achievement Badges (4)
  ('summit-king', 'Summit King', 'Summit Mt. Elbert, Colorado''s highest peak', 'special', 'crown-elevation', 30,
   '{"type": "specific_peak", "peak_slug": "mt-elbert"}'),
  ('prominence-pioneer', 'Prominence Pioneer', 'Summit Pikes Peak, the most prominent 14er', 'special', 'mountain-shadow', 31,
   '{"type": "specific_peak", "peak_slug": "pikes-peak"}'),
  ('maroon-survivor', 'Maroon Survivor', 'Survive the Deadly Bells - summit either Maroon Bell', 'special', 'bell-peaks', 32,
   '{"type": "peak_list_any", "peaks": ["maroon-peak", "north-maroon-peak"]}'),
  ('basin-bagger', 'Basin Bagger', 'Complete the Chicago Basin trio', 'special', 'train-peaks', 33,
   '{"type": "peak_list", "peaks": ["windom-peak", "sunlight-peak", "mt-eolus"]}'),

  -- Seasonal & Dedication Badges (4)
  ('winter-warrior', 'Winter Warrior', 'Summit a 14er during winter (Dec-Feb)', 'seasonal', 'snowflake-peak', 40,
   '{"type": "seasonal_summit", "months": [12, 1, 2]}'),
  ('sunrise-summiter', 'Sunrise Summiter', 'Log 5 summits with clear weather conditions', 'dedication', 'sun-rising', 41,
   '{"type": "weather_count", "weather": "Clear", "count": 5}'),
  ('elevation-beast', 'Elevation Beast', 'Gain over 100,000 feet of total elevation', 'dedication', 'upward-arrow', 42,
   '{"type": "total_elevation", "feet": 100000}'),
  ('century-hiker', 'Century Hiker', 'Hike over 100 total miles on 14ers', 'dedication', 'century-boots', 43,
   '{"type": "total_miles", "miles": 100}');
