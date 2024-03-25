import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import axios from "axios";

const PdfViewer = ({ pdfBase64, filename }) => {
  const [numPages, setNumPages] = useState(null);
  const [selectedPages, setSelectedPages] = useState([]);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleCheckboxChange = (pageNumber) => {
    setSelectedPages((prevSelectedPages) => {
      if (prevSelectedPages.includes(pageNumber)) {
        return prevSelectedPages.filter((page) => page !== pageNumber);
      } else {
        return [...prevSelectedPages, pageNumber];
      }
    });
  };

  const handleDownload = async () => {
    // Check if any checkboxes are selected if it is 0 cannot download file.

    if (selectedPages.length === 0) {
      console.log(
        "No checkboxes selected. Please select at least one page to download."
      );
      return;
    }

    const payload = {
      filename: `./uploads/${filename}`, // "./uploads/example.pdf" is the format backend is accepting
      pageNumbers: selectedPages, //Array of pages sent to backend
    };

    try {
      const response = await axios.post(
        "https://pdf-splitter-api.onrender.com/extract-pages",
        payload,
        { responseType: "blob" } // Specify response type as blob to handle binary data
      );

      const blob = new Blob([response.data], { type: "application/pdf" });

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Downloading the file(link is created and it is clicked to initiate download).
      const link = document.createElement("a");
      link.href = url;
      link.download = "extracted_pages.pdf"; //Download filename is set.
      document.body.appendChild(link);

      link.click();

      // Remove the anchor element from the document
      document.body.removeChild(link);

      // Unchecking all the checkboxes or checkbox will appear even after upload of new file
      setSelectedPages([]);
    } catch (error) {
      console.error("Error sending download request:", error);
    }
  };

  return (
    <div className="pdf-viewer">
      {pdfBase64 && (
        <Document
          file={`data:application/pdf;base64,${pdfBase64}`}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <div className="flex flex-wrap justify-center">
            {Array.from(new Array(numPages), (el, index) => {
              const pageNumber = index + 1;
              return (
                <div
                  key={`page_${pageNumber}`}
                  className="w-2/3 mb-8 border border-gray-300 rounded-lg overflow-hidden"
                  style={{ margin: "10px" }}
                >
                  <label className="block flex items-center mb-2 p-2 bg-gray-100 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedPages.includes(pageNumber)}
                      onChange={() => handleCheckboxChange(pageNumber)}
                      className="form-checkbox h-5 w-5 text-indigo-600 mr-2"
                    />
                    <span className="text-gray-700">Page {pageNumber}</span>
                  </label>
                  <div className="w-full h-full overflow-auto">
                    <Page
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                      pageNumber={pageNumber}
                      width={250}
                      className="max-w-full max-h-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={handleDownload}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md mt-2 inline-flex items-center"
          >
            <svg
              className="fill-current w-4 h-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
            </svg>
            Download Pages
          </button>
        </Document>
      )}
    </div>
  );
};

export default PdfViewer;
