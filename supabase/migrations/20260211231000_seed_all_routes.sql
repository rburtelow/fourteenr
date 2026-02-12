-- Seed routes for all Colorado 14ers
-- Routes reference peaks by slug, so we use a subquery to get the peak_id

-- Mount Elbert routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Northeast Ridge (Standard)', 9.5, 4700, 'Class 1', '6-8 hours', 'Mount Elbert Trailhead', 'The most popular route up Colorado''s highest peak. Well-maintained trail through forest before emerging above treeline for the final push to the summit.'
FROM peaks WHERE slug = 'mount-elbert';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'South Mount Elbert Trail', 11.0, 4900, 'Class 1', '7-9 hours', 'South Mount Elbert Trailhead', 'A longer but less crowded alternative starting from the south. Passes through beautiful aspen groves and offers excellent views throughout.'
FROM peaks WHERE slug = 'mount-elbert';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Black Cloud Trail', 10.0, 5300, 'Class 2', '7-9 hours', 'Black Cloud Trailhead', 'The steepest and most direct route. Less crowded but more strenuous with loose rock near the summit.'
FROM peaks WHERE slug = 'mount-elbert';

-- Mount Massive routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Mount Massive Trail', 14.0, 4500, 'Class 2', '8-10 hours', 'Mount Massive Trailhead', 'The standard route following a long ridge traverse. The extensive summit plateau requires careful navigation in poor weather.'
FROM peaks WHERE slug = 'mount-massive';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Southwest Slopes', 8.0, 4200, 'Class 2', '6-8 hours', 'Halfmoon Campground', 'A more direct route via the southwest slopes. Steeper but shorter than the standard trail.'
FROM peaks WHERE slug = 'mount-massive';

-- Mount Harvard routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'South Slopes', 14.0, 4500, 'Class 2', '8-10 hours', 'North Cottonwood Trailhead', 'The standard route ascending the moderate south slopes. Often combined with Mount Columbia for a long day.'
FROM peaks WHERE slug = 'mount-harvard';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'East Ridge via Horn Fork Basin', 12.0, 4800, 'Class 2', '7-9 hours', 'Horn Fork Trailhead', 'A scenic alternative through beautiful Horn Fork Basin with views of the Bears Playground.'
FROM peaks WHERE slug = 'mount-harvard';

-- Blanca Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Northwest Face', 7.0, 4400, 'Class 2', '6-9 hours', 'Lake Como Road (4WD)', 'The standard route from Lake Como. The 4WD road is notoriously rough - most hikers add 4 miles each way from the 2WD parking.'
FROM peaks WHERE slug = 'blanca-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Huerfano River Approach', 14.0, 5500, 'Class 2', '10-12 hours', 'Huerfano Trailhead', 'A long approach from the east avoiding the brutal Lake Como road. Better for backpacking trips.'
FROM peaks WHERE slug = 'blanca-peak';

-- La Plata Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Northwest Ridge', 9.0, 4500, 'Class 2', '6-8 hours', 'La Plata Gulch Trailhead', 'The standard route following La Plata Gulch before ascending the northwest ridge. Moderate but straightforward.'
FROM peaks WHERE slug = 'la-plata-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Southwest Ridge', 10.0, 4300, 'Class 2', '6-8 hours', 'South La Plata Trailhead', 'An alternative route from the south with less traffic and excellent views of the Ellingwood Ridge.'
FROM peaks WHERE slug = 'la-plata-peak';

-- Uncompahgre Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'South Ridge', 7.5, 3000, 'Class 1', '5-7 hours', 'Nellie Creek Trailhead (4WD)', 'The standard and easiest route up the highest San Juan peak. 4WD recommended but 2WD vehicles can park lower and add mileage.'
FROM peaks WHERE slug = 'uncompahgre-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'West Face', 10.0, 4200, 'Class 2', '7-9 hours', 'Matterhorn Creek Trailhead', 'A longer approach offering more solitude. Can be combined with Wetterhorn Peak.'
FROM peaks WHERE slug = 'uncompahgre-peak';

