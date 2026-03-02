-- Seed all Colorado 14er trailheads
-- Extracted and deduplicated from routes.trailhead text values.
-- Shared trailheads (e.g. Stevens Gulch, Kite Lake, South Colony Lakes) appear once.
-- After inserting, routes are linked via trailhead_id update.

INSERT INTO trailheads (slug, name, latitude, longitude, elevation_ft, road_type, parking_type, parking_capacity, restrooms, fee_required, winter_accessible, nearest_town, driving_notes, description)
VALUES

-- Sawatch Range ---------------------------------------------------------------

('mount-elbert-trailhead',
 'Mount Elbert Trailhead',
 39.113100, -106.445300, 10040,
 'gravel', 'lot', 'large', true, false, false,
 'Twin Lakes',
 'From Twin Lakes, take CO-82 west then turn south on Halfmoon Creek Road (CR-24). Paved to campground, then gravel to trailhead. High-clearance 2WD fine.',
 'The northeast trailhead for Colorado''s highest peak. Ample parking and vault toilets. Popular year-round; arrive early to secure a spot.'),

('south-mount-elbert-trailhead',
 'South Mount Elbert Trailhead',
 39.091400, -106.447000, 9580,
 'gravel', 'lot', 'medium', false, false, false,
 'Twin Lakes',
 'From Twin Lakes, take CO-82 west past the north trailhead. Follow signs south on a rough gravel road to the less-used south lot.',
 'Starting point for the quieter South Mount Elbert Trail. Less crowded than the northeast trailhead with good views into the aspen forests below.'),

('black-cloud-trailhead',
 'Black Cloud Trailhead',
 39.086000, -106.450000, 9720,
 'gravel', 'pulloff', 'small', false, false, false,
 'Twin Lakes',
 'Located south of Twin Lakes off CO-82. Follow gravel road past South Elbert Trailhead; the Black Cloud pulloff is a short distance beyond.',
 'Least-used Elbert trailhead, serving the steep and direct Black Cloud Trail. Small pulloff with no facilities.'),

('mount-massive-trailhead',
 'Mount Massive Trailhead',
 39.211300, -106.414000, 10060,
 'gravel', 'lot', 'medium', true, false, false,
 'Leadville',
 'From Leadville, head west on US-24 then south on Halfmoon Creek Road (CR-11). About 5 miles of gravel road; 2WD with decent clearance is fine.',
 'Primary trailhead for the standard Mount Massive trail. Vault toilet on site. Can be dusty in summer.'),

('halfmoon-campground',
 'Halfmoon Campground',
 39.162700, -106.386400, 10200,
 'gravel', 'lot', 'medium', true, true, false,
 'Leadville',
 'From Leadville, head west on US-24 then south on Halfmoon Creek Road (CR-11). The campground is about 4 miles in on the right. USFS fee site.',
 'Campground trailhead serving the southwest slopes approach to Mount Massive. Also used for Mount Elbert approaches. Fee required for day use.'),

('north-cottonwood-trailhead',
 'North Cottonwood Trailhead',
 38.858400, -106.322800, 9880,
 'gravel', 'lot', 'medium', true, false, false,
 'Buena Vista',
 'From Buena Vista, head west on Crossman Avenue / CR-350 (Cottonwood Pass Road). About 10 miles to the trailhead. Gravel road; 2WD fine in good conditions.',
 'Serves both Mount Harvard and Mount Columbia. The long approach through North Cottonwood Creek is beautiful but adds significant mileage.'),

('horn-fork-trailhead',
 'Horn Fork Trailhead',
 38.852000, -106.318000, 10004,
 'rough_2wd', 'lot', 'small', false, false, false,
 'Buena Vista',
 'Follow North Cottonwood Road west from Buena Vista. Before the main North Cottonwood Trailhead, a rougher spur leads to the Horn Fork basin parking area.',
 'Less-used entry point into Horn Fork Basin, offering a quieter approach to Mount Harvard''s east ridge.'),

('halfmoon-trailhead',
 'Halfmoon Trailhead',
 39.474000, -106.479000, 10320,
 'gravel', 'lot', 'medium', true, false, false,
 'Minturn',
 'From Minturn (I-70 exit 171), take US-24 south then turn west onto Tigiwon Road (FR-707). About 8 miles of maintained gravel road.',
 'Starting point for the Holy Cross standard route via Halo Ridge. Views of the famous cross-shaped couloir require a side trip to Notch Mountain.'),

('missouri-gulch-trailhead',
 'Missouri Gulch Trailhead',
 38.914000, -106.385000, 9680,
 'rough_2wd', 'lot', 'medium', false, false, false,
 'Vicksburg',
 'From US-24 near Granite, head west on Clear Creek Road (CR-390) past the ghost town of Vicksburg. Rough gravel last mile; high-clearance 2WD recommended.',
 'The hub trailhead for the Belford-Oxford-Missouri trio. Three major 14ers are accessible from this lot, making it very popular on summer weekends.'),

