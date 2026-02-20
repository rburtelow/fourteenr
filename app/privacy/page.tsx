import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | My14er",
  description: "Privacy Policy for My14er - how we collect, use, and protect your information.",
};

export default function PrivacyPolicyPage() {
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
            My14er Privacy Policy
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-12">
            Last Updated: February 16, 2026
          </p>

          <div className="prose prose-slate max-w-none space-y-10 text-[var(--color-text-secondary)]">
            <p className="text-base leading-relaxed">
              My14er (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the My14er website, applications, and related services (collectively, the &quot;Service&quot;).
            </p>
            <p className="text-base leading-relaxed">
              By using the Service, you agree to the practices described in this Privacy Policy.
            </p>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                1. Information We Collect
              </h2>
              <p className="mb-4">We collect information in the following ways:</p>

              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mt-6 mb-2">1.1 Information You Provide to Us</h3>
              <p className="mb-4">When you create an account or use the Service, we may collect:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Name or username</li>
                <li>Email address</li>
                <li>Profile photo</li>
                <li>Biographical information</li>
                <li>Hiking logs and summit history</li>
                <li>Photos and trip reports</li>
                <li>Comments and messages</li>
                <li>Any other content you choose to submit</li>
              </ul>
              <p className="mb-4">(collectively, &quot;User Content&quot;).</p>

              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mt-6 mb-2">1.2 Information Collected Automatically</h3>
              <p className="mb-4">When you use the Service, we may automatically collect:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>IP address</li>
                <li>Device type</li>
                <li>Browser type</li>
                <li>Operating system</li>
                <li>Usage activity (pages viewed, features used)</li>
                <li>Referring URLs</li>
                <li>Date and time of access</li>
              </ul>
              <p className="mb-4">We may use cookies or similar technologies to improve functionality and user experience.</p>

              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mt-6 mb-2">1.3 Location Information</h3>
              <p className="mb-4">If you log hikes or submit trail data, we may collect:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Approximate location information</li>
                <li>Elevation data</li>
                <li>Route details</li>
              </ul>
              <p className="mb-4">We do not collect precise GPS data unless you voluntarily submit it.</p>
              <p className="mb-4">You are responsible for ensuring that any location data you post does not compromise your safety.</p>

              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mt-6 mb-2">1.4 Third-Party Login Information</h3>
              <p className="mb-4">If you register using a third-party authentication provider (such as Google or GitHub), we may receive:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Your name</li>
                <li>Email address</li>
                <li>Profile image</li>
                <li>Public account information</li>
              </ul>
              <p>The information we receive depends on your privacy settings with that provider.</p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                2. How We Use Your Information
              </h2>
              <p className="mb-4">We may use your information to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Provide and operate the Service</li>
                <li>Create and manage user accounts</li>
                <li>Display your profile and posted content</li>
                <li>Improve platform features</li>
                <li>Generate aggregated statistics</li>
                <li>Communicate with you</li>
                <li>Respond to support inquiries</li>
                <li>Detect fraud, abuse, or security issues</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p>We may also use anonymized or aggregated data for analytics and product improvement.</p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                3. Public Information
              </h2>
              <p className="mb-4">The Service is a social platform.</p>
              <p className="mb-4">Information you post publicly, including:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Profile information</li>
                <li>Photos</li>
                <li>Trip reports</li>
                <li>Comments</li>
                <li>Summit logs</li>
              </ul>
              <p className="mb-4">may be visible to other users or the public.</p>
              <p>We cannot control how other users may use or share publicly available information.</p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                4. Sharing of Information
              </h2>
              <p className="mb-4">We do not sell your personal information.</p>
              <p className="mb-4">We may share information in the following circumstances:</p>

              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mt-6 mb-2">4.1 Service Providers</h3>
              <p className="mb-4">We may share information with vendors that help operate the Service, such as:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Cloud hosting providers</li>
                <li>Database providers (e.g., Supabase)</li>
                <li>Analytics providers</li>
                <li>Email delivery services</li>
              </ul>
              <p className="mb-4">These providers process data on our behalf.</p>

              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mt-6 mb-2">4.2 Legal Requirements</h3>
              <p className="mb-4">We may disclose information if required to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Comply with applicable law</li>
                <li>Respond to lawful requests</li>
                <li>Protect our rights or property</li>
                <li>Protect user safety</li>
              </ul>

              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mt-6 mb-2">4.3 Business Transfers</h3>
              <p>If My14er is acquired or merged, user information may be transferred as part of that transaction.</p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                5. Data Retention
              </h2>
              <p className="mb-4">We retain personal information:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>As long as your account is active</li>
                <li>As necessary to provide the Service</li>
                <li>As required by law</li>
              </ul>
              <p>You may request deletion of your account. Some information may be retained for legal, safety, or backup purposes.</p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                6. Your Rights and Choices
              </h2>
              <p className="mb-4">Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion</li>
                <li>Withdraw consent (where applicable)</li>
              </ul>
              <p className="mb-4">California residents may have additional rights under the California Consumer Privacy Act (CCPA).</p>
              <p>To exercise rights, contact us at: [Insert Email]</p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                7. Cookies and Tracking Technologies
              </h2>
              <p className="mb-4">We may use cookies or similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Maintain sessions</li>
                <li>Remember preferences</li>
                <li>Improve performance</li>
                <li>Analyze usage</li>
              </ul>
              <p>You can adjust browser settings to refuse cookies, though some features may not function properly.</p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                8. Data Security
              </h2>
              <p className="mb-4">
                We implement reasonable administrative, technical, and organizational safeguards to protect your information.
              </p>
              <p>However, no system is completely secure, and we cannot guarantee absolute security.</p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                9. Children&apos;s Privacy
              </h2>
              <p className="mb-4">The Service is not directed to children under 13. We do not knowingly collect personal information from children under 13.</p>
              <p>If we become aware of such collection, we will take steps to delete it.</p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                10. International Users
              </h2>
              <p className="mb-4">If you access the Service from outside the United States, your information may be transferred to and processed in the United States.</p>
              <p>By using the Service, you consent to such transfer.</p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                11. Third-Party Links
              </h2>
              <p>The Service may contain links to third-party websites or services. We are not responsible for their privacy practices.</p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                12. Changes to This Policy
              </h2>
              <p className="mb-4">We may update this Privacy Policy from time to time.</p>
              <p className="mb-4">If changes are material, we will provide notice through the Service.</p>
              <p>Continued use of the Service after changes constitutes acceptance.</p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 mt-8"
                style={{ fontFamily: "var(--font-display)" }}
              >
                13. Contact Us
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