-- Crestone Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'South Face Couloir', 12.0, 5600, 'Class 3', '10-14 hours', 'South Colony Lakes Trailhead', 'The standard route featuring the famous Red Couloir. Significant loose rock and exposure - helmet required.'
FROM peaks WHERE slug = 'crestone-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Northwest Couloir', 14.0, 5200, 'Class 3', '10-14 hours', 'Cottonwood Creek Trailhead', 'A north-side alternative that holds snow longer. Technical climbing skills required.'
FROM peaks WHERE slug = 'crestone-peak';

-- Mount Lincoln routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'West Ridge (Decalibron)', 7.0, 3700, 'Class 2', '5-7 hours', 'Kite Lake Trailhead', 'Part of the famous Decalibron loop hitting Democrat, Cameron, Lincoln, and Bross. Most popular route.'
FROM peaks WHERE slug = 'mount-lincoln';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Quartzville/Traver Peak Ridge', 8.0, 3900, 'Class 2', '6-8 hours', 'Quartzville Trailhead', 'Less crowded alternative from the east. Historic mining district adds interest.'
FROM peaks WHERE slug = 'mount-lincoln';

-- Grays Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'North Slopes', 8.0, 3000, 'Class 1', '4-6 hours', 'Stevens Gulch Trailhead', 'The standard route and one of the most popular 14er climbs in Colorado. Well-maintained trail throughout.'
FROM peaks WHERE slug = 'grays-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Lost Rat Couloir', 6.0, 3200, 'Class 3', '5-7 hours', 'Stevens Gulch Trailhead', 'A steeper direct route up a prominent couloir. Snow climbing skills helpful in early season.'
FROM peaks WHERE slug = 'grays-peak';

-- Mount Antero routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'West Slopes (4WD)', 6.0, 3100, 'Class 2', '4-6 hours', 'Baldwin Gulch (4WD High)', 'If your vehicle can handle the rough road, this is one of the shortest 14er routes. Famous for aquamarine crystals.'
FROM peaks WHERE slug = 'mount-antero';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'West Slopes (2WD)', 12.0, 5400, 'Class 2', '8-10 hours', 'Baldwin Gulch (2WD)', 'The full hike from the 2WD parking area. Long but non-technical with mining history throughout.'
FROM peaks WHERE slug = 'mount-antero';

-- Torreys Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'South Slopes', 8.5, 3300, 'Class 1', '5-7 hours', 'Stevens Gulch Trailhead', 'Usually climbed with Grays Peak via the connecting saddle. A short detour from the Grays trail.'
FROM peaks WHERE slug = 'torreys-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Kelso Ridge', 8.0, 3300, 'Class 3', '6-8 hours', 'Stevens Gulch Trailhead', 'A classic ridge scramble with excellent exposure and solid rock. One of the best Class 3 routes in Colorado.'
FROM peaks WHERE slug = 'torreys-peak';

-- Castle Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Northeast Ridge', 12.0, 4400, 'Class 2', '8-10 hours', 'Castle Creek Road Trailhead', 'The standard route passing the beautiful Montezuma Basin. Can add Conundrum Peak easily.'
FROM peaks WHERE slug = 'castle-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Northwest Ridge via Pearl Pass', 14.0, 4000, 'Class 2', '9-11 hours', 'Pearl Pass Trailhead', 'A longer but scenic approach from the historic Pearl Pass road.'
FROM peaks WHERE slug = 'castle-peak';

-- Quandary Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'East Ridge (Standard)', 6.75, 3450, 'Class 1', '4-6 hours', 'Quandary Peak Trailhead', 'Colorado''s most popular 14er trail. Well-maintained with excellent footing throughout. Perfect for beginners.'
FROM peaks WHERE slug = 'quandary-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Cristo Couloir', 5.0, 3500, 'Class 3', '5-7 hours', 'McCullough Gulch Trailhead', 'A steep snow/scree couloir on the west face. Good early season snow climb.'
FROM peaks WHERE slug = 'quandary-peak';

