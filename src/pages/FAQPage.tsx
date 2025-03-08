import React from 'react';
import { ChevronDown } from 'lucide-react';

const FAQPage: React.FC = () => {
  const faqs = [
    {
      question: 'What is the minimum investment amount?',
      answer: 'The minimum investment amount varies by opportunity but typically starts at £25,000 for property investments and £10,000 for business investments.',
    },
    {
      question: 'How are returns paid?',
      answer: 'Returns are paid monthly or can be accumulated and paid at maturity, depending on your preference. All payments are made directly to your nominated bank account.',
    },
    {
      question: 'What is the investment term?',
      answer: 'Our standard investment term is 12 months, though some opportunities may offer different terms. All terms are clearly stated in the investment documentation.',
    },
    {
      question: 'How is my investment secured?',
      answer: 'Property investments are secured against the physical property assets. Business investments are typically secured through a combination of business assets and personal guarantees.',
    },
    {
      question: 'What happens at the end of the investment term?',
      answer: 'At the end of the term, you can choose to either withdraw your capital or reinvest in new opportunities. We will contact you before maturity to discuss your preferences.',
    },
    {
      question: 'Who can invest?',
      answer: 'We accept investments from UK residents who qualify as sophisticated investors, high net worth individuals, or professional investors as defined by FCA regulations.',
    },
    {
      question: 'What due diligence do you perform?',
      answer: 'We conduct thorough due diligence on all investments, including property valuations, structural surveys, legal checks, and financial analysis. All findings are available to investors.',
    },
    {
      question: 'How do you manage risk?',
      answer: 'We employ a multi-layered risk management approach including asset-backed security, conservative LTV ratios, thorough due diligence, and active investment monitoring.',
    },
    {
      question: 'What fees do you charge?',
      answer: 'We do not charge any direct fees to investors. Our returns are quoted net of our fees, which we receive from the investment vehicle.',
    },
    {
      question: 'How do I track my investments?',
      answer: 'Through your secure investor dashboard, you can monitor all your investments, view returns, access documents, and track performance in real-time.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to know about investing with HW Legacy Group
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              <details className="group">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer">
                  <h3 className="text-lg font-medium text-gray-900">
                    {faq.question}
                  </h3>
                  <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </details>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-blue-700 mb-4">
            Cannot find the answer you are looking for? Please contact our investor relations team.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;