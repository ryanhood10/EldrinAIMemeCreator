import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faImage,
    faWandMagicSparkles,
    faCircleQuestion,
    faImagePortrait,
    faFont,
    faCloudArrowUp,
    faDownload,
    faShareNodes,
    faXmark,
    faCopy
  } from '@fortawesome/free-solid-svg-icons';
  import { FaDownload, FaLinkedin, FaSearch } from 'react-icons/fa';

export default function MemeGenerator() {

// UI state: 
// aiPrompt → AI generation input  
// templateSearch → search box value  
// showTemplateResults → dropdown toggle  
// showAddImageModal → modal toggle  
// text1, text2 → caption text fields  

    const [aiPrompt, setAiPrompt] = useState('');
  const [templateSearch, setTemplateSearch] = useState('Drake Hotline Bling');
  const [showTemplateResults, setShowTemplateResults] = useState(false);
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [text1, setText1] = useState('Using boring text-only memes');
  const [text2, setText2] = useState('Creating memes with Eldrin AI');

  const templateSearchRef = useRef();
  const templateResultsRef = useRef();


  function handleGenerate() {
      // TODO: POST { prompt } to /api/memes/ai and handle response
    console.log('Generate button clicked!', aiPrompt);
  }
  // refs + effect to close the template-search dropdown when clicking outside  

  // Hide template results on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        templateSearchRef.current && !templateSearchRef.current.contains(e.target) &&
        templateResultsRef.current && !templateResultsRef.current.contains(e.target)
      ) {
        setShowTemplateResults(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // AI Generation handler
  const handleGenerateAI = () => {
    // TODO: call /api/v1/memes/ai with { prompt: aiPrompt }
    console.log('Generating AI meme:', aiPrompt);
  };

  // Sample templates
  const templates = [
    { name: 'Drake Hotline Bling', id: '30b1gx' },
    { name: 'Distracted Boyfriend', id: '1ur9b0' },
    { name: 'Two Buttons', id: '1g8my4' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
        {/* DESKTOP CODE */}
        <div className="hidden md:block min-h-screen bg-gray-50 text-gray-900">
 
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-[#5167FC] to-[#6817FF] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#5167FC] to-[#6817FF]">
              Eldrin AI Meme Generator
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-[#5167FC] transition">
              <i className="fa-regular fa-circle-question text-lg" />
            </button>
            <button className="bg-gradient-to-r from-[#5167FC] to-[#6817FF] text-white px-4 py-2 rounded-md hover:opacity-90 transition">
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6">
       {/* AI Meme Generator Section */}
       <section id="ai-meme-generator" className="mb-8 bg-gradient-to-r from-[#5167FC]/10 to-[#6817FF]/10 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Generate Meme with AI</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                id="ai-prompt-input"
                placeholder="Enter a prompt to generate a meme with AI"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5167FC]"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </div>
            <button
              id="generate-ai-meme-btn"
              className="px-6 py-3 bg-[#5167FC] text-white rounded-lg hover:bg-[#6817FF] transition flex items-center justify-center whitespace-nowrap"
              onClick={handleGenerate}
            >
      <FontAwesomeIcon icon={faWandMagicSparkles} className="mr-2" />
              Generate Meme with AI
            </button>
          </div>
        </section>

        {/* Meme Editor */}
        <section className="flex flex-col lg:flex-row gap-8">
          {/* Preview */}
          <div className="w-full lg:w-1/2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Preview</h2>
            <div className="aspect-square border border-gray-300 rounded-md flex items-center justify-center bg-gray-100 relative overflow-hidden">
              <img
                className="w-full h-full object-contain"
                src={`https://i.imgflip.com/${templates.find(t => t.name === templateSearch)?.id || templates[0].id}.jpg`}
                alt="Meme template"
              />
              <div className="absolute top-0 left-0 w-1/2 h-1/2 flex items-center justify-center p-4">
                <p className="text-white text-xl font-bold text-center" style={{ textShadow: '2px 2px 2px rgba(0,0,0,0.8)' }}>
                  {text1}
                </p>
              </div>
              <div className="absolute top-1/2 left-0 w-1/2 h-1/2 flex items-center justify-center p-4">
                <p className="text-white text-xl font-bold text-center" style={{ textShadow: '2px 2px 2px rgba(0,0,0,0.8)' }}>
                  {text2}
                </p>
              </div>
            </div>

              {/* Add Image Section */}
              <div className="mb-6 pt-6">
                <button
                  onClick={() => setShowAddImageModal(true)}
                  className="w-full border border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition"
                >
                  <i className="fa-solid fa-image text-2xl text-gray-500" />
                  <span className="font-medium text-gray-700">Add Image</span>
                </button>
              </div>
          </div>

          {/* Editing */}
          <div className="w-full lg:w-1/2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Your Meme</h2>

            {/* Template Selection */}
          {/* Template Selection */}
          <div className="mb-6" ref={templateSearchRef}>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Search all memes
  </label>
  <div className="flex items-center space-x-2">
    {/* input with icon */}
    <div className="relative flex-grow">
      <input
        type="text"
        className="w-full border border-gray-300 rounded-md px-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#5167FC] focus:border-transparent"
        value={templateSearch}
        onChange={(e) => setTemplateSearch(e.target.value)}
        onFocus={() => setShowTemplateResults(true)}
        placeholder="Type to search..."
      />
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <FaSearch className="text-gray-400" />
      </div>
    </div>
    {/* new search button */}
    <button
      onClick={() => {
        /* implement your search handler here */
        console.log('Searching for', templateSearch);
      }}
      className="px-4 py-2 bg-gradient-to-r from-[#5167FC] to-[#6817FF] text-white rounded-md hover:opacity-90 transition whitespace-nowrap"
    >
      Search
    </button>
  </div>

  <div
    ref={templateResultsRef}
    className={`mt-2 border border-gray-200 rounded-md bg-white shadow-md max-h-60 overflow-y-auto ${
      showTemplateResults ? '' : 'hidden'
    }`}
  >
    {templates.map((tpl) => (
      <div
        key={tpl.name}
        className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
        onClick={() => {
          setTemplateSearch(tpl.name);
          setShowTemplateResults(false);
        }}
      >
        <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
          <img
            src={`https://i.imgflip.com/${tpl.id}.jpg`}
            alt={tpl.name}
            className="w-full h-full object-cover"
          />
        </div>
        <span>{tpl.name}</span>
      </div>
    ))}
  </div>

  {/* ← Insert Trending Memes here ↓ */}
  <h3 className="text-sm font-medium mt-6 mb-2 text-gray-700">Trending Memes</h3>
  <div className="flex space-x-4 overflow-x-auto pb-2">
    {Array.from({ length: 20 }).map((_, i) => (
      <div
        key={i}
        className="flex-shrink-0 w-36 template-item cursor-pointer bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-[#5167FC] transition-all"
      >
        <div className="aspect-square bg-gray-100">
          <img
            src="https://storage.googleapis.com/uxpilot-auth.appspot.com/c6373105e6-bc96f0f13b0af5e2a72b.png"
            alt="Drake Hotline Bling"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-2">
          <p className="text-sm font-medium truncate">Drake Hotline Bling</p>
        </div>
      </div>
    ))}
  </div>
</div>



            {/* Text Editing */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-gray-800">Text Editing</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Text 1</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#5167FC] focus:border-transparent"
                  value={text1}
                  onChange={(e) => setText1(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Text 2</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#5167FC] focus:border-transparent"
                  value={text2}
                  onChange={(e) => setText2(e.target.value)}
                />
              </div>

            </div>
            </div>

        </section>

        {/* Action Buttons */}
        <section className="mt-8 flex justify-center gap-4">
       
          <button
  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5167FC] to-[#6817FF] text-white rounded hover:opacity-90 transition cursor-pointer"
>
  <FaDownload/> Download
</button>
          <button
        className="flex items-center gap-2 px-6 py-3 bg-[#0077B5] text-white rounded hover:bg-[#005A8C] hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out"
       >
           <FaLinkedin className="text-xl" />
           Post to LinkedIn
         </button>
        </section>

        {/* Add Image Modal */}
        {showAddImageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Add Image to Meme</h3>
                <button onClick={() => setShowAddImageModal(false)} className="text-gray-500 hover:text-gray-700">
                  <i className="fa-solid fa-times" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <i className="fa-solid fa-cloud-arrow-up text-4xl text-gray-400 mb-3" />
                  <h4 className="text-lg font-medium mb-2">Upload Your Own Image</h4>
                  <p className="text-gray-500 mb-4">Drag and drop or click to select</p>
                  <input type="file" className="hidden" />
                  <button className="bg-[#5167FC] text-white px-4 py-2 rounded-md hover:bg-[#4056EB] transition">Select Image</button>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-3">Choose from Meme Generator API</h4>
                  <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                    {templates.map((tpl) => (
                      <div key={tpl.id} className="aspect-square bg-gray-100 rounded cursor-pointer hover:opacity-80 transition overflow-hidden">
                        <img src={`https://i.imgflip.com/${tpl.id}.jpg`} alt={tpl.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setShowAddImageModal(false)} className="text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100 transition mr-2">
                  Cancel
                </button>
                <button className="bg-[#5167FC] text-white px-4 py-2 rounded-md hover:bg-[#4056EB] transition">
                  Add to Meme
                </button>
              </div>
            </div>
          </div>
        )}
 
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-r from-[#5167FC] to-[#6817FF] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="font-bold text-gray-800">Eldrin AI</span>
              </div>
              <div className="flex gap-6">
                <span className="text-gray-600 hover:text-[#5167FC] transition cursor-pointer">Terms</span>
                <span className="text-gray-600 hover:text-[#5167FC] transition cursor-pointer">Privacy</span>
                <span className="text-gray-600 hover:text-[#5167FC] transition cursor-pointer">Help</span>
                <span className="text-gray-600 hover:text-[#5167FC] transition cursor-pointer">Contact</span>
              </div>
            </div>
            <div className="mt-4 text-center md:text-left text-sm text-gray-500">
              © 2025 Eldrin AI. All rights reserved.
            </div>
          </div>
        </footer>
        
      </main>
      </div>
      {/* // MOBILE CODE */}
    <div className="block md:hidden min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#5167FC] to-[#6817FF] text-transparent bg-clip-text">
            Eldrin AI
          </h1>
          <button className="text-[#5167FC] px-3 py-1 rounded-full text-sm border border-[#5167FC] flex items-center">
            <FontAwesomeIcon icon={faUser} className="mr-1" /> Login
          </button>
        </div>
      </header>

      {/* AI Generation Section */}
      <section className="px-4 py-4 bg-gradient-to-r from-[#5167FC]/10 to-[#6817FF]/10">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">
            Generate Meme with AI
          </h2>
          <div className="relative">
            <input
              type="text"
              id="ai-prompt-input"
              placeholder="Enter a prompt to generate a meme with AI"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5167FC]"
            />
            <button
              id="generate-ai-meme-btn"
              className="mt-3 w-full bg-gradient-to-r from-[#5167FC] to-[#6817FF] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center"
            >
              <FontAwesomeIcon
                icon={faWandMagicSparkles}
                className="mr-2"
              />
              Generate Meme with AI
            </button>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="px-4 py-4">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Preview</h2>
          <div className="relative w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
            <div id="preview-placeholder" className="text-center px-4">
              <FontAwesomeIcon
                icon={faImage}
                className="text-gray-400 text-5xl mb-3"
              />
              <p className="text-gray-500">Your meme will appear here</p>
            </div>
            <div id="meme-container" className="hidden relative w-full h-full">
              <img
                id="meme-template"
                src=""
                alt="Meme template"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-5 left-0 right-0 text-center text-white text-2xl font-bold px-4 drop-shadow-lg">
                Text 1
              </div>
              <div className="absolute bottom-5 left-0 right-0 text-center text-white text-2xl font-bold px-4 drop-shadow-lg">
                Text 2
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="px-4">
        <div className="flex border-b border-gray-200">
          <button
            id="tab-template"
            className="flex-1 py-3 font-medium text-[#5167FC] border-b-2 border-[#5167FC] flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faImagePortrait} className="mr-1" />
            Template
          </button>
          <button
            id="tab-text"
            className="flex-1 py-3 font-medium text-gray-500 flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faFont} className="mr-1" />
            Text
          </button>
          <button
            id="tab-image"
            className="flex-1 py-3 font-medium text-gray-500 flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faImage} className="mr-1" />
            Add Image
          </button>
        </div>
      </div>

      {/* Template Selection Tab */}
   {/* Template Selection Tab */}
<section id="template-selection-tab" className="px-4 py-4">
  <div className="relative mb-4">
    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
      <FontAwesomeIcon icon={faImage} className="text-gray-400" />
    </div>
    <input
      type="text"
      id="template-search"
      placeholder="Search all memes"
      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5167FC]"
    />
  </div>

  <h3 className="text-sm font-medium mb-2 text-gray-700">Trending Memes</h3>
  <div className="grid grid-cols-3 gap-3">
    {Array.from({ length: 9 }).map((_, idx) => (
      <div
        key={idx}
        className="template-item w-[90%] mx-auto my-auto cursor-pointer bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-[#5167FC] transition-all"
      >
        <div className="aspect-square bg-gray-100">
          <img
            src="https://storage.googleapis.com/uxpilot-auth.appspot.com/c6373105e6-bc96f0f13b0af5e2a72b.png"
            alt="Drake Hotline Bling"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-2">
          <p className="text-sm font-medium truncate">Drake Hotline Bling</p>
        </div>
      </div>
    ))}
  </div>
</section>



      {/* Fixed action buttons */}
      <section className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 z-40">
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-[#97FBD1] text-gray-800 font-medium py-3 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            Download
          </button>
          <button
        className="flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded hover:bg-[#005A8C] hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out"
       >
           <FaLinkedin className="text-xl" />
           Post to LinkedIn
         </button>
        </div>
      </section>

    </div>
    </div>
    
  );
}
