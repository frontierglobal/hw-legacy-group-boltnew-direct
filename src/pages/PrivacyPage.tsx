import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-8">
          Privacy Policy
        </h1>

        <div className="bg-white shadow rounded-lg p-6 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600">
              HW Legacy Group is committed to protecting your privacy and ensuring your personal data is handled securely and responsibly. This policy explains how we collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-600 mb-4">We collect the following types of information:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Personal identification information (name, email address, phone number)</li>
              <li>Financial information for KYC and AML checks</li>
              <li>Investment preferences and history</li>
              <li>Communication records</li>
              <li>Website usage data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Process your investments</li>
              <li>Verify your identity</li>
              <li>Communicate with you about your investments</li>
              <li>Send you relevant investment opportunities</li>
              <li>Comply with legal and regulatory requirements</li>
              <li>Improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing and accidental loss, destruction, or damage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Sharing</h2>
            <p className="text-gray-600 mb-4">
              We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Service providers who assist in operating our platform</li>
              <li>Professional advisers</li>
              <li>Regulatory authorities</li>
              <li>Law enforcement agencies when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="text-gray-600 mb-4">
              Under data protection law, you have rights including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>The right to access your personal data</li>
              <li>The right to rectification</li>
              <li>The right to erasure</li>
              <li>The right to restrict processing</li>
              <li>The right to data portability</li>
              <li>The right to object to processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Cookies</h2>
            <p className="text-gray-600 mb-4">
              We use cookies to improve your experience on our website. You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              For any privacy-related queries, please contact our Data Protection Officer at:
            </p>
            <div className="text-gray-600">
              <p>Email: privacy@hwlegacygroup.com</p>
              <p>Address: Newcastle Business Park, Newcastle upon Tyne, NE4 7YL</p>
            </div>
          </section>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p>Last updated: February 2024</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;