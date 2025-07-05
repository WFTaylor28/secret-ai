import React from 'react';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-purple-900 dark:to-blue-900 text-white py-20 px-4">
      <div className="container mx-auto flex flex-col-reverse md:flex-row items-center justify-between">
        <div className="max-w-lg mt-8 md:mt-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Create & Chat with AI Characters
          </h1>
          <p className="text-lg mb-6 opacity-90">
            Bring your imagination to life. Build unique characters, chat with them, and explore stories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/create" className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition shadow-md">
              Create Character
            </a>
            <a href="/gallery" className="border border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-lg font-semibold transition">
              Browse Characters
            </a>
          </div>
        </div>
        <img
          src="https://source.unsplash.com/600x500/?ai,robot,character"
          alt="AI Character Illustration"
          className="rounded-lg shadow-xl w-full md:w-1/2 object-cover max-h-96"
        />
      </div>
    </section>
  );
};

export default HeroSection;
