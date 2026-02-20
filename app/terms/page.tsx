import Link from "next/link";

export const metadata = {
  title: "Terms of Service | My14er",
  description: "Terms of Service for My14er - the definitive platform for Colorado's high-altitude community.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16 lg:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors mb-12"
        >
          ← Back to My14er
        </Link>

        <article className="bg-white rounded-2xl shadow-sm border border-[var(--color-border-marketing)] p-8 md:p-12">
          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            My14er Terms of Service
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-12">
            Last Updated: February 16, 2026
          </p>

          <div className="prose prose-slate max-w-none space-y-10 text-[var(--color-text-secondary)]">
            <p className="text-base leading-relaxed">
              Welcome to My14er. These Terms of Service (&quot;Terms&quot;) govern your access to and use of the My14er website, mobile applications, and related services (collectively, the &quot;Service&quot;) operated by My14er (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
            </p>
            <p className="text-base leading-relaxed">
              By accessing or using the Service, you agree to these Terms. If you do not agree, do not use the Service.
            </p>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                1. Eligibility
              </h2>
              <p className="mb-4">
                You must be at least 13 years old to use the Service. If you are under 18, you represent that you have permission from a parent or legal guardian.
              </p>
              <p className="mb-4">By using the Service, you represent that:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>You have the legal capacity to enter into these Terms.</li>
                <li>Your use complies with all applicable laws.</li>
              </ul>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                2. Description of the Service
              </h2>
              <p className="mb-4">
                My14er is a social platform designed to help users:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Track progress toward hiking Colorado 14,000-foot peaks</li>
                <li>Log hikes and summit attempts</li>
                <li>Share trip reports, photos, and comments</li>
                <li>View community-generated content</li>
                <li>Access informational tools such as weather data, elevation data, and risk indicators</li>
              </ul>
              <p>The Service is provided for informational and social purposes only.</p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                3. Outdoor Activity & Assumption of Risk
              </h2>
              <p className="mb-4">
                Hiking, mountaineering, and high-altitude travel involve inherent risks, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Severe weather</li>
                <li>Falling rocks</li>
                <li>Avalanches</li>
                <li>Wildlife encounters</li>
                <li>Altitude sickness</li>
                <li>Injury or death</li>
              </ul>
              <p className="mb-4">
                Information provided through the Service (including weather data, elevation data, trail conditions, risk scores, or user posts) may be inaccurate, outdated, incomplete, or misleading.
              </p>
              <p className="mb-4">You acknowledge and agree that:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>You are solely responsible for your safety.</li>
                <li>You assume all risks associated with outdoor activities.</li>
                <li>The Company does not guarantee the accuracy of any information on the Service.</li>
                <li>The Service does not provide professional, safety, or guiding advice.</li>
              </ul>
              <p>
                To the maximum extent permitted by law, the Company is not responsible for injuries, damages, or losses arising from your hiking or outdoor activities.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                4. User Accounts
              </h2>
              <p className="mb-4">
                To access certain features, you may be required to create an account.
              </p>
              <p className="mb-4">You agree to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us of unauthorized use</li>
              </ul>
              <p className="mb-4">
                You are responsible for all activity that occurs under your account.
              </p>
              <p>
                We reserve the right to suspend or terminate accounts at our discretion.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                5. User-Generated Content
              </h2>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mt-6 mb-2">5.1 Ownership</h3>
              <p className="mb-4">
                You retain ownership of content you submit, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Photos</li>
                <li>Trip reports</li>
                <li>Comments</li>
                <li>Route descriptions</li>
                <li>Profile information</li>
              </ul>
              <p className="mb-4">(&quot;User Content&quot;).</p>

              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mt-6 mb-2">5.2 License to My14er</h3>
              <p className="mb-4">
                By posting User Content, you grant the Company a worldwide, non-exclusive, royalty-free, transferable license to use, reproduce, modify, display, distribute, and promote your User Content in connection with operating and improving the Service.
              </p>
              <p className="mb-4">
                This license ends when you delete your content or account, except where content has been shared by others or retained for legal reasons.
              </p>

              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mt-6 mb-2">5.3 Public Nature of Content</h3>
              <p className="mb-4">You understand that:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Content you post may be publicly visible.</li>
                <li>Other users may copy, screenshot, or share your content.</li>
                <li>We cannot control third-party use of public content.</li>
              </ul>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                6. Acceptable Use
              </h2>
              <p className="mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Post unlawful, defamatory, or abusive content</li>
                <li>Harass or threaten other users</li>
                <li>Post pornography or sexually explicit material</li>
                <li>Post hate speech or discriminatory content</li>
                <li>Impersonate another person</li>
                <li>Upload malicious code or attempt to hack the Service</li>
                <li>Scrape or collect data without permission</li>
                <li>Post knowingly false or dangerous trail information</li>
              </ul>
              <p>
                We reserve the right to remove content or restrict accounts at our sole discretion.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                7. Content Moderation
              </h2>
              <p className="mb-4">We may, but are not obligated to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Monitor content</li>
                <li>Remove content</li>
                <li>Restrict users</li>
                <li>Investigate violations</li>
              </ul>
              <p>We are not responsible for user-generated content.</p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                8. Third-Party Services
              </h2>
              <p className="mb-4">
                The Service may incorporate third-party tools or data sources, including weather providers, mapping services, hosting providers, or analytics platforms.
              </p>
              <p className="mb-4">We are not responsible for:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>The accuracy of third-party data</li>
                <li>Downtime of third-party services</li>
                <li>Third-party privacy practices</li>
              </ul>
              <p>Your use of third-party services may be governed by their terms.</p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                9. Intellectual Property
              </h2>
              <p className="mb-4">
                The Service, including its design, branding, software, and content (excluding User Content), is owned by the Company and protected by intellectual property laws.
              </p>
              <p className="mb-4">You may not:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Copy or reproduce platform content</li>
                <li>Reverse engineer the Service</li>
                <li>Use our trademarks without permission</li>
              </ul>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                10. Termination
              </h2>
              <p className="mb-4">We may suspend or terminate your access:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>For violation of these Terms</li>
                <li>To protect the safety of the community</li>
                <li>For legal or operational reasons</li>
              </ul>
              <p className="mb-4">Upon termination:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Your right to use the Service ends immediately.</li>
                <li>We may retain certain information as required by law.</li>
              </ul>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                11. Disclaimer of Warranties
              </h2>
              <p className="mb-4">
                The Service is provided &quot;AS IS&quot; and &quot;AS AVAILABLE.&quot;
              </p>
              <p className="mb-4">We disclaim all warranties, including:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Accuracy</li>
                <li>Reliability</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement</li>
              </ul>
              <p>We do not guarantee uninterrupted or error-free service.</p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                12. Limitation of Liability
              </h2>
              <p className="mb-4">To the maximum extent permitted by law:</p>
              <p className="mb-4">
                The Company shall not be liable for indirect, incidental, consequential, special, or punitive damages.
              </p>
              <p>
                In no event shall our total liability exceed one hundred dollars ($100) or the amount you paid to use the Service in the past 12 months, whichever is greater.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                13. Indemnification
              </h2>
              <p className="mb-4">
                You agree to indemnify and hold harmless the Company from claims, damages, losses, and expenses arising out of:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Your use of the Service</li>
                <li>Your User Content</li>
                <li>Your violation of these Terms</li>
                <li>Your outdoor activities</li>
              </ul>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                14. Copyright Policy (DMCA)
              </h2>
              <p className="mb-4">
                If you believe content infringes your copyright, you may submit a notice including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Identification of the copyrighted work</li>
                <li>Identification of the infringing material</li>
                <li>Your contact information</li>
                <li>A statement of good faith belief</li>
                <li>A statement under penalty of perjury of accuracy</li>
              </ul>
              <p>We may remove infringing content and terminate repeat infringers.</p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                15. Governing Law
              </h2>
              <p className="mb-4">
                These Terms are governed by the laws of the State of Colorado, without regard to conflict of law principles.
              </p>
              <p>
                Any disputes shall be resolved in the state or federal courts located in Colorado.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                16. Changes to These Terms
              </h2>
              <p className="mb-4">We may update these Terms from time to time.</p>
              <p className="mb-4">
                If changes are material, we will provide notice through the Service.
              </p>
              <p>
                Continued use of the Service after updates constitutes acceptance.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                17. Contact Information
              </h2>
              <p className="mb-2">My14er</p>
              <p className="mb-2">[Insert Business Address]</p>
              <p>[Insert Contact Email]</p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
