import React from "react";

function AboutUs() {
  return (
    <div className="container max-w-6xl mx-auto footer-content py-6">
      <div className="mb-6 flex flex-col gap-4">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-4 text-center">
          About Us
        </h1>

        <p className="text-gray-700 leading-relaxed mb-4">
          Welcome to{" "}
          <a href="/" className="internal-link">
            SaveInstaVideo.io
          </a>
          , a simple and reliable platform designed to help you download
          Instagram content quickly and easily. In a world where Instagram is
          full of inspiring videos, creative Reels, memorable Stories, and
          stunning photos, we make it easy to save the content you love for
          offline viewing and personal use.
        </p>
        <p className="text-gray-700 leading-relaxed">
          At SaveInstaVideo.io, our goal is to provide a fast, user-friendly
          Instagram downloader that works smoothly on all devices. Whether
          you’re using a mobile phone, tablet, or desktop computer, our tool
          allows you to download Instagram videos, Reels, Stories, and photos
          directly from your browser—no apps, no sign-ups, and no complicated
          steps.
        </p>

        <h3 className="text-2xl font-bold mt-4">What We Do</h3>
        <p>
          SaveInstaVideo.io is built to simplify Instagram downloads. With just
          a few clicks, you can save high-quality Instagram content and enjoy it
          anytime, even without an internet connection. Our platform supports:
        </p>
        <ul>
          <li>Instagram video downloads</li>
          <li>Instagram photo downloads</li>
          <li>Instagram Reels downloads</li>
          <li>Instagram Story downloads</li>
        </ul>
        <p>
          We focus on speed, ease of use, and consistent performance so users
          can get what they need without frustration.
        </p>

        <h3 className="text-2xl font-bold mt-4">
          Why Choose SaveInstaVideo.io?
        </h3>
        <ul>
          <li>
            <b>Fast & Easy</b> – Download Instagram content in seconds
          </li>
          <li>
            <b>No Registration Required</b> – Use our tool instantly, without
            creating an account
          </li>
          <li>
            <b>Device Friendly</b> – Works on Android, iPhone, Windows, Mac, and
            tablets
          </li>
          <li>
            <b>High-Quality Downloads</b> – Save content in the best available
            quality
          </li>
          <li>
            <b>Free to Use</b> – No hidden fees or subscriptions
          </li>
        </ul>

        <h3 className="text-2xl font-bold mt-4">Our Vision</h3>
        <p>
          Our vision is to become a trusted and go-to Instagram video downloader
          for users worldwide. We believe downloading Instagram content should
          be simple, accessible, and secure for everyone.
        </p>

        <h3 className="text-2xl font-bold mt-4">
          Respect for Privacy & Content
        </h3>
        <p>
          SaveInstaVideo.io does not store any downloaded content or personal
          data. We encourage users to respect Instagram’s terms of service and
          content creators’ rights. Our tool is intended for personal use,
          offline viewing, and content reference only.
        </p>
      </div>
    </div>
  );
}

export default AboutUs;
