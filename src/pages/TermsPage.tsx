import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-8">
          Terms and Conditions
        </h1>

        <div className="bg-white shadow rounded-lg p-6 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              These terms and conditions govern your use of the HW Legacy Group investment platform and services. By using our platform, you agree to these terms in full. If you disagree with any part of these terms, you must not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Investment Risks</h2>
            <p className="text-gray-600 mb-4">
              All investments carry risk and may result in losses. Past performance is not indicative of future results. Property and business investments can be illiquid and you may not be able to sell your investment when you wish.
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>The value of investments can go down as well as up</li>
              <li>You may not get back the amount you invested</li>
              <li>Investment returns are not guaranteed</li>
              <li>Past performance is not a guide to future performance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Investor Eligibility</h2>
            <p className="text-gray-600 mb-4">
              To invest through our platform, you must be:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>At least 18 years old</li>
              <li>A resident of the United Kingdom</li>
              <li>Qualify as a sophisticated investor, high net worth individual, or professional investor as defined by FCA regulations</li>
              <li>Have a UK bank account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Investment Process</h2>
            <p className="text-gray-600 mb-4">
              All investments are subject to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Successful completion of our KYC and AML checks</li>
              <li>Signing of relevant investment documentation</li>
              <li>Receipt of cleared funds</li>
              <li>Availability of the investment opportunity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Fees and Charges</h2>
            <p className="text-gray-600 mb-4">
              We do not charge direct fees to investors. Our fees are incorporated into the investment structure and are fully disclosed in the investment documentation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Privacy and Data Protection</h2>
            <p className="text-gray-600 mb-4">
              We are committed to protecting your privacy and personal data. Our collection and use of your data is governed by our Privacy Policy and applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Complaints Procedure</h2>
            <p className="text-gray-600 mb-4">
              If you have any complaints about our service, please contact us in writing. We will acknowledge your complaint within 3 business days and aim to resolve it within 8 weeks.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Governing Law</h2>
            <p className="text-gray-600 mb-4">
              These terms are governed by and construed in accordance with the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the English courts.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p>Last updated: February 2024</p>
          <p className="mt-2">
            For any questions about these terms, please{' '}
            <a href="/contact" className="text-blue-600 hover:text-blue-800">
              contact us
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;