import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faWandMagicSparkles,
  faImagePortrait,
  faFont,
} from "@fortawesome/free-solid-svg-icons";
import { FaDownload, FaLinkedin, FaSearch } from "react-icons/fa";
import axios from "axios";
import { Rnd } from "react-rnd";
import { toast } from "react-toastify";
import domtoimage from "dom-to-image";

export default function MemeGenerator() {
  const [aiPrompt, setAiPrompt] = useState("");
  const [templateSearch, setTemplateSearch] = useState("Drake Hotline Bling");
  const [showTemplateResults, setShowTemplateResults] = useState(false);
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addedImages, setAddedImages] = useState([]);

  const fileInputRef = useRef(null);
  const [texts, setTexts] = useState([]);
  const [textColors, setTextColors] = useState([]);
  const [textBackgrounds, setTextBackgrounds] = useState([]); // New: background color per text box
  const [textPositions, setTextPositions] = useState([]);
  const [textBgTransparent, setTextBgTransparent] = useState([]); // New: transparent toggle

  const [memes, setMemes] = useState([]);
  const [activeTab, setActiveTab] = useState("template");
  const [selectedElement, setSelectedElement] = useState({
    type: null,
    id: null,
  });
  const [dragStartPositions, setDragStartPositions] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const [selectedImageToAdd, setSelectedImageToAdd] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    targetType: null, // 'image' or 'text'
    targetId: null, // image ID or text index
    relativeX: 0,
    relativeY: 0,
  });

  const textRefs = useRef([]);
  // testing
  // Add these new functions:

  const useScreenWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return width;
  };
  const screenWidth = useScreenWidth();

  const getResponsiveWidth = () => {
    if (screenWidth < 640) return 140; // sm
    if (screenWidth < 1024) return 240; // md
    return 300; // lg
  };
  const initializeTextFields = (boxCount) => {
    const boxWidth = getResponsiveWidth();

    const initialTexts = Array(boxCount)
      .fill("")
      .map((_, i) =>
        i === 0
          ? "Using boring text-only memes"
          : i === 1
          ? "Creating memes with Eldrin AI"
          : `Text ${i + 1}`
      );

    const initialColors = Array(boxCount).fill("#ffffff");

    const initialPositions = Array(boxCount)
      .fill(null)
      .map((_, i) => ({
        x: 50,
        y: 50 + i * 100,
        width: boxWidth,
        height: 0,
      }));

    textRefs.current = Array(boxCount)
      .fill(null)
      .map((_, i) => textRefs.current[i] || React.createRef());

    setTexts(initialTexts);
    setTextColors(initialColors);
    setTextPositions(initialPositions);
    setDragStartPositions(initialPositions);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setTemplateSearch(template.name);
    initializeTextFields(template.box_count);
  };
  // testng

  const handleRemoveImage = () => {
    if (contextMenu.imageId) {
      setAddedImages((prev) =>
        prev.filter((img) => img.id !== contextMenu.imageId)
      );
      setContextMenu({ visible: false, x: 0, y: 0, imageId: null });
    }
  };

  const templateSearchRef = useRef();
  const templateResultsRef = useRef();

  const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api/v1/memes",
  });

  useEffect(() => {
    const handleScroll = () => {
      if (contextMenu.visible) {
        setContextMenu({ visible: false, x: 0, y: 0, imageId: null });
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [contextMenu.visible]);

  const handleTextContextMenu = (e, index) => {
    e.preventDefault();

    const container = memeRef.current;
    const containerRect = container.getBoundingClientRect();

    const relativeX = e.clientX - containerRect.left;
    const relativeY = e.clientY - containerRect.top;

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      targetType: "text",
      targetId: index,
      relativeX,
      relativeY,
    });
  };

  const handleContextMenu = (e, imageId) => {
    e.preventDefault();

    const container = memeRef.current;
    const containerRect = container.getBoundingClientRect();

    const relativeX = e.clientX - containerRect.left;
    const relativeY = e.clientY - containerRect.top;

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      targetType: "image",
      targetId: imageId,
      relativeX,
      relativeY,
    });
  };

  const handleRemoveText = (index) => {
    const newTexts = [...texts];
    newTexts[index] = ""; // Clear the text
    setTexts(newTexts);

    // Optional: Also reset position if you want
    const newPositions = [...textPositions];
    newPositions[index] = {
      x: 50,
      y: 50 + index * 100,
      width: 300,
      height: 80,
    };
    setTextPositions(newPositions);
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, imageId: null });
  };

  // Add this useEffect to close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => handleCloseContextMenu();
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchMemes = async () => {
    try {
      const res = await axiosInstance.get("/trending");
      setMemes(res.data.data.memes || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Then use it in useEffect with eslint-disable for the warning
  useEffect(() => {
    fetchMemes();
    // Clean up refs when component unmounts
    return () => {
      textRefs.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - runs only once on mount

  const createMeme = async () => {
    try {
      const selectedTemplate =
        memes?.find((t) => t.name === templateSearch) || memes[0];

      // Prepare text data based on box_count
      const textData = {};
      texts.forEach((text, index) => {
        textData[`text${index + 1}`] = text;
      });

      await axiosInstance.post("/memes", {
        ...textData, // Spread all text fields
        imageUrl: `https://i.imgflip.com/${selectedTemplate.id}.jpg`,
        box_count: selectedTemplate.box_count, // Include box_count in the request
      });

      toast.success("Meme created successfully!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        pauseOnHover: true,
        draggable: true,
      });
      fetchMemes();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create meme.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };
  const generateMemeAI = async () => {
    try {
      const res = await axiosInstance.post("/ai", { prompt: aiPrompt });
      const aiMeme = res.data.data;

      setSelectedTemplate({
        url: aiMeme.url,
        id: aiMeme.template_id,
      });

      initializeTextFields(aiMeme.texts?.length || 2);
      setTexts([]);

      toast.success("AI Meme generated!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate AI meme.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };
  const handleGenerate = () => {
    if (aiPrompt.trim() !== "") {
      generateMemeAI();
    } else {
      createMeme();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        templateSearchRef.current &&
        !templateSearchRef.current.contains(e.target) &&
        templateResultsRef.current &&
        !templateResultsRef.current.contains(e.target)
      ) {
        setShowTemplateResults(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const memeRef = useRef();
  const downloadBtnRef = useRef(null);
  const handleDownload = async () => {
    if (!imageLoaded) {
      toast.warning("Please wait, image is still loading...", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    setIsDownloading(true);

    const removeButtons = memeRef.current.querySelectorAll(".remove-button");
    removeButtons.forEach((btn) => (btn.style.display = "none"));

    const contentBoxes = memeRef.current.querySelectorAll("[contenteditable]");
    contentBoxes.forEach((box) => {
      box.setAttribute(
        "data-prev-editable",
        box.getAttribute("contenteditable")
      );
      box.setAttribute("contenteditable", "false");
    });

    const textWrappers = memeRef.current.querySelectorAll(".rnd-text-wrapper");
    textWrappers.forEach((wrapper) => {
      const textContent = wrapper.querySelector("[contenteditable]");
      if (textContent) {
        const contentRect = textContent.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        const heightDiff = contentRect.height - wrapperRect.height;
        if (heightDiff > 0) {
          wrapper.style.height = `${contentRect.height}px`;
        }
      }
    });

    // Force fonts and layout to load
    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const node = memeRef.current;
      if (!node) return;

      const scale = 3; // Export at 3x the displayed size for better quality

      const style = {
        transform: "scale(" + scale + ")",
        transformOrigin: "top left",
        width: node.offsetWidth + "px",
        height: node.offsetHeight + "px",
      };

      const param = {
        height: node.offsetHeight * scale,
        width: node.offsetWidth * scale,
        style,
      };

      domtoimage
        .toPng(node, param)
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "meme.png";
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error("Export error:", err);
        });

      toast.success("Meme downloaded!", {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Failed to generate download.", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      removeButtons.forEach((btn) => (btn.style.display = "block"));
      contentBoxes.forEach((box) => {
        const prev = box.getAttribute("data-prev-editable");
        if (prev !== null) {
          box.setAttribute("contenteditable", prev);
          box.removeAttribute("data-prev-editable");
        }
      });
      textWrappers.forEach((wrapper) => {
        wrapper.style.height = "";
      });
      setIsDownloading(false);
    }
  };

  // Update the handleUploadImage function
  const handleUploadImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      // Create an image element to get natural dimensions
      const img = new Image();
      img.src = url;
      img.onload = () => {
        // Calculate size to fit within the meme container (assuming 500x500)
        const maxWidth = 500;
        const maxHeight = 500;
        let width = img.width;
        let height = img.height;

        // Scale down if necessary while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        setUploadedImage({
          url: url,
          file: file,
          width: width,
          height: height,
        });
      };
    }
  };
  const handleAddImageClick = () => {
    fileInputRef.current.click();
  };

  // Keep track of position when drag starts
  const handleDragStart = () => {
    setDragStartPositions(JSON.parse(JSON.stringify(textPositions)));
  };

  // Fixed handleDragStopText function
  const handleDragStopText = (index, d) => {
    const prev = textPositions[index];
    const updatedBox = {
      ...prev,
      x: d.x,
      y: d.y,
    };

    // Get the actual text element
    const textElement = textRefs.current[index]?.current;
    if (!textElement) return;

    // Get all text lines' bounding boxes
    const range = document.createRange();
    const textNodes = getTextNodes(textElement);
    const textRects = [];

    textNodes.forEach((node) => {
      range.selectNodeContents(node);
      const rects = range.getClientRects();
      Array.from(rects).forEach((rect) => {
        textRects.push({
          left: rect.left - textElement.getBoundingClientRect().left,
          right: rect.right - textElement.getBoundingClientRect().left,
          top: rect.top - textElement.getBoundingClientRect().top,
          bottom: rect.bottom - textElement.getBoundingClientRect().top,
        });
      });
    });

    // Check for overlaps with other text elements
    const isOverlapping = textPositions.some((box, i) => {
      if (i === index) return false;

      const otherTextElement = textRefs.current[i]?.current;
      if (!otherTextElement) return false;

      const otherRange = document.createRange();
      const otherTextNodes = getTextNodes(otherTextElement);

      for (const node of otherTextNodes) {
        otherRange.selectNodeContents(node);
        const otherRects = otherRange.getClientRects();

        for (const otherRect of otherRects) {
          const otherTextRect = {
            left:
              box.x +
              (otherRect.left - otherTextElement.getBoundingClientRect().left),
            right:
              box.x +
              (otherRect.right - otherTextElement.getBoundingClientRect().left),
            top:
              box.y +
              (otherRect.top - otherTextElement.getBoundingClientRect().top),
            bottom:
              box.y +
              (otherRect.bottom - otherTextElement.getBoundingClientRect().top),
          };

          for (const textRect of textRects) {
            const currentTextRect = {
              left: updatedBox.x + textRect.left,
              right: updatedBox.x + textRect.right,
              top: updatedBox.y + textRect.top,
              bottom: updatedBox.y + textRect.bottom,
            };

            const overlapX =
              currentTextRect.left < otherTextRect.right &&
              currentTextRect.right > otherTextRect.left;
            const overlapY =
              currentTextRect.top < otherTextRect.bottom &&
              currentTextRect.bottom > otherTextRect.top;

            if (overlapX && overlapY) return true;
          }
        }
      }

      return false;
    });

    if (isOverlapping) {
      toast.error("Text content is overlapping! Please adjust the position.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      const newPositions = [...textPositions];
      newPositions[index] = dragStartPositions[index];
      setTextPositions(newPositions);
    } else {
      const newPositions = [...textPositions];
      newPositions[index] = updatedBox;
      setTextPositions(newPositions);
      setDragStartPositions(newPositions);
    }
  };

  // Helper function to get all text nodes
  function getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.trim() !== "") {
        textNodes.push(node);
      }
    }

    return textNodes;
  }

  const prevTextPositions = useRef(textPositions);

  useEffect(() => {
    if (
      JSON.stringify(prevTextPositions.current) !==
      JSON.stringify(textPositions)
    ) {
      const updateTextSizes = () => {
        const newPositions = [...textPositions];
        let needsUpdate = false;

        textRefs.current.forEach((ref, index) => {
          if (ref?.current) {
            const computedStyle = window.getComputedStyle(ref.current);
            const paddingX =
              parseFloat(computedStyle.paddingLeft) +
              parseFloat(computedStyle.paddingRight);
            const paddingY =
              parseFloat(computedStyle.paddingTop) +
              parseFloat(computedStyle.paddingBottom);

            const newWidth = ref.current.scrollWidth + paddingX;
            const newHeight = ref.current.scrollHeight + paddingY;

            if (
              newPositions[index].width !== newWidth ||
              newPositions[index].height !== newHeight
            ) {
              newPositions[index] = {
                ...newPositions[index],
              };
              needsUpdate = true;
            }
          }
        });

        if (needsUpdate) {
          prevTextPositions.current = newPositions;
          setTextPositions(newPositions);
          setDragStartPositions(newPositions);
        }
      };

      updateTextSizes();
    }
  }, [texts, textColors, textPositions]);
  // test
  // Add this outside render to deselect on outside click

  // Add this outside render to deselect on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (memeRef.current && !memeRef.current.contains(e.target)) {
        setSelectedElement({ type: null, id: null });
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Ensure text size updates after resize
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* DESKTOP CODE */}
      <div className=" min-h-screen bg-gray-50 text-gray-900">
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
          <section
            id="ai-meme-generator"
            className="mb-8 bg-gradient-to-r from-[#5167FC]/10 to-[#6817FF]/10 p-6 rounded-xl"
          >
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
              <div
                ref={memeRef}
                className="aspect-square border border-gray-300 rounded-md flex items-center justify-center bg-gray-100 relative overflow-hidden"
              >
                {/* Base Meme Image */}
                <img
                  className="w-full h-full object-contain"
                  src={
                    selectedTemplate?.url ||
                    memes?.find((t) => t.name === templateSearch)?.url ||
                    memes[0]?.url
                  }
                  alt="Meme template"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(false)}
                />
                {/* Render added images that are draggable and resizable */}
                {addedImages.map((img) => (
                  <Rnd
                    key={img.id}
                    style={{
                      zIndex: 10,
                      border:
                        selectedElement.type === "image" &&
                        selectedElement.id === img.id
                          ? "2px dashed #5167FC"
                          : "none",
                      borderRadius: "6px",
                    }}
                    default={{
                      x: img.x,
                      y: img.y,
                      width: img.width,
                      height: img.height,
                    }}
                    size={{ width: img.width, height: img.height }}
                    bounds="parent"
                    enableResizing={{
                      top: true,
                      right: true,
                      bottom: true,
                      left: true,
                      topRight: true,
                      bottomRight: true,
                      bottomLeft: true,
                      topLeft: true,
                    }}
                    lockAspectRatio={true}
                    onClick={() =>
                      setSelectedElement({ type: "image", id: img.id })
                    }
                    onTouchStart={() =>
                      setSelectedElement({ type: "image", id: img.id })
                    }
                    onDragStop={(e, d) => {
                      setAddedImages((prev) =>
                        prev.map((item) =>
                          item.id === img.id
                            ? { ...item, x: d.x, y: d.y }
                            : item
                        )
                      );
                    }}
                    onResizeStop={(e, direction, ref, delta, position) => {
                      setAddedImages((prev) =>
                        prev.map((item) =>
                          item.id === img.id
                            ? {
                                ...item,
                                width: ref.offsetWidth,
                                height: ref.offsetHeight,
                                ...position,
                              }
                            : item
                        )
                      );
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handleContextMenu(e, img.id);
                    }}
                  >
                    <div className="relative w-full h-full">
                      <img
                        src={img.url}
                        alt="added"
                        className="w-full h-full object-contain pointer-events-none"
                      />
                      {selectedElement.type === "image" &&
                        selectedElement.id === img.id && (
                          <button
                            className="remove-button absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-50 hover:bg-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAddedImages((prev) =>
                                prev.filter((item) => item.id !== img.id)
                              );
                              setSelectedElement({ type: null, id: null });
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              setAddedImages((prev) =>
                                prev.filter((item) => item.id !== img.id)
                              );
                              setSelectedElement({ type: null, id: null });
                            }}
                          >
                            ×
                          </button>
                        )}
                    </div>
                  </Rnd>
                ))}
                {contextMenu.visible && (
                  <div
                    className="absolute bg-white shadow-lg rounded-md py-1 z-50"
                    style={{
                      top: `${contextMenu.relativeY}px`,
                      left: `${contextMenu.relativeX}px`,
                      transform: "translate(0, -100%)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="px-4 py-2 text-red-500 hover:bg-gray-100 w-full text-left"
                      onClick={() => {
                        if (contextMenu.targetType === "image") {
                          handleRemoveImage();
                        } else if (contextMenu.targetType === "text") {
                          handleRemoveText(contextMenu.targetId);
                        }
                        setContextMenu({ ...contextMenu, visible: false });
                      }}
                    >
                      Remove{" "}
                      {contextMenu.targetType === "image" ? "Image" : "Text"}
                    </button>
                  </div>
                )}

                {texts.map((text, index) =>
                  text.trim() ? (
                    <Rnd
                      key={`text-${index}`}
                      default={{
                        x: textPositions[index]?.x || 50,
                        y: textPositions[index]?.y || index * 100 + 10,
                        width: textPositions[index]?.width || 120,
                        height: textPositions[index]?.height || 40,
                      }}
                      size={{
                        width: textPositions[index]?.width || "auto",
                        // height: textPositions[index]?.height || "auto",
                      }}
                      position={{
                        x: textPositions[index]?.x || 50,
                        y: textPositions[index]?.y || index * 100 + 10,
                      }}
                      onDragStart={handleDragStart}
                      onDragStop={(e, d) => handleDragStopText(index, d)}
                      onResizeStop={(e, direction, ref, delta, position) => {
                        const width = ref.offsetWidth;
                        const height = ref.offsetHeight;

                        const newPositions = [...textPositions];
                        newPositions[index] = {
                          ...newPositions[index],
                          x: position.x,
                          y: position.y,
                          width,
                          height,
                        };
                        setTextPositions(newPositions);
                        setDragStartPositions(newPositions);
                      }}
                      onContextMenu={(e) => handleTextContextMenu(e, index)}
                      onClick={() =>
                        setSelectedElement({ type: "text", id: index })
                      }
                      onTouchStart={() =>
                        setSelectedElement({ type: "text", id: index })
                      }
                      bounds="parent"
                      enableResizing={{
                        bottom: true,
                        right: true,
                        bottomRight: true,
                        left: true,
                        top: true,
                        topRight: true,
                        topLeft: true,
                        bottomLeft: true,
                      }}
                      dragGrid={[5, 5]}
                      style={{
                        zIndex:
                          selectedElement.type === "text" &&
                          selectedElement.id === index
                            ? 20
                            : 10,
                        border:
                          selectedElement.type === "text" &&
                          selectedElement.id === index
                            ? "2px dashed #5167FC"
                            : "none",
                        borderRadius: "6px",
                      }}
                    >
                      <div className="relative w-full h-full">
                        <div
                          ref={(el) =>
                            (textRefs.current[index] = { current: el })
                          }
                          contentEditable
                          suppressContentEditableWarning
                          onInput={(e) => {
                            let rawText = e.currentTarget.innerText
                              .replace(/\n/g, "")
                              .trim();
                            const lineLength = 30;

                            const wrappedText =
                              rawText
                                .match(new RegExp(`.{1,${lineLength}}`, "g"))
                                ?.join("\n") || "";

                            const newTexts = [...texts];
                            newTexts[index] = wrappedText;
                            setTexts(newTexts);

                            const el = e.currentTarget;
                            const newPositions = [...textPositions];
                            newPositions[index] = {
                              ...newPositions[index],
                              width: el.scrollWidth + 16,
                              height: el.scrollHeight + 16,
                            };
                            setTextPositions(newPositions);
                          }}
                          className="responsive-text"
                          style={{
                            color: textColors[index],
                            backgroundColor: textBgTransparent[index]
                              ? "transparent"
                              : textBackgrounds[index] || "transparent",
                            fontWeight: "bold",
                            textAlign: "center",
                            lineHeight: "1.2",
                            display: "inline-block",
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                            whiteSpace: "pre-wrap",
                            outline: "none",
                            overflow: "visible",
                            padding: "18px 8px",
                            minWidth: "60px",
                            minHeight: "40px",
                            width: "fit-content",
                            height: "fit-content",
                          }}
                        >
                          {text}
                        </div>

                        {selectedElement.type === "text" &&
                          selectedElement.id === index && (
                            <button
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-50 hover:bg-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveText(index);
                                setSelectedElement({ type: null, id: null });
                              }}
                              onTouchStart={(e) => {
                                e.stopPropagation();
                                handleRemoveText(index);
                                setSelectedElement({ type: null, id: null });
                              }}
                            >
                              ×
                            </button>
                          )}
                      </div>
                    </Rnd>
                  ) : null
                )}
              </div>

              {/* Add Image Section */}
              <div className="mb-6 pt-6">
                <button
                  onClick={() => setShowAddImageModal(true)}
                  className="hidden md:block w-full border border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition"
                >
                  <i className="fa-solid fa-image text-2xl text-gray-500" />
                  <span className="font-medium text-gray-700 ">Add Image</span>
                </button>
              </div>
            </div>

            {/* Editing */}
            <div className="hidden md:block w-full lg:w-1/2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Edit Your Meme
              </h2>

              {/* Template Selection */}
              <div className="mb-6" ref={templateSearchRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search all memes
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className=" w-full border border-gray-300 rounded-md px-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#5167FC] focus:border-transparent"
                    value={templateSearch}
                    onChange={(e) => {
                      const searchTerm = e.target.value;
                      setTemplateSearch(searchTerm);
                      setShowTemplateResults(searchTerm.length > 0);
                    }}
                    placeholder="Type to search..."
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                </div>

                {/* Search Results Dropdown */}
                {showTemplateResults && (
                  <div className="mt-2 border border-gray-200 rounded-md bg-white shadow-md max-h-60 overflow-y-auto">
                    {memes
                      .filter((meme) =>
                        meme.name
                          .toLowerCase()
                          .includes(templateSearch.toLowerCase())
                      )
                      .map((tpl) => (
                        <div
                          key={tpl.name}
                          className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                          onClick={() => {
                            setSelectedTemplate(tpl);
                            setTemplateSearch(tpl.name);
                            setShowTemplateResults(false);
                            initializeTextFields(tpl.box_count);
                          }}
                        >
                          <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                            <img
                              src={tpl.url}
                              alt={tpl.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span>{tpl.name}</span>
                        </div>
                      ))}
                  </div>
                )}

                {/* Keep your existing Trending Memes section exactly as is */}
                <h3 className="text-sm font-medium mt-6 mb-2 text-gray-700">
                  Trending Memes
                </h3>
                <div className="flex space-x-4 overflow-x-auto pb-2">
                  {memes.slice(0, 20).map((meme) => (
                    <div
                      key={meme.id}
                      className="flex-shrink-0 w-36 template-item cursor-pointer bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-[#5167FC] transition-all"
                      onClick={() => handleTemplateSelect(meme)}
                    >
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={meme.url}
                          alt={meme.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-sm font-medium truncate">
                          {meme.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text Editing */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-800">
                  Text Editing
                </h3>
                {texts.map((text, index) => (
                  <div key={`text-input-${index}`} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text {index + 1}
                    </label>
                    <div className="flex items-end gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={textColors[index] || "#ffffff"}
                          onChange={(e) => {
                            const newColors = [...textColors];
                            newColors[index] = e.target.value;
                            setTextColors(newColors);
                          }}
                          className="w-8 h-8 p-0 border-2 border-gray-300 rounded-md"
                        />
                        <span>Text Color</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={textBackgrounds[index] || "#00000000"}
                          onChange={(e) => {
                            const newBgs = [...textBackgrounds];
                            newBgs[index] = e.target.value;
                            setTextBackgrounds(newBgs);
                          }}
                          className="w-8 h-8 p-0 border-2 border-gray-300 rounded-md"
                        />
                        <span>BG Color</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={textBgTransparent[index] || false}
                          onChange={(e) => {
                            const newTransparent = [...textBgTransparent];
                            newTransparent[index] = e.target.checked;
                            setTextBgTransparent(newTransparent);
                          }}
                        />
                        <span>Transparent</span>
                      </div>
                      <button
                        onClick={() => {
                          const removeAt = (arr) =>
                            arr.filter((_, i) => i !== index);
                          setTexts(removeAt(texts));
                          setTextColors(removeAt(textColors));
                          setTextBackgrounds(removeAt(textBackgrounds));
                          setTextBgTransparent(removeAt(textBgTransparent));
                          setTextPositions(removeAt(textPositions));
                        }}
                        className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        X
                      </button>
                    </div>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5167FC]"
                      value={text}
                      onChange={(e) => {
                        const newTexts = [...texts];
                        newTexts[index] = e.target.value;
                        setTexts(newTexts);
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setTexts((prev) => [...prev, `Text ${prev.length + 1}`]);
                    setTextColors((prev) => [...prev, "#ffffff"]);
                    setTextBackgrounds((prev) => [...prev, "#00000000"]);
                    setTextBgTransparent((prev) => [...prev, true]);
                    setTextPositions((prev) => [
                      ...prev,
                      {
                        x: 50,
                        y: 50 + prev.length * 100,
                        width: 200,
                        height: 50,
                      },
                    ]);
                    textRefs.current = [...textRefs.current, React.createRef()];
                  }}
                  className="mt-4 px-4 py-2 bg-[#5167FC] text-white rounded-md hover:bg-[#4056EB] transition text-sm"
                >
                  ＋
                </button>
              </div>
            </div>
            {/* TABS */}
            <div className="block md:hidden px-4">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("template")}
                  className={`flex-1 py-3 font-medium flex items-center justify-center ${
                    activeTab === "template"
                      ? "text-[#5167FC] border-b-2 border-[#5167FC]"
                      : "text-gray-500"
                  }`}
                >
                  <FontAwesomeIcon icon={faImagePortrait} className="mr-1" />
                  Template
                </button>
                <button
                  onClick={() => setActiveTab("text")}
                  className={`flex-1 py-3 font-medium flex items-center justify-center ${
                    activeTab === "text"
                      ? "text-[#5167FC] border-b-2 border-[#5167FC]"
                      : "text-gray-500"
                  }`}
                >
                  <FontAwesomeIcon icon={faFont} className="mr-1" />
                  Text
                </button>
                <button
                  onClick={() => setActiveTab("image")}
                  className={`flex-1 py-3 font-medium flex items-center justify-center ${
                    activeTab === "image"
                      ? "text-[#5167FC] border-b-2 border-[#5167FC]"
                      : "text-gray-500"
                  }`}
                >
                  <FontAwesomeIcon icon={faImage} className="mr-1" />
                  Add
                </button>
              </div>
            </div>

            {/* TEMPLATE PANEL */}
            {activeTab === "template" && (
              <section
                id="template-selection-tab"
                className="md:hidden px-4 py-4 mb-20"
              >
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faImage} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#5167FC] focus:border-transparent"
                    value={templateSearch}
                    onChange={(e) => {
                      const searchTerm = e.target.value;
                      setTemplateSearch(searchTerm);
                      setShowTemplateResults(searchTerm.length > 0);
                    }}
                    placeholder="Type to search..."
                  />
                </div>
                {/* Search Results Dropdown */}
                {showTemplateResults && (
                  <div className="mt-2 border border-gray-200 rounded-md bg-white shadow-md max-h-60 overflow-y-auto">
                    {memes
                      .filter((meme) =>
                        meme.name
                          .toLowerCase()
                          .includes(templateSearch.toLowerCase())
                      )
                      .map((tpl) => (
                        <div
                          key={tpl.name}
                          className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                          onClick={() => {
                            setSelectedTemplate(tpl);
                            setTemplateSearch(tpl.name);
                            setShowTemplateResults(false);
                            initializeTextFields(tpl.box_count);
                          }}
                        >
                          <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                            <img
                              src={tpl.url}
                              alt={tpl.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span>{tpl.name}</span>
                        </div>
                      ))}
                  </div>
                )}

                <div className="md:hidden">
                  <h3 className="text-sm font-medium mb-2 text-gray-700">
                    Trending Memes
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {memes.slice(0, 20).map((meme) => (
                      <div
                        key={meme.id}
                        className="flex-shrink-0 w-24 template-item cursor-pointer bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-[#5167FC] transition-all"
                        onClick={() => handleTemplateSelect(meme)}
                      >
                        <div className="aspect-square bg-gray-100">
                          <img
                            src={meme.url}
                            alt={meme.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2">
                          <p className="text-sm font-medium truncate">
                            {meme.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* TEXT PANEL */}
            {activeTab === "text" && (
              <section className="px-4 py-4 mb-20">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-gray-800">
                    Text Editing
                  </h3>
                  {texts.map((text, index) => (
                    <div key={`text-input-${index}`} className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text {index + 1}
                      </label>
                      <div className="flex flex-wrap items-end gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={textColors[index] || "#ffffff"}
                            onChange={(e) => {
                              const newColors = [...textColors];
                              newColors[index] = e.target.value;
                              setTextColors(newColors);
                            }}
                            className="w-8 h-8 p-0 border-2 border-gray-300 rounded-md"
                          />
                          <span>Text Color</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={textBackgrounds[index] || "#00000000"}
                            onChange={(e) => {
                              const newBgs = [...textBackgrounds];
                              newBgs[index] = e.target.value;
                              setTextBackgrounds(newBgs);
                            }}
                            className="w-8 h-8 p-0 border-2 border-gray-300 rounded-md"
                          />
                          <span>BG Color</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={textBgTransparent[index] || false}
                            onChange={(e) => {
                              const newTransparent = [...textBgTransparent];
                              newTransparent[index] = e.target.checked;
                              setTextBgTransparent(newTransparent);
                            }}
                          />
                          <span>Transparent</span>
                        </div>
                        <button
                          onClick={() => {
                            const removeAt = (arr) =>
                              arr.filter((_, i) => i !== index);
                            setTexts(removeAt(texts));
                            setTextColors(removeAt(textColors));
                            setTextBackgrounds(removeAt(textBackgrounds));
                            setTextBgTransparent(removeAt(textBgTransparent));
                            setTextPositions(removeAt(textPositions));
                          }}
                          className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          X
                        </button>
                      </div>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5167FC]"
                        value={text}
                        onChange={(e) => {
                          const newTexts = [...texts];
                          newTexts[index] = e.target.value;
                          setTexts(newTexts);
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setTexts((prev) => [...prev, `Text ${prev.length + 1}`]);
                      setTextColors((prev) => [...prev, "#ffffff"]);
                      setTextBackgrounds((prev) => [...prev, "#00000000"]);
                      setTextBgTransparent((prev) => [...prev, true]);
                      setTextPositions((prev) => [
                        ...prev,
                        {
                          x: 50,
                          y: 50 + prev.length * 100,
                          width: 200,
                          height: 50,
                        },
                      ]);
                      textRefs.current = [
                        ...textRefs.current,
                        React.createRef(),
                      ];
                    }}
                    className="mt-4 px-4 py-2 bg-[#5167FC] text-white rounded-md hover:bg-[#4056EB] transition text-sm"
                  >
                    ＋
                  </button>
                </div>
              </section>
            )}

            {/* ADD IMAGE PANEL */}
            {activeTab === "image" && (
              <section className="px-4 py-4 mb-20">
                <button
                  onClick={() => setShowAddImageModal(true)}
                  className="md:hidden w-full border border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition"
                >
                  {/* <i className="fa-solid fa-image text-2xl text-gray-500" /> */}
                  <i className="fa-solid fa-image text-2xl text-gray-500" />
                  <span className="font-medium text-gray-700 ">Add Image</span>
                </button>
              </section>
            )}
          </section>

          {/* Action Buttons */}
          <section className="mt-8 flex justify-center gap-4">
            <button
              id="download-btn"
              ref={downloadBtnRef}
              onClick={handleDownload}
              disabled={isDownloading}
              className=" flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5167FC] to-[#6817FF] text-white rounded hover:opacity-90 transition cursor-pointer"
            >
              <FaDownload /> {isDownloading ? "Processing..." : "Download"}
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-[#0077B5] text-white rounded hover:bg-[#005A8C] hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out">
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
                  <button
                    onClick={() => {
                      setShowAddImageModal(false);
                      setSelectedImageToAdd(null);
                      setUploadedImage(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="fa-solid fa-times" />
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <i className="fa-solid fa-cloud-arrow-up text-4xl text-gray-400 mb-3" />
                    <h4 className="text-lg font-medium mb-2">
                      Upload Your Own Image
                    </h4>
                    <p className="text-gray-500 mb-4">
                      Drag and drop or click to select
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleUploadImage}
                    />
                    <button
                      onClick={handleAddImageClick}
                      className="bg-[#5167FC] text-white px-4 py-2 rounded-md hover:bg-[#4056EB] transition mb-3"
                    >
                      Select Image
                    </button>

                    {/* Show preview of uploaded image */}
                    {uploadedImage && (
                      <div className="mt-4">
                        <div className="relative mx-auto w-32 h-32 border border-gray-300 rounded-md overflow-hidden">
                          <img
                            src={uploadedImage.url}
                            alt="Uploaded preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Image selected
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-medium mb-3">
                      Choose from Meme Generator API
                    </h4>
                    <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                      {memes?.map((tpl) => (
                        <div
                          key={tpl.id}
                          className={`aspect-square bg-gray-100 rounded cursor-pointer hover:opacity-80 transition overflow-hidden ${
                            selectedImageToAdd?.id === tpl.id
                              ? "ring-2 ring-[#5167FC]"
                              : ""
                          }`}
                          onClick={() => {
                            setSelectedImageToAdd(tpl);
                            setUploadedImage(null); // Clear any uploaded image when selecting from API
                          }}
                        >
                          <img
                            src={tpl.url}
                            alt={tpl.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setShowAddImageModal(false);
                      setSelectedImageToAdd(null);
                      setUploadedImage(null);
                    }}
                    className="text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100 transition mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (uploadedImage || selectedImageToAdd) {
                        setAddedImages((prev) => [
                          ...prev,
                          {
                            id: Date.now(),
                            url: uploadedImage
                              ? uploadedImage.url
                              : selectedImageToAdd.url,
                            x: 50,
                            y: 50,
                            width: 100,
                            height: 100,
                          },
                        ]);
                        setShowAddImageModal(false);
                        setSelectedImageToAdd(null);
                        setUploadedImage(null);
                      } else {
                        alert("Please select an image first");
                      }
                    }}
                    className="bg-[#5167FC] text-white px-4 py-2 rounded-md hover:bg-[#4056EB] transition"
                  >
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
                  <span className="text-gray-600 hover:text-[#5167FC] transition cursor-pointer">
                    Terms
                  </span>
                  <span className="text-gray-600 hover:text-[#5167FC] transition cursor-pointer">
                    Privacy
                  </span>
                  <span className="text-gray-600 hover:text-[#5167FC] transition cursor-pointer">
                    Help
                  </span>
                  <span className="text-gray-600 hover:text-[#5167FC] transition cursor-pointer">
                    Contact
                  </span>
                </div>
              </div>
              <div className="mt-4 text-center md:text-left text-sm text-gray-500">
                © 2025 Eldrin AI. All rights reserved.
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