-- Mount Evans routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'West Ridge from Summit Lake', 2.5, 700, 'Class 1', '1-2 hours', 'Summit Lake Trailhead', 'The shortest hiking route, starting from the end of the paved road. Accessible when road is open.'
FROM peaks WHERE slug = 'mount-evans';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Chicago Lakes Trail', 16.0, 5000, 'Class 2', '9-12 hours', 'Chicago Lakes Trailhead', 'The full hiking experience avoiding the road. Beautiful alpine lakes and meadows.'
FROM peaks WHERE slug = 'mount-evans';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Mount Evans Scenic Byway (Drive)', 0.1, 50, 'Class 1', '0.5 hours', 'Summit Parking Lot', 'Walk from the highest paved road in North America. Only available when road is open (Memorial Day - Labor Day, weather permitting).'
FROM peaks WHERE slug = 'mount-evans';

-- Longs Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Keyhole Route', 15.0, 5100, 'Class 3', '10-15 hours', 'Longs Peak Trailhead', 'The classic route featuring the famous Keyhole, Trough, Narrows, and Homestretch. Start very early to avoid afternoon storms.'
FROM peaks WHERE slug = 'longs-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Loft Route', 14.0, 5200, 'Class 3', '10-14 hours', 'Longs Peak Trailhead', 'An alternative to the crowded Keyhole route via the Loft between Longs and Meeker. More solitude but more challenging navigation.'
FROM peaks WHERE slug = 'longs-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Cables Route', 14.0, 5300, 'Class 4', '10-14 hours', 'Longs Peak Trailhead', 'A more direct line up the north face. Cables provide assistance on the steepest section.'
FROM peaks WHERE slug = 'longs-peak';

-- Mount Wilson routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'North Slopes', 11.0, 4800, 'Class 4', '9-12 hours', 'Rock of Ages Trailhead', 'The standard route with exposed Class 4 rock near the summit. Loose rock requires careful climbing.'
FROM peaks WHERE slug = 'mount-wilson';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Navajo Lake Approach', 13.0, 5200, 'Class 4', '10-13 hours', 'Navajo Lake Trailhead', 'A longer approach but allows combining with El Diente via the challenging traverse.'
FROM peaks WHERE slug = 'mount-wilson';

-- Mount Shavano routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'East Slopes (Standard)', 10.0, 4600, 'Class 2', '7-9 hours', 'Blank Gulch Trailhead', 'The most popular route, often combined with Tabeguache Peak. Look for the Angel of Shavano snow formation in spring.'
FROM peaks WHERE slug = 'mount-shavano';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Southwest Ridge via Placer Creek', 12.0, 5200, 'Class 2', '8-10 hours', 'Placer Creek Trailhead', 'A less traveled alternative offering more solitude and views of the Arkansas Valley.'
FROM peaks WHERE slug = 'mount-shavano';

-- Mount Princeton routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'East Slopes', 7.0, 3500, 'Class 2', '5-7 hours', 'Mount Princeton Trailhead', 'The standard route ascending directly from the hot springs area. Post-hike soak highly recommended.'
FROM peaks WHERE slug = 'mount-princeton';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'South Ridge via Grouse Canyon', 10.0, 4000, 'Class 2', '7-9 hours', 'Grouse Canyon Trailhead', 'A longer alternative with excellent views of the Collegiate Peaks.'
FROM peaks WHERE slug = 'mount-princeton';

-- Mount Belford routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'West Slopes (Standard)', 9.0, 4500, 'Class 2', '6-8 hours', 'Missouri Gulch Trailhead', 'The direct route up Belford. Often combined with Oxford and Missouri Mountain for a big day.'
FROM peaks WHERE slug = 'mount-belford';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Elkhead Pass Traverse', 12.0, 5200, 'Class 2', '8-10 hours', 'Vicksburg Trailhead', 'Approach from the north allowing a traverse over Elkhead Pass.'
FROM peaks WHERE slug = 'mount-belford';

-- Crestone Needle routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'South Face', 13.0, 5400, 'Class 3', '10-14 hours', 'South Colony Lakes Trailhead', 'The standard route with challenging loose rock and exposure. One of the most difficult standard routes in Colorado.'
FROM peaks WHERE slug = 'crestone-needle';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Ellingwood Ledges', 13.0, 5400, 'Class 4', '10-14 hours', 'South Colony Lakes Trailhead', 'A technical alternative on better rock than the standard route. Named for climbing pioneer Albert Ellingwood.'
FROM peaks WHERE slug = 'crestone-needle';

