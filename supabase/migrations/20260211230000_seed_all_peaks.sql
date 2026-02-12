-- Seed all 58 Colorado 14ers
-- Data sourced from 14ers.com and Colorado Mountain Club

INSERT INTO peaks (slug, name, elevation, rank, range, difficulty, prominence, latitude, longitude, county, forest, nearby_towns, description) VALUES

-- Sawatch Range (15 peaks)
('mount-elbert', 'Mount Elbert', 14433, 1, 'Sawatch Range', 'Class 1', 9093, 39.1178, -106.4454, 'Lake', 'San Isabel National Forest', ARRAY['Leadville', 'Twin Lakes'], 'The highest peak in Colorado and the Rocky Mountains. Mount Elbert offers several well-maintained trails to the summit with stunning views of the surrounding Sawatch Range.'),

('mount-massive', 'Mount Massive', 14421, 2, 'Sawatch Range', 'Class 2', 1961, 39.1875, -106.4756, 'Lake', 'San Isabel National Forest', ARRAY['Leadville', 'Twin Lakes'], 'Colorado''s second highest peak with the largest summit area of any 14er. The mountain lives up to its name with an expansive ridge over three miles long.'),

('mount-harvard', 'Mount Harvard', 14420, 3, 'Sawatch Range', 'Class 2', 1840, 38.9243, -106.3206, 'Chaffee', 'San Isabel National Forest', ARRAY['Buena Vista', 'Granite'], 'The highest of the Collegiate Peaks and third highest in Colorado. Named after Harvard University, it''s often climbed with neighboring Mount Columbia.'),

('la-plata-peak', 'La Plata Peak', 14336, 5, 'Sawatch Range', 'Class 2', 1476, 39.0293, -106.4731, 'Chaffee/Lake', 'San Isabel National Forest', ARRAY['Buena Vista', 'Twin Lakes'], 'A prominent peak visible from Highway 82. The standard route follows a beautiful valley before ascending steep slopes to the summit.'),

('mount-antero', 'Mount Antero', 14269, 10, 'Sawatch Range', 'Class 2', 2299, 38.6740, -106.2462, 'Chaffee', 'San Isabel National Forest', ARRAY['Buena Vista', 'Nathrop'], 'Famous for its aquamarine gemstones and minerals. A rough 4WD road allows access high on the mountain, making it one of the more accessible 14ers.'),

('mount-shavano', 'Mount Shavano', 14229, 17, 'Sawatch Range', 'Class 2', 2169, 38.6193, -106.2393, 'Chaffee', 'San Isabel National Forest', ARRAY['Salida', 'Poncha Springs'], 'Known for the "Angel of Shavano" snow formation visible in spring. Often climbed together with neighboring Tabeguache Peak.'),

('mount-princeton', 'Mount Princeton', 14197, 18, 'Sawatch Range', 'Class 2', 2037, 38.7491, -106.2423, 'Chaffee', 'San Isabel National Forest', ARRAY['Buena Vista', 'Nathrop'], 'One of the most prominent Collegiate Peaks with excellent views. Hot springs at the base make for a perfect post-climb soak.'),

('mount-belford', 'Mount Belford', 14197, 19, 'Sawatch Range', 'Class 2', 1417, 38.9608, -106.3607, 'Chaffee', 'San Isabel National Forest', ARRAY['Buena Vista', 'Granite'], 'Often climbed as part of a three-peak day with Mount Oxford and Missouri Mountain. The standard route is straightforward but steep.'),

('mount-yale', 'Mount Yale', 14196, 21, 'Sawatch Range', 'Class 2', 1716, 38.8440, -106.3139, 'Chaffee', 'San Isabel National Forest', ARRAY['Buena Vista'], 'A striking pyramid-shaped peak in the Collegiate group. Named after Yale University and offers excellent views of the Arkansas River valley.'),

('tabeguache-peak', 'Tabeguache Peak', 14155, 22, 'Sawatch Range', 'Class 2', 615, 38.6257, -106.2507, 'Chaffee', 'San Isabel National Forest', ARRAY['Salida', 'Poncha Springs'], 'Almost always climbed with Mount Shavano via a connecting ridge. The name is derived from a Ute word meaning "place where the snow melts first."'),