('vicksburg-trailhead',
 'Vicksburg Trailhead',
 38.948000, -106.389000, 9200,
 'gravel', 'lot', 'small', false, false, false,
 'Vicksburg',
 'From US-24 near Granite, head west on Clear Creek Road (CR-390) to the Vicksburg ghost town area. Gravel road, 2WD accessible.',
 'Lower trailhead near the historic Vicksburg townsite. Used for the Elkhead Pass approach to Mount Belford with a longer but more gradual ascent.'),

('south-winfield-trailhead',
 'South Winfield Trailhead',
 38.957000, -106.412000, 10560,
 'rough_2wd', 'lot', 'medium', false, false, false,
 'Winfield',
 'From US-24 near Granite, take Clear Creek Road (CR-390) west past Vicksburg to Winfield ghost town. Last 2 miles are rough; high-clearance 2WD strongly recommended.',
 'Primary trailhead for Huron Peak''s scenic northwest slopes route passing Lake Ann. The ghost town of Winfield adds historic character to the approach.'),

('browns-creek-trailhead',
 'Browns Creek Trailhead',
 38.793000, -106.159000, 9200,
 'gravel', 'lot', 'small', false, false, false,
 'Nathrop',
 'From US-285 near Nathrop, head west on CR-270 (Browns Creek Road). About 5 miles of gravel road to the trailhead.',
 'Eastern approach to Huron Peak with more solitude than the South Winfield route. Longer but gentler with varied terrain.'),

('blank-gulch-trailhead',
 'Blank Gulch Trailhead',
 38.583000, -106.152000, 9760,
 'gravel', 'lot', 'medium', false, false, false,
 'Poncha Springs',
 'From US-285 at Poncha Springs, head west on CR-240 (North Fork Road) then turn north on the Blank Gulch road. About 7 miles total from the highway.',
 'The standard departure point for Mount Shavano and Tabeguache Peak. Look for the Angel of Shavano snow formation on the east face in spring.'),

('placer-creek-trailhead',
 'Placer Creek Trailhead',
 38.564000, -106.178000, 9400,
 'gravel', 'pulloff', 'small', false, false, false,
 'Poncha Springs',
 'From US-285 south of Poncha Springs, turn west on the Placer Creek road. Rougher than Blank Gulch; 2WD with decent clearance needed.',
 'Less-trafficked trailhead for Shavano''s southwest ridge. Good option for hikers wanting more solitude on a long but rewarding route.'),

('mount-princeton-trailhead',
 'Mount Princeton Trailhead',
 38.742000, -106.242000, 9580,
 'rough_2wd', 'lot', 'medium', false, false, false,
 'Nathrop',
 'From US-285 at Nathrop, take CR-162 west toward Mount Princeton Hot Springs. Continue past the hot springs on Chalk Creek Road, then turn north at the trailhead sign.',
 'Closest trailhead to the Chalk Creek valley. A post-hike soak at the nearby hot springs is a local tradition.'),

('grouse-canyon-trailhead',
 'Grouse Canyon Trailhead',
 38.710000, -106.230000, 9200,
 'rough_2wd', 'pulloff', 'small', false, false, false,
 'Nathrop',
 'Take Chalk Creek Road (CR-162) west from Nathrop. Grouse Canyon Road branches south; high-clearance 2WD needed for the last mile.',
 'Southern approach to Mount Princeton via the South Ridge. Much less used than the standard route, offering a quiet alternative.'),

('denny-creek-trailhead',
 'Denny Creek Trailhead',
 38.836000, -106.300000, 9940,
 'rough_2wd', 'lot', 'medium', false, false, false,
 'Buena Vista',
 'From Buena Vista, head west on CR-306 (Cottonwood Pass Road). Turn south on the Yale trailhead road about 12 miles from town. Last mile is rough.',
 'The standard trailhead for Mount Yale. Steady climb through dense forest gives way to open alpine terrain above treeline.'),

('avalanche-gulch-trailhead',
 'Avalanche Gulch Trailhead',
 38.820000, -106.283000, 9600,
 'rough_2wd', 'pulloff', 'small', false, false, false,
 'Buena Vista',
 'From Cottonwood Pass Road (CR-306) west of Buena Vista, turn south at the Avalanche Gulch sign. Rough road to a small pulloff.',
 'Eastern approach to Mount Yale via Hartenstein Lake. The lake adds a scenic highlight to this longer but beautiful alternative route.'),

('la-plata-gulch-trailhead',
 'La Plata Gulch Trailhead',
 38.965800, -106.383000, 9760,
 'gravel', 'lot', 'medium', false, false, false,
 'Buena Vista',
 'From US-24 north of Buena Vista, turn west on CR-390. About 6 miles of good gravel road to the trailhead. 2WD fine.',
 'Standard departure for La Plata Peak''s northwest ridge. Pleasant approach through La Plata Gulch with consistent trail to the summit.'),

('south-la-plata-trailhead',
 'South La Plata Trailhead',
 38.940000, -106.378000, 10000,
 'gravel', 'pulloff', 'small', false, false, false,
 'Buena Vista',
 'Continue past the main La Plata Gulch trailhead on CR-390; the south pulloff is about 1 mile further with a rougher access road.',
 'Less-used southern approach to La Plata Peak with good views of the Ellingwood Ridge. More solitude than the standard route.'),