-- Mount Yale routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Southwest Slopes', 9.0, 4300, 'Class 2', '6-8 hours', 'Denny Creek Trailhead', 'The standard route with steady climbing through forest before the alpine finish.'
FROM peaks WHERE slug = 'mount-yale';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'East Ridge via Hartenstein Lake', 12.0, 5000, 'Class 2', '8-10 hours', 'Avalanche Gulch Trailhead', 'A longer route passing scenic Hartenstein Lake. Less crowded than the standard route.'
FROM peaks WHERE slug = 'mount-yale';

-- Tabeguache Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Via Mount Shavano', 12.0, 5400, 'Class 2', '8-10 hours', 'Blank Gulch Trailhead', 'Almost always climbed as an addition to Shavano via the connecting ridge. Minimal extra effort from Shavano summit.'
FROM peaks WHERE slug = 'tabeguache-peak';

-- Mount Oxford routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Via Mount Belford', 11.0, 5200, 'Class 2', '8-10 hours', 'Missouri Gulch Trailhead', 'An easy ridge walk from Belford summit. Usually climbed together with Belford and sometimes Missouri Mountain.'
FROM peaks WHERE slug = 'mount-oxford';

-- Mount Sneffels routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'South Slopes (Standard)', 6.0, 2900, 'Class 3', '5-7 hours', 'Yankee Boy Basin (4WD)', 'The standard route featuring a fun Class 3 chimney/gully near the summit. Spectacular wildflowers in July.'
FROM peaks WHERE slug = 'mount-sneffels';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Blue Lakes Approach', 9.0, 4200, 'Class 3', '7-9 hours', 'Blue Lakes Trailhead', 'A scenic approach past the stunning Blue Lakes before joining the standard route.'
FROM peaks WHERE slug = 'mount-sneffels';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Snake Couloir', 6.0, 3000, 'Class 4', '6-8 hours', 'Yankee Boy Basin (4WD)', 'A steep snow/ice couloir route popular in early season. Requires mountaineering skills and equipment.'
FROM peaks WHERE slug = 'mount-sneffels';

-- Mount Democrat routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'East Ridge (Decalibron)', 3.5, 2100, 'Class 2', '3-4 hours', 'Kite Lake Trailhead', 'Part of the popular Decalibron loop. Short and steep with outstanding views.'
FROM peaks WHERE slug = 'mount-democrat';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'East Face Direct', 3.0, 2100, 'Class 3', '3-5 hours', 'Kite Lake Trailhead', 'A steeper direct line up the east face avoiding the standard trail crowds.'
FROM peaks WHERE slug = 'mount-democrat';

-- Capitol Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Northeast Ridge via Knife Edge', 17.0, 5300, 'Class 4', '12-16 hours', 'Capitol Creek Trailhead', 'Colorado''s most dangerous standard route. The Knife Edge is extremely exposed with fatal potential. For experienced climbers only.'
FROM peaks WHERE slug = 'capitol-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'West Face', 18.0, 5500, 'Class 4', '13-17 hours', 'West Snowmass Trailhead', 'An alternative avoiding the Knife Edge but with its own serious challenges and routefinding.'
FROM peaks WHERE slug = 'capitol-peak';

-- Pikes Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Barr Trail', 24.0, 7400, 'Class 1', '12-16 hours', 'Barr Trail Trailhead', 'The classic marathon trail from Manitou Springs. Most hikers take 2 days with an overnight at Barr Camp.'
FROM peaks WHERE slug = 'pikes-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Crags Trail', 7.0, 2300, 'Class 1', '4-6 hours', 'Crags Campground', 'The shortest hiking route to the summit. Much more manageable than Barr Trail.'
FROM peaks WHERE slug = 'pikes-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Pikes Peak Cog Railway', 0.0, 0, 'Class 1', '3 hours', 'Manitou Springs Depot', 'Historic cog railway to the summit. Reservations required, especially in summer.'
FROM peaks WHERE slug = 'pikes-peak';