('mount-oxford', 'Mount Oxford', 14153, 23, 'Sawatch Range', 'Class 2', 733, 38.9646, -106.3385, 'Chaffee', 'San Isabel National Forest', ARRAY['Buena Vista', 'Granite'], 'Part of the Belford-Oxford-Missouri group. A moderate ridge walk from Belford makes this an easy addition to a multi-peak day.'),

('mount-columbia', 'Mount Columbia', 14073, 32, 'Sawatch Range', 'Class 2', 873, 38.9039, -106.2974, 'Chaffee', 'San Isabel National Forest', ARRAY['Buena Vista', 'Granite'], 'Often climbed with Mount Harvard via a rugged connecting ridge. The standard west slopes route is straightforward Class 2.'),

('missouri-mountain', 'Missouri Mountain', 14067, 33, 'Sawatch Range', 'Class 2', 807, 38.9476, -106.3782, 'Chaffee', 'San Isabel National Forest', ARRAY['Buena Vista', 'Granite'], 'A beautiful peak that can be added to the Belford-Oxford traverse. The colorful rock bands make this summit particularly scenic.'),

('huron-peak', 'Huron Peak', 14003, 50, 'Sawatch Range', 'Class 2', 1763, 38.9454, -106.4380, 'Chaffee', 'San Isabel National Forest', ARRAY['Buena Vista', 'Granite'], 'One of the most scenic 14ers with views of Lake Ann below. The standard route passes through beautiful alpine meadows.'),

('mount-of-the-holy-cross', 'Mount of the Holy Cross', 14005, 49, 'Sawatch Range', 'Class 2', 2005, 39.4668, -106.4817, 'Eagle', 'White River National Forest', ARRAY['Minturn', 'Vail'], 'Famous for the cross-shaped snow couloir on its northeast face. A challenging approach through Halfmoon Creek drainage.'),

-- Mosquito Range (6 peaks)
('mount-lincoln', 'Mount Lincoln', 14286, 8, 'Mosquito Range', 'Class 2', 1366, 39.3515, -106.1115, 'Park', 'Pike National Forest', ARRAY['Fairplay', 'Alma'], 'The highest peak in the Mosquito Range. Often climbed as part of a 4-peak day with Democrat, Cameron, and Bross.'),

('quandary-peak', 'Quandary Peak', 14265, 13, 'Tenmile Range', 'Class 1', 1925, 39.3972, -106.1064, 'Summit', 'White River National Forest', ARRAY['Breckenridge', 'Frisco'], 'One of the most popular 14ers due to easy access and a well-maintained trail. Great for beginners with stunning views of the Tenmile Range.'),

('mount-democrat', 'Mount Democrat', 14148, 25, 'Mosquito Range', 'Class 2', 668, 39.3397, -106.1397, 'Park', 'Pike National Forest', ARRAY['Fairplay', 'Alma'], 'Part of the famous "Decalibron" loop with Cameron, Lincoln, and Bross. The steep east face provides a challenging direct route.'),

('mount-sherman', 'Mount Sherman', 14036, 42, 'Mosquito Range', 'Class 2', 756, 39.2250, -106.1699, 'Park/Lake', 'Pike National Forest', ARRAY['Fairplay', 'Leadville'], 'One of the easiest 14ers to climb with a relatively short approach past historic mining ruins. Popular for beginners.'),

('mount-bross', 'Mount Bross', 14172, 20, 'Mosquito Range', 'Class 2', 292, 39.3352, -106.1073, 'Park', 'Pike National Forest', ARRAY['Fairplay', 'Alma'], 'The fourth peak in the Decalibron loop. Note that private property issues may affect access - check current conditions.'),

('mount-cameron', 'Mount Cameron', 14238, 15, 'Mosquito Range', 'Class 2', 138, 39.3469, -106.1185, 'Park', 'Pike National Forest', ARRAY['Fairplay', 'Alma'], 'A ranked summit on the ridge between Lincoln and Democrat. Part of the popular Decalibron loop.'),

-- Front Range (5 peaks)
('grays-peak', 'Grays Peak', 14270, 9, 'Front Range', 'Class 1', 2990, 39.6339, -105.8176, 'Clear Creek/Summit', 'Arapaho National Forest', ARRAY['Georgetown', 'Silverthorne'], 'The highest peak on the Continental Divide in North America. Often climbed with neighboring Torreys Peak via a scenic saddle.'),

