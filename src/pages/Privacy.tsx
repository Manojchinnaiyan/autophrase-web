export function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Last updated: May 15, 2025
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">1. Overview</h2>
          <p>
            Autophrase ("we", "our", "the extension") is a Chrome extension that provides
            AI-powered writing tools on any webpage. We are committed to protecting your
            privacy. This policy explains what data we collect, how we use it, and what
            we never do.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">2. Data We Collect</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Account information</strong> — your email address and a hashed
              password when you create an account on autophrase.online.
            </li>
            <li>
              <strong>License key</strong> — a randomly generated key linked to your
              account, stored locally in the extension and used only to verify your
              subscription status.
            </li>
            <li>
              <strong>Usage count</strong> — a request counter used to enforce the
              free trial limit. We count requests, not content.
            </li>
            <li>
              <strong>Device fingerprint</strong> — a non-personally-identifiable
              identifier used to enforce the per-device limit on your plan.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">3. Data We Do NOT Collect</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Your AI API keys</strong> — keys for Anthropic, OpenAI, and Google
              are stored exclusively in your browser's local storage. They are never
              sent to our servers.
            </li>
            <li>
              <strong>Your text or content</strong> — the text you select, rewrite, or
              chat about is sent directly from your browser to your chosen AI provider.
              It never passes through Autophrase servers.
            </li>
            <li>
              <strong>Browsing history</strong> — we do not track which websites you
              visit or which pages you use the extension on.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">4. How We Use Your Data</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>To create and manage your account</li>
            <li>To verify your subscription or trial status</li>
            <li>To enforce device limits on your plan</li>
            <li>To process payments via Razorpay (see Section 5)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">5. Payments</h2>
          <p>
            Payments are processed by Razorpay. When you make a purchase, Razorpay
            collects your payment details directly. We receive a payment confirmation
            and store the Razorpay order ID and payment ID against your account to
            activate your subscription. We do not store your card details.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">6. Data Storage</h2>
          <p>
            Account data is stored in a Cloudflare D1 database hosted on Cloudflare's
            global network. AI provider keys and extension preferences are stored
            locally in your browser using Chrome's storage API and never leave your
            device.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">7. Third-Party Services</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Razorpay</strong> — payment processing</li>
            <li><strong>Cloudflare</strong> — hosting and database infrastructure</li>
            <li>
              <strong>AI providers (Anthropic, OpenAI, Google)</strong> — your text is
              sent directly to whichever provider you configure. Their respective
              privacy policies apply to that data.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">8. Data Deletion</h2>
          <p>
            You can request deletion of your account and all associated data at any
            time by emailing{' '}
            <a
              href="mailto:manojchinnaiyan111@gmail.com"
              className="text-zinc-900 underline underline-offset-2 dark:text-zinc-100"
            >
              manojchinnaiyan111@gmail.com
            </a>
            . We will delete your account within 7 days of your request.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">9. Children's Privacy</h2>
          <p>
            Autophrase is not directed at children under 13. We do not knowingly
            collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">10. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. The "last updated" date at
            the top of this page will reflect any changes. Continued use of Autophrase
            after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">11. Contact</h2>
          <p>
            For any privacy-related questions, email us at{' '}
            <a
              href="mailto:manojchinnaiyan111@gmail.com"
              className="text-zinc-900 underline underline-offset-2 dark:text-zinc-100"
            >
              manojchinnaiyan111@gmail.com
            </a>
            .
          </p>
        </section>

      </div>
    </div>
  );
}