-- Snowmass Mountain routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'S-Ridge/Elk Creek', 18.0, 5700, 'Class 3', '2 days', 'Snowmass Creek Trailhead', 'The standard route via the distinctive S-shaped couloir. Most parties backpack to Snowmass Lake.'
FROM peaks WHERE slug = 'snowmass-mountain';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'West Face', 16.0, 5400, 'Class 3', '2 days', 'Lead King Basin', 'An alternative from the west with less traffic but similar difficulty.'
FROM peaks WHERE slug = 'snowmass-mountain';

-- Mount Eolus routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Northeast Ridge via Catwalk', 16.0, 5100, 'Class 3', '2 days', 'Purgatory Flats Trailhead', 'The standard route featuring the exposed Catwalk. Most parties take the Durango & Silverton Railroad to Needleton.'
FROM peaks WHERE slug = 'mount-eolus';

-- Windom Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'West Ridge', 15.0, 4900, 'Class 2', '2 days', 'Purgatory Flats Trailhead', 'The easiest route in Chicago Basin. Often climbed with Sunlight Peak from a base camp at Twin Lakes.'
FROM peaks WHERE slug = 'windom-peak';

-- Challenger Point routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'North Ridge', 13.0, 5800, 'Class 2', '10-14 hours', 'Willow Creek Trailhead', 'The standard route often combined with Kit Carson Peak. Named for the Space Shuttle Challenger crew.'
FROM peaks WHERE slug = 'challenger-point';

-- Kit Carson Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Via Challenger Point', 14.0, 6200, 'Class 3', '12-16 hours', 'Willow Creek Trailhead', 'Most popular route ascending Challenger first then traversing to Kit Carson. Class 3 traverse requires careful route-finding.'
FROM peaks WHERE slug = 'kit-carson-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Outward Bound Couloir', 12.0, 5500, 'Class 3', '10-13 hours', 'South Colony Lakes Trailhead', 'Direct route from South Colony Lakes. Steep couloir with loose rock.'
FROM peaks WHERE slug = 'kit-carson-peak';

-- Mount Columbia routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'West Slopes', 11.0, 4000, 'Class 2', '7-9 hours', 'North Cottonwood Trailhead', 'The standard route, usually climbed with Harvard. Straightforward ascent of the west slopes.'
FROM peaks WHERE slug = 'mount-columbia';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Via Harvard (Traverse)', 16.0, 5500, 'Class 3', '10-14 hours', 'North Cottonwood Trailhead', 'The rugged connecting ridge from Harvard. A long but rewarding day.'
FROM peaks WHERE slug = 'mount-columbia';

-- Missouri Mountain routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Northwest Ridge', 10.0, 4200, 'Class 2', '7-9 hours', 'Missouri Gulch Trailhead', 'The standard route often combined with Belford and Oxford for a three-peak day.'
FROM peaks WHERE slug = 'missouri-mountain';

-- Humboldt Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'West Ridge', 12.0, 4100, 'Class 2', '7-9 hours', 'South Colony Lakes Trailhead', 'The easiest peak in the Crestone group. A straightforward ascent with views of the more technical neighbors.'
FROM peaks WHERE slug = 'humboldt-peak';

-- Mount Bierstadt routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'West Slopes (Standard)', 7.0, 2850, 'Class 2', '4-6 hours', 'Guanella Pass Trailhead', 'One of the most accessible 14ers near Denver. Popular year-round with excellent views of the Sawtooth Ridge.'
FROM peaks WHERE slug = 'mount-bierstadt';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Sawtooth Ridge to Evans', 10.0, 4200, 'Class 3', '8-12 hours', 'Guanella Pass Trailhead', 'The classic traverse to Mount Evans over the dramatic Sawtooth Ridge. Serious exposure and loose rock.'
FROM peaks WHERE slug = 'mount-bierstadt';

-- Sunlight Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'South Face', 16.0, 5000, 'Class 4', '2 days', 'Purgatory Flats Trailhead', 'The standard route featuring a memorable final move to the tiny summit block. Usually combined with Windom Peak.'
FROM peaks WHERE slug = 'sunlight-peak';