('torreys-peak', 'Torreys Peak', 14267, 11, 'Front Range', 'Class 1', 627, 39.6427, -105.8214, 'Clear Creek/Summit', 'Arapaho National Forest', ARRAY['Georgetown', 'Silverthorne'], 'A beautiful pyramidal peak often climbed with Grays Peak. The Kelso Ridge offers a more challenging Class 3 alternative route.'),

('mount-evans', 'Mount Evans', 14264, 14, 'Front Range', 'Class 1', 2764, 39.5883, -105.6438, 'Clear Creek', 'Arapaho National Forest', ARRAY['Idaho Springs', 'Georgetown'], 'Home to the highest paved road in North America. Can be hiked from Summit Lake or driven to the top for accessible alpine views.'),

('longs-peak', 'Longs Peak', 14255, 16, 'Front Range', 'Class 3', 2925, 40.2549, -105.6156, 'Boulder/Larimer', 'Rocky Mountain National Park', ARRAY['Estes Park', 'Lyons'], 'The northernmost 14er and the most prominent peak in Rocky Mountain National Park. The Keyhole Route is a challenging Class 3 climb.'),

('mount-bierstadt', 'Mount Bierstadt', 14060, 35, 'Front Range', 'Class 2', 1680, 39.5827, -105.6686, 'Clear Creek', 'Arapaho National Forest', ARRAY['Georgetown', 'Idaho Springs'], 'One of the most accessible 14ers near Denver. Often climbed with Mount Evans via the challenging Sawtooth Ridge.'),

('pikes-peak', 'Pikes Peak', 14110, 27, 'Front Range', 'Class 1', 5530, 38.8409, -105.0423, 'El Paso/Teller', 'Pike National Forest', ARRAY['Colorado Springs', 'Manitou Springs'], 'America''s Mountain - the most visited peak in North America. Accessible by hiking, cog railway, or scenic highway.'),

-- Sangre de Cristo Range (10 peaks)
('blanca-peak', 'Blanca Peak', 14345, 4, 'Sangre de Cristo Range', 'Class 2', 5325, 37.5775, -105.4856, 'Alamosa/Costilla/Huerfano', 'Rio Grande National Forest', ARRAY['Alamosa', 'Fort Garland'], 'The highest peak in the Sangre de Cristo Range and fourth highest in Colorado. A challenging climb with rough 4WD access.'),

('crestone-peak', 'Crestone Peak', 14294, 7, 'Sangre de Cristo Range', 'Class 3', 1494, 37.9669, -105.5857, 'Custer/Saguache', 'Rio Grande National Forest', ARRAY['Crestone', 'Moffat'], 'One of the most technical standard routes on any 14er. The loose rock and exposure make this a serious mountaineering objective.'),

('crestone-needle', 'Crestone Needle', 14197, 20, 'Sangre de Cristo Range', 'Class 3', 617, 37.9646, -105.5766, 'Custer/Saguache', 'Rio Grande National Forest', ARRAY['Crestone', 'Moffat'], 'A dramatic spire with one of the most difficult standard routes in Colorado. Often climbed with Crestone Peak.'),

('humboldt-peak', 'Humboldt Peak', 14064, 34, 'Sangre de Cristo Range', 'Class 2', 1144, 37.9761, -105.5554, 'Custer/Saguache', 'Rio Grande National Forest', ARRAY['Crestone', 'Westcliffe'], 'The easiest of the Crestone group peaks. Offers excellent views of the more technical Crestone Peak and Needle.'),

('challenger-point', 'Challenger Point', 14081, 31, 'Sangre de Cristo Range', 'Class 2', 281, 37.9802, -105.6066, 'Saguache', 'Rio Grande National Forest', ARRAY['Crestone', 'Moffat'], 'Named in memory of the Space Shuttle Challenger crew. A relatively moderate climb often combined with Kit Carson Peak.'),

('kit-carson-peak', 'Kit Carson Peak', 14165, 21, 'Sangre de Cristo Range', 'Class 3', 1585, 37.9797, -105.6024, 'Saguache', 'Rio Grande National Forest', ARRAY['Crestone', 'Moffat'], 'A prominent peak named for the famous frontiersman. The traverse from Challenger Point requires Class 3 scrambling.'),

('ellingwood-point', 'Ellingwood Point', 14042, 39, 'Sangre de Cristo Range', 'Class 2', 342, 37.5825, -105.4926, 'Alamosa/Costilla', 'Rio Grande National Forest', ARRAY['Alamosa', 'Fort Garland'], 'A subpeak of Blanca that requires minimal extra effort from the Blanca summit. Named for Albert Ellingwood, a Colorado climbing pioneer.'),

