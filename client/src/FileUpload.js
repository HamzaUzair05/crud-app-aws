import React, { useState } from 'react';
import axios from 'axios';
import './FileUpload.css';

const FileUpload = () => {
  const [file, setFile] = useState('');
  const [filename, setFilename] = useState('Choose File');
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(0);

  const onChange = e => {
    setFile(e.target.files[0]);
    setFilename(e.target.files[0].name);
  };

  const onSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          setUploadPercentage(
            parseInt(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            )
          );
          
          // Clear percentage after 3 seconds
          setTimeout(() => setUploadPercentage(0), 3000);
        }
      });

      const { fileName, filePath } = res.data;
      setUploadedFile({ fileName, filePath });
      setMessage('File Uploaded Successfully');
    } catch (err) {
      if (err.response && err.response.status === 500) {
        setMessage('There was a problem with the server');
      } else {
        setMessage(err.response?.data?.msg || 'Error uploading file');
      }
    }
  };

  return (
    <div className="container mt-4">
      {message && (
        <div className={`alert ${message.includes('Success') ? 'alert-success' : 'alert-danger'}`} role="alert">
          {message}
        </div>
      )}
      <form onSubmit={onSubmit}>
        <div className="custom-file mb-4">
          <input
            type="file"
            className="custom-file-input"
            id="customFile"
            onChange={onChange}
          />
          <label className="custom-file-label" htmlFor="customFile">
            {filename}
          </label>
        </div>

        <div className="progress mb-4">
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${uploadPercentage}%` }}
            aria-valuenow={uploadPercentage}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            {uploadPercentage}%
          </div>
        </div>

        <input
          type="submit"
          value="Upload"
          className="btn btn-primary btn-block mt-4"
        />
      </form>
      {uploadedFile && (
        <div className="row mt-5">
          <div className="col-md-6 m-auto">
            <h3 className="text-center">{uploadedFile.fileName}</h3>
            {uploadedFile.filePath && (
              <img style={{ width: '100%' }} src={uploadedFile.filePath} alt="" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