-- Handies Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'West Slopes', 5.5, 2400, 'Class 1', '4-5 hours', 'American Basin Trailhead', 'The easiest route up Handies. Famous for spectacular wildflower displays in July.'
FROM peaks WHERE slug = 'handies-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Grizzly Gulch', 7.5, 3200, 'Class 1', '5-7 hours', 'Grizzly Gulch Trailhead', 'A longer but scenic alternative from the Lake City side.'
FROM peaks WHERE slug = 'handies-peak';

-- Culebra Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Northwest Ridge', 11.0, 4200, 'Class 2', '8-10 hours', 'Cielo Vista Ranch', 'The only route on Colorado''s only private 14er. Access fee required through Cielo Vista Ranch - book in advance.'
FROM peaks WHERE slug = 'culebra-peak';

-- Ellingwood Point routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'South Face via Blanca', 8.0, 5000, 'Class 2', '8-10 hours', 'Lake Como Road (4WD)', 'Usually climbed as an add-on from Blanca Peak summit. Short traverse with minimal additional elevation gain.'
FROM peaks WHERE slug = 'ellingwood-point';

-- Mount Lindsey routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Northwest Ridge', 9.0, 3500, 'Class 3', '7-9 hours', 'Lily Lake Trailhead', 'The standard route featuring the Iron Nipple formation near the summit. Class 3 rock moves near the top.'
FROM peaks WHERE slug = 'mount-lindsey';

-- Little Bear Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Hourglass Couloir', 8.0, 4500, 'Class 4', '9-12 hours', 'Lake Como Road (4WD)', 'Colorado''s most dangerous 14er route. Extreme loose rock and rockfall danger. Multiple fatalities. For expert climbers only.'
FROM peaks WHERE slug = 'little-bear-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'West Ridge from Blanca', 10.0, 5200, 'Class 4', '10-14 hours', 'Lake Como Road (4WD)', 'The traverse from Blanca avoids the Hourglass but is still extremely challenging with serious exposure.'
FROM peaks WHERE slug = 'little-bear-peak';

-- Mount Sherman routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'South Slopes', 5.5, 2100, 'Class 2', '3-5 hours', 'Fourmile Creek Trailhead', 'One of the easiest 14ers in Colorado. Historic mining ruins add interest to this beginner-friendly route.'
FROM peaks WHERE slug = 'mount-sherman';

-- Redcloud Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Northeast Ridge', 9.0, 3700, 'Class 2', '6-8 hours', 'Silver Creek Trailhead', 'The standard route, almost always combined with Sunshine Peak via the connecting ridge.'
FROM peaks WHERE slug = 'redcloud-peak';

-- Pyramid Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Northeast Ridge', 8.0, 4500, 'Class 4', '8-12 hours', 'Maroon Lake Trailhead', 'A serious climb with loose rock throughout. Multiple route options near the summit, all involving Class 4 moves.'
FROM peaks WHERE slug = 'pyramid-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'West Face Keyhole', 9.0, 4600, 'Class 4', '9-12 hours', 'Maroon Lake Trailhead', 'An alternative line on the west face. Slightly more solid rock but still serious terrain.'
FROM peaks WHERE slug = 'pyramid-peak';

-- Wilson Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'West Ridge', 10.0, 4200, 'Class 4', '8-11 hours', 'Rock of Ages Trailhead', 'The standard route featuring exposed Class 4 rock near the summit. The peak on the Coors beer can.'
FROM peaks WHERE slug = 'wilson-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Silver Pick Road Approach', 7.0, 3600, 'Class 4', '7-10 hours', 'Silver Pick Basin (4WD)', 'Shorter approach via 4WD road but same summit challenges.'
FROM peaks WHERE slug = 'wilson-peak';

-- Wetterhorn Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Southeast Ridge', 7.0, 3100, 'Class 3', '6-8 hours', 'Matterhorn Creek Trailhead', 'The standard route with a fun Class 3 summit block. Can be combined with Matterhorn Peak.'
FROM peaks WHERE slug = 'wetterhorn-peak';

