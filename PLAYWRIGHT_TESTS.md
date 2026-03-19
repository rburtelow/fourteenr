# Playwright Test Plan

Incremental test plan organized by feature area. Each item is scoped to be a single test (or small test file).

---

## 1. Navigation & Layout (start here — foundational)

1. **Nav links render and route correctly** — Verify Home, Peaks, Trailheads, Community links exist and navigate to the right pages
2. **Mobile nav opens/closes** — Hamburger menu toggles, links work on mobile viewport
3. **Auth-gated nav items** — Logged-out users don't see Groups/Events links; logged-in users do
4. **Global search opens and accepts input** — Search bar renders, accepts text, shows results area

## 2. Peaks

5. **Peaks listing page loads with cards** — `/peaks` renders a grid of peak cards with name, elevation, difficulty
6. **Peaks filtering** — Filter pills (range, difficulty, class) update the displayed peaks
7. **Peaks sorting** — Sort by name/elevation changes card order
8. **Peak detail page renders** — `/peaks/[slug]` shows hero, elevation, routes, weather forecast
9. **Peak routes section** — Routes list on detail page shows route name, class, trailhead
10. **Peak watchlist toggle** — Logged-in user can add/remove a peak from watchlist with optimistic UI

## 3. Weather & Forecasts

11. **Peak forecast card renders** — Peak detail page shows weather card with temperature, wind, risk level
12. **Risk level badges display correctly** — LOW/MODERATE/HIGH/EXTREME show correct colors
13. **Summit window info renders** — Best summit hour and morning average score display
14. **Condition flags render** — Wind risk, thunderstorm risk, snow risk flags show when applicable

## 4. Trailheads

15. **Trailheads listing page loads** — `/trailheads` renders grid of trailhead cards
16. **Trailheads filtering** — Filter by road type, parking, winter accessible, fee
17. **Trailheads sorting** — Sort by name, elevation, route count
18. **Trailhead detail page renders** — `/trailheads/[slug]` shows name, elevation, road type, parking, routes
19. **Trailhead links from peak page** — Peak detail page shows trailhead info with links to `/trailheads/[slug]`
20. **Trailhead recent conditions** — Detail page shows trip report access ratings timeline

## 5. Community Feed (authenticated)

21. **Community page loads** — `/community` renders three-column layout with feed
22. **Feed posts render** — Posts show author, content, timestamps, engagement counts
23. **Feed filtering tabs exist** — Latest/Following/Conditions tabs render
24. **Sidebar panels render** — Trending peaks, upcoming events, weather widget show content

## 6. Community Feed actions (authenticated)

25. **Post composer renders for logged-in user** — Textarea and Post button appear
26. **Create a text post** — Type content, submit, verify post appears in feed
27. **Create a post with peak tag** — Select a peak from dropdown, submit, verify peak badge on post
28. **Create a condition report post** — Toggle condition report checkbox, submit, verify badge
29. **Like a post** — Click like, verify count increments and heart fills
30. **Unlike a post** — Click filled heart, verify count decrements
31. **Save/bookmark a post** — Click save, verify bookmark fills
32. **Add a comment** — Expand comments, type and submit, verify comment appears
33. **Delete own comment** — Delete button appears on own comment, removes it
34. **Delete own post** — More menu on own post shows delete, removes post from feed
35. **Load more posts (pagination)** — Click "Load More Stories", verify additional posts appear
36. **Feed filter: Latest** — Tab shows all posts sorted by newest
37. **Feed filter: Conditions** — Tab shows only condition report posts
38. **Realtime post appearance** — Post created in one tab appears in another tab's feed

## 7. Activity Feed Auto-Posts

39. **Summit log auto-post renders** — Green-tinted card with mountain icon, peak name, elevation
40. **Summit log auto-post links to peak** — Clicking peak name navigates to `/peaks/[slug]`
41. **Badge earned auto-post renders** — Amber-tinted card with badge icon, name, description
42. **Auto-posts support likes/comments** — Engagement buttons work on activity posts

## 8. Trip Reports

