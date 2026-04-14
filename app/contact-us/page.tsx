import React from "react";

function ContactUs() {
  return (
    <div className="container max-w-6xl mx-auto footer-content py-6">
      <div className="mb-6 flex flex-col gap-4">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-4 text-center">
          Contact Us
        </h1>

        <p className="text-gray-700 text-lg mb-6 leading-relaxed">
          We’re here to help!
        </p>

        <p className="text-gray-800 text-lg mb-2">
          At{" "}
          <a href="/" className="internal-link">
            SaveInstaVideo.io
          </a>
          , we value your feedback, questions, and suggestions. If you’re
          experiencing any issues while using our Instagram downloader or simply
          want to share your thoughts, feel free to get in touch with us.
        </p>

        <h3 className="text-2xl font-bold mt-4">How Can We Help You?</h3>
        <p>You can contact us for:</p>
        <ul>
          <li>Questions about using SaveInstaVideo.io</li>
          <li>Reporting technical issues or bugs</li>
          <li>Feedback and suggestions for improvement</li>
          <li>General inquiries about our services</li>
        </ul>

        <h3 className="text-2xl font-bold mt-4">Get in Touch</h3>
        <p>For all inquiries, please reach out to us via email:</p>
        <p>
          <b>Email:</b> support@saveinstavideo.io
        </p>
        <p>
          We aim to respond as quickly as possible and usually reply within{" "}
          <b>24–48 hours</b>.
        </p>

        <h3 className="text-2xl font-bold mt-4">Important Note</h3>
        <p>
          SaveInstaVideo.io is an independent online tool and is not affiliated
          with Instagram or Meta. We do not host or store any downloaded content
          on our servers. If you have copyright-related concerns, please include
          detailed information in your message so we can review it promptly.
        </p>
        <p>
          Thank you for choosing
          <a href="/" className="internal-link">
            SaveInstaVideo.io
          </a>
          .
        </p>
        <p>
          Your feedback helps us improve and provide a better experience for
          everyone.
        </p>
      </div>
    </div>
  );
}

export default ContactUs;