-- Sangre de Cristo Range ------------------------------------------------------

('south-colony-lakes-trailhead',
 'South Colony Lakes Trailhead',
 37.976000, -105.586000, 11680,
 'rough_2wd', 'lot', 'medium', false, false, false,
 'Westcliffe',
 'From Westcliffe, take CR-119 south then CR-120 west. The road becomes increasingly rough; high-clearance 2WD can usually make it to the main lot but 4WD is more comfortable. Lower 2WD lot adds 2 miles RT.',
 'Highest trailhead in the Crestone group, serving Crestone Peak, Crestone Needle, Humboldt Peak, and Kit Carson''s Outward Bound Couloir. Stunning setting below the Sangres.'),

('cottonwood-creek-trailhead',
 'Cottonwood Creek Trailhead',
 37.980000, -105.610000, 10200,
 'gravel', 'pulloff', 'small', false, false, false,
 'Moffat',
 'From Moffat on CO-17 in the San Luis Valley, head east on CR-T toward Crestone. Continue past the town on a gravel road into the mountains.',
 'North-side approach to Crestone Peak via the Northwest Couloir. Holds snow longer than the standard route and sees far less traffic.'),

('willow-creek-trailhead',
 'Willow Creek Trailhead',
 37.990000, -105.590000, 10600,
 'rough_2wd', 'lot', 'small', false, false, false,
 'Crestone',
 'From the town of Crestone, head south on Camino Baca Grande then continue into the mountains on the Willow Creek road. High-clearance 2WD needed.',
 'Access point for Challenger Point and Kit Carson Peak from the north. Named for the crew of Space Shuttle Challenger; a somber and beautiful approach.'),

('lily-lake-trailhead',
 'Lily Lake Trailhead',
 37.522000, -105.460000, 9340,
 'rough_2wd', 'lot', 'small', false, false, false,
 'Blanca',
 'From Blanca on US-160, head north on CR-31 (Huerfano County Road). Road becomes rough well before the trailhead; high-clearance 2WD needed.',
 'Starting point for Mount Lindsey''s northwest ridge featuring the distinctive Iron Nipple rock formation. Less visited than the Blanca group nearby.'),

('lake-como-road-4wd',
 'Lake Como Road (4WD)',
 37.557000, -105.496000, 8000,
 '4wd_high_clearance', 'pulloff', 'small', false, false, false,
 'Blanca',
 'From Blanca, head north on CR-31 to the Lake Como Road turnoff. The 4WD road climbs to Lake Como—it is notoriously rough and rocky, widely considered one of the most brutal 4WD roads in Colorado. Most hikers park at the lower 2WD lot (~4 miles below) and add 8 miles RT on foot.',
 'Lower access point for Blanca Peak, Ellingwood Point, and Little Bear Peak. Reaching Lake Como by 4WD shortens the hike significantly but demands a capable, high-clearance vehicle.'),

('huerfano-trailhead',
 'Huerfano Trailhead',
 37.570000, -105.420000, 9040,
 'gravel', 'lot', 'small', false, false, false,
 'Gardner',
 'From US-160 east of Blanca, turn north on CR-580 (Huerfano County Road). About 12 miles of gravel road to the trailhead near the Huerfano River crossing.',
 'Eastern approach to Blanca Peak avoiding the brutal Lake Como Road. A long, remote route better suited for backpacking than day hiking.'),

-- Front Range -----------------------------------------------------------------

('stevens-gulch-trailhead',
 'Stevens Gulch Trailhead',
 39.649000, -105.833000, 11240,
 'gravel', 'lot', 'large', true, false, false,
 'Georgetown',
 'From Georgetown (I-70 exit 228), take Guanella Pass Road south briefly, then turn west onto Stevens Gulch Road. About 4 miles of good gravel; 2WD fine. Early arrival essential on weekends.',
 'Highest-traffic trailhead in Colorado, serving both Grays and Torreys Peaks. Frequently reaching capacity by 6am on summer weekends. Vault toilets on site.'),

('longs-peak-trailhead',
 'Longs Peak Trailhead',
 40.272800, -105.558000, 9400,
 'paved', 'lot', 'large', true, true, false,
 'Estes Park',
 'From Estes Park, take CO-7 south about 9 miles. Turn west at the signed Longs Peak entrance. Paved road to a large NPS parking lot. Fee required (Rocky Mountain National Park pass or America the Beautiful).',
 'NPS trailhead within Rocky Mountain National Park. All Longs Peak routes—Keyhole, Loft, and Cables—begin here. The most technical standard 14er in Colorado. Hikers must start by 3am on the Keyhole Route to avoid afternoon storms.'),

('guanella-pass-trailhead',
 'Guanella Pass Trailhead',
 39.593800, -105.713000, 11669,
 'paved', 'lot', 'large', true, false, false,
 'Georgetown',
 'From Georgetown (I-70 exit 228), follow Guanella Pass Road south about 12 miles to the pass. Fully paved road, open year-round except after major snow events.',
 'High-elevation trailhead at Guanella Pass serving Mount Bierstadt and the Sawtooth-Evans traverse. One of the most accessible 14er starts near Denver.'),