43. **Trip report modal opens from peak page** — "Log Summit" button opens modal
44. **Trip report form fields render** — Date, route, difficulty rating, conditions, narrative fields present
45. **Submit a basic trip report** — Fill required fields, submit, verify success
46. **Trip report ratings sliders** — Difficulty, condition severity, objective risk score (1-5) work
47. **Snow conditions toggle** — Enabling "snow present" reveals snow depth and traction fields
48. **Trip report shows on peak page** — Submitted report appears in the peak's reports section
49. **Trip report detail page** — `/reports/[id]` renders full report with all sections
50. **Trailhead auto-populates on route selection** — Selecting a route shows trailhead name

## 9. Groups — CRUD & Discovery

51. **Groups listing page loads** — `/groups` renders grid of group cards
52. **Create a group** — Fill name, description, category, submit, redirect to group page
53. **Group profile page renders** — `/groups/[slug]` shows cover, name, description, member count
54. **Group search** — Search by name filters group cards
55. **Group category filter** — Filter by category updates displayed groups
56. **Group sort** — Sort by newest/most members/recently active

## 10. Groups — Membership

57. **Join a public group** — Click "Join", verify member count increments, button changes to "Leave"
58. **Leave a group** — Click "Leave Group", verify removal
59. **Request to join private group** — Click "Request to Join", verify pending state
60. **Admin approves join request** — Requests tab shows pending, approve changes member to active
61. **Admin denies join request** — Deny removes the pending member
62. **Private group hides content from non-members** — Non-member sees only name/description, no feed

## 11. Groups — Feed & Posts

63. **Group feed renders for members** — Group page shows posts scoped to group
64. **Post to a group** — Composer in group creates post with group_id, appears in group feed
65. **Group post does NOT appear in main feed** — Verify group-scoped post is absent from `/community`
66. **Pin a post (admin)** — Admin pins post, it appears at top with "Pinned" badge
67. **Unpin a post (admin)** — Unpin removes the badge and repositions
68. **Remove a post (mod/admin)** — Moderator can delete any post in the group

## 12. Groups — Settings & Admin

69. **Group settings page renders for admin** — Settings accessible, shows edit fields
70. **Edit group details** — Change name/description, save, verify changes
71. **Promote member to moderator** — Admin promotes, role badge updates
72. **Ban a member** — Admin bans, member removed from list
73. **Transfer admin role** — Transfer to another member, verify role swap
74. **Delete a group** — Confirmation dialog, group removed

## 13. Groups — Events & Activity

75. **Create a group event** — Event modal with group pre-filled, event appears in group Events tab
76. **Group event RSVP** — RSVP button works, attendee count updates
77. **My Groups sidebar** — Community sidebar shows user's groups with links
78. **Profile shows public group memberships** — `/u/[username]` lists groups

## 14. Events

79. **Upcoming events render in sidebar** — Community page shows event cards
80. **Event RSVP toggle** — Click attend/unattend, count updates
81. **View All Events page** — Events listing page renders

## 15. Notifications

82. **Notification bell shows unread count** — Bell icon displays count badge
83. **Notification dropdown renders** — Click bell, dropdown shows recent notifications
84. **Mark notification as read** — Click notification, read state updates
85. **Like notification generated** — Liking a post creates notification for author
86. **Comment notification generated** — Commenting creates notification for post author

## 16. User Profile

87. **Profile page renders** — `/u/[username]` shows name, avatar, summit count, badges
88. **Recent badges section** — Profile shows earned badges with icons
89. **Summit log history** — Profile shows list of logged summits
90. **Follow/unfollow a user** — Toggle follow button, follower count updates

---

## Recommended Order

Start with **group 1 (Nav)** since those tests verify basic app health. Then **group 2 (Peaks)** and **group 5 (Community unauthenticated)** — these test read-only pages and don't require auth setup. Next tackle **group 6 (Community authenticated)** which requires setting up a test auth flow. From there, pick any feature group based on what you're actively building.

Each numbered item is a single, self-contained test (or small test file) you can ask Claude to implement one at a time.