-- San Luis Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'East Slopes', 13.5, 3600, 'Class 1', '8-10 hours', 'Stewart Creek Trailhead', 'The gentlest 14er with the longest drive to any trailhead. A true wilderness experience.'
FROM peaks WHERE slug = 'san-luis-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'West Willow Creek', 11.0, 3500, 'Class 1', '7-9 hours', 'West Willow Creek Trailhead', 'An alternative approach from Creede with slightly shorter hiking distance.'
FROM peaks WHERE slug = 'san-luis-peak';

-- North Maroon Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Northeast Ridge', 10.0, 4400, 'Class 4', '10-14 hours', 'Maroon Lake Trailhead', 'Extremely loose and dangerous rock. The "Deadly Bells" claim lives regularly. For expert climbers only.'
FROM peaks WHERE slug = 'north-maroon-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Traverse from South Maroon', 12.0, 5000, 'Class 5', '12-16 hours', 'Maroon Lake Trailhead', 'One of the most dangerous traverses in Colorado. Technical climbing on the worst rock imaginable.'
FROM peaks WHERE slug = 'north-maroon-peak';

-- Mount of the Holy Cross routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'North Ridge (Halo Ridge)', 12.0, 5600, 'Class 2', '9-12 hours', 'Halfmoon Trailhead', 'The standard route with a significant approach. The famous cross-shaped couloir is best viewed from Notch Mountain.'
FROM peaks WHERE slug = 'mount-of-the-holy-cross';

-- Huron Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Northwest Slopes', 7.0, 3500, 'Class 2', '5-7 hours', 'South Winfield Trailhead', 'A scenic route passing Lake Ann. One of the most beautiful 14er approaches in Colorado.'
FROM peaks WHERE slug = 'huron-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Browns Creek', 12.0, 4800, 'Class 2', '8-10 hours', 'Browns Creek Trailhead', 'A longer eastern approach with more solitude.'
FROM peaks WHERE slug = 'huron-peak';

-- Sunshine Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Via Redcloud Peak', 11.0, 4400, 'Class 2', '7-9 hours', 'Silver Creek Trailhead', 'Almost always climbed with Redcloud via the scenic connecting ridge.'
FROM peaks WHERE slug = 'sunshine-peak';

-- Mount Bross routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'West Slopes (Decalibron)', 7.0, 3700, 'Class 2', '5-7 hours', 'Kite Lake Trailhead', 'Part of the Decalibron loop. Note: Private property issues may affect access - check current conditions before climbing.'
FROM peaks WHERE slug = 'mount-bross';

-- Mount Cameron routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Via Decalibron Loop', 6.5, 3500, 'Class 2', '5-7 hours', 'Kite Lake Trailhead', 'Summited as part of the Decalibron traverse between Lincoln and Democrat. Easy ridge walk.'
FROM peaks WHERE slug = 'mount-cameron';

-- Conundrum Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Via Castle Peak', 13.0, 4600, 'Class 2', '8-10 hours', 'Castle Creek Road Trailhead', 'A simple addition from Castle Peak summit. Short ridge walk with minimal additional effort.'
FROM peaks WHERE slug = 'conundrum-peak';

-- El Diente Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'North Slopes', 12.0, 4800, 'Class 4', '9-12 hours', 'Kilpacker Trailhead', 'The standard route with exposed Class 4 moves near the summit.'
FROM peaks WHERE slug = 'el-diente-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Traverse to Mount Wilson', 14.0, 5500, 'Class 5', '12-16 hours', 'Navajo Lake Trailhead', 'One of Colorado''s most challenging traverses with serious technical climbing on loose rock.'
FROM peaks WHERE slug = 'el-diente-peak';

-- Maroon Peak routes
INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'South Ridge', 9.0, 4500, 'Class 4', '9-12 hours', 'Maroon Lake Trailhead', 'The "easier" of the Deadly Bells routes. Still extremely dangerous with notoriously loose rock throughout.'
FROM peaks WHERE slug = 'maroon-peak';

INSERT INTO routes (peak_id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description)
SELECT id, 'Bell Cord Couloir', 8.0, 4400, 'Class 4', '8-11 hours', 'Maroon Lake Trailhead', 'A steep couloir route that''s preferred when filled with snow in early season. Rockfall danger high otherwise.'
FROM peaks WHERE slug = 'maroon-peak';
