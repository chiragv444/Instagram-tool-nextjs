/**
 * Static Instagram tool DOM shell (ids/classes preserved for legacy widget script).
 * Pair with /public/instagram-widget.js (your migrated IIFE).
 */
export function HeroInstagramMarkup() {
  return (
    <>
      <div id="instagram-results" className="hidden bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <InstagramLoadingBlock />
          <InstagramErrorBlock />
          <InstagramSinglePost />
          <InstagramProfile />
          <InstagramTabs />
          <InstagramPostsGrid />
          <InstagramStoriesGrid />
          <InstagramHighlightsSection />
          <InstagramReelsGrid />
          <div className="mt-6 text-right">
            <button
              type="button"
              id="instagram-close"
              className="text-sm text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <SearchDownloadBlock />

      <InstagramPostModal />
      <DownloadModal />
    </>
  );
}

function InstagramLoadingBlock() {
  return (
    <div
      id="instagram-loading"
      className="hidden min-h-[400px] border border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-500 text-sm"
    >
      <style>{`
        @keyframes instagram-spinner-spin { to { transform: rotate(360deg); } }
        .instagram-spinner { animation: instagram-spinner-spin 0.8s linear infinite; }
      `}</style>
      <div className="mb-4">
        <svg
          className="instagram-spinner text-gray-600"
          style={{ width: 48, height: 48 }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <circle
            style={{ opacity: 0.25 }}
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            style={{ opacity: 0.75 }}
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    </div>
  );
}

function InstagramErrorBlock() {
  return (
    <div
      id="instagram-error"
      className="hidden min-h-[400px] border border-red-300 bg-red-50 text-red-700 rounded-lg flex flex-col items-center justify-center text-center px-4 py-6"
    >
      <p
        id="instagram-error-message"
        className="font-semibold mb-2 text-base"
      >
        Failed to load Instagram content.
      </p>
      <button
        type="button"
        id="instagram-retry"
        className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded hover:bg-red-100 text-sm cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}

function InstagramSinglePost() {
  return (
    <div id="instagram-single-post" className="hidden">
      <div className="space-y-4">
        <div className="max-w-md mx-auto bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div
            id="single-post-media"
            className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer"
          >
            <button
              type="button"
              id="single-post-carousel-prev"
              className="hidden absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black/50 rounded-full p-2 transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              id="single-post-carousel-next"
              className="hidden absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black/50 rounded-full p-2 transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            <div
              id="single-post-carousel-indicator"
              className="hidden absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full z-10"
            >
              <span id="single-post-carousel-current">1</span> /{" "}
              <span id="single-post-carousel-total">1</span>
            </div>
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <div className="flex-grow">
              <p
                id="single-post-description"
                className="text-gray-700 text-sm mb-3 line-clamp-2"
              />
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span id="single-post-likes" />
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span id="single-post-comments" />
                  </span>
                </div>
                <span id="single-post-time" className="text-xs text-gray-500" />
              </div>
            </div>
            <button
              type="button"
              id="single-post-download"
              className="w-full px-4 py-2 bg-[#2d8cff] text-white font-semibold rounded hover:bg-[#2573d9] transition-colors mt-auto cursor-pointer"
              data-url=""
              data-type=""
            >
              Download
            </button>
          </div>
        </div>
        <div
          id="single-post-comments-section"
          className="hidden bg-white rounded-lg border border-gray-200 shadow-sm p-4"
        >
          <div id="single-post-comments-list" className="space-y-0" />
          <div
            id="single-post-comments-total"
            className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-500 text-center cursor-pointer hover:text-gray-700 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

function InstagramProfile() {
  const placeholderSvg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='14'%3EProfile%3C/text%3E%3C/svg%3E";

  return (
    <div id="instagram-profile" className="hidden mb-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex justify-between gap-6">
          <div className="flex-shrink-0 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              id="profile-pic"
              src={placeholderSvg}
              alt="Profile"
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-gray-200 bg-gray-100"
            />
            <button
              type="button"
              id="profile-download-btn"
              aria-label="Download profile picture"
              className="hidden absolute bg-white rounded-full shadow-md p-2 border border-pink-100 text-[#cb2444] hover:text-[#b232e9] cursor-pointer flex items-center justify-center text-[0px] leading-none"
              style={{ bottom: 10, right: 10 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 3v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 11l4 4 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 17h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="md:hidden w-full">
            <AnonymityPill />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-5 h-5 text-gray-500 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden
              >
                <rect x="3" y="3" width="18" height="18" rx="5" ry="5" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" strokeWidth="2" />
                <circle cx="17" cy="7" r="1.2" fill="currentColor" stroke="none" />
              </svg>
              <a
                id="profile-link"
                href="#"
                target="_blank"
                rel="noreferrer"
                className="text-base md:text-lg font-semibold text-gray-900 hover:text-gray-700 break-all underline decoration-1 underline-offset-auto"
              >
                <span id="profile-username" />
              </a>
            </div>
            <div className="hidden md:flex">
              <AnonymityPill />
            </div>
          </div>
          <div className="flex gap-6 mb-3">
            <div>
              <span id="profile-posts" className="font-semibold text-gray-900">
                0
              </span>{" "}
              <span className="text-gray-600">posts</span>
            </div>
            <div>
              <span id="profile-followers" className="font-semibold text-gray-900">
                0
              </span>{" "}
              <span className="text-gray-600">followers</span>
            </div>
            <div>
              <span id="profile-following" className="font-semibold text-gray-900">
                0
              </span>{" "}
              <span className="text-gray-600">following</span>
            </div>
          </div>
          <p id="profile-bio" className="text-gray-700 text-sm" />
        </div>
      </div>
    </div>
  );
}

function AnonymityPill() {
  return (
    <div
      className="flex items-center gap-1 rounded-full px-3 py-1 text-[11px] md:text-xs font-medium whitespace-nowrap cursor-default select-none"
      style={{
        borderWidth: 1,
        borderColor: "#23BA93",
        backgroundColor: "#E6FBF4",
        color: "#23BA93",
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#23BA93" aria-hidden>
        <path d="M12 3l7 3v5c0 4.418-3.134 8.418-7 9-3.866-.582-7-4.582-7-9V6l7-3z" strokeWidth="1.8" />
        <path
          d="M9.5 12.5l1.8 1.8 3.2-3.3"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>100% anonymous</span>
    </div>
  );
}

function InstagramTabs() {
  return (
    <div id="instagram-tabs" className="hidden mb-6 mx-6">
      <div className="w-full inline-flex gap-5 md:gap-10 justify-around bg-white rounded-full shadow-md border border-gray-100 px-5 sm:px-10">
        <button
          type="button"
          className="tab-btn active flex-1 flex items-center justify-center gap-1 sm:gap-2 py-3 pb-2 text-l font-semibold text-gray-900 cursor-pointer border-t-2 border-pink-500"
          data-tab="posts"
        >
          <TabPostsIcon />
          <span className="hidden md:block">POSTS</span>
        </button>
        <button
          type="button"
          className="tab-btn flex-1 flex items-center justify-center gap-1 sm:gap-2 py-3 pb-2 text-l font-semibold text-gray-500 hover:text-gray-900 cursor-pointer border-t-2 border-transparent"
          data-tab="reels"
        >
          <TabReelsIcon />
          <span className="hidden md:block">REELS</span>
        </button>
        <button
          type="button"
          className="tab-btn flex-1 flex items-center justify-center gap-1 sm:gap-2 py-3 pb-2 text-l font-semibold text-gray-500 hover:text-gray-900 cursor-pointer border-t-2 border-transparent"
          data-tab="stories"
        >
          <TabStoriesIcon />
          <span className="hidden md:block">STORIES</span>
        </button>
        <button
          type="button"
          className="tab-btn flex-1 flex items-center justify-center gap-1 sm:gap-2 py-3 pb-2 text-l font-semibold text-gray-500 hover:text-gray-900 cursor-pointer border-t-2 border-transparent"
          data-tab="highlights"
        >
          <TabHighlightsIcon />
          <span className="hidden md:block">HIGHLIGHTS</span>
        </button>
      </div>
    </div>
  );
}

function TabPostsIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M9.33335 21.3333H4.00002C3.26364 21.3333 2.66669 21.9303 2.66669 22.6666V28C2.66669 28.7364 3.26364 29.3333 4.00002 29.3333H9.33335C10.0697 29.3333 10.6667 28.7364 10.6667 28V22.6666C10.6667 21.9303 10.0697 21.3333 9.33335 21.3333Z" fill="black" />
      <path d="M18.6667 21.3333H13.3333C12.597 21.3333 12 21.9303 12 22.6666V28C12 28.7364 12.597 29.3333 13.3333 29.3333H18.6667C19.403 29.3333 20 28.7364 20 28V22.6666C20 21.9303 19.403 21.3333 18.6667 21.3333Z" fill="black" />
      <path d="M28 21.3333H22.6666C21.9303 21.3333 21.3333 21.9303 21.3333 22.6666V28C21.3333 28.7364 21.9303 29.3333 22.6666 29.3333H28C28.7364 29.3333 29.3333 28.7364 29.3333 28V22.6666C29.3333 21.9303 28.7364 21.3333 28 21.3333Z" fill="black" />
      <path d="M9.33335 12H4.00002C3.26364 12 2.66669 12.597 2.66669 13.3333V18.6667C2.66669 19.403 3.26364 20 4.00002 20H9.33335C10.0697 20 10.6667 19.403 10.6667 18.6667V13.3333C10.6667 12.597 10.0697 12 9.33335 12Z" fill="black" />
      <path d="M18.6667 12H13.3333C12.597 12 12 12.597 12 13.3333V18.6667C12 19.403 12.597 20 13.3333 20H18.6667C19.403 20 20 19.403 20 18.6667V13.3333C20 12.597 19.403 12 18.6667 12Z" fill="black" />
      <path d="M28 12H22.6666C21.9303 12 21.3333 12.597 21.3333 13.3333V18.6667C21.3333 19.403 21.9303 20 22.6666 20H28C28.7364 20 29.3333 19.403 29.3333 18.6667V13.3333C29.3333 12.597 28.7364 12 28 12Z" fill="black" />
      <path d="M9.33335 2.66669H4.00002C3.26364 2.66669 2.66669 3.26364 2.66669 4.00002V9.33335C2.66669 10.0697 3.26364 10.6667 4.00002 10.6667H9.33335C10.0697 10.6667 10.6667 10.0697 10.6667 9.33335V4.00002C10.6667 3.26364 10.0697 2.66669 9.33335 2.66669Z" fill="black" />
      <path d="M18.6667 2.66669H13.3333C12.597 2.66669 12 3.26364 12 4.00002V9.33335C12 10.0697 12.597 10.6667 13.3333 10.6667H18.6667C19.403 10.6667 20 10.0697 20 9.33335V4.00002C20 3.26364 19.403 2.66669 18.6667 2.66669Z" fill="black" />
      <path d="M28 2.66669H22.6666C21.9303 2.66669 21.3333 3.26364 21.3333 4.00002V9.33335C21.3333 10.0697 21.9303 10.6667 22.6666 10.6667H28C28.7364 10.6667 29.3333 10.0697 29.3333 9.33335V4.00002C29.3333 3.26364 28.7364 2.66669 28 2.66669Z" fill="black" />
    </svg>
  );
}

function TabReelsIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3.33331 9.99998H28.6666M22.6666 3.33331L18.6666 9.99998M13.3333 3.33331L9.33331 9.99998" stroke="black" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3.33331 16C3.33331 10.0293 3.33331 7.04265 5.18798 5.18798C7.04265 3.33331 10.028 3.33331 16 3.33331C21.9706 3.33331 24.9573 3.33331 26.812 5.18798C28.6666 7.04265 28.6666 10.028 28.6666 16C28.6666 21.9706 28.6666 24.9573 26.812 26.812C24.9573 28.6666 21.972 28.6666 16 28.6666C10.0293 28.6666 7.04265 28.6666 5.18798 26.812C3.33331 24.9573 3.33331 21.972 3.33331 16Z" stroke="black" strokeWidth="1.5" />
      <path d="M19.9373 19.86C19.736 20.696 18.7813 21.2867 16.8707 22.4667C15.0267 23.608 14.104 24.18 13.36 23.9493C13.0477 23.8496 12.7672 23.6693 12.5467 23.4267C12 22.8267 12 21.6627 12 19.3333C12 17.004 12 15.84 12.5467 15.24C12.7733 14.992 13.0533 14.812 13.36 14.716C14.104 14.4867 15.0267 15.0587 16.872 16.2C18.7813 17.3813 19.736 17.972 19.9387 18.8067C20.0214 19.1529 20.0214 19.5138 19.9387 19.86H19.9373Z" stroke="black" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function TabStoriesIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <g clipPath="url(#clip0_2116_17)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.9171 1.2664C14.9384 1.45281 14.9228 1.64158 14.8712 1.82196C14.8195 2.00233 14.7329 2.17077 14.6161 2.31765C14.4994 2.46453 14.3549 2.58697 14.1908 2.67799C14.0267 2.76901 13.8463 2.82682 13.6599 2.84812C11.9776 3.04012 10.5056 3.4424 9.23707 4.02754C8.89305 4.18637 8.50002 4.20203 8.14445 4.07108C7.78888 3.94012 7.4999 3.67328 7.34107 3.32926C7.18225 2.98523 7.16659 2.59221 7.29754 2.23664C7.42849 1.88107 7.69533 1.59209 8.03936 1.43326C9.71684 0.677467 11.505 0.196649 13.3354 0.00925833C13.5218 -0.0120674 13.7105 0.00353427 13.8909 0.0551723C14.0713 0.10681 14.2397 0.193473 14.3866 0.310212C14.5335 0.426951 14.6559 0.571479 14.7469 0.735543C14.838 0.899607 14.8958 1.07999 14.9171 1.2664ZM17.9799 1.32126C18.0099 1.13605 18.0761 0.958566 18.1747 0.798941C18.2733 0.639317 18.4024 0.500678 18.5546 0.390943C18.7068 0.281209 18.8791 0.202527 19.0617 0.159391C19.2443 0.116256 19.4336 0.109512 19.6188 0.139544C23.5114 0.768115 26.6542 2.47554 28.8074 5.23669C30.9491 7.97726 32.0005 11.623 32.0005 15.9315C32.0005 20.8778 30.6131 24.9441 27.7948 27.7715C24.9811 30.6058 20.9308 32.0001 16.0005 32.0001C10.3868 32.0001 5.91822 30.183 3.12507 26.5373C2.89441 26.2366 2.79264 25.8566 2.84215 25.4809C2.89166 25.1052 3.08839 24.7645 3.38907 24.5338C3.68975 24.3032 4.06975 24.2014 4.44546 24.2509C4.82118 24.3004 5.16184 24.4971 5.3925 24.7978C7.49764 27.5475 11.0016 29.1407 16.0005 29.1407C20.3982 29.1407 23.6348 27.9064 25.7719 25.7578C27.9091 23.6093 29.1434 20.3544 29.1434 15.9293C29.1434 12.0733 28.2062 9.1064 26.5536 6.99212C24.9171 4.89383 22.4691 3.49497 19.1639 2.96012C18.9787 2.93011 18.8012 2.86392 18.6416 2.76532C18.482 2.66672 18.3433 2.53764 18.2336 2.38546C18.1239 2.23327 18.0452 2.06096 18.0021 1.87836C17.9589 1.69577 17.9499 1.50646 17.9799 1.32126ZM1.43136 14.503C2.21993 14.503 2.85993 15.143 2.85993 15.9315C2.86298 17.5559 3.0245 19.0256 3.3445 20.3407C3.39198 20.5242 3.40246 20.7154 3.37531 20.903C3.34816 21.0907 3.28394 21.271 3.18638 21.4336C3.08883 21.5961 2.95989 21.7377 2.80709 21.8499C2.65428 21.9621 2.48067 22.0428 2.29636 22.0872C2.11206 22.1317 1.92075 22.139 1.73359 22.1088C1.54643 22.0785 1.36716 22.0113 1.20623 21.9111C1.0453 21.8109 0.905935 21.6796 0.796249 21.525C0.686563 21.3703 0.608755 21.1954 0.567358 21.0104C0.179155 19.3457 -0.011115 17.6409 0.000501396 15.9315C0.000501396 15.143 0.642787 14.503 1.43136 14.503ZM5.4245 7.02412C5.53946 6.87583 5.6241 6.70636 5.67356 6.52537C5.72303 6.34438 5.73636 6.15543 5.7128 5.96928C5.68924 5.78314 5.62925 5.60346 5.53625 5.44051C5.44325 5.27755 5.31907 5.13451 5.17079 5.01954C5.02251 4.90458 4.85303 4.81995 4.67204 4.77048C4.49106 4.72102 4.3021 4.70768 4.11596 4.73124C3.74003 4.77882 3.39839 4.97379 3.16622 5.27326C2.02336 6.74754 1.19364 8.4824 0.670216 10.439C0.572313 10.8051 0.623873 11.1952 0.813552 11.5233C1.00323 11.8514 1.31549 12.0908 1.68164 12.1887C2.04779 12.2866 2.43784 12.235 2.76597 12.0453C3.09411 11.8557 3.33346 11.5434 3.43136 11.1773C3.86564 9.54526 4.54222 8.16469 5.4245 7.02412ZM17.7148 10.2858C17.7148 9.83117 17.5342 9.39514 17.2127 9.07365C16.8912 8.75216 16.4552 8.57154 16.0005 8.57154C15.5458 8.57154 15.1098 8.75216 14.7883 9.07365C14.4668 9.39514 14.2862 9.83117 14.2862 10.2858V14.2858H10.2862C9.83156 14.2858 9.39552 14.4664 9.07403 14.7879C8.75254 15.1094 8.57193 15.5455 8.57193 16.0001C8.57193 16.4548 8.75254 16.8908 9.07403 17.2123C9.39552 17.5338 9.83156 17.7144 10.2862 17.7144H14.2862V21.7144C14.2862 22.1691 14.4668 22.6051 14.7883 22.9266C15.1098 23.2481 15.5458 23.4287 16.0005 23.4287C16.4552 23.4287 16.8912 23.2481 17.2127 22.9266C17.5342 22.6051 17.7148 22.1691 17.7148 21.7144V17.7144H21.7148C22.1694 17.7144 22.6055 17.5338 22.927 17.2123C23.2485 16.8908 23.4291 16.4548 23.4291 16.0001C23.4291 15.5455 23.2485 15.1094 22.927 14.7879C22.6055 14.4664 22.1694 14.2858 21.7148 14.2858H17.7148V10.2858Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip0_2116_17">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function TabHighlightsIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path        d="M18.4971 27.7406C18.9246 27.6491 19.3657 27.8617 19.5337 28.2663C19.7291 28.7394 19.4731 29.2811 18.9726 29.392C17.015 29.8227 14.9873 29.8227 13.0297 29.392C12.5291 29.2811 12.272 28.7394 12.4697 28.2651C12.5547 28.0711 12.7044 27.9127 12.8932 27.8168C13.0821 27.7209 13.2984 27.6936 13.5051 27.7394C15.1509 28.0877 16.8514 28.0877 18.4971 27.7394M4.82857 22.1714C5.02606 22.0945 5.24414 22.0886 5.44552 22.1546C5.6469 22.2207 5.81906 22.3547 5.93257 22.5337C6.85208 23.9444 8.05558 25.1479 9.46628 26.0674C9.832 26.3051 9.99657 26.768 9.82971 27.1714C9.63314 27.6457 9.06743 27.8469 8.63543 27.5714C6.94506 26.4912 5.50997 25.0561 4.42971 23.3657C4.15428 22.9326 4.35428 22.368 4.82857 22.1714ZM26.0686 22.5326C26.1819 22.3536 26.3538 22.2196 26.5549 22.1533C26.756 22.087 26.974 22.0926 27.1714 22.1691C27.6457 22.3657 27.8469 22.9314 27.5714 23.3634C26.4913 25.0542 25.0562 26.4897 23.3657 27.5703C22.9337 27.8457 22.3691 27.6446 22.1726 27.1703C22.095 26.973 22.0888 26.7549 22.1549 26.5536C22.2211 26.3522 22.3555 26.1803 22.5349 26.0674C23.9457 25.1476 25.1492 23.9437 26.0686 22.5326ZM16.7063 11.5566C17.2976 10.8654 18.1364 10.4338 19.0425 10.3542C19.9485 10.2747 20.8497 10.5537 21.5523 11.1313C22.255 11.7088 22.7031 12.5389 22.8005 13.4433C22.8979 14.3476 22.6367 15.2541 22.0731 15.968L16.6651 22.5451C16.5847 22.6432 16.4836 22.7222 16.369 22.7765C16.2543 22.8307 16.1291 22.8589 16.0023 22.8589C15.8755 22.8589 15.7502 22.8307 15.6356 22.7765C15.521 22.7222 15.4198 22.6432 15.3394 22.5451L9.93371 15.968C9.64406 15.6157 9.42663 15.2098 9.29384 14.7734C9.16106 14.3371 9.11552 13.8788 9.15983 13.4249C9.24931 12.5081 9.69932 11.6644 10.4109 11.0794C11.1224 10.4944 12.0372 10.2161 12.954 10.3055C13.8707 10.395 14.7144 10.845 15.2994 11.5566L16.0023 12.4137L16.7063 11.5566ZM2.60914 13.024C2.72 12.5234 3.26171 12.2663 3.736 12.4617C3.93069 12.5468 4.08966 12.6971 4.1856 12.8866C4.28154 13.0762 4.30845 13.2933 4.26171 13.5006C3.91107 15.1468 3.91068 16.8484 4.26057 18.4949C4.30701 18.702 4.27996 18.9188 4.18404 19.1081C4.08812 19.2974 3.92931 19.4475 3.73486 19.5326C3.26057 19.728 2.71886 19.4709 2.608 18.9703C2.39272 17.9949 2.28465 16.9989 2.28571 16C2.28571 14.9783 2.39771 13.9817 2.60914 13.024ZM28.264 12.464C28.7383 12.2686 29.28 12.5246 29.3909 13.0263C29.8238 14.9835 29.8241 17.0117 29.392 18.9691C29.2811 19.4697 28.7394 19.7269 28.2651 19.5291C28.0714 19.444 27.9131 19.2942 27.8175 19.1053C27.7218 18.9165 27.6946 18.7003 27.7406 18.4937C27.9135 17.6876 28 16.8564 28 16C27.9985 15.1421 27.912 14.3089 27.7406 13.5006C27.6943 13.2939 27.7211 13.0776 27.8166 12.8885C27.9121 12.6995 28.0702 12.5494 28.264 12.464ZM22.1749 4.832C22.3714 4.35771 22.9371 4.15543 23.3691 4.432C25.0563 5.51106 26.4889 6.9437 27.568 8.63085C27.8434 9.06285 27.6434 9.62857 27.1691 9.82514C26.9717 9.90207 26.7536 9.90801 26.5522 9.84192C26.3508 9.77584 26.1786 9.64184 26.0651 9.46285C25.1467 8.0548 23.9452 6.85332 22.5371 5.93485C22.3584 5.8214 22.2246 5.64943 22.1585 5.4483C22.0924 5.24717 22.0982 5.02934 22.1749 4.832ZM8.632 4.43085C9.06514 4.15543 9.62971 4.35657 9.82628 4.83085C9.90382 5.0281 9.91005 5.24623 9.84391 5.44758C9.77777 5.64893 9.6434 5.82087 9.464 5.93371C8.05541 6.85239 6.85353 8.05427 5.93486 9.46285C5.82201 9.64225 5.65007 9.77662 5.44872 9.84277C5.24737 9.90891 5.02924 9.90268 4.832 9.82514C4.35771 9.62857 4.15771 9.06285 4.432 8.63085C5.51172 6.94346 6.94516 5.5108 8.63314 4.432M16 2.28571C17.0217 2.28571 18.0171 2.39771 18.976 2.60914C19.4754 2.72 19.7326 3.26171 19.536 3.736C19.4509 3.93045 19.3009 4.08926 19.1115 4.18518C18.9222 4.2811 18.7054 4.30816 18.4983 4.26171C16.8517 3.91091 15.1496 3.91052 13.5029 4.26057C13.2958 4.30701 13.0789 4.27995 12.8896 4.18404C12.7003 4.08812 12.5502 3.92931 12.4651 3.73485C12.2697 3.26171 12.5257 2.72 13.0263 2.60914C14.0028 2.39323 14.9999 2.28477 16 2.28571Z"
        fill="black"
      />
    </svg>
  );
}

function BounceRow() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div
        className="w-3 h-3 rounded-full bg-[#ff1667] border-2 border-[#b232e9] animate-bounce"
        style={{ animationDelay: "0s", animationDuration: "0.6s" }}
      />
      <div
        className="w-3 h-3 rounded-full bg-[#ff1667] border-2 border-[#b232e9] animate-bounce"
        style={{ animationDelay: "0.2s", animationDuration: "0.6s" }}
      />
      <div
        className="w-3 h-3 rounded-full bg-[#ff1667] border-2 border-[#b232e9] animate-bounce"
        style={{ animationDelay: "0.4s", animationDuration: "0.6s" }}
      />
    </div>
  );
}

function InstagramPostsGrid() {
  return (
    <div id="instagram-posts" className="hidden">
      <div id="posts-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" />
      {/* Triggers infinite scroll when this enters the viewport (Posts tab only, see instagram-form-bridge). */}
      <div
        id="posts-infinite-sentinel"
        className="h-3 w-full shrink-0 pointer-events-none"
        aria-hidden="true"
      />
      <div id="posts-loading" className="hidden mt-6 text-center py-8">
        <BounceRow />
      </div>
      <div id="posts-no-more" className="hidden mt-6 text-center">
        <p className="text-gray-500 text-sm">No more posts to load</p>
      </div>
    </div>
  );
}

function InstagramStoriesGrid() {
  return (
    <div id="instagram-stories" className="hidden">
      <div id="stories-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" />
      <div id="stories-loading" className="hidden mt-6 text-center py-8">
        <BounceRow />
      </div>
      <div id="stories-no-more" className="hidden mt-6 text-center">
        <p className="text-gray-500 text-sm">No more stories to load</p>
      </div>
    </div>
  );
}

function InstagramHighlightsSection() {
  return (
    <div id="instagram-highlights" className="hidden">
      <p
        id="highlights-empty-message"
        className="hidden w-full rounded-lg border border-dashed border-gray-200 bg-gray-50 py-10 px-4 text-center text-sm text-gray-600 mb-4"
        role="status"
      />
      {/* Highlights carousel — same structure as legacy (horizontal tray) */}
      <div
        id="highlights-carousel"
        className="flex overflow-x-auto gap-4 pb-4 mb-6 [scrollbar-width:none] [-ms-overflow-style:none]"
      />
      <style>{`
        #highlights-carousel::-webkit-scrollbar { display: none; }
      `}</style>
      {/* Highlight stories grid (after carousel, like legacy) */}
      <div id="highlight-stories-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[4rem]" />
      <div
        id="highlight-stories-loading"
        className="hidden py-4 text-center text-sm text-gray-500"
      >
        Loading highlight…
      </div>
      <div className="flex flex-col items-center w-full">
        <button
          type="button"
          id="highlight-stories-load-more"
          className="hidden mt-4 px-5 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Load more
        </button>
        <p id="highlight-stories-no-more" className="hidden mt-4 text-sm text-gray-500 text-center">
          All stories in this highlight are shown.
        </p>
      </div>
      <div id="highlights-loading" className="hidden mt-6 text-center py-8">
        <BounceRow />
      </div>
      <div id="highlights-no-more" className="hidden mt-6 text-center">
        <p className="text-gray-500 text-sm">No more highlights to load</p>
      </div>
    </div>
  );
}

function InstagramReelsGrid() {
  return (
    <div id="instagram-reels" className="hidden">
      <div id="reels-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" />
      <div
        id="reels-infinite-sentinel"
        className="h-3 w-full shrink-0 pointer-events-none"
        aria-hidden="true"
      />
      <div id="reels-loading" className="hidden mt-6 text-center py-8">
        <BounceRow />
      </div>
      <div id="reels-no-more" className="hidden mt-6 text-center">
        <p className="text-gray-500 text-sm">No more reels to load</p>
      </div>
    </div>
  );
}

function SearchDownloadBlock() {
  return (
    <div id="search-download" className="hidden bg-white border-b shadow-sm">
      <div className="container py-6 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3 space-y-4">
            <div
              id="result-loading"
              className="hidden min-h-[220px] border border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-500 text-sm"
            >
              <div className="animate-pulse text-base font-semibold mb-2">
                Fetching instagram content…
              </div>
              <p>Please wait a moment while we prepare your preview.</p>
            </div>
            <div
              id="result-error"
              className="hidden min-h-[220px] border border-dashed border-red-200 bg-red-50 text-red-700 rounded-lg flex flex-col items-center justify-center text-center px-4 py-6"
            >
              <p id="result-error-message" className="font-semibold mb-2">
                Failed to load content.
              </p>
              <button
                type="button"
                id="result-retry"
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded hover:bg-red-100 text-sm cursor-pointer"
              >
                Try again
              </button>
            </div>
            <div id="result-video-container" className="hidden rounded-lg overflow-hidden bg-black/80">
              <video
                id="result-video"
                className="w-full h-full"
                controls
                playsInline
                preload="metadata"
              />
            </div>
            <div id="result-image-container" className="hidden rounded-lg overflow-hidden bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                id="result-image"
                src="/file.svg"
                alt="Instagram preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div id="search-title" className="font-semibold text-xl text-gray-900">
                  Instagram result
                </div>
                <div id="search-sub" className="text-sm text-gray-500">
                  Preview and choose quality
                </div>
              </div>
              <button
                type="button"
                id="search-close"
                className="text-sm text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
              <div className="text-sm text-gray-700">
                Preview ready — click Download to save the primary media.
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="button"
                id="search-download-btn"
                className="w-full sm:w-auto px-6 py-3 bg-[#cb2444] text-white font-semibold rounded shadow disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InstagramPostModal() {
  return (
    <div
      id="instagram-post-modal"
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 items-center justify-center hidden"
    >
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] mx-auto flex flex-col">
        <button
          type="button"
          id="instagram-modal-close"
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 bg-black/50 rounded-full p-2 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button
          type="button"
          id="instagram-modal-download"
          className="absolute top-4 right-16 z-10 text-white hover:text-gray-300 bg-black/50 rounded-full p-2 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <div id="instagram-modal-video" className="hidden w-full h-full flex items-center justify-center">
            <video
              id="instagram-modal-video-element"
              className="max-w-full max-h-full"
              controls
              autoPlay
              playsInline
              preload="metadata"
              crossOrigin="anonymous"
            />
          </div>
          <div id="instagram-modal-carousel" className="hidden w-full h-full relative flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              id="instagram-modal-carousel-image"
              className="max-w-full max-h-full object-contain hidden"
              alt="Carousel image"
            />
            <video
              id="instagram-modal-carousel-video"
              className="max-w-full max-h-full object-contain hidden"
              controls
              playsInline
            />
            <button
              type="button"
              id="instagram-carousel-prev"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black/50 rounded-full p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              id="instagram-carousel-next"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black/50 rounded-full p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div
              id="instagram-carousel-indicator"
              className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full"
            >
              <span id="carousel-current">1</span> / <span id="carousel-total">1</span>
            </div>
          </div>
          <div id="instagram-modal-image" className="hidden w-full h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              id="instagram-modal-image-element"
              className="max-w-full max-h-full object-contain"
              alt="Post image"
            />
          </div>
        </div>
        <div id="instagram-modal-caption" className="hidden bg-black/50 text-white p-4 max-h-32 overflow-y-auto">
          <p id="instagram-modal-caption-text" className="text-sm" />
        </div>
      </div>
    </div>
  );
}

function DownloadModal() {
  return (
    <div
      id="downloadModal"
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 items-center justify-center hidden"
    >
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="text-lg font-semibold text-gray-900">Preparing download</p>
          <button type="button" id="modal-close" className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>
        <div className="px-6 py-6 space-y-4">
          <div id="modal-processing" className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span id="modal-percentage" className="text-3xl font-bold text-[#cb2444]">
                0%
              </span>
              <span className="text-sm text-gray-500">Preparing media…</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                id="modal-progress"
                className="h-3 bg-[#cb2444] rounded-full transition-all duration-200"
                style={{ width: "0%" }}
              />
            </div>
            <p id="modal-status-text" className="text-sm text-gray-500">
              Optimizing your download for the best quality.
            </p>
          </div>
          <div id="modal-download-ready" className="hidden space-y-3">
            <p className="text-sm text-gray-600">
              Download is ready. Click the button below to save the file.
            </p>
            <button
              type="button"
              id="modal-download-btn"
              className="w-full px-4 py-3 bg-[#cb2444] text-white font-semibold rounded shadow"
            >
              Download now
            </button>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 text-right">
          <button type="button" id="modal-cancel" className="text-sm text-gray-500 hover:text-gray-800">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