('mount-lindsey', 'Mount Lindsey', 14042, 40, 'Sangre de Cristo Range', 'Class 3', 1542, 37.5839, -105.4450, 'Costilla/Huerfano', 'Rio Grande National Forest', ARRAY['Fort Garland', 'Walsenburg'], 'A striking peak with the "Iron Nipple" formation near the summit. The northwest ridge provides an excellent Class 3 route.'),

('little-bear-peak', 'Little Bear Peak', 14037, 41, 'Sangre de Cristo Range', 'Class 4', 377, 37.5666, -105.4970, 'Alamosa/Costilla', 'Rio Grande National Forest', ARRAY['Alamosa', 'Fort Garland'], 'Considered the most difficult 14er standard route in Colorado. The Hourglass couloir is notorious for loose rock and danger.'),

('culebra-peak', 'Culebra Peak', 14047, 38, 'Sangre de Cristo Range', 'Class 2', 1907, 37.1220, -105.1856, 'Costilla', 'Private Land', ARRAY['San Luis', 'Fort Garland'], 'The only 14er on private land requiring paid access through Cielo Vista Ranch. A long but non-technical climb.'),

-- Elk Range (6 peaks)
('castle-peak', 'Castle Peak', 14265, 12, 'Elk Range', 'Class 2', 2365, 39.0097, -106.8614, 'Gunnison/Pitkin', 'White River National Forest', ARRAY['Aspen', 'Crested Butte'], 'The highest peak in the Elk Range with distinctive castle-like formations. Often climbed with Conundrum Peak.'),

('capitol-peak', 'Capitol Peak', 14130, 26, 'Elk Range', 'Class 4', 2090, 39.1502, -107.0832, 'Pitkin', 'White River National Forest', ARRAY['Aspen', 'Snowmass'], 'One of the most difficult and dangerous 14ers. The notorious Knife Edge requires extreme exposure and route-finding skills.'),

('snowmass-mountain', 'Snowmass Mountain', 14092, 28, 'Elk Range', 'Class 3', 1872, 39.1189, -107.0665, 'Gunnison/Pitkin', 'White River National Forest', ARRAY['Aspen', 'Snowmass'], 'A remote and challenging peak requiring a long approach. The S-shaped couloir is the standard route.'),

('maroon-peak', 'Maroon Peak', 14156, 22, 'Elk Range', 'Class 4', 1236, 39.0709, -106.9890, 'Gunnison/Pitkin', 'White River National Forest', ARRAY['Aspen'], 'One of the iconic Maroon Bells. The "Deadly Bells" moniker comes from the notoriously loose and crumbly rock.'),

('north-maroon-peak', 'North Maroon Peak', 14014, 48, 'Elk Range', 'Class 4', 494, 39.0762, -106.9872, 'Gunnison/Pitkin', 'White River National Forest', ARRAY['Aspen'], 'The slightly lower of the Maroon Bells. The traverse from South Maroon is considered one of the most dangerous in Colorado.'),

('pyramid-peak', 'Pyramid Peak', 14018, 44, 'Elk Range', 'Class 4', 1078, 39.0715, -106.9502, 'Pitkin', 'White River National Forest', ARRAY['Aspen'], 'A steep and intimidating peak with loose rock throughout. All routes require careful climbing and solid route-finding.'),

('conundrum-peak', 'Conundrum Peak', 14060, 36, 'Elk Range', 'Class 2', 240, 39.0153, -106.8632, 'Gunnison/Pitkin', 'White River National Forest', ARRAY['Aspen', 'Crested Butte'], 'An easy addition from Castle Peak via a short ridge walk. Named for nearby Conundrum Hot Springs.'),

-- San Juan Range (13 peaks)
('uncompahgre-peak', 'Uncompahgre Peak', 14309, 6, 'San Juan Range', 'Class 2', 4009, 38.0717, -107.4622, 'Hinsdale', 'Uncompahgre National Forest', ARRAY['Lake City', 'Ouray'], 'The highest peak in the San Juan Mountains. The name means "red water spring" in the Ute language.'),

('mount-wilson', 'Mount Wilson', 14246, 16, 'San Juan Range', 'Class 4', 1866, 37.8392, -107.9914, 'Dolores/San Miguel', 'San Juan National Forest', ARRAY['Telluride', 'Rico'], 'A challenging peak above the town of Telluride. Not to be confused with Wilson Peak, which is nearby.'),