('chicago-lakes-trailhead',
 'Chicago Lakes Trailhead',
 39.638000, -105.625000, 9920,
 'gravel', 'lot', 'medium', false, true, false,
 'Idaho Springs',
 'From Idaho Springs (I-70 exit 240), take Echo Lake Road (CR-65) south past Echo Lake to the trailhead. Small parking fee applies in summer.',
 'Lower trailhead for a full wilderness approach to Mount Evans. The Chicago Lakes route avoids the paved summit road and offers a genuine alpine experience.'),

('summit-lake-trailhead',
 'Summit Lake Trailhead',
 39.588000, -105.642000, 12840,
 'paved', 'lot', 'large', true, true, false,
 'Idaho Springs',
 'Drive the Mount Evans Scenic Byway (CO-5) from Echo Lake to Summit Lake. America''s highest paved road, typically open Memorial Day through Labor Day. Fee required.',
 'Highest drive-to trailhead for hiking Mount Evans. The spectacular paved road itself is an experience. Limited to hiking season when CO-5 is open.'),

('summit-parking-lot',
 'Summit Parking Lot',
 39.588400, -105.642900, 14130,
 'paved', 'lot', 'small', true, true, false,
 'Idaho Springs',
 'Drive the full length of CO-5 to the summit. America''s highest paved road ends at the top of Mount Evans. Fee required; seasonal.',
 'Summit-level parking for Colorado''s most drive-accessible 14er. A café and visitor area are typically open during the season.'),

-- Mosquito / Tenmile Range ----------------------------------------------------

('kite-lake-trailhead',
 'Kite Lake Trailhead',
 39.309000, -106.144000, 12000,
 'rough_2wd', 'lot', 'medium', false, false, false,
 'Alma',
 'From Alma, head west on CR-8 (Kite Lake Road). The road starts paved and becomes increasingly rough gravel/dirt. High-clearance 2WD recommended; 4WD safer for the last mile. Note: access to Mount Bross may be limited due to private property disputes—check current conditions.',
 'Highest trailhead for the famous Decalibron loop (Democrat, Cameron, Lincoln, Bross). One of Colorado''s most popular multi-peak days. Very crowded on summer weekends.'),

('quartzville-trailhead',
 'Quartzville Trailhead',
 39.351000, -106.069000, 11200,
 'rough_2wd', 'pulloff', 'small', false, false, false,
 'Alma',
 'From Alma, head east on CR-6 into the historic Quartzville mining district. Road is rough; high-clearance 2WD needed.',
 'Less-visited eastern approach to Mount Lincoln through historic mining terrain. Good alternative when Kite Lake is overcrowded.'),

('quandary-peak-trailhead',
 'Quandary Peak Trailhead',
 39.378000, -106.105000, 10850,
 'paved', 'lot', 'large', true, false, false,
 'Breckenridge',
 'From Breckenridge, take CO-9 south about 7 miles. The trailhead is on the right (west) side of the highway with a large paved lot. Very easy to find.',
 'Colorado''s most-hiked 14er trailhead. Paved lot fills by 7am on summer weekends. A USFS fee is being considered; check current status.'),

('mccullough-gulch-trailhead',
 'McCullough Gulch Trailhead',
 39.370000, -106.124000, 11000,
 'rough_2wd', 'lot', 'small', false, false, false,
 'Breckenridge',
 'From CO-9 south of Breckenridge, turn west onto Blue Lakes Road. Follow signs to McCullough Gulch. Last mile is rough; high-clearance 2WD recommended.',
 'Trailhead for the Cristo Couloir on Quandary Peak''s west face. Far less crowded than the standard east ridge trailhead.'),

('fourmile-creek-trailhead',
 'Fourmile Creek Trailhead',
 39.213000, -105.986000, 12240,
 'rough_2wd', 'lot', 'medium', false, false, false,
 'Fairplay',
 'From Fairplay, head west on Fourmile Creek Road (CR-18). The road climbs through historic mining terrain; high-clearance 2WD recommended. Very high starting elevation.',
 'High trailhead for one of Colorado''s easiest 14ers. Mount Sherman''s minimal technical challenge combined with historic mining ruins makes this a popular beginner peak.'),

-- Elk Range -------------------------------------------------------------------

('castle-creek-road-trailhead',
 'Castle Creek Road Trailhead',
 39.100000, -106.848000, 9580,
 'rough_2wd', 'lot', 'medium', false, false, false,
 'Aspen',
 'From Aspen, head south on Castle Creek Road (CR-15). About 12 miles of road, paved at first then transitioning to maintained gravel. Trailhead parking area is on the left.',
 'Access for Castle Peak and Conundrum Peak via the Montezuma Basin approach. The scenic basin below the summits is one of the most beautiful in the Elks.'),

('pearl-pass-trailhead',
 'Pearl Pass Trailhead',
 38.898000, -106.934000, 10600,
 'rough_2wd', 'lot', 'small', false, false, false,
 'Aspen',
 'Continue past the Castle Creek Road Trailhead toward Pearl Pass (a historic 4WD/mountain bike route to Crested Butte). Last miles are rough; high-clearance 2WD needed.',
 'Alternate access for Castle Peak from the south via Pearl Pass Road. Historic route connecting Aspen and Crested Butte across the Elk Range.'),

