import HikeTimeline from '../components/HikeTimeline';
import HikeTimelineHorizontal from '../components/HikeTimelineHorizontal';

const sampleHikes = [
  {
    id: '1',
    peakName: 'Mt. Elbert',
    elevation: 14433,
    date: '2024-08-15',
    routeName: 'Northeast Ridge',
    distance: 9.5,
    elevationGain: 4700,
    duration: '6h 30m',
    conditions: 'excellent' as const,
    notes:
      'Perfect bluebird day with calm winds. Started at 5am and summited by 9:30am. Could see all the way to the Maroon Bells.',
    imageUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  },
  {
    id: '2',
    peakName: 'Mt. Massive',
    elevation: 14421,
    date: '2024-07-22',
    routeName: 'Mt. Massive Trail',
    distance: 14.0,
    elevationGain: 4500,
    duration: '8h 15m',
    conditions: 'good' as const,
    notes:
      'Long but rewarding hike. Afternoon thunderstorms rolled in around 1pm but we made it down safely.',
  },
  {
    id: '3',
    peakName: 'Grays Peak',
    elevation: 14270,
    date: '2024-06-10',
    routeName: 'North Slopes',
    distance: 8.0,
    elevationGain: 3000,
    duration: '5h 00m',
    conditions: 'excellent' as const,
    imageUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  },
  {
    id: '4',
    peakName: 'Torreys Peak',
    elevation: 14267,
    date: '2024-06-10',
    routeName: 'Kelso Ridge',
    distance: 8.5,
    elevationGain: 3300,
    duration: '5h 30m',
    conditions: 'good' as const,
    notes: 'Combined with Grays Peak for a great combo day.',
  },
  {
    id: '5',
    peakName: 'Quandary Peak',
    elevation: 14265,
    date: '2023-09-02',
    routeName: 'East Ridge',
    distance: 6.75,
    elevationGain: 3450,
    duration: '4h 45m',
    conditions: 'fair' as const,
    notes: 'Crowded trail but beautiful fall colors starting to appear.',
    imageUrl:
      'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80',
  },
  {
    id: '6',
    peakName: 'Longs Peak',
    elevation: 14255,
    date: '2023-08-12',
    routeName: 'Keyhole Route',
    distance: 15.0,
    elevationGain: 5100,
    duration: '12h 00m',
    conditions: 'challenging' as const,
    notes:
      'Technical and exposed. Started at 2am to beat the weather. The Narrows and Homestretch were intense.',
    imageUrl:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80',
  },
  {
    id: '7',
    peakName: 'Mt. Bierstadt',
    elevation: 14060,
    date: '2023-07-04',
    routeName: 'West Slopes',
    distance: 7.0,
    elevationGain: 2850,
    duration: '4h 30m',
    conditions: 'excellent' as const,
    notes: 'July 4th summit! Great views of the Sawtooth.',
  },
  {
    id: '8',
    peakName: 'Handies Peak',
    elevation: 14048,
    date: '2022-08-20',
    routeName: 'Grizzly Gulch',
    distance: 5.5,
    elevationGain: 2400,
    duration: '4h 00m',
    conditions: 'excellent' as const,
    notes: 'Short and sweet. One of the easier 14ers with stunning views.',
    imageUrl:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
  },
];

export default function TimelineDemoPage() {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-border-app)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <h1
            className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Hike Timeline Components
          </h1>
          <p className="mt-2 text-lg text-[var(--color-text-secondary)]">
            Beautiful timeline views for tracking your completed 14er summits.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Horizontal Timeline */}
        <section className="mb-16">
          <div className="mb-4 flex items-center gap-3">
            <div className="px-4 py-2 bg-[var(--color-brand-primary)] text-white rounded-lg inline-block">
              <code className="text-sm font-medium">HikeTimelineHorizontal</code>
            </div>
            <span className="text-sm text-[var(--color-text-secondary)]">
              Scrollable horizontal timeline with detail panel
            </span>
          </div>
          <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-6 shadow-sm">
            <HikeTimelineHorizontal hikes={sampleHikes} title="My Summit Journey" />
          </div>
        </section>

        {/* Divider */}
        <div className="relative my-16">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-border-app)]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[var(--color-page)] px-4 text-sm text-[var(--color-text-secondary)]">
              or use vertical layout
            </span>
          </div>
        </div>

        {/* Vertical Timeline */}
        <section className="mb-16">
          <div className="mb-4 flex items-center gap-3">
            <div className="px-4 py-2 bg-[var(--color-surface-subtle)] rounded-lg inline-block">
              <code className="text-sm text-[var(--color-brand-primary)] font-medium">
                HikeTimeline
              </code>
            </div>
            <span className="text-sm text-[var(--color-text-secondary)]">
              Vertical timeline with expandable cards
            </span>
          </div>
          <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-6 shadow-sm max-w-2xl">
            <HikeTimeline hikes={sampleHikes} title="My 14er Journey" />
          </div>
        </section>
      </main>
    </div>
  );
}
