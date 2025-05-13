import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
//  const handleDownload = () => {
//     const node = memeRef.current;
//     if (!node) return;
  
//     domtoimage.toPng(node)
//       .then(function (dataUrl) {
//         const link = document.createElement('a');
//         link.download = 'meme.png';
//         link.href = dataUrl;
//         link.click();
//       })
//       .catch(function (error) {
//         console.error('Error exporting:', error);
//       });
//   };