('maroon-lake-trailhead',
 'Maroon Lake Trailhead',
 39.093000, -106.943000, 9580,
 'paved', 'lot', 'large', true, true, false,
 'Aspen',
 'From Aspen, take Maroon Creek Road west. In summer (late June–early October), the road is closed to private vehicles past the T-Lazy-7 Ranch; take the free shuttle bus from Aspen Highlands. Fee required. Outside shuttle season, driving is permitted.',
 'The famous "Maroon Bells" trailhead, serving Pyramid Peak, North Maroon Peak, and Maroon Peak. The most-photographed spot in Colorado. The Maroon Bells are nicknamed the "Deadly Bells" for their notoriously loose and dangerous rock—treat all routes here with extreme caution.'),

('capitol-creek-trailhead',
 'Capitol Creek Trailhead',
 39.168000, -107.090000, 9070,
 'gravel', 'lot', 'medium', false, false, false,
 'Basalt',
 'From Basalt, head west on Fryingpan Road briefly then turn south on Capitol Creek Road. About 12 miles of good gravel road. 2WD fine.',
 'Gateway to Capitol Peak, considered the most dangerous standard 14er route in Colorado. The 17-mile round trip with the infamous Knife Edge ridge requires experience and nerve.'),

('west-snowmass-trailhead',
 'West Snowmass Trailhead',
 39.170000, -107.140000, 8900,
 'gravel', 'lot', 'small', false, false, false,
 'Basalt',
 'From Basalt, head west and then south via CR-103 / Snowmass Creek Road. About 14 miles of gravel road.',
 'Less-used western approach to Capitol Peak. Avoids the Knife Edge but presents its own serious routefinding challenges on the west face.'),

('snowmass-creek-trailhead',
 'Snowmass Creek Trailhead',
 39.188000, -107.020000, 8380,
 'gravel', 'lot', 'medium', false, false, false,
 'Snowmass Village',
 'From Snowmass Village, take Owl Creek Road south then turn onto Snowmass Creek Road. About 10 miles of gravel from the village.',
 'Starting point for the long S-Ridge approach to Snowmass Mountain. Most parties backpack to Snowmass Lake (9 miles in) and summit from camp.'),

('lead-king-basin',
 'Lead King Basin',
 39.057000, -107.220000, 9400,
 'rough_2wd', 'lot', 'small', false, false, false,
 'Marble',
 'From Marble, CO, take CR-314 (Crystal River Road) east past the Crystal ghost town to Lead King Basin. The road is famously rough—high-clearance 2WD minimum, 4WD preferred.',
 'Remote western access for Snowmass Mountain. Crystal ghost town and mill make the drive an attraction in its own right.'),

-- San Juan Range --------------------------------------------------------------

('nellie-creek-trailhead-4wd',
 'Nellie Creek Trailhead (4WD)',
 38.094000, -107.458000, 11400,
 '4wd_required', 'pulloff', 'small', false, false, false,
 'Lake City',
 'From Lake City, take CO-149 north then turn west on Engineer Pass Road (CR-30). Turn south on Nellie Creek Road; the last 4 miles are steep and rocky, requiring 4WD with good clearance.',
 'Upper trailhead for Uncompahgre Peak, the highest San Juan summit. 4WD vehicles save 8 miles of hiking. Hikers in 2WD vehicles park below and walk the road.'),

('matterhorn-creek-trailhead',
 'Matterhorn Creek Trailhead',
 38.097000, -107.495000, 10200,
 'rough_2wd', 'lot', 'small', false, false, false,
 'Lake City',
 'From Lake City, take CO-149 north and turn west on Alpine Gulch Road (CR-30 area). Follow signs to Matterhorn Creek. High-clearance 2WD recommended.',
 'Serves Uncompahgre Peak''s west face and Wetterhorn Peak''s standard southeast ridge route. Wetterhorn can be combined with Matterhorn Peak for a longer day.'),

('american-basin-trailhead',
 'American Basin Trailhead',
 37.958000, -107.584000, 11600,
 'rough_2wd', 'lot', 'medium', false, false, false,
 'Lake City',
 'From Lake City, take CO-149 south then head west on CR-30 (Engineer Pass Road). Turn south into American Basin about 14 miles from Lake City. High-clearance 2WD needed for the last 2 miles.',
 'Trailhead for Handies Peak''s shortest and most popular route. Famous for July wildflower displays that are among the best in Colorado.'),

('grizzly-gulch-trailhead',
 'Grizzly Gulch Trailhead',
 37.972000, -107.520000, 10400,
 'rough_2wd', 'lot', 'small', false, false, false,
 'Lake City',
 'From Lake City, take CO-149 south, then head west on the road toward Sherman townsite. Turn south into Grizzly Gulch. Rough road; high-clearance 2WD needed.',
 'Less-visited approach to Handies Peak from the Lake City side. A longer route with more solitude than the popular American Basin trail.'),

