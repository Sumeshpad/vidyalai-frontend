import React, { useState } from "react";
import axios from "axios";
import PdfViewer from "./PdfViewer";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [pdfBase64Data, setPdfBase64Data] = useState(null);
  const [filename, setFilename] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    // Reset the uploaded status when a new file is selected
    setIsUploaded(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      try {
        // Send the file to the backend /upload route
        const response = await axios.post(
          "https://pdf-splitter-api.onrender.com/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("File uploaded successfully:", response.data);
        setPdfBase64Data(response.data.pdfBase64);
        setFilename(response.data.filename);
        // Reset the selected file.
        setSelectedFile(null);
        // Set uploaded status to true so that tick appears.
        setIsUploaded(true);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center ">
      <div className="max-w-md w-full bg-white p-8 shadow-lg rounded-md relative">
        {isUploaded && (
          <div className="absolute top-4 right-4 text-green-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </svg>
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload PDF</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="border border-gray-300 p-2 rounded-md w-full"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md mr-2"
          >
            Upload
          </button>
          <PdfViewer filename={filename} pdfBase64={pdfBase64Data} />
        </form>
      </div>
    </div>
  );
}
export default App;
