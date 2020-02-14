import React from "react";

const Header = ({ editImage, saveImage }) => {
  return (
    <div className="header">
      <button onClick={editImage}>Edit Image</button>
      <button onClick={saveImage}>Save Image</button>
    </div>
  );
};

export default Header;