('silver-creek-trailhead',
 'Silver Creek Trailhead',
 37.954000, -107.489000, 10880,
 'rough_2wd', 'lot', 'medium', false, false, false,
 'Lake City',
 'From Lake City, head south on CO-149 then turn west onto the Cinnamon Pass Road (CR-30). The Silver Creek trailhead is about 5 miles up; high-clearance 2WD needed.',
 'Hub trailhead for Redcloud and Sunshine Peaks, almost always climbed together via the connecting ridge. Very popular for a relatively accessible double-summit day.'),

('stewart-creek-trailhead',
 'Stewart Creek Trailhead',
 37.912000, -107.049000, 10480,
 'rough_2wd', 'lot', 'small', false, false, false,
 'Creede',
 'From Creede, head west on CO-149 then turn south on the Stewart Creek Road. Long drive on rough gravel; high-clearance 2WD needed. Plan extra time for the approach.',
 'Remote trailhead for San Luis Peak, the gentlest 14er. The long drive is part of why this peak sees less traffic—a true wilderness experience in the La Garita range.'),

('west-willow-creek-trailhead',
 'West Willow Creek Trailhead',
 37.928000, -107.097000, 10200,
 'rough_2wd', 'lot', 'small', false, false, false,
 'Creede',
 'From Creede, head west briefly on CO-149 then take the West Willow Creek Road south into the mountains. Rough gravel; high-clearance 2WD needed.',
 'Alternative approach to San Luis Peak starting from the Creede side. Slightly shorter hiking mileage than the Stewart Creek route.'),

('yankee-boy-basin-4wd',
 'Yankee Boy Basin (4WD)',
 38.002000, -107.760000, 11400,
 '4wd_high_clearance', 'lot', 'medium', false, false, false,
 'Ouray',
 'From Ouray, head south on US-550 briefly then turn west onto CR-361 (Camp Bird Road). Continue past Camp Bird Mine to Yankee Boy Basin. The road becomes extremely rough; 4WD high-clearance essential.',
 'Spectacular upper basin trailhead for Mount Sneffels. The drive through Camp Bird Mine and up to the basin is one of Colorado''s most dramatic. Famous for July wildflowers.'),

('blue-lakes-trailhead',
 'Blue Lakes Trailhead',
 38.028000, -107.798000, 9350,
 'rough_2wd', 'lot', 'medium', false, false, false,
 'Ridgway',
 'From Ridgway, take CO-62 west then turn south on CR-7 (Dallas Creek Road). About 9 miles of maintained gravel to the Blue Lakes parking area.',
 'Access point for the beautiful Blue Lakes approach to Mount Sneffels. The turquoise Blue Lakes are a destination in their own right.'),

('rock-of-ages-trailhead',
 'Rock of Ages Trailhead',
 37.878000, -107.890000, 9400,
 'rough_2wd', 'lot', 'medium', false, false, false,
 'Telluride',
 'From Telluride, drive south on CO-145 then turn west on FR-622 (Silver Pick Road). Follow signs toward Rock of Ages. Road is rough; high-clearance 2WD needed.',
 'Trailhead for both Mount Wilson and Wilson Peak—two of the most remote and demanding 14ers in Colorado. The area is beautiful and far from crowds.'),

('navajo-lake-trailhead',
 'Navajo Lake Trailhead',
 37.840000, -107.950000, 8400,
 'rough_2wd', 'lot', 'small', false, false, false,
 'Dolores',
 'From Dolores, take CO-145 northeast toward Rico, then turn west on West Dolores Road (FR-535). Follow signs to Navajo Lake trailhead. Long gravel approach; high-clearance 2WD needed.',
 'Southern trailhead for Mount Wilson and El Diente, allowing the classic and extremely challenging traverse between the two peaks.'),

('kilpacker-trailhead',
 'Kilpacker Trailhead',
 37.819000, -107.988000, 9400,
 'rough_2wd', 'lot', 'small', false, false, false,
 'Dolores',
 'From Dolores, take CO-145 northeast then turn west on West Dolores Road (FR-535). The Kilpacker Creek road branches north; rough gravel, high-clearance 2WD needed.',
 'Northern access for El Diente Peak, the westernmost Colorado 14er. Very remote and rarely crowded.'),

('silver-pick-basin-4wd',
 'Silver Pick Basin (4WD)',
 37.872000, -107.855000, 10200,
 '4wd_required', 'lot', 'small', false, false, false,
 'Telluride',
 'From Telluride, head south on CO-145 then turn west on Silver Pick Road (FR-622). Continue to the upper basin; requires 4WD with good clearance.',
 'Upper access point for Wilson Peak, shortening the hike significantly compared to the Rock of Ages approach. The peak gained fame as the mountain on Coors beer cans.'),

('purgatory-flats-trailhead',
 'Purgatory Flats Trailhead',
 37.814000, -107.866000, 8200,
 'paved', 'lot', 'medium', true, false, true,
 'Durango',
 'Located at the Durango & Silverton Narrow Gauge Railroad''s Needleton stop. Most hikers take the historic steam train from Durango (reservations required) and are dropped at Needleton, then hike in to Purgatory Flats.',
 'Unique train-access trailhead for Chicago Basin''s three 14ers: Mount Eolus, Windom Peak, and Sunlight Peak. The D&SNG Railroad makes this one of the most memorable 14er approaches anywhere. Backpacking strongly recommended—base camp at Twin Lakes in the basin.'),