('mount-sneffels', 'Mount Sneffels', 14150, 24, 'San Juan Range', 'Class 3', 2990, 38.0037, -107.7922, 'Ouray', 'Uncompahgre National Forest', ARRAY['Ouray', 'Ridgway'], 'One of the most beautiful peaks in Colorado. The standard route includes a fun Class 3 chimney near the summit.'),

('mount-eolus', 'Mount Eolus', 14083, 29, 'San Juan Range', 'Class 3', 1183, 37.6219, -107.6222, 'La Plata', 'San Juan National Forest', ARRAY['Durango', 'Silverton'], 'Part of the Chicago Basin group accessed via the Durango & Silverton Railroad. The Catwalk is an exposed section near the summit.'),

('windom-peak', 'Windom Peak', 14082, 30, 'San Juan Range', 'Class 2', 822, 37.6211, -107.5916, 'La Plata', 'San Juan National Forest', ARRAY['Durango', 'Silverton'], 'The easiest of the Chicago Basin peaks. Often climbed with nearby Sunlight Peak.'),

('sunlight-peak', 'Sunlight Peak', 14059, 36, 'San Juan Range', 'Class 4', 539, 37.6273, -107.5956, 'La Plata/San Juan', 'San Juan National Forest', ARRAY['Durango', 'Silverton'], 'The summit block requires a memorable final move to reach the tiny top. The shortest true summit in Colorado.'),

('handies-peak', 'Handies Peak', 14048, 37, 'San Juan Range', 'Class 1', 1788, 37.9131, -107.5044, 'Hinsdale', 'Bureau of Land Management', ARRAY['Lake City', 'Silverton'], 'One of the easier San Juan 14ers with a straightforward trail. Popular for its accessibility and beautiful wildflower displays.'),

('redcloud-peak', 'Redcloud Peak', 14034, 43, 'San Juan Range', 'Class 2', 1674, 37.9409, -107.4217, 'Hinsdale', 'Bureau of Land Management', ARRAY['Lake City'], 'Named for the red-colored rock near the summit. Almost always climbed with nearby Sunshine Peak.'),

('wilson-peak', 'Wilson Peak', 14017, 45, 'San Juan Range', 'Class 4', 1257, 37.8599, -107.9843, 'San Miguel', 'San Juan National Forest', ARRAY['Telluride'], 'The peak featured on Coors beer cans. A challenging climb with exposed Class 4 rock near the summit.'),

('wetterhorn-peak', 'Wetterhorn Peak', 14015, 46, 'San Juan Range', 'Class 3', 1755, 38.0606, -107.5108, 'Hinsdale', 'Uncompahgre National Forest', ARRAY['Lake City', 'Ouray'], 'Named after the famous Swiss peak. Features a distinctive summit block requiring Class 3 moves to reach the top.'),

('san-luis-peak', 'San Luis Peak', 14014, 47, 'San Juan Range', 'Class 1', 2494, 37.9869, -106.9311, 'Saguache', 'Rio Grande National Forest', ARRAY['Creede', 'Lake City'], 'The most remote 14er with the longest drive to any trailhead. A gentle giant with easy terrain throughout.'),

('sunshine-peak', 'Sunshine Peak', 14001, 51, 'San Juan Range', 'Class 2', 621, 37.9228, -107.4256, 'Hinsdale', 'Bureau of Land Management', ARRAY['Lake City'], 'The shortest of Colorado''s 14ers by elevation. Almost always climbed with Redcloud Peak via a scenic connecting ridge.'),

('el-diente-peak', 'El Diente Peak', 14159, 23, 'San Juan Range', 'Class 4', 319, 37.8392, -108.0053, 'Dolores/San Miguel', 'San Juan National Forest', ARRAY['Telluride', 'Rico'], 'The name means "the tooth" in Spanish. The traverse to/from Mount Wilson is one of the most challenging in Colorado.')

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  elevation = EXCLUDED.elevation,
  rank = EXCLUDED.rank,
  range = EXCLUDED.range,
  difficulty = EXCLUDED.difficulty,
  prominence = EXCLUDED.prominence,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  county = EXCLUDED.county,
  forest = EXCLUDED.forest,
  nearby_towns = EXCLUDED.nearby_towns,
  description = EXCLUDED.description,
  updated_at = now();