-- Pikes Peak ------------------------------------------------------------------

('barr-trail-trailhead',
 'Barr Trail Trailhead',
 38.862600, -104.936000, 6800,
 'paved', 'lot', 'large', true, false, true,
 'Manitou Springs',
 'In Manitou Springs (US-24 west of Colorado Springs), follow signs to Ruxton Avenue. The Barr Trail trailhead is at the west end of town near the cog railway depot. Ample street and lot parking.',
 'Starting point for the legendary Barr Trail, the classic marathon route to Pikes Peak. Most hikers take two days with an overnight at Barr Camp (advance reservations recommended). The Pikes Peak Marathon in August runs this entire route.'),

('crags-campground',
 'Crags Campground',
 38.889800, -105.183000, 10100,
 'gravel', 'lot', 'medium', true, true, false,
 'Divide',
 'From Divide on US-24, take CO-67 south toward Cripple Creek. Turn west on CR-62 to the Crags Campground. About 4 miles of good gravel. USFS fee site.',
 'Shortest hiking route to Pikes Peak summit, starting from the northwest side. A fee campground trailhead offering a much more reasonable approach than the Barr Trail.'),

('manitou-springs-depot',
 'Manitou Springs Depot',
 38.859400, -104.916000, 6350,
 'paved', 'lot', 'large', true, false, true,
 'Manitou Springs',
 'Located on Ruxton Avenue in Manitou Springs. Follow signs from US-24. Ample public parking nearby.',
 'Departure point for the Pikes Peak Cog Railway, the highest cog railway in North America. Reservations required and sell out weeks in advance in summer. Historic experience with guaranteed summit access regardless of fitness level.'),

-- Baldwin Gulch (Mount Antero) -----------------------------------------------

('baldwin-gulch-4wd',
 'Baldwin Gulch (4WD High)',
 38.707000, -106.348000, 11300,
 '4wd_high_clearance', 'pulloff', 'small', false, false, false,
 'Nathrop',
 'From US-285 near Nathrop, turn west on CR-162 (Chalk Creek Road) and continue past St. Elmo ghost town. Turn south up Baldwin Gulch. The road is extremely rough; 4WD with high clearance required.',
 'Upper trailhead for Mount Antero, famous for its aquamarine and other gem crystals. Reaching this lot by 4WD makes it one of the shortest 14er routes. The ghost town of St. Elmo is nearby.'),

('baldwin-gulch-2wd',
 'Baldwin Gulch (2WD)',
 38.727000, -106.348000, 10000,
 'rough_2wd', 'pulloff', 'small', false, false, false,
 'Nathrop',
 'From US-285 near Nathrop, turn west on CR-162 (Chalk Creek Road) past St. Elmo. The 2WD parking area is at the base of the rough upper Baldwin Gulch road. From here, walk the road to the upper trailhead.',
 'Lower access point for Mount Antero when 4WD is not available. Adds roughly 4 miles each way but the road walk itself is scenic and passes through old mining country.'),

-- Private / Unique ------------------------------------------------------------

('cielo-vista-ranch',
 'Cielo Vista Ranch',
 37.009000, -105.200000, 9000,
 'gravel', 'lot', 'small', false, true, false,
 'San Luis',
 'From San Luis (the oldest incorporated town in Colorado), head south on local roads. The ranch is accessed by appointment only—book and pay the access fee in advance through the Cielo Vista Ranch website.',
 'The only access point for Culebra Peak, Colorado''s only fee-based private 14er. The Cielo Vista Ranch charges a per-person fee. Reservations are essential. The ranch land is well-maintained with a good trail.')

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  elevation_ft = EXCLUDED.elevation_ft,
  road_type = EXCLUDED.road_type,
  parking_type = EXCLUDED.parking_type,
  parking_capacity = EXCLUDED.parking_capacity,
  restrooms = EXCLUDED.restrooms,
  fee_required = EXCLUDED.fee_required,
  winter_accessible = EXCLUDED.winter_accessible,
  nearest_town = EXCLUDED.nearest_town,
  driving_notes = EXCLUDED.driving_notes,
  description = EXCLUDED.description;


-- Link routes to trailheads via the routes.trailhead text column
-- Each UPDATE matches the text value currently stored on the route.

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'mount-elbert-trailhead')
  WHERE trailhead = 'Mount Elbert Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'south-mount-elbert-trailhead')
  WHERE trailhead = 'South Mount Elbert Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'black-cloud-trailhead')
  WHERE trailhead = 'Black Cloud Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'mount-massive-trailhead')
  WHERE trailhead = 'Mount Massive Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'halfmoon-campground')
  WHERE trailhead = 'Halfmoon Campground';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'north-cottonwood-trailhead')
  WHERE trailhead = 'North Cottonwood Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'horn-fork-trailhead')
  WHERE trailhead = 'Horn Fork Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'lake-como-road-4wd')
  WHERE trailhead = 'Lake Como Road (4WD)';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'huerfano-trailhead')
  WHERE trailhead = 'Huerfano Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'la-plata-gulch-trailhead')
  WHERE trailhead = 'La Plata Gulch Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'south-la-plata-trailhead')
  WHERE trailhead = 'South La Plata Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'nellie-creek-trailhead-4wd')
  WHERE trailhead = 'Nellie Creek Trailhead (4WD)';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'matterhorn-creek-trailhead')
  WHERE trailhead = 'Matterhorn Creek Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'south-colony-lakes-trailhead')
  WHERE trailhead = 'South Colony Lakes Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'cottonwood-creek-trailhead')
  WHERE trailhead = 'Cottonwood Creek Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'kite-lake-trailhead')
  WHERE trailhead = 'Kite Lake Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'quartzville-trailhead')
  WHERE trailhead = 'Quartzville Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'stevens-gulch-trailhead')
  WHERE trailhead = 'Stevens Gulch Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'baldwin-gulch-4wd')
  WHERE trailhead = 'Baldwin Gulch (4WD High)';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'baldwin-gulch-2wd')
  WHERE trailhead = 'Baldwin Gulch (2WD)';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'castle-creek-road-trailhead')
  WHERE trailhead = 'Castle Creek Road Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'pearl-pass-trailhead')
  WHERE trailhead = 'Pearl Pass Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'quandary-peak-trailhead')
  WHERE trailhead = 'Quandary Peak Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'mccullough-gulch-trailhead')
  WHERE trailhead = 'McCullough Gulch Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'summit-lake-trailhead')
  WHERE trailhead = 'Summit Lake Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'chicago-lakes-trailhead')
  WHERE trailhead = 'Chicago Lakes Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'summit-parking-lot')
  WHERE trailhead = 'Summit Parking Lot';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'longs-peak-trailhead')
  WHERE trailhead = 'Longs Peak Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'rock-of-ages-trailhead')
  WHERE trailhead = 'Rock of Ages Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'navajo-lake-trailhead')
  WHERE trailhead = 'Navajo Lake Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'blank-gulch-trailhead')
  WHERE trailhead = 'Blank Gulch Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'placer-creek-trailhead')
  WHERE trailhead = 'Placer Creek Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'mount-princeton-trailhead')
  WHERE trailhead = 'Mount Princeton Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'grouse-canyon-trailhead')
  WHERE trailhead = 'Grouse Canyon Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'missouri-gulch-trailhead')
  WHERE trailhead = 'Missouri Gulch Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'vicksburg-trailhead')
  WHERE trailhead = 'Vicksburg Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'denny-creek-trailhead')
  WHERE trailhead = 'Denny Creek Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'avalanche-gulch-trailhead')
  WHERE trailhead = 'Avalanche Gulch Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'yankee-boy-basin-4wd')
  WHERE trailhead = 'Yankee Boy Basin (4WD)';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'blue-lakes-trailhead')
  WHERE trailhead = 'Blue Lakes Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'capitol-creek-trailhead')
  WHERE trailhead = 'Capitol Creek Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'west-snowmass-trailhead')
  WHERE trailhead = 'West Snowmass Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'barr-trail-trailhead')
  WHERE trailhead = 'Barr Trail Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'crags-campground')
  WHERE trailhead = 'Crags Campground';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'manitou-springs-depot')
  WHERE trailhead = 'Manitou Springs Depot';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'snowmass-creek-trailhead')
  WHERE trailhead = 'Snowmass Creek Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'lead-king-basin')
  WHERE trailhead = 'Lead King Basin';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'purgatory-flats-trailhead')
  WHERE trailhead = 'Purgatory Flats Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'willow-creek-trailhead')
  WHERE trailhead = 'Willow Creek Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'guanella-pass-trailhead')
  WHERE trailhead = 'Guanella Pass Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'american-basin-trailhead')
  WHERE trailhead = 'American Basin Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'grizzly-gulch-trailhead')
  WHERE trailhead = 'Grizzly Gulch Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'cielo-vista-ranch')
  WHERE trailhead = 'Cielo Vista Ranch';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'lily-lake-trailhead')
  WHERE trailhead = 'Lily Lake Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'fourmile-creek-trailhead')
  WHERE trailhead = 'Fourmile Creek Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'silver-creek-trailhead')
  WHERE trailhead = 'Silver Creek Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'maroon-lake-trailhead')
  WHERE trailhead = 'Maroon Lake Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'silver-pick-basin-4wd')
  WHERE trailhead = 'Silver Pick Basin (4WD)';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'stewart-creek-trailhead')
  WHERE trailhead = 'Stewart Creek Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'west-willow-creek-trailhead')
  WHERE trailhead = 'West Willow Creek Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'halfmoon-trailhead')
  WHERE trailhead = 'Halfmoon Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'south-winfield-trailhead')
  WHERE trailhead = 'South Winfield Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'browns-creek-trailhead')
  WHERE trailhead = 'Browns Creek Trailhead';

UPDATE routes SET trailhead_id = (SELECT id FROM trailheads WHERE slug = 'kilpacker-trailhead')
  WHERE trailhead = 'Kilpacker Trailhead';
